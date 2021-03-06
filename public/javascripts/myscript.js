var tempChart;
var humChart;
var presChart;
var socket = io();

$(document).ready(function () {
    var chartStatus = checkForCharts();

    if(chartStatus[0]){
        tempChart = createChart('tempChart', 'Temperature in °C', '#FF0000', 'temperature', 'Temperature');
    }
    if(chartStatus[1]){
        humChart = createChart('humChart', 'Humidity in %', '#0a48ff', 'humidity', 'Humidity');
    }
    if(chartStatus[2]){
        presChart = createChart('presChart', 'Pressure in Pa', '#327a00', 'pressure', 'Pressure');
    }

    function createConfig(label, data, title) {
        /* Return config for chart with given parameters */
        return {
            label: label,
            type: 'line',
            data: data,
            options: {
                responsive: true,
                title: {
                    display: true,
                    text: title,
                    fontSize: 15
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            displayFormats: {
                                millisecond: "HH:mm:ss",
                                second: 'HH:mm:ss',
                                minute: 'HH:mm:ss',
                                hour: 'HH:mm:ss',
                                day: 'HH:mm:ss',
                                month: 'HH:mm:ss',
                                quarter: "HH:mm:ss",
                                year: 'HH:mm:ss'
                            }
                        },
                        distribution: 'linear',
                        ticks: {callback: function(value, index, values) {
                                if (!values[index]) {return}
                                return moment.utc(values[index]['value']).format('HH:mm:ss');
                            }}
                    }]
                }
            }
        };
    }

    function createChart(id, label_data, color_data, label_config, title){
        /* Return created chart */
        var data = {
            datasets: [{
                label: label_data,
                fill: false,
                lineTension: 0,
                borderColor: color_data,
                backgroundColor: '#FFFFFF',
                pointBorderColor: '#000000',
                pointBackgroundColor: '#000000',
                data: []
            }]
        };
        return new Chart($("#"+id), createConfig(label_config, data, title));
    }


    function addData(chart, label, data) {
        /* Add data to given chart with values and update chart */
        chart.data.datasets[0].data.push({x: label, y: data});
        chart.update();
    }

    function checkForCharts() {
        /* Check if all charts are created in document */
        var i1 = false, i2 = false, i3 = false;
        var elem = document.getElementById('tempChart');
        if (elem !== null) {
            i1 = true;
        }
        elem = document.getElementById('humChart');
        if (elem !== null) {
            i2 = true;
        }
        elem = document.getElementById('presChart');
        if (elem !== null) {
            i3 = true;
        }

        return [i1, i2, i3];
    }

    function deleteData(chart){
        /* Delete data from chart, which is older than one minute */
        if(chart.data.datasets[0].data.length !== 0){
            while (true){
                var lastValue = chart.data.datasets[0].data.shift();
                var lastMoment = lastValue['x'];
                var lastTime = moment(lastMoment).subtract(1, 'hour');
                if(moment() - lastTime < 60*1000){
                    chart.data.datasets[0].data.unshift(lastValue);
                    break;
                }
            }
        }
    }

    function onNewData(time, temperature, humidity, pressure){
        /* Insert new data coming from sensor into charts, if any exists */
        if (chartStatus[0]) {
            deleteData(tempChart);
            addData(tempChart, time, temperature);
        }
        if (chartStatus[1]) {
            deleteData(humChart);
            addData(humChart, time, humidity);
        }
        if (chartStatus[2]) {
            deleteData(presChart);
            addData(presChart, time, pressure);
        }
    }

    // when document is fully ready, send signal to server that it can send init data
    socket.emit('ready', 'hi', function (init_data) {
        // initialize charts
        var elem;
        for (elem in init_data) {
            if (chartStatus[0]) {
                addData(tempChart, moment(init_data[elem]['time']), init_data[elem]['temp_value']);
            }
            if (chartStatus[1]) {
                addData(humChart, moment(init_data[elem]['time']), init_data[elem]['hum_value']);
            }
            if (chartStatus[2]) {
                addData(presChart, moment(init_data[elem]['time']), init_data[elem]['pres_value']);
            }
        }
        socket.on('new_data', onNewData);
    });
});
