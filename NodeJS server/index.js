const express = require(`express`);
const mqtt = require(`mqtt`);
let fs = require('fs');


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
                        addDataToDB(data);
                    } else {
                        console.log(topic, message.toString());
                    }
                })
            }
        })
    })
}

const addDataToDB = function(data){
    let datetime = new Date();
    data.datetime = datetime
    let currentgreenhouse = data;

    if(db.greenHouses.length > 0){
        let checkToAdd = checkDb(currentgreenhouse);
        if(checkToAdd){
            db.greenHouses.push([currentgreenhouse]);
        }
    } else {
        db.greenHouses.push([currentgreenhouse]);
    }

    updateDB();
}

const checkDb = function(currentgreenhouse){
    let foundmatch = false;
    db.greenHouses.forEach(greenhouse => {
        if(greenhouse[0].uniqueId === currentgreenhouse.uniqueId){
            greenhouse.push(currentgreenhouse);
            foundmatch = true;
        }
    });
    if(foundmatch){
        return false;
    } else {
        return true;
    }
}
    
  ///////////////////
 //// WEBSERVER ////
///////////////////
const createServerResponse = function(link, file){
    router.get(link, function(request, response){
        response.sendFile(`${__dirname}/html/${file}`)
    })
}


  //////////////////
 //// DATABASE ////
//////////////////
const readInDB = async function(file){
    return JSON.parse(await readFile(file));
}

const updateDB = async function(){
    await writeToFile(`${__dirname}/db.db`, JSON.stringify(db, null, 2));
    db = await readInDB(`${__dirname}/db.db`);
}

const getMostRecentForAllGreenhouses = function(){
    let newestgreenhouses = [];
    db.greenHouses.forEach(greenHouse => {
        newestgreenhouses.push(greenHouse[greenHouse.length-1]);  
    });

    return newestgreenhouses;
}




  /////////////////
 //// HELPERS ////
/////////////////
const readFile = function(path){
    return new Promise(function(resolve, reject){
        try {
            let data = fs.readFileSync(path);
            resolve(data);
        } catch(e) {
            console.log(e.message, 2);
            reject();
        }
    })
}

const writeToFile = function(filename, data){
    return new Promise(function(resolve, reject){
        fs.writeFile(filename, data, function (e){
            if(e){
                console.log(e.message, 2);
                reject();
            } else {
                resolve();
            }
        })
    })
}


  //////////////
 //// INIT ////
//////////////
const init = async function(){
    db = await readInDB(`${__dirname}/db.db`);
    server.use('/', router);
    server.use(express.static('html'))

    server.listen(webServerPort, function(){
        console.log(`Webserver is listening on port: ${webServerPort}`);
    })

    await mqttClientConnect();
    createServerResponse(`/`, `index.html`);
    router.get(`/recent`, (req, res) => {
        return res.send(getMostRecentForAllGreenhouses());
      });

}


init();