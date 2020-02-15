#include <WiFi.h>
#include <Wire.h>
#include <BH1750FVI.h>
#include <Sodaq_HTS221.h>
#include <PubSubClient.h>


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
const int pushButton = 0;

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

  lightSensor.begin();
  Serial.println("BH1750FVI sensor initialized");
}

/**
 * Main application which runs in infinite loop.
 */
void loop() {
  char buff1[64] = { 0 };
  float temp = humiditySensor.readTemperature();
  float humidity = humiditySensor.readHumidity();

  Serial.println(temp);


  snprintf(buff1, 64, "{\"tmp\":%.02f,\"hmd\":%.02f}", temp, humidity);
  Serial.println(buff1);
  
  char buff2[64] = { 0 };
  uint16_t lux = lightSensor.GetLightIntensity();
  snprintf(buff2, 64, "{\"lux\":%d}", lux);
  Serial.println(buff2);
  
  mqttClient.publish(MQTT_TOPIC_PREFIX,buff1);

  mqttClient.publish(MQTT_TOPIC_PREFIX,buff2);


  int stateButton = digitalRead(pushButton);
  
  if(stateButton == 0) {
     Serial.println("PRESSED"); 
  } else {
     Serial.println("RELEASED"); 
  }
  
    
  /* Check MQTT connection */
  if(!mqttClient.connected()) {
    Serial.print("Reconnecting to MQTT server\n");
    if(mqttClient.connect(MQTT_CLIENT_ID)) {
      Serial.println("MQTT connected\n");
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
