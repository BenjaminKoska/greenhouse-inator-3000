const express = require(`express`);
const mqtt = require(`mqtt`);

  //////////////
 //// VARS ////
//////////////
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
    return new Promise(function(resolve, reject){
        mqttClient.on('connect', function(){
            mqttClient.subscribe(mqttTopic, function(e){
                if(e){
                    console.log(e.message);
                    reject();
                } else {
                    mqttClient.publish(mqttTopic, `API has made connection`);
                    console.log(`MQTT connection made to ${mqttUrl} on Topic: ${mqttTopic}`)
                    resolve();
                }
            })
        })
    })
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