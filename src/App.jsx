import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Wind, Droplets, Thermometer, Gauge, Calendar, MapPin, Menu, X, Sun, Moon } from 'lucide-react';
import Globe from 'react-globe.gl';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '7cc46ea2b0b831627a376350da06f3bf';

const StatBox = ({ icon, label, value }) => (
  <div className="stat-box">
    <div className="stat-label">
      {icon}
      <span>{label}</span>
    </div>
    <span className="stat-value">{value}</span>
  </div>
);

const App = () => {
  const [city, setCity] = useState('Baku');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [rings, setRings] = useState([]);
  const [labels, setLabels] = useState([]);
  const globeEl = useRef();

  const fetchWeather = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const weatherRes = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}&lang=az`);
      const forecastRes = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityName)}&units=metric&appid=${API_KEY}&lang=az`);
      
      const lat = weatherRes.data?.coord?.lat;
      const lon = weatherRes.data?.coord?.lon;
      
      setWeather(weatherRes.data);
      if (forecastRes.data && forecastRes.data.list) {
        setForecast(forecastRes.data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 5));
      }

      // Update Globe markers
      if (lat != null && lon != null) {
        setRings([{ lat, lng: lon, maxR: 5, propagationSpeed: 2, repeatPeriod: 1000 }]);
        setLabels([{ lat, lng: lon, text: cityName.charAt(0).toUpperCase() + cityName.slice(1), size: 2, dotRadius: 0.5 }]);
        
        if (globeEl.current) {
          globeEl.current.pointOfView({
            lat: lat,
            lng: lon,
            altitude: 1.5
          }, 2000);
        }
      }
    } catch (error) {

      console.error("Error fetching weather data:", error);
      setError("Məlumat tapılmadı! Şəhər adını düzgün daxil edin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput);
      setSearchInput('');
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`}>
      {/* 3D Globe Background */}
      <div className="globe-wrapper">
        <Globe
          ref={globeEl}
          globeImageUrl={theme === 'dark' ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" : "//unpkg.com/three-globe/example/img/earth-day.jpg"}
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundImageUrl={theme === 'dark' ? "//unpkg.com/three-globe/example/img/night-sky.png" : "//unpkg.com/three-globe/example/img/night-sky.png"}
          showAtmosphere={true}
          atmosphereColor={theme === 'dark' ? "#4facfe" : "#7dd3fc"}
          atmosphereAltitude={0.25}
          
          ringsData={rings}
          ringColor={() => t => `rgba(0, 242, 254, ${1 - t})`}
          ringMaxRadius="maxR"
          ringPropagationSpeed="propagationSpeed"
          ringRepeatPeriod="repeatPeriod"

          labelsData={labels}
          labelColor={() => '#00f2fe'}
          labelSize="size"
          labelDotRadius="dotRadius"
          labelResolution={30}
        />

      </div>

      {/* Overlay Layers for Aesthetics */}
      <div className="overlay-layer"></div>

      {/* Theme Toggle */}
      <button onClick={toggleTheme} className="theme-toggle">
        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      {/* Mobile Toggle */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="mobile-toggle glass"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -450, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -450, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="sidebar-container"
          >
            <div className="sidebar-content glass">
              {/* Branding Logo */}
              <div className="sidebar-logo">
                <img src="/logo.png" alt="AzWeather Logo" className="app-logo" />
                <span className="logo-text">AzWeather 3D</span>
              </div>

              {/* Search Header */}
              <div className="search-section">
                <form onSubmit={handleSearch} className="search-box">
                  <Search size={20} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Şəhər axtar..."
                    className="search-input"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </form>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="error-message"
                  >
                    {error}
                  </motion.div>
                )}
              </div>

              {weather && !loading && (
                <>
                  {/* Current Weather Main */}
                  <div className="weather-main">
                    <motion.div 
                      key={weather?.name}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="weather-header"
                    >
                      <div className="location-info">
                        <MapPin size={20} className="text-primary" />
                        <span>{weather?.name}, {weather?.sys?.country}</span>
                      </div>
                      <h1 className="main-temp glow-text">
                        {weather?.main?.temp != null ? Math.round(weather.main.temp) : '--'}°
                      </h1>
                      <p className="weather-desc">{weather?.weather?.[0]?.description}</p>
                    </motion.div>
                  </div>

                  {/* Weather Stats Grid */}
                  <div className="stats-grid">
                    <StatBox icon={<Thermometer size={22} style={{ color: '#fb923c' }} />} label="Hiss edilən" value={weather?.main?.feels_like != null ? `${Math.round(weather.main.feels_like)}°C` : '--'} />
                    <StatBox icon={<Droplets size={22} style={{ color: '#60a5fa' }} />} label="Rütubət" value={weather?.main?.humidity != null ? `${weather.main.humidity}%` : '--'} />
                    <StatBox icon={<Wind size={22} style={{ color: '#94a3b8' }} />} label="Külək" value={weather?.wind?.speed != null ? `${weather.wind.speed} km/s` : '--'} />
                    <StatBox icon={<Gauge size={22} style={{ color: '#34d399' }} />} label="Təzyiq" value={weather?.main?.pressure != null ? `${weather.main.pressure} hPa` : '--'} />
                  </div>

                  <hr className="separator" />


                  {/* 5-Day Forecast */}
                  <div className="forecast-section">
                    <div className="forecast-header">
                      <Calendar size={18} />
                      <span>5-GÜNLÜK PROQNOZ</span>
                    </div>
                    <div className="forecast-list">
                      {forecast?.map((day, idx) => (
                        <motion.div
                          key={day.dt}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="forecast-item"
                        >
                          <span className="forecast-date">
                            {new Date(day.dt * 1000).toLocaleDateString('az-AZ', { weekday: 'short' })}
                          </span>
                          <img 
                            src={`https://openweathermap.org/img/wn/${day.weather?.[0]?.icon}@2x.png`} 
                            alt="icon"
                            className="forecast-icon"
                          />
                          <div className="forecast-temps">
                            <span className="temp-max">{day.main?.temp_max != null ? Math.round(day.main.temp_max) : '--'}°</span>
                            <span className="temp-min">{day.main?.temp_min != null ? Math.round(day.main.temp_min) : '--'}°</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              )}


              {loading && (
                <div className="flex flex-col items-center justify-center h-40">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
                  />
                  <p className="mt-4 text-slate-400">Yüklənir...</p>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};




export default App;
