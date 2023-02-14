
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const upload = require('./upload.js')

const app = express();
const port = process.env.PORT || 8000;
const dbPath = './db.json';




app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://landing-page-backend.onrender.com/' : 'http://localhost:8000';

app.get('/', (req, res) => {
    fs.readFile(dbPath, (err, data) => {
        if (err) {
            res.status(500).send({ message: 'Failed to read database.' });
        } else {
            res.send(JSON.parse(data));
        }
    });
});

app.get('/:id', (req, res) => {
    fs.readFile(dbPath, (err, data) => {
        if (err) {
            return res.status(500).send({ message: 'Error reading database file' });
        }

        const db = JSON.parse(data);

        const item = db.find((item) => item.id === parseInt(req.params.id));
        if (!item) {
            return res.status(404).send({ message: 'Item not found' });
        }



        // res.set('Content-Type','image/jpg')
        res.send(item);
    });
});


app.get('/:id/uploads/:imageName', function(req, res) {
    // const item = db.find((item) => item.id === parseInt(req.params.id));
    var image = req.params['imageName'];
    // if(item.findIndex(image)<0){
    //     res.end(403)
    // }
    res.header('Content-Type', "image/jpg");
    fs.readFile("uploads/"+image, function(err, data){
      if(err){
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
]), (req, res) => {
    fs.readFile('./db.json', 'utf-8', (err, data) => {

        if (err) {
            return res.status(500).json({ message: 'Error reading file.' });
        }

        const db = JSON.parse(data);
        const newCompany = {
            id: db.length + 1,
            brand: req.body.brand,
            hero: req.files.hero[0].filename,
            image1: req.files.image1[0].filename,
            image2: req.files.image2[0].filename,
            image3: req.files.image3[0].filename,
            ...req.body
        };
        db.push(newCompany);

        fs.writeFile('./db.json', JSON.stringify(db), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ message: 'Error writing file.' });
            }

            return res.status(201).json(newCompany);
        });
    });
});

app.put('/:id', (req, res) => {
    fs.readFile(dbPath, (err, data) => {
        if (err) {
            res.status(500).send({ message: 'Failed to read database.' });
        } else {
            const db = JSON.parse(data);
            const itemIndex = db.findIndex((item) => item.id === parseInt(req.params.id));
            if (itemIndex === -1) {
                res.status(404).send({ message: 'Item not found.' });
            } else {
                const updatedItem = { ...db[itemIndex], ...req.body };
                db[itemIndex] = updatedItem;
                fs.writeFile(dbPath, JSON.stringify(db), (err) => {
                    if (err) {
                        res.status(500).send({ message: 'Failed to write to database.' });
                    } else {
                        res.send(updatedItem);
                    }
                });
            }
        }
    });
});

app.delete('/:id', (req, res) => {
    fs.readFile(dbPath, (err, data) => {
        if (err) {
            res.status(500).send({ message: 'Failed to read database.' });
        } else {
            const db = JSON.parse(data);
            const itemIndex = db.findIndex((item) => item.id === parseInt(req.params.id));
            if (itemIndex === -1) {
                res.status(404).send({ message: 'Item not found.' });
            } else {
                const deletedItem = db.splice(itemIndex, 1);
                fs.writeFile(dbPath, JSON.stringify(db), (err) => {
                    if (err) {
                        res.status(500).send({ message: 'Failed to write to database.' });
                    } else {
                        res.send(deletedItem[0]);
                    }
                });
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});