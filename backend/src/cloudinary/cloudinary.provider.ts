import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (): typeof cloudinary => {
    // TODO: Replace with your actual Cloudinary credentials
    // It's highly recommended to use process.env variables and ConfigModule for this
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME , 
      api_key: process.env.CLOUDINARY_API_KEY ,       
      api_secret: process.env.CLOUDINARY_API_SECRET , 
    });
    return cloudinary; // Return the configured cloudinary instance
  },
};
