const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'men-stack-session-auth2-listings',
        allowed_formats: ['jpg','jpeg','png'],
    }
})

module.exports = multer({storage:storage});