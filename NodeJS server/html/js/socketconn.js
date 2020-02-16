let socket = io();

let currentData;
let statistics;
let cropInfo;

socket.on(`realTimeData`, function(data) {
    console.log(`update this now: ${data}`);
    currentData = JSON.parse(data);
    updateRealTime();
    
})

socket.on(`cropInfo`, function(data) {
    //console.log(`less important: ${data}`);
    cropInfo = JSON.parse(data);
})

socket.on(`statistics`, function(data) {
    //console.log(`statistics: ${data}`);
    statistics = JSON.parse(data);
})