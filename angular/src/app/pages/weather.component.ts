import { Component, signal, OnInit } from '@angular/core';

interface CurrentWeather {
  temperature: number;
  windspeed: number;
  weathercode: number;
  is_day: number;
  time: string;
}

interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weathercode: number;
}

const weatherDescriptions: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

const weatherIcons: Record<number, string> = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '🌨️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️',
};

@Component({
  selector: 'app-weather',
  standalone: true,
  templateUrl: './weather.component.html',
  styleUrl: './weather.component.css',
})
export class WeatherComponent implements OnInit {
  current = signal<CurrentWeather | null>(null);
  forecast = signal<DailyForecast[]>([]);
  location = signal('Denver, CO');
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.fetchWeather();
  }

  async fetchWeather(): Promise<void> {
    this.loading.set(true);
    this.error.set('');

    const lat = 39.7392;
    const lon = -104.9903;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&forecast_days=16&timezone=America%2FDenver`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();

      this.current.set(data.current_weather);

      const days: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
        date,
        tempMax: data.daily.temperature_2m_max[i],
        tempMin: data.daily.temperature_2m_min[i],
        weathercode: data.daily.weathercode[i],
      }));
      this.forecast.set(days);
    } catch {
      this.error.set('Unable to load weather data. Please try again later.');
    } finally {
      this.loading.set(false);
    }
  }

  descriptionFor(code: number): string {
    return weatherDescriptions[code] ?? 'Unknown';
  }

  iconFor(code: number): string {
    return weatherIcons[code] ?? '🌡️';
  }

  formatDay(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
}
