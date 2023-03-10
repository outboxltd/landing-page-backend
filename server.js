
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { upload, compressImage } = require('./upload.js')
const path = require('path');
const bot = require('./bot.js')

const app = express();
const port = process.env.PORT || 8000;


const LandingPage = require("./models/companyModel.js")
const FormModel = require("./models/formModel.js")
const User = require("./models/userModel.js")
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));



require('dotenv').config();



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

app.get('/landingPages/:uid', async (req, res) => {
    const uid = req.params.uid;

    try {
        const landingPages = await LandingPage.findAll({ where: { uid: uid } });

        res.json({ landingPages: landingPages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});



app.get(`/uploads/:imageName`, async (req, res) => {
    res.sendFile(path.join(__dirname, `./uploads/${req.params.imageName}`));
});

app.get('/user/:uid', async (req, res) => {
    try {
        const user = await User.findOne({
            where: {
                uid: req.params.uid
            }
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
        } else {
            res.status(200).json(user);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server Error' });
    }
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


        // save the other data to MySQL database
        const createdCompany = await LandingPage.create(newCompany);

        // update the filenames with the id of the new company
        const id = createdCompany.id;
        const user = await User.findOne({ where: { uid: req.body.uid } });
        const companyIds = (user.companyIds ? JSON.parse(user.companyIds) : []);
        
        if (!companyIds.includes(user.companyIds)) {
            console.log(  user.companyIds)
            companyIds.push(id);
            await user.update({ companyIds: companyIds });
        }
        



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
            companyId: req.body.companyId,
            leadStatus: 0
        };

        const createdForm = await FormModel.create(newForm);

        res.status(201).json(createdForm);
    } catch (err) {
        console.error('Unable to create form:', err);
        res.status(500).send({ message: 'Failed to create form.' });
    }
});

app.post('/user', async (req, res) => {
    try {
        console.log(req.body);
        const newUser = {
            uid: req.body.uid,
            phoneNumber: req.body.phoneNumber
        }
        const createdUser = await User.create(newUser)


        res.status(201).json(createdUser);
    } catch (err) {
        console.error('Unable to create user:', err);
        res.status(500).send({ message: 'Failed to create user.' });
    }
});


app.put('/:id', async (req, res) => {
    try {
        const landingPage = await LandingPage.findByPk(req.params.id);

        if (!landingPage) {
            return res.status(404).send({ message: 'Item not found.' });
        }

        // Delete existing images


        if (req.body.hero) {

            fs.unlink(`./uploads/${landingPage.hero.match(/\/([^/]+)$/)[1]}`, (err) => {
                if (err) console.error(err);
            });

        }
        if (req.body.image1) {
            fs.unlink(`./uploads/${landingPage.image1.match(/\/([^/]+)$/)[1]}`, (err) => {
                if (err) console.error(err);
            });
        }
        if (req.body.image2) {
            fs.unlink(`./uploads/${landingPage.image2.match(/\/([^/]+)$/)[1]}`, (err) => {
                if (err) console.error(err);
            });
        }
        if (req.body.image3) {
            fs.unlink(`/uploads/${landingPage.image3.match(/\/([^/]+)$/)[1]}`, (err) => {
                if (err) console.error(err);
            });
        }
        if (req.body.testimonialImg1) {
            fs.unlink(`./uploads/${landingPage.testimonialImg1.match(/\/([^/]+)$/)[1]}`, (err) => {
                if (err) console.error(err);
            });
        }
        if (req.body.testimonialImg2) {
            fs.unlink(`./uploads/${landingPage.testimonialImg2.match(/\/([^/]+)$/)[1]}`, (err) => {
                if (err) console.error(err);
            });
        }
        if (req.body.testimonialImg3) {
            fs.unlink(`./uploads/${landingPage.testimonialImg3.match(/\/([^/]+)$/)[1]}`, (err) => {
                if (err) console.error(err);
            });
        }

        // Upload new images
        const uploadMiddleware = upload.fields([
            { name: 'hero', maxCount: 1 },
            { name: 'image1', maxCount: 1 },
            { name: 'image2', maxCount: 1 },
            { name: 'image3', maxCount: 1 },
            { name: 'testimonialImg1', maxCount: 1 },
            { name: 'testimonialImg2', maxCount: 1 },
            { name: 'testimonialImg3', maxCount: 1 },
        ]);
        uploadMiddleware(req, res, async (err) => {
            if (err) {
                console.error('Unable to upload images:', err);
                return res.status(500).send({ message: 'Failed to upload images.' });
            }

            // Compress and update image URLs
            let updatedFields = { ...req.body };
            const fields = ['hero', 'image1', 'image2', 'image3', 'testimonialImg1', 'testimonialImg2', 'testimonialImg3'];
            for (const field of fields) {
                if (req.files[field]) {

                    const fileName = req.files[field][0].filename;
                    if (fileName) {
                        const imageUrl = `${BASE_URL}/uploads/${fileName}`.replace(/\.\w+$/, '.webp');
                        const newFileName = `./uploads/${fileName}`.replace(/\.\w+$/, '.webp')
                        fs.renameSync(`./uploads/${fileName}`, newFileName);
                        await compressImage(newFileName);

                        updatedFields[field] = imageUrl;
                    }
                }
            }

            await landingPage.update(updatedFields);

            const updatedLandingPage = await LandingPage.findByPk(req.params.id);

            res.send(updatedLandingPage);
        });
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