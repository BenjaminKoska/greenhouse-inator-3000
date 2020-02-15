// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';


let optimalData = { temperature: 23.00, humidity: 85.00, lux: 37500, pressure: 1.00 };

/*
async function init() {
    console.log("pie script loaded");
    sensorData = await getAllData(recentInfoUrl);

    generateList();
    updateInfo(0); //open page with current page displaying info of sensor 1
}



async function getDataToCompareTo(url = ``) {
    const response = await fetch(url, {
        method: `GET`,
        mode: `cors`
    });
    return await response.json()
}
*/

function calculateScore() {
    let currentValues = { temperature: 15.00, humidity: 95.00, lux: 20500, pressure: 0.80 };
    let scores = [
        Math.abs((currentValues.temperature / optimalData.temperature) - 1),
        Math.abs((currentValues.humidity / optimalData.humidity) - 1),
        Math.abs((currentValues.lux / optimalData.lux) - 1),
        Math.abs((currentValues.pressure / optimalData.pressure) - 1)
    ];

    scores[0] = Math.abs(scores[0] - 1) * 100;
    scores[1] = Math.abs(scores[1] - 1) * 100;
    scores[2] = Math.abs(scores[2] - 1) * 100;
    scores[3] = Math.abs(scores[3] - 1) * 100;
    console.log(scores);
    return scores;
}

function number_format(number, decimals, dec_point, thousands_sep) {
    // *     example: number_format(1234.56, 2, ',', ' ');
    // *     return: '1 234,56'
    number = (number + '').replace(',', '').replace(' ', '');
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        s = '',
        toFixedFix = function(n, prec) {
            var k = Math.pow(10, prec);
            return '' + Math.round(n * k) / k;
        };
    // Fix for IE parseFloat(0.55).toFixed(0) = 0;
    s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}

// Bar Chart Example
var ctx = document.getElementById("myBarChart");
var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Temperature", "Humitidy", "Light", "Pressure"],
        datasets: [{

            backgroundColor: "#4e73df",
            hoverBackgroundColor: "#2e59d9",
            borderColor: "#4e73df",
            data: calculateScore(),
        }],
    },
    options: {
        maintainAspectRatio: false,
        layout: {
            padding: {
                left: 10,
                right: 25,
                top: 25,
                bottom: 0
            }
        },
        scales: {
            xAxes: [{
                gridLines: {
                    display: false,
                    drawBorder: false
                },
                ticks: {
                    maxTicksLimit: 6,
                },
                maxBarThickness: 25,
            }],
            yAxes: [{
                ticks: {
                    min: 0,
                    max: 100,
                    maxTicksLimit: 5,
                    stepSize: 0.5,
                    padding: 10,
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return number_format(value);
                    }
                },
                gridLines: {
                    color: "rgb(234, 236, 244)",
                    zeroLineColor: "rgb(234, 236, 244)",
                    drawBorder: false,
                    borderDash: [2],
                    zeroLineBorderDash: [2]
                }
            }],
        },
        legend: {
            display: false
        },
        tooltips: {
            titleMarginBottom: 10,
            titleFontColor: '#6e707e',
            titleFontSize: 14,
            backgroundColor: "rgb(255,255,255)",
            bodyFontColor: "#858796",
            borderColor: '#dddfeb',
            borderWidth: 1,
            xPadding: 15,
            yPadding: 15,
            displayColors: false,
            caretPadding: 10,
            callbacks: {
                label: function(tooltipItem, chart) {
                    return `Score: ${number_format(tooltipItem.yLabel)}/100`;
                }
            }
        },
    }
});