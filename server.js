
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const upload = require('./upload.js')
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;
const dbPath = './db.json';
// const Sequelize = require('sequelize');
const LandingPage = require("./models/companyModel.js")


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));



// const db = new Sequelize('landingPageDB', 'root', 'password', {
//     host: '127.0.0.1',
//     dialect: 'mysql'
// });


// try {
//     db.authenticate();
//     console.log('Connection has been established successfully.');
// } catch (error) {
//     console.error('Unable to connect to the database:', error);
// }




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

            const imagePath = (imageName) => `${BASE_URL}/uploads/${item.id}-${imageName}`;

            const response = {
                ...item.toJSON(),
                hero: imagePath('hero.jpg'),
                image1: imagePath('image1.jpg'),
                image2: imagePath('image2.jpg'),
                image3: imagePath('image3.jpg')
            };

            res.send(response);
        })
        .catch((err) => {
            console.error('Unable to fetch landing page:', err);
            res.status(500).send({ message: 'Failed to fetch landing page.' });
        });
});


app.get('/uploads/:imageName', function (req, res) {
    // const item = db.find((item) => item.id === parseInt(req.params.id));
    var image = req.params['imageName'];
    // if(item.findIndex(image)<0){
    //     res.end(403)
    // }
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
    { name: 'image3', maxCount: 1 }
]), async (req, res) => {
    try {
        const newCompany = {
            brand: req.body.brand,
            hero: req.files.hero[0].filename,
            image1: req.files.image1[0].filename,
            image2: req.files.image2[0].filename,
            image3: req.files.image3[0].filename,
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
        const filesToUpdate = ['hero', 'image1', 'image2', 'image3'];
        for (const fieldName of filesToUpdate) {
            const file = req.files[fieldName][0];
            const prefix = (fieldName === 'hero') ? 'hero' : `image${fieldName.slice(-1)}`
            const extension = file.originalname.split('.').pop();
            const filename = `${id}-${prefix}.${extension}`.replace(/\s+/g, '-');
            fs.renameSync(`./uploads/${file.filename}`, `./uploads/${filename}`);
        }

        res.status(201).json(createdCompany);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error creating item in database' });
    }
});

app.put('/:id', upload.fields([
    { name: 'hero', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
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
        }

        await landingPage.update(updatedFields);

        const updatedLandingPage = await LandingPage.findByPk(req.params.id);
        updatedLandingPage.hero = `${BASE_URL}/uploads/${updatedLandingPage.hero}`;
        updatedLandingPage.image1 = `${BASE_URL}/uploads/${updatedLandingPage.image1}`;
        updatedLandingPage.image2 = `${BASE_URL}/uploads/${updatedLandingPage.image2}`;
        updatedLandingPage.image3 = `${BASE_URL}/uploads/${updatedLandingPage.image3}`;

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
        console.log(deletedItem);
        // Delete the images from the file system
        if (deletedItem.hero) {
            fs.unlink(`./uploads/${deletedItem.id}-${deletedItem.hero.toString()}`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image1) {
            fs.unlink(`./uploads/${deletedItem.id}-${deletedItem.image1.toString()}`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image2) {
            fs.unlink(`./uploads/${deletedItem.id}-${deletedItem.image2.toString()}`, (err) => {
                if (err) console.error(err);
            });
        }
        if (deletedItem.image3) {
            fs.unlink(`./uploads/${deletedItem.id}-${deletedItem.image3.toString()}`, (err) => {
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