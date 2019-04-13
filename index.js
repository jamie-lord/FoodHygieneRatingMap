function onLoad() {
    getLocation();
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(positionCallback, positionErrorCallback);
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

function positionCallback(position) {
    initMap(position.coords.latitude, position.coords.longitude);
    getData(position.coords.latitude, position.coords.longitude, 3);
}

function positionErrorCallback(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}

var map;

function initMap(latitude, longitude) {
    map = L.map('map').setView([latitude, longitude], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', { foo: 'bar', attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>' }).addTo(map);
    var marker = L.marker([latitude, longitude], { icon: myLocationIcon }).addTo(map);
    marker.bindPopup('You are (probably) here');
}

function getData(latitude, longitude, pageNumber) {
    getJSON('http://api.ratings.food.gov.uk/Establishments/?latitude=' + latitude + '&longitude=' + longitude + '&pageSize=1000&pageNumber=' + pageNumber,
        function (err, data) {
            if (err !== null) {
                alert('Something went wrong: ' + err);
            } else {
                addEstablishmentsToMap(data.establishments);
            }
        });
}

var getJSON = function (url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader('x-api-version', '2');
    xhr.onload = function () {
        var status = xhr.status;
        if (status === 200) {
            callback(null, xhr.response);
        } else {
            callback(status, xhr.response);
        }
    };
    xhr.send();
};

var myLocationIcon = L.icon({
    iconUrl: 'myLocation.svg',
    iconSize: [38, 95]
});

function generatePlaceIcon(rating) {
    var colour = '0, 0, 0';
    switch (rating) {
        case '0':
            colour = '231, 76, 60';
            break;
        case '1':
            colour = '230, 126, 34';
            break;
        case '2':
            colour = '243, 156, 18';
            break;
        case '3':
            colour = '241, 196, 15';
            break;
        case '4':
            colour = '46, 204, 113';
            break;
        case '5':
            colour = '39, 174, 96';
            break;
        case 'Pass':
            colour = '39, 174, 96';
            break;
        case 'ImprovementRequired':
            colour = '243, 156, 18';
            break;
        case 'AwaitingPublication':
            colour = '52, 152, 219';
            break;
        case 'AwaitingInspection':
            colour = '52, 152, 219';
            break;
        case 'Exempt':
            colour = '52, 152, 219';
            break;
    }
    var i = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="rgb(` + colour + `)"/><path d="M0 0h24v24H0z" fill="none"/></svg>`;
    console.log(i);
    return i;
}

function addEstablishmentsToMap(establishments) {
    establishments.forEach(establishment => {
        var placeIcon = L.icon({
            iconUrl: encodeURI(`data:image/svg+xml,` + generatePlaceIcon(establishment.RatingValue)),
            iconSize: [38, 95],
            popupAnchor: [0, -15]
        });

        var marker = L.marker([establishment.geocode.latitude, establishment.geocode.longitude], { icon: placeIcon, title: establishment.BusinessName }).addTo(map);
        marker.bindPopup(establishment.BusinessName + ' ' + establishment.RatingValue);
    });
}