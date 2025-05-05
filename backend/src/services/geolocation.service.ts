import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cache for IP geolocation data
interface GeoLocationCache {
  [ip: string]: {
    data: GeoLocationData;
    timestamp: number;
  };
}

// Geolocation data structure
export interface GeoLocationData {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

// In-memory cache with 24-hour expiration
const geoCache: GeoLocationCache = {};
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const REQUEST_LIMIT = 15; // 15 requests per minute
const IPS_PER_REQUEST = 5; // Process 5 IPs at a time to avoid rate limiting
let lastRequestTime = 0;
let requestCount = 0;

/**
 * Reset request counter every minute
 */
setInterval(() => {
  requestCount = 0;
  lastRequestTime = Date.now();
}, 60 * 1000);

/**
 * Get geolocation data for a single IP address
 */
export async function getIPGeolocation(ip: string): Promise<GeoLocationData | null> {
  try {
    // Extract the IP address without port
    const ipAddress = ip.split(':')[0];
    
    // Check cache first
    if (geoCache[ipAddress] && (Date.now() - geoCache[ipAddress].timestamp) < CACHE_EXPIRATION) {
      return geoCache[ipAddress].data;
    }

    // Check database cache
    const cachedData = await prisma.iPGeolocation.findUnique({
      where: { ip: ipAddress }
    });

    if (cachedData && (Date.now() - cachedData.timestamp.getTime()) < CACHE_EXPIRATION) {
      // Update in-memory cache
      geoCache[ipAddress] = {
        data: {
          ip: cachedData.ip,
          country: cachedData.country,
          countryCode: cachedData.countryCode,
          region: cachedData.region,
          regionName: cachedData.regionName,
          city: cachedData.city,
          zip: cachedData.zip,
          lat: cachedData.lat,
          lon: cachedData.lon,
          timezone: cachedData.timezone,
          isp: cachedData.isp,
          org: cachedData.org,
          as: cachedData.as
        },
        timestamp: cachedData.timestamp.getTime()
      };
      return geoCache[ipAddress].data;
    }

    // Check rate limit
    const currentTime = Date.now();
    if (currentTime - lastRequestTime < 60 * 1000) {
      if (requestCount >= REQUEST_LIMIT) {
        console.log('Rate limit reached for geolocation API');
        return null;
      }
      requestCount++;
    } else {
      requestCount = 1;
      lastRequestTime = currentTime;
    }

    // Fetch from API
    const response = await axios.get(`http://ip-api.com/json/${ipAddress}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as`);
    
    if (response.data && response.data.status === 'success') {
      const geoData: GeoLocationData = {
        ip: ipAddress,
        country: response.data.country,
        countryCode: response.data.countryCode,
        region: response.data.region,
        regionName: response.data.regionName,
        city: response.data.city,
        zip: response.data.zip,
        lat: response.data.lat,
        lon: response.data.lon,
        timezone: response.data.timezone,
        isp: response.data.isp,
        org: response.data.org,
        as: response.data.as
      };

      // Update cache
      geoCache[ipAddress] = {
        data: geoData,
        timestamp: currentTime
      };

      // Store in database
      await prisma.iPGeolocation.upsert({
        where: { ip: ipAddress },
        update: {
          ...geoData,
          timestamp: new Date(currentTime)
        },
        create: {
          ...geoData,
          timestamp: new Date(currentTime)
        }
      });

      return geoData;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching geolocation for IP ${ip}:`, error);
    return null;
  }
}

/**
 * Get geolocation data for multiple IP addresses
 */
export async function getBatchIPGeolocation(ips: string[]): Promise<{[ip: string]: GeoLocationData}> {
  const result: {[ip: string]: GeoLocationData} = {};
  const ipsToFetch: string[] = [];
  
  // Extract IP addresses without ports
  const ipAddresses = ips.map(ip => ip.split(':')[0]);
  
  // Check cache first
  for (const ip of ipAddresses) {
    if (geoCache[ip] && (Date.now() - geoCache[ip].timestamp) < CACHE_EXPIRATION) {
      result[ip] = geoCache[ip].data;
    } else {
      ipsToFetch.push(ip);
    }
  }
  
  if (ipsToFetch.length === 0) {
    return result;
  }
  
  // Check database cache
  const cachedData = await prisma.iPGeolocation.findMany({
    where: {
      ip: { in: ipsToFetch },
      timestamp: { gt: new Date(Date.now() - CACHE_EXPIRATION) }
    }
  });
  
  // Update result with cached data from database
  for (const data of cachedData) {
    const geoData: GeoLocationData = {
      ip: data.ip,
      country: data.country,
      countryCode: data.countryCode,
      region: data.region,
      regionName: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as
    };
    
    result[data.ip] = geoData;
    geoCache[data.ip] = {
      data: geoData,
      timestamp: data.timestamp.getTime()
    };
    
    // Remove from ipsToFetch
    const index = ipsToFetch.indexOf(data.ip);
    if (index !== -1) {
      ipsToFetch.splice(index, 1);
    }
  }
  
  // Fetch remaining IPs from API in batches
  for (let i = 0; i < ipsToFetch.length; i += IPS_PER_REQUEST) {
    const batch = ipsToFetch.slice(i, i + IPS_PER_REQUEST);
    
    // Check rate limit
    const currentTime = Date.now();
    if (currentTime - lastRequestTime < 60 * 1000) {
      if (requestCount >= REQUEST_LIMIT) {
        console.log('Rate limit reached for geolocation API');
        break;
      }
      requestCount++;
    } else {
      requestCount = 1;
      lastRequestTime = currentTime;
    }
    
    try {
      // Process each IP individually instead of using batch API
      for (const ip of batch) {
        try {
          const geoData = await getIPGeolocation(ip);
          if (geoData) {
            result[ip] = geoData;
          }
        } catch (ipError) {
          console.error(`Error fetching geolocation for IP ${ip}:`, ipError);
        }
      }
    } catch (error) {
      console.error(`Error in batch geolocation processing:`, error);
    }
  }
  
  return result;
}
