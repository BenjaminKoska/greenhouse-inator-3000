const express = require(`express`);
const mqtt = require(`mqtt`);

  //////////////
 //// VARS ////
//////////////
const greenHouses = [];
const webServerPort = 80;
const mqttUrl = `mqtt://broker.hivemq.com`
const mqttPort = `1883`
const mqttTopic = `/DeCodeBadgers`

const mqttClient = mqtt.connect(`${mqttUrl}:${mqttPort}`)
const server = express();
const router = express.Router();

  /////////////////////
 //// MQTT CLIENT ////
/////////////////////
const mqttClientConnect = async function(){
    mqttClient.on('connect', function(){
        mqttClient.subscribe(`${mqttTopic}/#`, function(e){
            if(e){
                console.log(e.message);
                reject();
            } else {
                mqttClient.publish(mqttTopic, `API has made connection`);
                console.log(`MQTT connection made to ${mqttUrl} on Topic: ${mqttTopic}`)
                mqttClient.on('message', function(topic, message){
                    if(topic == `/DeCodeBadgers/API`){
                        let data = JSON.parse(message.toString());
                        addDataToArray(data)

                    } else {
                        console.log(topic, message.toString());
                    }
                })
            }
        })
    })
}

const addDataToArray = function(data){
    let hasFound = false;
    greenHouses.forEach(greenHouse => {
        if(greenHouse.uniqueId === data.uniqueId){
            greenHouse.light = data.light;
            greenHouse.humidity = data.humidity;
            greenHouse.temperature = data.temperature;
            greenHouse.doorOpen = data.doorOpen;

            hasFound = true;
        }
    });
    if(!hasFound){
        greenHouses.push(data);
    }
    console.log(greenHouses);

}


  ///////////////////
 //// WEBSERVER ////
///////////////////
const createServerResponse = function(link, file){
    router.get(link, function(request, response){
        response.sendFile(`${__dirname}/html/${file}`)
    })
}

  //////////////
 //// INIT ////
//////////////
const init = async function(){
    server.use('/', router);
    server.listen(webServerPort, function(){
        console.log(`Webserver is listening on port: ${webServerPort}`);
    })

    await mqttClientConnect();
    createServerResponse(`/`, `index.html`);
}



init();