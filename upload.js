const multer = require('multer');
const path = require('path');

const storageEngine = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
        const companyId = req.params.id;
        const fieldName = file.fieldname;
        const prefix = (fieldName === 'hero') ? 'hero' : `image${fieldName.slice(-1)}`
        const extension = file.originalname.split('.').pop();
        const filename = `${companyId}-${prefix}.${extension}`.replace(/\s+/g, '-');
        cb(null, filename);
    }
});

const upload = multer({
    storage: storageEngine,
    limits: {
        fileSize: 10 * 1000 * 1000
    }
});

module.exports = upload;