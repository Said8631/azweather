// UTF-8 Dəstəyi üçün xüsusi simvollar: ə, ş, ç, ğ, ı, ö
const API_KEY = '7cc46ea2b0b831627a376350da06f3bf';
let myGlobe;

function init3DGlobe() {
    const container = document.getElementById('globeViz');
    
    myGlobe = Globe()(container)
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('https://unpkg.com/three-globe/example/img/night-sky.png')
        .width(window.innerWidth)
        .height(window.innerHeight)
        .showAtmosphere(true)
        .atmosphereColor('#4facfe')
        .atmosphereAltitude(0.2)
        
        // Neon Halqa (Mavi xətt əvəzinə)
        .ringColor(() => '#00f2fe')
        .ringMaxRadius(5)
        .ringPropagationSpeed(2.5)
        .ringRepeatPeriod(800)
        
        // Şəhər Etiketi
        .labelColor(() => 'white')
        .labelSize(1.8)
        .labelDotRadius(0.4)
        .labelResolution(30);

    myGlobe.controls().autoRotate = true;
    myGlobe.controls().autoRotateSpeed = 0.5;
}

async function getWeatherData(city) {
    try {
        // encodeURIComponent axtarışda Azərbaycan hərflərini qoruyur
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}&lang=az`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            updateUI(data);
            const { lat, lon } = data.coord;

            // Kamera hərəkəti
            myGlobe.pointOfView({ lat: lat, lng: lon, altitude: 1.2 }, 2000);

            // Vizual effektlər
            myGlobe.ringsData([{ lat: lat, lng: lon }]);
            myGlobe.labelsData([{ lat: lat, lng: lon, text: data.name }]);

            getForecast(city);
        } else {
            alert("Şəhər tapılmadı!");
        }
    } catch (error) {
        console.error("Xəta:", error);
    }
}

async function getForecast(city) {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}&lang=az`);
    const data = await response.json();
    
    const grid = document.getElementById('forecast-grid');
    grid.innerHTML = '';

    const daily = data.list.filter(f => f.dt_txt.includes("12:00:00")).slice(0, 5);

    daily.forEach(day => {
        const date = new Date(day.dt * 1000).toLocaleDateString('az-AZ', { weekday: 'short' });
        grid.innerHTML += `
            <div class="forecast-item">
                <span>${date}</span>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" width="35">
                <span style="font-weight:bold">${Math.round(day.main.temp)}°C</span>
            </div>
        `;
    });
}

function updateUI(data) {
    document.getElementById('city-display').innerText = data.name;
    document.getElementById('temp').innerText = Math.round(data.main.temp);
    document.getElementById('desc').innerText = data.weather[0].description;
    document.getElementById('hum').innerText = data.main.humidity;
    document.getElementById('wind').innerText = data.wind.speed;
    
    // Genişləndirilmiş temperatur məlumatları
    document.getElementById('feels-like').innerText = Math.round(data.main.feels_like);
    document.getElementById('temp-min').innerText = Math.round(data.main.temp_min);
    document.getElementById('temp-max').innerText = Math.round(data.main.temp_max);
    document.getElementById('press').innerText = data.main.pressure;
}

// Düymə və Klaviatura hadisələri
document.getElementById('search-btn').onclick = () => {
    const city = document.getElementById('city-input').value;
    if (city) getWeatherData(city);
};

document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') getWeatherData(e.target.value);
});

window.addEventListener('resize', () => {
    myGlobe.width(window.innerWidth);
    myGlobe.height(window.innerHeight);
});

// Başlanğıc
init3DGlobe();
getWeatherData('Baku');