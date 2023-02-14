
const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8000;
const dbPath = './db.json';

app.use(express.json());
app.use(cors());

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
    console.log(req.params.id);
    fs.readFile(dbPath, (err, data) => {
        if (err) {
            return res.status(500).send({ message: 'Error reading database file' });
        }

        const db = JSON.parse(data);
        console.log(db);
        const item = db.find((item) => item.id === parseInt(req.params.id));
        console.log(item);
        if (!item) {
            return res.status(404).send({ message: 'Item not found' });
        }

        res.send(item);
    });
});

app.post('/companies', (req, res) => {
    fs.readFile('./db.json', 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading file.' });
        }

        const db = JSON.parse(data);
        const newCompany = {
            id: db.length + 1,
            ...req.body,
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