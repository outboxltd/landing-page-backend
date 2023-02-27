
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { upload, compressImage } = require('./upload.js')
const path = require('path');


const app = express();
const port = process.env.PORT || 8000;
// const dbPath = './db.json';
// const { db, connectDB } = require('./config/database.js');
// connectDB();
const LandingPage = require("./models/companyModel.js")
// const FormModel = require("./models/formModel.js")

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
            res.status(404).send('image not found');
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
            hero: req.files.hero ? req.files.hero[0].filename : null,
            image1: req.files.image1 ? req.files.image1[0].filename : null,
            image2: req.files.image2 ? req.files.image2[0].filename : null,
            image3: req.files.image3 ? req.files.image3[0].filename : null,
            testimonialImg1: req.files.testimonialImg1 ? req.files.testimonialImg1[0].filename : null,
            testimonialImg2: req.files.testimonialImg2 ? req.files.testimonialImg2[0].filename : null,
            testimonialImg3: req.files.testimonialImg3 ? req.files.testimonialImg3[0].filename : null,
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
            const file = req.files[fieldName];
            if (file) {
                const fileData = file[0];
                let prefix = '';
                if (fieldName === 'hero') {
                    prefix = 'hero';
                } else if (fieldName.startsWith('image')) {
                    prefix = `image${fieldName.slice(-1)}`;
                } else {
                    prefix = `testimonialImg${fieldName.slice(-1)}`;
                }
                const extension = fileData.originalname.split('.').pop();
                const filename = `${id}-${prefix}.webp`.replace(/\s+/g, '-');
                fs.renameSync(`./uploads/${fileData.filename}`, `./uploads/${filename}`);
                newCompany[fieldName] = filename; // update the filename in newCompany
                compressImage(`./uploads/${filename}`)
            }
        }


        const imagePath = (imageName) => `${BASE_URL}/uploads/${id}-${imageName}`;

        updatedCompany = {
            ...createdCompany,
            hero: imagePath('hero.webp'),
            image1: imagePath('image1.webp'),
            image2: imagePath('image2.webp'),
            image3: imagePath('image3.webp'),
            testimonialImg1: imagePath('testimonialImg1.webp'),
            testimonialImg2: imagePath('testimonialImg2.webp'),
            testimonialImg3: imagePath('testimonialImg3.webp')
        };

        await createdCompany.update(updatedCompany);

        res.status(201).send(createdCompany);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating item in database' });
    }
});

app.post('/form', async (req, res) => {
    try {
        console.log(req.body);
        const newForm = {
            name: req.body.name,
            phone: req.body.phone,
            email: req.body.email,
            companyId: req.body.companyId
        };

        const createdForm = await FormModel.create(newForm);

        res.status(201).json(createdForm);
    } catch (err) {
        console.error('Unable to create form:', err);
        res.status(500).send({ message: 'Failed to create form.' });
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
                const heroFileName = req.files['hero'][0].filename;
                await compressImage(`./uploads/${heroFileName}`)
                const heroImageUrl = `${BASE_URL}/uploads/${heroFileName}`.replace('.jpg', '.webp');
                updatedFields.hero = heroImageUrl;
                fs.unlink(`./uploads/${heroFileName}`, (err) => {
                    if (err) console.error(err);
                });
            }
            if (req.files['image1']) {
                const image1FileName = req.files['image1'][0].filename;
                await compressImage(`./uploads/${image1FileName}`)
                const image1ImageUrl = `${BASE_URL}/uploads/${image1FileName}`.replace('.jpg', '.webp');
                updatedFields.image1 = image1ImageUrl;
                fs.unlink(`./uploads/${image1FileName}`, (err) => {
                    if (err) console.error(err);
                });
            }
            if (req.files['image2']) {
                const image2FileName = req.files['image2'][0].filename;
                await compressImage(`./uploads/${image2FileName}`)
                const image2ImageUrl = `${BASE_URL}/uploads/${image2FileName}`.replace('.jpg', '.webp');
                updatedFields.image2 = image2ImageUrl;
                fs.unlink(`./uploads/${image2FileName}`, (err) => {
                    if (err) console.error(err);
                });
            }
            if (req.files['image3']) {
                const image3FileName = req.files['image3'][0].filename;
                await compressImage(`./uploads/${image3FileName}`);
                const image3ImageUrl = `${BASE_URL}/uploads/${image3FileName}`.replace('.jpg', '.webp');
                updatedFields.image3 = image3ImageUrl;
                fs.unlink(`./uploads/${image3FileName}`, (err) => {
                    if (err) console.error(err);
                });
            }
            if (req.files['testimonialImg1']) {
                const testimonialImg1FileName = req.files['testimonialImg1'][0].filename;
                await compressImage(`./uploads/${testimonialImg1FileName}`);
                const testimonialImg1ImageUrl = `${BASE_URL}/uploads/${testimonialImg1FileName}`.replace('.jpg', '.webp');
                updatedFields.testimonialImg1 = testimonialImg1ImageUrl;
                fs.unlink(`./uploads/${testimonialImg1FileName}`, (err) => {
                    if (err) console.error(err);
                });
            }
            if (req.files['testimonialImg2']) {
                const testimonialImg2FileName = req.files['testimonialImg2'][0].filename;
                await compressImage(`./uploads/${testimonialImg2FileName}`)
                const testimonialImg2ImageUrl = `${BASE_URL}/uploads/${testimonialImg2FileName}`.replace('.jpg', '.webp');
                updatedFields.testimonialImg2 = testimonialImg2ImageUrl;
                fs.unlink(`./uploads/${testimonialImg2FileName}`, (err) => {
                    if (err) console.error(err);
                });
            }
            if (req.files['testimonialImg3']) {
                const testimonialImg3FileName = req.files['testimonialImg3'][0].filename;
                await compressImage(`./uploads/${testimonialImg3FileName}`);
                const testimonialImg3ImageUrl = `${BASE_URL}/uploads/${testimonialImg3FileName}`.replace('.jpg', '.webp');
                updatedFields.testimonialImg3 = testimonialImg3ImageUrl;
                fs.unlink(`./uploads/${testimonialImg3FileName}`, (err) => {
                    if (err) console.error(err);
                });
            }
        }

        await landingPage.update(updatedFields);

        const updatedLandingPage = await LandingPage.findByPk(req.params.id);

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
            fs.unlink(`./uploads/${deletedItem.id}-hero.webp`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image1) {
            fs.unlink(`./uploads/${deletedItem.id}-image1.webp`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image2) {
            fs.unlink(`./uploads/${deletedItem.id}-image2.webp`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image3) {
            fs.unlink(`./uploads/${deletedItem.id}-image3.webp`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.testimonialImg1) {
            fs.unlink(`./uploads/${deletedItem.id}-testimonialImg1.webp`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.testimonialImg2) {
            fs.unlink(`./uploads/${deletedItem.id}-testimonialImg2.webp`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.testimonialImg3) {
            fs.unlink(`./uploads/${deletedItem.id}-testimonialImg3.webp`, (err) => {
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