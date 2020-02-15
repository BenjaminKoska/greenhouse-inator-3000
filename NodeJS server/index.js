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
    data.datetime = returnCurrentTime();
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

const returnCurrentTime = function(){
    let dt = new Date(),
	current_date = dt.getDate(),
	current_month = dt.getMonth() + 1,
	current_year = dt.getFullYear(),
	current_hrs = dt.getHours(),
	current_mins = dt.getMinutes(),
	current_secs = dt.getSeconds(),
	current_datetime;

// Add 0 before date, month, hrs, mins or secs if they are less than 0
current_date = current_date < 10 ? '0' + current_date : current_date;
current_month = current_month < 10 ? '0' + current_month : current_month;
current_hrs = current_hrs < 10 ? '0' + current_hrs : current_hrs;
current_mins = current_mins < 10 ? '0' + current_mins : current_mins;
current_secs = current_secs < 10 ? '0' + current_secs : current_secs;

// Current datetime
// String such as 2016-07-16T19:20:30
current_datetime = current_year + '-' + current_month + '-' + current_date + 'T' + current_hrs + ':' + current_mins + ':' + current_secs;

return current_datetime;
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

const getHourlyGreenhouseData = function(uniqueId){
    let hourlygreenhouses;
    db.greenHouses.forEach(greenHouse => {
        if(greenHouse[0].uniqueId == uniqueId){
            hourlygreenhouses = greenHouse.slice(-24);  
        }
    });

    return hourlygreenhouses;
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

    router.get(`/graph/:uniqueId`, (req, res) => {
        return res.send(getHourlyGreenhouseData(req.params.uniqueId));
    });

}


init();