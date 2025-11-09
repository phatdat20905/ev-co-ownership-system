import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '@ev-coownership/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration for KYC documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/kyc');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id || 'unknown';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const fieldName = file.fieldname; // idCardFront, idCardBack, driverLicense, selfie
    cb(null, `${userId}-${fieldName}-${timestamp}${ext}`);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed (jpeg, jpg, png, gif, webp)', 400), false);
  }
};

// Multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size for KYC documents
  }
});

// Upload multiple KYC files
export const uploadKYCDocuments = upload.fields([
  { name: 'idCardFront', maxCount: 1 },
  { name: 'idCardBack', maxCount: 1 },
  { name: 'driverLicense', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]);

// Error handling middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size exceeds 10MB limit', 400));
    }
    return next(new AppError(`Upload error: ${err.message}`, 400));
  }
  
  if (err) {
    return next(err);
  }
  
  next();
};
