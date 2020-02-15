const recentInfoUrl = `http://localhost/recent`;

const doorStatusCard = document.querySelector(`#doorStatusCard`);
const tempInfoField = document.querySelector(`#tempInfoField`);
const pressInfoField = document.querySelector(`#pressInfoField`);
const humidInfoField = document.querySelector(`#humidInfoField`);

const doorInfoCard = document.querySelector(`#doorInfoCard`);

const sensorSidebar = document.querySelector(`#sensorSidebar`);

let isDoorOpen = null;
let curTemp = null;
let curPress = null;
let curHumid = null;

let sensorData = [
    {
        "uniqueId": "mock 1",
        "light": 5000,
        "humidity": 30,
        "temperature": null,
        "doorOpen": false,
        "pressure": 160,
    },
    {
        "uniqueId": "mock 2",
        "light": 10000,
        "humidity": 40,
        "temperature": 40,
        "doorOpen": true,
        "pressure": 160,
    },
    {
        "uniqueId": "mock 69",
        "light": 69000,
        "humidity": 50,
        "temperature": 32,
        "doorOpen": null,
        "pressure": 160,
    },
    {
        "uniqueId": "mock 420",
        "light": null,
        "humidity": null,
        "temperature": null,
        "doorOpen": null,
        "pressure": null,
    },
];

async function init() {
    console.log("custom script loaded");
    sensorData = await getAllData(recentInfoUrl); //TODO remove commenting if you want to call to the db

    generateList();
    updateInfo(0); //open page with current page displaying info of sensor 1
}

async function getAllData(url = ``) {
    const response = await fetch(url, {
        method: `GET`,
        mode: `cors`
    });
    return await response.json()
}

let updateInfo = (clickedItem) => {
    isDoorOpen = sensorData[clickedItem].doorOpen;
    curTemp = sensorData[clickedItem].temperature;
    curPress = sensorData[clickedItem].pressure;
    curHumid = sensorData[clickedItem].humidity;

    if (isDoorOpen) {
        openDoor()
    } else if (isDoorOpen === false) {
        closeDoor()
    } else {
        stupidDoor()
    }
    updateTemp();
    updatePress();
    updateHumid();
}; //get basic data from backend and update in frontend

let openDoor = () => {
    doorStatusCard.classList.remove('fa-door-closed');
    doorStatusCard.classList.add('fa-door-open');

    doorInfoCard.innerHTML = `
                        <div class="card shadow h-100 py-2 bg-danger border-left-danger">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-light text-uppercase mb-1"><i class="fas fa-exclamation-triangle text-light"></i> Door status 
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-light">Open
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-door-open fa-2x text-light"></i>
                                    </div>
                                </div>
                            </div>
                        </div>`;
};  //show door that is opened

let closeDoor = () => {
    doorStatusCard.classList.remove('fa-door-open');
    doorStatusCard.classList.add('fa-door-closed');

    doorInfoCard.innerHTML = `
                        <div class="card border-left-info shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">Door status
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800">Closed
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-door-closed fa-2x text-info" id="doorStatusCard"></i>
                                    </div>
                                </div>
                            </div>
                        </div>`;
}; // show closed door

let stupidDoor = () => {
    doorStatusCard.classList.remove('fa-door-open');
    doorStatusCard.classList.add('fa-door-closed');

    doorInfoCard.innerHTML = `
                        <div class="card border-left-info shadow h-100 py-2">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-info text-uppercase mb-1">Door status
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-gray-800"><span id="doorInfoField">Missing info</span>
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-door-closed fa-2x text-info" id="doorStatusCard"></i>
                                    </div>
                                </div>
                            </div>
                        </div>`;
}; // show door with missing info

let updateTemp = () => {
    if (curTemp != null) {
        tempInfoField.innerText = `${curTemp}°C`
    } else {
        tempInfoField.innerText = `Missing info`
    }

};

let updatePress = () => {
    if (curPress != null) {
        pressInfoField.innerText = `${curPress} Bar`;
    } else {
        pressInfoField.innerText = `Missing info`
    }

};

let updateHumid = () => {
    if (curHumid != null) {
        humidInfoField.innerText = `${curHumid}%`;
    } else {
        humidInfoField.innerHTML = `Missing Info`
    }
};

let generateList = () => {
    let resultList = ``;

    for (let i = 0; i < sensorData.length; i++) {
        resultList = resultList + `
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="updateInfo(${i})">
                <i class="fas fa-fw fa-leaf"></i>
                <span>${sensorData[i].uniqueId} - Dashboard</span></a>
        </li>
        <hr class="sidebar-divider my-0">`
    }

    sensorSidebar.innerHTML = resultList;
}; //generate the list of sensors

document.addEventListener('DOMContentLoaded', init);