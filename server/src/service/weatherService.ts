import dotenv from 'dotenv';
dotenv.config();
// Fill these two classes
class Coordinates {
  lat: number;
  lon: number;

  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon;
  }
}

class Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
  temp: number;
  humidity: number;
  date: string;

  constructor(id: number, main: string, description: string, icon: string, temp: number, humidity: number, date: string) {
    this.id = id;
    this.main = main;
    this.description = description;
    this.icon = icon;
    this.temp = temp;
    this.humidity = humidity;
    this.date = date;
  }
}

class WeatherService {
  private baseURL: string;
  private apiKey: string | undefined;

  constructor() {
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
    this.apiKey = process.env.WEATHER_API_KEY;
  }

  // Fetch location data (e.g., from a geocoding API)
  private async fetchLocationData(query: string): Promise<any> {
    const geocodeQuery = this.buildGeocodeQuery(query);
    const response = await fetch(geocodeQuery);
    return await response.json();
  }

  // Destructure location data to get latitude and longitude
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon
    };
  }

  // Build the geocode query for fetching location data
  private buildGeocodeQuery(query: string): string {
    return `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${this.apiKey}`;
  }

  // Build the query for fetching weather data
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch and destructure location data (combines fetching and destructuring)
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData[0]);
  }

  // Fetch weather data for given coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const weatherQuery = this.buildWeatherQuery(coordinates);
    const response = await fetch(weatherQuery);
    return await response.json();
  }

  // Parse the current weather data
  private parseCurrentWeather(response: any): Weather {
    const { main, weather } = response;

    return new Weather(
      weather[0].id,            // Weather condition ID
      weather[0].main,          // Weather condition (e.g., "Clear")
      weather[0].description,   // Description of the weather (e.g., "clear sky")
      weather[0].icon,          // Icon code (e.g., "01d")
      main.temp,                // Temperature from the "main" object
      main.humidity,            // Humidity from the "main" object
      new Date(response.dt * 1000).toISOString().split('T')[0] // Convert timestamp to YYYY-MM-DD
    );
}

// Fetch 5-day weather forecast data
private async fetchForecastData(coordinates: Coordinates): Promise<any> {
  const forecastQuery = `${this.baseURL}/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  const response = await fetch(forecastQuery);
  return await response.json();
}

// Get the 5-day weather forecast for a specific city
public async getFiveDayForecastForCity(city: string): Promise<Weather[]> {
  const coordinates = await this.fetchAndDestructureLocationData(city);
  const forecastData = await this.fetchForecastData(coordinates);

  // Call the buildForecastArray to process the 5-day forecast
  const forecast = this.buildForecastArray(forecastData.list); // 'list' holds the forecast data from the API
  return forecast;
}

  // Build a forecast array (Write more for 5 day forecast)
  private buildForecastArray(weatherData: any[]): Weather[] {
    const forecast: Weather[] = [];
  
    // Filter data to select one forecast per day (e.g., at noon)
    const dailyData = weatherData.filter((data: any) => {
      const forecastDate = new Date(data.dt * 1000);
      return forecastDate.getHours() === 12; // Pick forecasts at noon
    });
  
    // Check if we have enough data for 5 days, and if not, log a warning or handle it
    if (dailyData.length < 5) {
      console.warn("Not enough noon forecasts available for a 5-day forecast.");
    }
  
    // Create a 5-day forecast array
    for (let i = 0; i < Math.min(5, dailyData.length); i++) {
      const data = dailyData[i];
      const forecastDate = new Date(data.dt * 1000).toISOString().split('T')[0]; // Extract YYYY-MM-DD
  
      // Ensure weather[0] exists to avoid potential errors
      if (data.weather && data.weather[0]) {
        const weather = new Weather(
          data.weather[0].id,
          data.weather[0].main,
          data.weather[0].description,
          data.weather[0].icon,
          data.main.temp,
          data.main.humidity,
          forecastDate
        );
        forecast.push(weather);
      } else {
        console.warn("Missing weather data for entry", data);
      }
    }
  
    return forecast;
  }

  // Get the weather for a specific city
  public async getWeatherForCity(city: string): Promise<Weather> {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    return this.parseCurrentWeather(weatherData);
  }
}

export default new WeatherService();