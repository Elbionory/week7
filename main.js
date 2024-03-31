import moment from 'moment';
let currentDate = moment();
let city = '';
let tempUnits = 'celsius';
const windSpeedUnit = 'mph'
const root = document.documentElement;
const btnSearch = document.querySelector(".btn-search");
const searchPlace = document.querySelector(".search-place");
const closeBtn = document.querySelector(".close");
const currentTemp = document.querySelector('#currentTemp');
const cityPlace = document.querySelector('#cityPlace');
const condition = document.querySelector("#condition");
const imageToday = document.querySelector(".image");
const dateToday = document.querySelector("#dateToday");
const wind = document.querySelector('#wind');
const humidity = document.querySelector('#humidity');
const visibility = document.querySelector('#visibility');
const pressure = document.querySelector('#pressure');
const daysWeek = document.querySelectorAll('.card.day');
const searchInput = document.querySelector("input");
const searchBtn = document.querySelector("#search-btn")
const placesTosearch = document.querySelector(".places");
const getLocationButton = document.querySelector("#getYourLocation");
const main = document.querySelector("main");
const loaders = document.querySelector(".loaders")
const objOfCordiantes = {};
function delayONeSeconds() {
    return new Promise((resolve,) => {
        setTimeout(() => {
            resolve();
        }, 1500);
    });
}
getPosition();
dateToday.innerHTML = `${moment().format('MMM Do YY')}`
function changeUnit() {
    if (tempUnits == 'celsius') {
        tempUnits = 'fahrenheit'
    } else {
        tempUnits = 'celsius'
    }
    manipulateDatatoday(city)

}

setInterval(changeUnit, 7000)


getLocationButton.addEventListener("click", getPosition)
async function getPosition() {
    loaders.style.display = 'flex'
    main.style.display = 'none'

    city = await new Promise(get => {
        navigator.geolocation.getCurrentPosition(position => {
            get(showPosition(position))
        })

    })
    manipulateDatatoday(city);
    await delayONeSeconds()
    main.style.display = 'flex'
    loaders.style.display = 'none'

}

async function showPosition(position) {
    console.log(position)
    objOfCordiantes.latitude = position.coords.latitude;
    objOfCordiantes.longitude = position.coords.longitude;

    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${objOfCordiantes.latitude}&lon=${objOfCordiantes.longitude}`);
    const data = await response.json();
    console.log(data)
    return data.address.town || data.address.state || data.address.country;
}

searchInput.addEventListener('input', () => {
    placesTosearch.innerHTML = ''
})
searchBtn.addEventListener('click', async () => {
    city = searchInput.value
    let citiesAfterSearch = await getCordinates(city);
    if (placesTosearch.innerHTML == '') {
        citiesAfterSearch.forEach((cityAfterSearch) => {
            placesTosearch.innerHTML += `<div class="place" data-latitude=${cityAfterSearch.latitude} data-longitude=${cityAfterSearch.longitude}>
        ${cityAfterSearch.name}-${cityAfterSearch.country}
        <span
          ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
            <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
            <path
              d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
            /></svg
        ></span>
        </div>`
        })
    } else {
        placesTosearch.innerHTML += ''
    }
    searchInput.value = ''
})
placesTosearch.addEventListener('click', async (e) => {
    if (e.target.closest('.place')) {
        main.style.display = 'none'
        loaders.style.display = 'flex'
        objOfCordiantes.latitude = +(e.target.dataset.latitude);
        objOfCordiantes.longitude = +(e.target.dataset.longitude);
        manipulateDatatoday(city)
        await delayONeSeconds()
        main.style.display = 'flex'
        loaders.style.display = 'none'
        placesTosearch.innerHTML = '';
        searchPlace.classList.remove("show");

    }
})




async function getCordinates(city) {
    const urlCordinates = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=5&language=en&format=json`
    const response = await fetch(urlCordinates)
    const data = await response.json()
    console.log(data)

    return data.results;
}
async function getForecast(city) {
    const { latitude, longitude } = objOfCordiantes;
    const urlForecast = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&timezone=auto&temperature_unit=${tempUnits}&wind_speed_unit=${windSpeedUnit}&current=temperature_2m,pressure_msl,weather_code,wind_direction_10m,relative_humidity_2m,wind_speed_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min`;
    const response = await fetch(urlForecast);
    const data = await response.json();
    console.log(data)
    const allWeatherData = { maintenant: data.current, dataWeek: data.daily }
    return allWeatherData;
}
async function manipulateDatatoday(city) {
    try {
        const allWeatherData = await getForecast(city);
        const weatherConditionToday = weatherConditions[allWeatherData.maintenant.weather_code]
        currentTemp.innerHTML = tempUnits == 'celsius' ? `<span >${allWeatherData.maintenant.temperature_2m}</span>°C` : `<span >${allWeatherData.maintenant.temperature_2m}</span>F`;
        cityPlace.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
    <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
    <path
    d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"
    />
    </svg>
    ${city} `


        condition.innerHTML = `${weatherConditionToday}`
        imageToday.innerHTML = `<img src="./images/${weatherConditionToday}.png" alt="" />`
        wind.children[1].innerHTML = `${allWeatherData.maintenant.wind_speed_10m}<span> mph</span>`
        wind.children[2].children[0].style.transform = `rotate(${allWeatherData.maintenant.wind_direction_10m}deg)`;
        humidity.children[1].innerHTML = `${allWeatherData.maintenant.relative_humidity_2m}<span>%</span>`;
        console.log(allWeatherData.maintenant.visibility)
        visibility.children[1].innerHTML = `${Math.ceil((allWeatherData.maintenant.visibility) / 1609.34)}<span>miles</span>`
        root.style.setProperty('--width-bar', `${allWeatherData.maintenant.relative_humidity_2m}%`);
        pressure.children[1].innerHTML = `${allWeatherData.maintenant.pressure_msl}<span>mb</span>`;
        const weatherCode5days = allWeatherData.dataWeek.weather_code //condtions for the 5 days
        const { temperature_2m_max, temperature_2m_min } = allWeatherData.dataWeek
        currentDate.add(1, 'days');
        daysWeek.forEach((day, i) => {
            day.children[0].innerHTML = `${currentDate.format(' Do MMM YY')}`;//date
            let weatherConditionThisDAy = weatherConditions[weatherCode5days[i]]//image of condition
            day.children[1].setAttribute('src', `./images/${weatherConditionThisDAy}.png`);
            const unit = tempUnits == 'celsius' ? 'C' : 'F'
            day.children[2].innerHTML = ` <span class="great">${temperature_2m_max[i]}${unit}</span> <span class="small">${temperature_2m_min[i]}${unit}</span>`
            currentDate.add(1, 'days');
        })
        currentDate.subtract(6, 'days')

    }
    catch {
        console.log('hello world')
    }
}
const weatherConditions = {
    0: "Clear",
    1: "LightCloud",
    2: "LightCloud",
    3: "HeavyCloud",
    45: "HeavyCloud",
    48: "HeavyCloud",
    51: "LightRain",
    53: "LightRain",
    55: "LightRain",
    56: "Sleet",
    57: "Sleet",
    61: "HeavyRain",
    63: "HeavyRain",
    65: "HeavyRain",
    66: "HeavyRain",
    67: "HeavyRain",
    71: "Snow",
    73: "Snow",
    75: "Snow",
    77: "Snow",
    80: "Shower",
    81: "Shower",
    82: "Shower",
    85: "Sleet",
    86: "Sleet",
    95: "Thunderstorm",
    96: "Thunderstorm",
    99: "Thunderstorm"
};
btnSearch.addEventListener('click', () => {
    searchPlace.classList.add("show");
});
closeBtn.addEventListener('click', () => {
    searchPlace.classList.remove("show");
});




