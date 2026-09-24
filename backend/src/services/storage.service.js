import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { logger } from '../utils/logger.js';
import { ENV } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads/resumes');

// Ensure local uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export const storageService = {
  uploadResume: async (file) => {
    // If Cloudinary is configured, upload to Cloudinary
    if (isCloudinaryConfigured) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            folder: 'hireflow_resumes',
            public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error.message);
              return reject(error);
            }
            resolve({
              fileUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format || path.extname(file.originalname).slice(1),
              bytes: result.bytes,
            });
          }
        );
        uploadStream.end(file.buffer);
      });
    }

    // Fallback: Save to local uploads directory
    const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${file.originalname}`;
    const filePath = path.join(uploadsDir, uniqueFileName);
    fs.writeFileSync(filePath, file.buffer);

    const localUrl = `http://localhost:${ENV.PORT}/uploads/resumes/${uniqueFileName}`;
    logger.info(`File saved locally to ${filePath}`);

    return {
      fileUrl: localUrl,
      publicId: uniqueFileName,
      format: path.extname(file.originalname).slice(1),
      bytes: file.size,
      localPath: filePath,
    };
  },

  deleteFile: async (publicId) => {
    try {
      if (isCloudinaryConfigured) {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      } else {
        const localPath = path.join(uploadsDir, publicId);
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }
      return true;
    } catch (err) {
      logger.warn('Failed to delete file from storage:', err.message);
      return false;
    }
  },
};
