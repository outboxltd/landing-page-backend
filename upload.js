const multer = require('multer');
const path = require('path');
const tinify = require("tinify");
require('dotenv').config()
const fs = require('fs');

tinify.key = process.env.TINIFY_KEY;

const storageEngine = multer.diskStorage({
    destination: path.join(__dirname,'./uploads'),
    filename: (req, file, cb) => {
        const companyId = req.params.id;
        const fieldName = file.fieldname;
        let prefix;
        if (fieldName === 'hero') {
            prefix = 'hero';
        } else if (fieldName.startsWith('image')) {
            prefix = `image${fieldName.slice(-1)}`;
        } else {
            prefix = `testimonialImg${fieldName.slice(-1)}`;
        }
        const extension = file.originalname.split('.').pop();
        const filename = companyId ? `${companyId}-${prefix}.${extension}`.replace(/\s+/g, '-') : `${prefix}.${extension}`.replace(/\s+/g, '-');
        console.log("got here");
        cb(null, filename);
    }
});

const upload = multer({
    storage: storageEngine,
    limits: {
        fileSize: 10 * 1000 * 1000
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            const error = new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.');
            error.code = 'INVALID_FILE_TYPE';
            return cb(error, false);
        }
        cb(null, true);
    }
});

const compressImage = async (filePath) => {
    try {
        
        fs.writeFileSync('tmp', filePath);
        const source = tinify.fromFile(filePath);
        if (path.extname(filePath) === '.png' || path.extname(filePath) === '.jpeg') {
            fs.writeFileSync('tmp', filePath);
            await source.toFormat('webp').toFile(filePath.replace(/\.\w+$/, '.webp'));
        } else if (path.extname(filePath) === '.webp') {
            fs.writeFileSync('tmp', filePath);
            
            await source.toFile(filePath);
        }
    } catch (error) {
        console.error(error);
        throw new Error('Error compressing image');
    }
};

module.exports = { upload, compressImage };
