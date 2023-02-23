const multer = require('multer');
const path = require('path');
const tinify = require("tinify");
require('dotenv').config()

tinify.key = process.env.TINIFY_KEY;




const storageEngine = multer.diskStorage({
    destination: "./uploads",
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
        cb(null, filename);
    }
});

const upload = multer({
    storage: storageEngine,
    limits: {
        fileSize: 10 * 1000 * 1000
    }
});

const compressImage = async (filePath) => {
    try {
        const source = tinify.fromFile(filePath);
        const converted = source.convert({ type: ["image/webp", "image/jpeg"] });
        await converted.toFile(filePath.replace('.jpg', '.webp'));
    } catch (error) {
        console.error(error);
        throw new Error('Error compressing image');
    }
};

module.exports = { upload, compressImage };