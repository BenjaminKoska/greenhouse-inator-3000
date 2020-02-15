#include <WiFi.h>
#include <Wire.h>
#include <BH1750FVI.h>
#include <Sodaq_HTS221.h>
#include <PubSubClient.h>
#include <iot_fbm320.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>


#define I2C_SDA_PIN         25
#define I2C_SCL_PIN         26
#define IC2_SPEED           400000

#define WIFI_SSID           "Schuur De Vier Ambachten"
#define WIFI_PASSWORD       "gratiswifi"

/* Parameters for the MQTT connection */
#define MQTT_SERVER         "broker.hivemq.com"
#define MQTT_PORT           1883
#define MQTT_CLIENT_ID      "DeCodeBadgers"
#define MQTT_TOPIC_PREFIX   "/DeCodeBadgers"

#define fbm320_ADDRESS 0x6D //   IIC Address

/* Parameters for the OLED screen */
#define SCREEN_WIDTH        128
#define SCREEN_HEIGHT       64
#define SCREEN_RESET        -1
#define SCREEN_ADDRESS      0x3C

const int pushButton = 0;
const int id = 1;

long int C11;
long int C12;
long int C0,C1,C2,C3,C5,C6,C8,C9,C10;
long int C4,C7;
int32_t  UP,UT,DT,X01,X02,X03,DT2,X11,X12,X13,X21,X22;
int32_t  X23,X24,X25,X26,PP1,PP2,PP3,PP4,CF,X31,X32,RP;     
long int RT;
uint16_t R0,R1,R2,R3,R4,R5,R6,R7,R8,R9;

Adafruit_SSD1306  display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, SCREEN_RESET);
WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);
BH1750FVI lightSensor(13, BH1750FVI::k_DevAddress_L, BH1750FVI::k_DevModeContHighRes);
Sodaq_HTS221 humiditySensor;

/**
 * Connect to the WiFi
 */
void setup_wifi() {
  Serial.println("Connecting to WiFi");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(250);
  }

  Serial.println("Connection success");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}


/**
 * Setup the MQTT client
 */
void setup_mqtt() {
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  
  while(!mqttClient.connected()) {
    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      mqttClient.publish(MQTT_TOPIC_PREFIX, MQTT_CLIENT_ID " is online");
    } else {
      Serial.print("MQTT connection failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void setup(){
    Serial.begin(115200);
    Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
    Wire.setClock(400000);
    pinMode(pushButton, INPUT);
    
    setup_wifi();
    setup_mqtt();
    setup_sensors();
}

void setup_sensors(){
  if(!humiditySensor.init()) {
    Serial.println("Could not initialize HTS221 sensor");  
  }
  humiditySensor.enableSensor();
  Serial.println("HTS221 sensor initialized");

  Serial.println("Pressure sensor initialized");

  lightSensor.begin();
  Serial.println("BH1750FVI sensor initialized");

  fbm320Calibration();
}

/**
 * Main application which runs in infinite loop.
 */
void loop() {
  char buff[128] = { 0 };
  
  int32_t ut;
  int32_t DT1;
  long int up;
  
  float temp = humiditySensor.readTemperature();
  float humidity = humiditySensor.readHumidity();
  uint16_t lux = lightSensor.GetLightIntensity();
  int stateButton = digitalRead(pushButton);
  int buttonPressed;

  uint32_t pressure = fbm320GetPressure(fbm320ReadUP());
  
  if(stateButton == 1) {
     buttonPressed = 1;
  } else {
    buttonPressed = 0;
  }


  snprintf(buff, 128, "{\"UniqueId\":%d,\"light\":%d,\"humidity\":%0.2f,\"temperature\":%0.2f,\"doorOpen\":%d,\"pressure:\":%d}",id,lux,humidity,temp,buttonPressed, pressure);
  
  Serial.println(buff);
  
  mqttClient.publish(MQTT_TOPIC_PREFIX "/API",buff);

  /* Check MQTT connection */
  if(!mqttClient.connected()) {
    Serial.print("Reconnecting to MQTT server\n");
    if(mqttClient.connect(MQTT_CLIENT_ID)) {
      Serial.println("MQTT connected\n");
      mqttClient.publish(MQTT_TOPIC_PREFIX "/API",buff);
      mqttClient.publish(MQTT_TOPIC_PREFIX, "Perry nee");
    } else {
      Serial.print("MQTT connection failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      
    }
    
  }

  delay(5000);
  /* Process incoming MQTT messages */
  mqttClient.loop();

}

void display_set_header()
{
  display.cp437(true);
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(0,0);
  display.println("BlueCherry Hackathon");
  display.drawLine(0,8, 128, 8, SSD1306_WHITE);
}

/**
 * Initialize the display and print program name
 */
void setup_display() {
  if(!display.begin(SSD1306_SWITCHCAPVCC, SCREEN_ADDRESS, true, false)) {
    Serial.println("Screen initialization failed");
    while(true);
  }
  Serial.println("Display initialized");

  /* Display header */
  display.clearDisplay();
  display_set_header();
  display.setCursor(0, 16);
  display.print("ID: ");
  display.print(id);
  display.display();
  
}


// It works so don't question it



// Stores all of the fbm320's calibration values into global variables
// Calibration values are required to calculate temp and pressure
// This function should be called at the beginning of the program
void fbm320Calibration()
{
   
  R0 = fbm320ReadInt(0xAA);
  R1 = fbm320ReadInt(0xAC);
  R2 = fbm320ReadInt(0xAE);
  R3 = fbm320ReadInt(0xB0);
  R4 = fbm320ReadInt(0xB2);
  R5 = fbm320ReadInt(0xB4);
  R6 = fbm320ReadInt(0xB6);
  R7 = fbm320ReadInt(0xB8);
  R8 = fbm320ReadInt(0xBA);
  R9 = fbm320ReadInt1(0xD0)<<8|fbm320ReadInt1(0xF1);
  
  C0=R0>>4;
  C1=((R1&0xFF00)>>5)|(R2&7);
  C2=((R1&0xFF)<<1)|(R4&1);
  C3=R2>>3;
  C4=((uint32_t)R3<<1)|(R5&1);
  C5=R4>>1;
  C6=R5>>3;
  C7=((uint32_t)R6<<2)|((R0>>2)&3);
  C8=R7>>3;
  C9=R8>>2;
  C10=((R9&0xFF00)>>6)|(R8&3);
  C11 = R9 & 0xFF;
  C12=((R5&6)<<2)|(R7&7);
}

// Calculate pressure given up
// calibration values must be known
long int fbm320GetPressure(long int up)
{
  DT2=(X01+X02+X03)>>12;
  X11=(C5*DT2);
  X12=(((C6*DT2)>>16)*DT2)>>2;
  X13=((X11+X12)>>10)+((C4+211288)<<4);
  X21=((C8+7209)*DT2)>>10;
  X22=(((C9*DT2)>>17)*DT2)>>12;
   if(X22>=X21)
    X23=X22-X21;
   else
    X23=X21-X22;
 X24=(X23>>11)*(C7+285594);
 X25=((X23&0x7FF)*(C7+285594))>>11;
   if((X22-X21)<0)
    X26=((0-X24-X25)>>11)+C7+285594;
   else
    X26=((X24+X25)>>11)+C7+285594;
 PP1=((up-8388608)-X13)>>3;
 PP2=(X26>>11)*PP1;
 PP3=((X26&0x7FF)*PP1)>>11;
 PP4=(PP2+PP3)>>10;
 CF=(2097152+C12*DT2)>>3;
 X31=(((CF*C10)>>17)*PP4)>>2;
 X32=(((((CF*C11)>>15)*PP4)>>18)*PP4);
 RP=((X31+X32)>>15)+PP4+99880;
  return RP;
}
 
// Read 1 byte from the fbm320 at 'address'
char fbm320Read(unsigned char address)
{
  unsigned char data;
 
  Wire.beginTransmission(fbm320_ADDRESS);
  Wire.write(address);
  Wire.endTransmission();
 
  Wire.requestFrom(fbm320_ADDRESS, 1);
  while(!Wire.available());
   
  return Wire.read();
}
 
// Read 2 bytes from the fbm320
// First byte will be from 'address'
// Second byte will be from 'address'+1
int fbm320ReadInt(unsigned char address)
{
  unsigned char msb, lsb;
 
  Wire.beginTransmission(fbm320_ADDRESS);
  Wire.write(address);
  Wire.endTransmission();
 
  Wire.requestFrom(fbm320_ADDRESS, 2);
  while(Wire.available()<2);
  msb = Wire.read();
  lsb = Wire.read();
 
  return( (long int) msb<<8 | (long int)lsb);
}

// Read 1 bytes from the fbm320
int fbm320ReadInt1(unsigned char address)
{
  unsigned char msb, lsb;
 
  Wire.beginTransmission(fbm320_ADDRESS);
  Wire.write(address);
  Wire.endTransmission();
 
  Wire.requestFrom(fbm320_ADDRESS, 1);
  while(Wire.available()<1);
  msb = Wire.read();
 // lsb = Wire.read();
 
  return (int) msb;
}
// Read 3 bytes from the fbm320
int fbm320ReadInt3(unsigned char address)
{
  unsigned char msb, lsb,xlsb;
 
  Wire.beginTransmission(fbm320_ADDRESS);
  Wire.write(address);
  Wire.endTransmission();
 
  Wire.requestFrom(fbm320_ADDRESS, 3);
  while(Wire.available());
  msb = Wire.read();
  lsb = Wire.read();
  xlsb = Wire.read();
 
  return( (unsigned long) msb<<16 | (unsigned long)lsb) <<8 | (unsigned long)xlsb;
}

 
// Read the uncompensated pressure value
 long int fbm320ReadUP()
{
  unsigned char msb, lsb, xlsb;
  long int up = 0;
 
  // Write 0x34+(OSS<<6) into register 0xF4
  // Request a pressure reading w/ oversampling setting
  Wire.beginTransmission(fbm320_ADDRESS);
  Wire.write(0xF4);
  Wire.write(0xF4);
  Wire.endTransmission();
 
  // Wait for conversion
  delay(12);
 
  // Read register 0xF6 (MSB), 0xF7 (LSB), and 0xF8 (XLSB)
  Wire.beginTransmission(fbm320_ADDRESS);
  Wire.write(0xF6);
  Wire.endTransmission();
  Wire.requestFrom(fbm320_ADDRESS, 3);
 
  // Wait for data to become available
  while(Wire.available() < 3);
  msb = Wire.read();
  lsb = Wire.read();
  xlsb = Wire.read();
 
  up = ((unsigned long) msb << 16) + ((unsigned long) lsb << 8) + (unsigned long) xlsb;
  return up;
}
