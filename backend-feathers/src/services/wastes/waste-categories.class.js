import { MongoDBService } from '@feathersjs/mongodb';
import redisClient from '../../redisClient.js';  // Import Redis client

// Service class for managing waste categories with caching
export class WasteCategoryService extends MongoDBService {
  
  // Override the find method to implement caching
  async find(params) {
    const key = 'wasteCategoriesCache';
    
    // Check if data is in cache
    const cachedData = await redisClient.get(key);
    
    if (cachedData) {
      console.log('Returning cached data');
      return JSON.parse(cachedData);
    }
    
    // If not cached, proceed with normal find
    const data = await super.find(params);
    
    // Store the result in cache with an expiration time (e.g., 3600 seconds)
    await redisClient.set(key, JSON.stringify(data), 'EX', 3600);
    
    return data;
  }
}

// Options for the service
export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('waste_categories'))
  };
}
