import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/avif',
        'image/gif',
        'image/bmp',
        'image/tiff',
        'image/x-icon',
        'image/svg+xml',
        'application/pdf',
        'video/mp4',
        'video/mpeg',
        'video/quicktime',
        'video/webm',
        'video/x-msvideo',
        'video/x-matroska'
    ]
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, PDF and Video are allowed.'))
    }
}

export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter
})
