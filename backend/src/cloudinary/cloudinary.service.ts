import { Injectable, Inject, InternalServerErrorException, Logger } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constants';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(@Inject(CLOUDINARY) private cloudinaryInstance: typeof cloudinary) {}

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'voice_messages', // Default folder in Cloudinary
  ): Promise<UploadApiResponse> { 
    if (!file || !file.buffer) {
      this.logger.error('File buffer is missing for Cloudinary upload.');
      throw new InternalServerErrorException('File buffer is missing for upload.');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = this.cloudinaryInstance.uploader.upload_stream(
        {
          folder: folder,
          resource_type: 'video', // Cloudinary often uses 'video' for audio for better codec/transformation support
                                  // Alternatives: 'audio', 'raw', or 'auto'
          // format: 'mp3', // Optional: convert to a specific format on upload
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error('Cloudinary upload failed', JSON.stringify(error));
            return reject(new InternalServerErrorException(`Cloudinary upload failed: ${error.message}`));
          }
          if (result) {
            this.logger.log(`File uploaded to Cloudinary: ${result.secure_url}`);
            resolve(result);
          } else {
            this.logger.error('Cloudinary upload returned no result and no error.');
            reject(new InternalServerErrorException('Cloudinary upload returned no result.'));
          }
        },
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
