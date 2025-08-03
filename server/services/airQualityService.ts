import axios from 'axios';
import { db } from '../db';
import { airQualityStations, airQualityReadings, airQualityAlertZones } from '@shared/schema';
import { eq } from 'drizzle-orm';

const EPA_AQS_BASE_URL = 'https://aqs.epa.gov/data/api';
const PURPLEAIR_BASE_URL = 'https://api.purpleair.com/v1';
const WAQI_BASE_URL = 'https://api.waqi.info';

interface EPAAQSResponse {
  Header: Array<{
    status: string;
    request_time: string;
    rows: number;
  }>;
  Data: Array<{
    state_code: string;
    county_code: string;
    site_number: string;
    parameter_code: string;
    latitude: number;
    longitude: number;
    date_local: string;
    time_local: string;
    sample_measurement: number;
    units_of_measure: string;
    aqi: number;
  }>;
}

interface PurpleAirSensor {
  sensor_index: number;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  pm2_5_atm: number;
  pm2_5_atm_a: number;
  pm2_5_atm_b: number;
  humidity: number;
  temperature: number;
  pressure: number;
  last_seen: number;
}

interface WAQIResponse {
  status: string;
  data: {
    idx: number;
    aqi: number;
    time: {
      s: string;
      tz: string;
      v: number;
    };
    city: {
      name: string;
      geo: [number, number];
    };
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      o3?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      co?: { v: number };
    };
  };
}

export interface AirQualityAlert {
  id: string;
  stationId: string;
  stationName: string;
  aqi: number;
  aqiCategory: string;
  primaryPollutant: string;
  location: string;
  state: string;
  coordinates: { lat: number; lng: number };
  timestamp: Date;
  healthRecommendations: string[];
  affectedGroups: string[];
  dataSource: string;
}

class AirQualityService {
  private epaApiKey: string | null = null;
  private purpleAirApiKey: string | null = null;
  private waqiApiKey: string | null = null;

  constructor() {
    this.epaApiKey = process.env.EPA_API_KEY || null;
    this.purpleAirApiKey = process.env.PURPLEAIR_API_KEY || null; 
    this.waqiApiKey = process.env.WAQI_API_KEY || null;
  }

  private async makeRequest<T>(url: string, headers: Record<string, string> = {}): Promise<T | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'R8-Environmental-Platform/1.0 (educational-research)',
          ...headers,
        },
        timeout: 15000,
      });

      return response.data;
    } catch (error: any) {
      console.error(`Air Quality API error for ${url}:`, error.message);
      return null;
    }
  }

  // Get AQI category and health recommendations based on AQI value
  private getAQIInfo(aqi: number): {
    category: string;
    color: string;
    healthRecommendations: string[];
    affectedGroups: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  } {
    if (aqi <= 50) {
      return {
        category: 'good',
        color: 'green',
        healthRecommendations: ['Air quality is satisfactory', 'Normal outdoor activities'],
        affectedGroups: [],
        severity: 'low'
      };
    } else if (aqi <= 100) {
      return {
        category: 'moderate',
        color: 'yellow', 
        healthRecommendations: ['Unusually sensitive people should consider limiting outdoor activities'],
        affectedGroups: ['Unusually sensitive individuals'],
        severity: 'low'
      };
    } else if (aqi <= 150) {
      return {
        category: 'unhealthy_sensitive',
        color: 'orange',
        healthRecommendations: [
          'Sensitive groups should limit outdoor activities',
          'Children and adults with respiratory conditions should stay indoors'
        ],
        affectedGroups: ['Children', 'Adults with respiratory/heart conditions', 'Older adults'],
        severity: 'medium'
      };
    } else if (aqi <= 200) {
      return {
        category: 'unhealthy',
        color: 'red',
        healthRecommendations: [
          'Everyone should limit outdoor activities',
          'Sensitive groups should avoid outdoor activities',
          'Consider wearing masks outdoors'
        ],
        affectedGroups: ['Everyone', 'Especially sensitive groups'],
        severity: 'high'
      };
    } else if (aqi <= 300) {
      return {
        category: 'very_unhealthy',
        color: 'purple',
        healthRecommendations: [
          'Everyone should avoid outdoor activities',
          'Stay indoors with windows closed',
          'Use air purifiers if available',
          'Wear N95 masks if must go outside'
        ],
        affectedGroups: ['Everyone'],
        severity: 'critical'
      };
    } else {
      return {
        category: 'hazardous',
        color: 'maroon',
        healthRecommendations: [
          'Emergency conditions - everyone stay indoors',
          'Avoid all outdoor activities',
          'Keep windows and doors closed',
          'Use air purifiers and avoid physical exertion'
        ],
        affectedGroups: ['Everyone - emergency conditions'],
        severity: 'critical'
      };
    }
  }

  // Fetch real-time air quality data from EPA AQS (requires API key)
  async getEPACurrentData(stateCodes: string[] = ['06', '36', '48']): Promise<AirQualityAlert[]> {
    if (!this.epaApiKey) {
      console.log('EPA API key not configured, skipping EPA data');
      return [];
    }

    const alerts: AirQualityAlert[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const stateCode of stateCodes) {
      try {
        const url = `${EPA_AQS_BASE_URL}/dailyData/byState?email=demo@r8platform.com&key=${this.epaApiKey}&param=88101&bdate=${today}&edate=${today}&state=${stateCode}`;
        
        const response = await this.makeRequest<EPAAQSResponse>(url);
        
        if (response?.Data) {
          for (const reading of response.Data) {
            if (reading.aqi > 100) { // Only alert for moderate+ conditions
              const aqiInfo = this.getAQIInfo(reading.aqi);
              
              alerts.push({
                id: `epa-${reading.state_code}-${reading.county_code}-${reading.site_number}`,
                stationId: `${reading.state_code}-${reading.county_code}-${reading.site_number}`,
                stationName: `EPA Station ${reading.site_number}`,
                aqi: reading.aqi,
                aqiCategory: aqiInfo.category,
                primaryPollutant: 'pm25', // EPA param 88101 is PM2.5
                location: `County ${reading.county_code}, State ${reading.state_code}`,
                state: reading.state_code,
                coordinates: { lat: reading.latitude, lng: reading.longitude },
                timestamp: new Date(`${reading.date_local}T${reading.time_local}`),
                healthRecommendations: aqiInfo.healthRecommendations,
                affectedGroups: aqiInfo.affectedGroups,
                dataSource: 'EPA AQS'
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching EPA data for state ${stateCode}:`, error);
      }
    }

    return alerts;
  }

  // Fetch data from PurpleAir (crowdsourced sensors)
  async getPurpleAirData(bounds?: {north: number, south: number, east: number, west: number}): Promise<AirQualityAlert[]> {
    if (!this.purpleAirApiKey) {
      console.log('PurpleAir API key not configured, using mock data');
      return this.getMockAirQualityData();
    }

    try {
      let url = `${PURPLEAIR_BASE_URL}/sensors?fields=name,latitude,longitude,pm2.5_atm,pm2.5_atm_a,pm2.5_atm_b,humidity,temperature,last_seen`;
      
      if (bounds) {
        url += `&nwlat=${bounds.north}&nwlng=${bounds.west}&selat=${bounds.south}&selng=${bounds.east}`;
      } else {
        // Default to continental US bounds
        url += `&nwlat=49.0&nwlng=-125.0&selat=25.0&selng=-66.0`;
      }

      const response = await this.makeRequest<{data: PurpleAirSensor[]}>(url, {
        'X-API-Key': this.purpleAirApiKey!
      });

      if (!response?.data) return [];

      const alerts: AirQualityAlert[] = [];

      for (const sensor of response.data) {
        // Calculate AQI from PM2.5 using EPA formula
        const pm25 = (sensor.pm2_5_atm_a + sensor.pm2_5_atm_b) / 2;
        const aqi = this.calculateAQIFromPM25(pm25);
        
        if (aqi > 100) { // Only create alerts for moderate+ conditions
          const aqiInfo = this.getAQIInfo(aqi);
          
          alerts.push({
            id: `purpleair-${sensor.sensor_index}`,
            stationId: sensor.sensor_index.toString(),
            stationName: sensor.name || `PurpleAir ${sensor.sensor_index}`,
            aqi: Math.round(aqi),
            aqiCategory: aqiInfo.category,
            primaryPollutant: 'pm25',
            location: `${sensor.latitude.toFixed(3)}, ${sensor.longitude.toFixed(3)}`,
            state: 'US', // PurpleAir doesn't provide state directly
            coordinates: { lat: sensor.latitude, lng: sensor.longitude },
            timestamp: new Date(sensor.last_seen * 1000),
            healthRecommendations: aqiInfo.healthRecommendations,
            affectedGroups: aqiInfo.affectedGroups,
            dataSource: 'PurpleAir'
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error fetching PurpleAir data:', error);
      return this.getMockAirQualityData();
    }
  }

  // Calculate AQI from PM2.5 concentration using EPA formula
  private calculateAQIFromPM25(pm25: number): number {
    // EPA AQI breakpoints for PM2.5 (24-hour average)
    const breakpoints = [
      { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },      // Good
      { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },   // Moderate  
      { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },  // Unhealthy for Sensitive Groups
      { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 }, // Unhealthy
      { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 }, // Very Unhealthy
      { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 }, // Hazardous
      { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 }  // Hazardous
    ];

    for (const bp of breakpoints) {
      if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
        return ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow;
      }
    }

    return 500; // Max AQI if above all breakpoints
  }

  // Fetch data from World Air Quality Index (WAQI)
  async getWAQIData(cities: string[] = ['los-angeles', 'new-york', 'chicago', 'houston']): Promise<AirQualityAlert[]> {
    if (!this.waqiApiKey) {
      console.log('WAQI API key not configured, skipping WAQI data');
      return [];
    }

    const alerts: AirQualityAlert[] = [];

    for (const city of cities) {
      try {
        const url = `${WAQI_BASE_URL}/feed/${city}/?token=${this.waqiApiKey}`;
        const response = await this.makeRequest<WAQIResponse>(url);

        if (response?.data && response.data.aqi > 100) {
          const aqiInfo = this.getAQIInfo(response.data.aqi);
          
          alerts.push({
            id: `waqi-${response.data.idx}`,
            stationId: response.data.idx.toString(),
            stationName: response.data.city.name,
            aqi: response.data.aqi,
            aqiCategory: aqiInfo.category,
            primaryPollutant: this.determinePrimaryPollutant(response.data.iaqi),
            location: response.data.city.name,
            state: 'US',
            coordinates: { lat: response.data.city.geo[0], lng: response.data.city.geo[1] },
            timestamp: new Date(response.data.time.v * 1000),
            healthRecommendations: aqiInfo.healthRecommendations,
            affectedGroups: aqiInfo.affectedGroups,
            dataSource: 'World Air Quality Index'
          });
        }
      } catch (error) {
        console.error(`Error fetching WAQI data for ${city}:`, error);
      }
    }

    return alerts;
  }

  private determinePrimaryPollutant(iaqi: any): string {
    const pollutants = [
      { name: 'pm25', value: iaqi.pm25?.v || 0 },
      { name: 'pm10', value: iaqi.pm10?.v || 0 },
      { name: 'o3', value: iaqi.o3?.v || 0 },
      { name: 'no2', value: iaqi.no2?.v || 0 },
      { name: 'so2', value: iaqi.so2?.v || 0 },
      { name: 'co', value: iaqi.co?.v || 0 },
    ];

    return pollutants.sort((a, b) => b.value - a.value)[0]?.name || 'pm25';
  }

  // Store air quality station in database
  async storeStation(stationData: {
    stationId: string;
    name: string;
    latitude: number;
    longitude: number;
    state?: string;
    dataSource: string;
  }): Promise<void> {
    try {
      await db.insert(airQualityStations).values({
        stationId: stationData.stationId,
        name: stationData.name,
        latitude: stationData.latitude,
        longitude: stationData.longitude,
        state: stationData.state,
        dataSource: stationData.dataSource,
        lastReportedAt: new Date(),
      }).onConflictDoUpdate({
        target: airQualityStations.stationId,
        set: {
          name: stationData.name,
          latitude: stationData.latitude,
          longitude: stationData.longitude,
          lastReportedAt: new Date(),
        }
      });
    } catch (error) {
      console.error('Error storing air quality station:', error);
    }
  }

  // Store air quality reading in database
  async storeReading(reading: {
    stationId: string;
    aqi: number;
    aqiCategory: string;
    primaryPollutant: string;
    pm25?: number;
    pm10?: number;
    ozone?: number;
    dataSource: string;
  }): Promise<void> {
    try {
      await db.insert(airQualityReadings).values({
        stationId: reading.stationId,
        timestamp: new Date(),
        aqi: reading.aqi,
        aqiCategory: reading.aqiCategory,
        primaryPollutant: reading.primaryPollutant,
        pm25: reading.pm25,
        pm10: reading.pm10,
        ozone: reading.ozone,
        dataSource: reading.dataSource,
      });
    } catch (error) {
      console.error('Error storing air quality reading:', error);
    }
  }

  // Get current air quality alerts across all sources
  async getCurrentAirQualityAlerts(): Promise<AirQualityAlert[]> {
    console.log('🌬️ Fetching current air quality alerts...');
    
    try {
      const [epaAlerts, purpleAirAlerts, waqiAlerts] = await Promise.all([
        this.getEPACurrentData(['06', '36', '48', '04']), // CA, NY, TX, AZ
        this.getPurpleAirData(),
        this.getWAQIData(['los-angeles', 'new-york', 'chicago', 'houston', 'phoenix'])
      ]);

      const allAlerts = [...epaAlerts, ...purpleAirAlerts, ...waqiAlerts];
      
      console.log(`✓ Found ${allAlerts.length} air quality alerts`);
      
      // Store stations and readings in database
      for (const alert of allAlerts) {
        await this.storeStation({
          stationId: alert.stationId,
          name: alert.stationName,
          latitude: alert.coordinates.lat,
          longitude: alert.coordinates.lng,
          state: alert.state,
          dataSource: alert.dataSource,
        });

        await this.storeReading({
          stationId: alert.stationId,
          aqi: alert.aqi,
          aqiCategory: alert.aqiCategory,
          primaryPollutant: alert.primaryPollutant,
          dataSource: alert.dataSource,
        });
      }

      return allAlerts;
    } catch (error) {
      console.error('Error fetching air quality alerts:', error);
      return this.getMockAirQualityData();
    }
  }

  // Mock data for when APIs are not available
  private getMockAirQualityData(): AirQualityAlert[] {
    const mockAlerts: AirQualityAlert[] = [
      {
        id: 'mock-la-1',
        stationId: 'mock-la-station',
        stationName: 'Downtown Los Angeles',
        aqi: 152,
        aqiCategory: 'unhealthy_sensitive',
        primaryPollutant: 'pm25',
        location: 'Los Angeles, CA',
        state: 'CA',
        coordinates: { lat: 34.0522, lng: -118.2437 },
        timestamp: new Date(),
        healthRecommendations: [
          'Sensitive groups should limit outdoor activities',
          'Children and adults with respiratory conditions should stay indoors'
        ],
        affectedGroups: ['Children', 'Adults with respiratory/heart conditions', 'Older adults'],
        dataSource: 'Mock Data'
      },
      {
        id: 'mock-phoenix-1',
        stationId: 'mock-phx-station',
        stationName: 'Phoenix Central',
        aqi: 187,
        aqiCategory: 'unhealthy',
        primaryPollutant: 'ozone',
        location: 'Phoenix, AZ',
        state: 'AZ',
        coordinates: { lat: 33.4484, lng: -112.0740 },
        timestamp: new Date(),
        healthRecommendations: [
          'Everyone should limit outdoor activities',
          'Sensitive groups should avoid outdoor activities',
          'Consider wearing masks outdoors'
        ],
        affectedGroups: ['Everyone', 'Especially sensitive groups'],
        dataSource: 'Mock Data'
      }
    ];

    return mockAlerts;
  }

  // Check for air quality conditions that should trigger alerts
  async monitorAirQuality(): Promise<AirQualityAlert[]> {
    const alerts = await this.getCurrentAirQualityAlerts();
    
    // Filter for conditions that warrant alerts (AQI > 100)
    const significantAlerts = alerts.filter(alert => alert.aqi > 100);
    
    console.log(`🚨 Found ${significantAlerts.length} significant air quality alerts`);
    
    return significantAlerts;
  }
}

export const airQualityService = new AirQualityService();