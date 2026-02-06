export interface Coords {
  lat: number;
  lng: number;
}

export interface UserLocation extends Coords {
  accuracy?: number;
}

export interface ItineraryItem {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  locationName: string;
  endLocationName?: string;
  coords: Coords;
  endCoords?: Coords;
  description: string;
  keyDetails: string;
  priceEUR: number;
  type: 'logistics' | 'transport' | 'sightseeing' | 'walk';
  completed: boolean;
  notes?: string;
  contingencyNote?: string;
  googleMapsUrl?: string;
  audioGuideText?: string;
}

export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
}

export interface CustomWaypoint {
  id: string;
  title: string;
  coords: Coords;
  timestamp: number;
}

export interface Pronunciation {
  word: string;
  phonetic: string;
  simplified: string;
  meaning: string;
}

export interface WeatherData {
  hourly: {
    time: string[];
    temperature: number[];
    code: number[];
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
}

export interface NotificationSettings {
  enabled: boolean;
  activityAlerts: boolean;
  criticalAlerts: boolean;
  minutesBefore: number;
}