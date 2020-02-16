const express = require(`express`);
const app = express();
const http = require(`http`).createServer(app);
const io = require(`socket.io`)(http);
const mqtt = require(`mqtt`);
const fs = require('fs');

let db;

let httpPort = 80
const mqttUrl = `mqtt://broker.hivemq.com`
const mqttPort = `1883`
const mqttTopic = `/DeCodeBadgers`

const mqttClient = mqtt.connect(`${mqttUrl}:${mqttPort}`)


//// WEBSERVER ////
//// WEBSOCKET //// 
app.get(`/`, function(req, res) {
    res.sendFile(`${__dirname}/html/index.html`)
})

// app.get(`/socket.js`, function(req, res){
//     res.sendFile(`${__dirname}/socket.io.js`)
// })

app.use(express.static('html'))


io.on(`connection`, function(socket) {
    console.log(`client connected`)
    socket.on(`disconnect`, function() {
        console.log(`client disconnected`)
    })
    sendInfoViaWS('allSensors', JSON.stringify(getAllSensors()))
    sendInfoViaWS('realTimeData', JSON.stringify(getMostRecentForFirstGreenhouses()))
    sendInfoViaWS('statistics', JSON.stringify(getHourlyGreenhouseData()))
    sendInfoViaWS('cropInfo', JSON.stringify(getCropInfo()))

    socket.on('msg', function(msg) {
        handleClientMsg(msg);
    })

    socket.on('chat', function(msg) {
        handleChatMessage(msg);
        sendInfoViaWS('chat', "Service desk unavailable");
    })

})

http.listen(httpPort, function() {
    console.log(`listening on *:${httpPort}`)
})

const handleChatMessage = function(msg) {
    mqttClient.publish(mqttTopic + "/chat", msg);
}

const handleClientMsg = function(msg) {
    console.log(msg);
}

const sendInfoViaWS = function(infoType, info) {
    io.emit(infoType, info);
}

//// FILE DB ////
const addDataToDB = function(data) {
    data.datetime = returnCurrentTime();
    let currentgreenhouse = data;

    if (db.greenHouses.length > 0) {
        let checkToAdd = checkDb(currentgreenhouse);
        if (checkToAdd) {
            db.greenHouses.push([currentgreenhouse]);
        }
    } else {
        db.greenHouses.push([currentgreenhouse]);
    }

    updateDB();
}

const checkDb = function(currentgreenhouse) {
    let foundmatch = false;
    db.greenHouses.forEach(greenhouse => {
        if (greenhouse[0].uniqueId === currentgreenhouse.uniqueId) {
            greenhouse.push(currentgreenhouse);
            foundmatch = true;
        }
    });
    if (foundmatch) {
        return false;
    } else {
        return true;
    }
}


const readInDB = async function(file) {
    return JSON.parse(await readFile(file));
}

const updateDB = async function() {
    await writeToFile(`${__dirname}/db.db`, JSON.stringify(db, null, 2));
    db = await readInDB(`${__dirname}/db.db`);
}

const getCropInfo = function() {
    return db.plants[0];
}

const getHourlyGreenhouseData = function(uniqueId) {
    let hourlygreenhouses;

    let temp = { temperature: [] };
    let humidity = { humidity: [] };
    let pressure = { pressure: [] };
    let light = { light: [] };

    if (uniqueId != null) {
        db.greenHouses.forEach(greenHouse => {
            if (greenHouse[0].uniqueId == uniqueId) {
                hourlygreenhouses = greenHouse.slice(-12);
            }
        });
    } else {
        hourlygreenhouses = db.greenHouses[0].slice(-12);
    }

    hourlygreenhouses.forEach(hourlygreenhouse => {
        temp.temperature.push(hourlygreenhouse.temperature);
        humidity.humidity.push(hourlygreenhouse.humidity);
        pressure.pressure.push(hourlygreenhouse.pressure);
        light.light.push(hourlygreenhouse.light);
    });

    return [temp, humidity, pressure, light];
}

const getAllSensors = function() {
    let allSensors = [];

    db.greenHouses.forEach(greenHouse => {
        allSensors.push(greenHouse[0].uniqueId);
    });

    return allSensors;
}

const getMostRecentForFirstGreenhouses = function() {
    let firstgreenhouse = db.greenHouses[0];
    return firstgreenhouse[firstgreenhouse.length - 1];
}

//// MQTT CLIENT ////
const mqttClientConnect = async function() {
    mqttClient.on('connect', function() {
        mqttClient.subscribe(`${mqttTopic}/#`, function(e) {
            if (e) {
                console.log(e.message);
                reject();
            } else {
                mqttClient.publish(mqttTopic, `API Server has made connection`);
                console.log(`MQTT connection made to ${mqttUrl} on Topic: ${mqttTopic}`)
                mqttClient.on('message', function(topic, message) {
                    if (topic == `/DeCodeBadgers/API`) {
                        let data = message.toString();
                        sendInfoViaWS(`realTimeData`, data);
                        addDataToDB(JSON.parse(data));
                    } else {
                        console.log(topic, message.toString());
                    }
                })
            }
        })
    })
}


//// HELPERS ////
const returnCurrentTime = function() {
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


const readFile = function(path) {
    return new Promise(function(resolve, reject) {
        try {
            let data = fs.readFileSync(path);
            resolve(data);
        } catch (e) {
            console.log(e.message, 2);
            reject();
        }
    })
}

const writeToFile = function(filename, data) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(filename, data, function(e) {
            if (e) {
                console.log(e.message, 2);
                reject();
            } else {
                resolve();
            }
        })
    })
}




//// INIT ////

const init = async function() {
    db = await readInDB(`${__dirname}/db.db`);
    await mqttClientConnect();
}

init();