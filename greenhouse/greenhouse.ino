#include <PubSubClient.h>
#include <WiFi.h>
/* Parameters for the MQTT connection */
#define MQTT_SERVER         "broker.hivemq.com"
#define MQTT_PORT           1883
#define MQTT_CLIENT_ID      "DeCodeBadgers"
#define MQTT_TOPIC_PREFIX   "/DeCodeBadgers"


#define WIFI_SSID           "Schuur De Vier Ambachten"
#define WIFI_PASSWORD       "gratiswifi"

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

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
    setup_wifi();
    setup_mqtt();
}

/**
 * Main application which runs in infinite loop.
 */
void loop() {
  mqttClient.publish(MQTT_TOPIC_PREFIX, "Perry nee");
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
