let socket = io();

let currentData;
let statistics;
let cropInfo;
let allSensors;

let counter = 0;

socket.on(`realTimeData`, async function (data) {
    console.log(`update this now: ${data}`);
    currentData = JSON.parse(data);
    updateRealTime();
    counter++

    if (counter == 6) {
        counter = 0;
        await sleep(500);
        mySunChart.data.datasets[0].data.shift();
        mySunChart.data.datasets[0].data.push(currentData.light);
        mySunChart.update();

        myHumChart.data.datasets[0].data.shift();
        myHumChart.data.datasets[0].data.push(currentData.humidity);
        myHumChart.update();

        myTempChart.data.datasets[0].data.shift();
        myTempChart.data.datasets[0].data.push(currentData.temperature);
        myTempChart.update();
    }

})

socket.on(`allSensors`, function (data) {
    //console.log(`less important: ${data}`);
    allSensors = JSON.parse(data);
    //console.log(allSensors);
    generateList();
})

socket.on(`cropInfo`, function (data) {
    //console.log(`less important: ${data}`);
    cropInfo = JSON.parse(data);
    calculateScore();
})

socket.on(`statistics`, function (data) {
    //console.log(`statistics: ${data}`);
    statistics = JSON.parse(data);
    console.log(statistics)
    loadTempGraph();
    loadHumGraph();
    loadSunLightGraph();
})


socket.on(`statisticsUpdate`, function (data) {
    //console.log(`statistics: ${data}`);
    statistics = JSON.parse(data);
    console.log(statistics)
    //myBarChart.data.datasets[0] = data;
    //myBarChart.update();


    // myHumChart
    // myTempChart


})

socket.on(`chat`, function (data) {
    addServerMessage(data);
})