const doorStatusCard = document.querySelector(`#doorStatusCard`);
const opendoorButton = document.querySelector(`#opendoorButton`);
const closedoorButton = document.querySelector(`#closedoorButton`);
const doorInfoField = document.querySelector(`#doorInfoField`);
const tempInfoField = document.querySelector(`#tempInfoField`);
const doorInfoCard = document.querySelector(`#doorInfoCard`);
const pressInfoField = document.querySelector(`#pressInfoField`);

let isDoorOpen = false;
let curTemp = 10;
let curPress = 60;


let init = () => {
    console.log("custom script loaded");
    if (isDoorOpen === true) {
        openDoor()
    } else if (isDoorOpen === false) {
        closeDoor()
    }
    updateTemp();
    updatePress();
};

let openDoor = () => {
    doorStatusCard.classList.remove('fa-door-closed');
    doorStatusCard.classList.add('fa-door-open');

    doorInfoField.innerHTML = `<i class="fas fa-exclamation-triangle text-danger"></i>Open`;

    doorInfoCard.innerHTML = `
                        <div class="card shadow h-100 py-2 bg-danger border-left-danger">
                            <div class="card-body">
                                <div class="row no-gutters align-items-center">
                                    <div class="col mr-2">
                                        <div class="text-xs font-weight-bold text-light text-uppercase mb-1"><i class="fas fa-exclamation-triangle text-light"></i> Door status 
                                        </div>
                                        <div class="h5 mb-0 font-weight-bold text-light"><span>Open</span>
                                        </div>
                                    </div>
                                    <div class="col-auto">
                                        <i class="fas fa-door-open fa-2x text-light"></i>
                                    </div>
                                </div>
                            </div>
                        </div>`
};

let closeDoor = () => {
    doorStatusCard.classList.remove('fa-door-open');
    doorStatusCard.classList.add('fa-door-closed');

    doorInfoField.innerHTML = `Closed`;
};

let updateTemp = () => {
    tempInfoField.innerText = `${curTemp}°C`
};

let updatePress = () => {
    pressInfoField.innerText = `${curPress} Pa`;
};

document.addEventListener('DOMContentLoaded', init);