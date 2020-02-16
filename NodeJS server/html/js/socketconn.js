let socket = io();

let currentData;
let statistics;
let cropInfo;
let allSensors;

socket.on(`realTimeData`, function(data) {
    console.log(`update this now: ${data}`);
    currentData = JSON.parse(data);
    updateRealTime();

})

socket.on(`allSensors`, function(data) {
    //console.log(`less important: ${data}`);
    allSensors = JSON.parse(data);
    console.log(allSensors);
    generateList();
})



socket.on(`cropInfo`, function(data) {
    //console.log(`less important: ${data}`);
    cropInfo = JSON.parse(data);
})

socket.on(`statistics`, function(data) {
    //console.log(`statistics: ${data}`);
    statistics = JSON.parse(data);
})