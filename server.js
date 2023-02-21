
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const upload = require('./upload.js')
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;
const dbPath = './db.json';
const { db, connectDB } = require('./config/database.js');
// connectDB();
const LandingPage = require("./models/companyModel.js")


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));






const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://landing-page-backend.onrender.com' : 'http://localhost:8000';

app.get('/', (req, res) => {
    LandingPage.findAll().then(landingPages => {
        res.json(landingPages);
    }).catch(err => {
        console.error('Unable to fetch landing pages:', err);
        res.status(500).send({ message: 'Failed to fetch landing pages.' });
    });
});

app.get('/:id', (req, res) => {
    LandingPage.findByPk(req.params.id)
        .then((item) => {
            if (!item) {
                return res.status(404).send({ message: 'Item not found' });
            }

            res.send(item);
        })
        .catch((err) => {
            console.error('Unable to fetch landing page:', err);
            res.status(500).send({ message: 'Failed to fetch landing page.' });
        });
});


app.get('/uploads/:imageName', function (req, res) {
    var image = req.params['imageName'];

    res.header('Content-Type', "image/jpg");
    fs.readFile("uploads/" + image, function (err, data) {
        if (err) {
            res.end(404);
        }
        res.send(data)
    });
});



app.post('/', upload.fields([
    { name: 'hero', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'testimonialImg1', maxCount: 1 },
    { name: 'testimonialImg2', maxCount: 1 },
    { name: 'testimonialImg3', maxCount: 1 },
]), async (req, res) => {
    try {
        const newCompany = {
            brand: req.body.brand,
            hero: req.files.hero[0].filename,
            image1: req.files.image1[0].filename,
            image2: req.files.image2[0].filename,
            image3: req.files.image3[0].filename,
            testimonialImg1: req.files.testimonialImg1[0].filename,
            testimonialImg2: req.files.testimonialImg2[0].filename,
            testimonialImg3: req.files.testimonialImg3[0].filename,
            ...req.body
        };

        // save the images to the local storage
        const db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
        const updatedDB = [...db, newCompany];
        fs.writeFileSync('./db.json', JSON.stringify(updatedDB));

        // save the other data to MySQL database
        const createdCompany = await LandingPage.create(newCompany);

        // update the filenames with the id of the new company
        const id = createdCompany.id;
        const filesToUpdate = ['hero', 'image1', 'image2', 'image3', 'testimonialImg1', 'testimonialImg2', 'testimonialImg3'];
        for (const fieldName of filesToUpdate) {
            const file = req.files[fieldName][0];
            let prefix = '';
            if (fieldName === 'hero') {
                prefix = 'hero';
            } else if (fieldName.startsWith('image')) {
                prefix = `image${fieldName.slice(-1)}`;
            } else if (fieldName.startsWith('testimonialImg')) {
                prefix = `testimonialImg${fieldName.slice(-1)}`;
            }
            const extension = file.originalname.split('.').pop();
            const filename = `${id}-${prefix}.${extension}`.replace(/\s+/g, '-');
            fs.renameSync(`./uploads/${file.filename}`, `./uploads/${filename}`);
            newCompany[fieldName] = filename; // update the filename in newCompany
        }

        
        const imagePath = (imageName) => `${BASE_URL}/uploads/${id}-${imageName}`;

        updatedCompany = {
            ...createdCompany,
            hero: imagePath('hero.jpg'),
            image1: imagePath('image1.jpg'),
            image2: imagePath('image2.jpg'),
            image3: imagePath('image3.jpg'),
            testimonialImg1: imagePath('testimonialImg1.jpg'),
            testimonialImg2: imagePath('testimonialImg2.jpg'),
            testimonialImg3: imagePath('testimonialImg3.jpg')
        };
        
        await createdCompany.update(updatedCompany);

        res.status(201).send(createdCompany);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating item in database' });
    }
});

app.put('/:id', upload.fields([
    { name: 'hero', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'testimonialImg1', maxCount: 1 },
    { name: 'testimonialImg2', maxCount: 1 },
    { name: 'testimonialImg3', maxCount: 1 }
]), async (req, res) => {
    try {
        const landingPage = await LandingPage.findByPk(req.params.id);

        if (!landingPage) {
            return res.status(404).send({ message: 'Item not found.' });
        }

        let updatedFields = { ...req.body };

        if (req.files) {
            if (req.files['hero']) {
                updatedFields.hero = req.files['hero'][0].filename;
            }
            if (req.files['image1']) {
                updatedFields.image1 = req.files['image1'][0].filename;
            }
            if (req.files['image2']) {
                updatedFields.image2 = req.files['image2'][0].filename;
            }
            if (req.files['image3']) {
                updatedFields.image3 = req.files['image3'][0].filename;
            }
            if (req.files['testimonialImg1']) {
                updatedFields.testimonialImg1 = req.files['testimonialImg1'][0].filename;
            }
            if (req.files['testimonialImg2']) {
                updatedFields.testimonialImg2 = req.files['testimonialImg2'][0].filename;
            }
            if (req.files['testimonialImg3']) {
                updatedFields.testimonialImg3 = req.files['testimonialImg3'][0].filename;
            }
        }

        await landingPage.update(updatedFields);

        const updatedLandingPage = await LandingPage.findByPk(req.params.id);

        const imagePath = (imageName) => `${BASE_URL}/uploads/${updatedLandingPage.id}-${imageName}`;

        updatedLandingPage.hero = updatedLandingPage.hero ? imagePath('hero.jpg') : null;
        updatedLandingPage.image1 = updatedLandingPage.image1 ? imagePath('image1.jpg') : null;
        updatedLandingPage.image2 = updatedLandingPage.image2 ? imagePath('image2.jpg') : null;
        updatedLandingPage.image3 = updatedLandingPage.image3 ? imagePath('image3.jpg') : null;
        updatedLandingPage.testimonialImg1 = updatedLandingPage.testimonialImg1 ? imagePath('testimonialImg1.jpg') : null;
        updatedLandingPage.testimonialImg2 = updatedLandingPage.testimonialImg2 ? imagePath('testimonialImg2.jpg') : null;
        updatedLandingPage.testimonialImg3 = updatedLandingPage.testimonialImg3 ? imagePath('testimonialImg3.jpg') : null;

        res.send(updatedLandingPage);

    } catch (err) {
        console.error('Unable to update landing page:', err);
        res.status(500).send({ message: 'Failed to update landing page.' });
    }
});





app.delete('/:id', async (req, res) => {
    try {
        const landingPage = await LandingPage.findByPk(req.params.id);

        if (!landingPage) {
            return res.status(404).send({ message: 'Item not found.' });
        }

        const deletedItem = { ...landingPage.toJSON() };

        // Delete the images from the file system
        if (deletedItem.hero) {
            fs.unlink(`./uploads/${deletedItem.id}-hero.jpg`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image1) {
            fs.unlink(`./uploads/${deletedItem.id}-image1.jpg`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image2) {
            fs.unlink(`./uploads/${deletedItem.id}-image2.jpg`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image3) {
            fs.unlink(`./uploads/${deletedItem.id}-image3.jpg`, (err) => {
                if (err) console.error(err);
            });
        }

        await landingPage.destroy();

        res.send(deletedItem);

    } catch (err) {
        console.error('Unable to delete landing page:', err);
        res.status(500).send({ message: 'Failed to delete landing page.' });
    }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});