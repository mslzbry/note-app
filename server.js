const express = require('express');
const path = require('path');
const fs = require('fs');
const util = require("util");
const NOTESPATH = './db/db.json';

const PORT = 3001;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Util for reading and writing files
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

// Static assets API routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

let notesData;
// GET API Route for getting all notes from the db file
app.get('/api/notes', (req, res) => {
    readFile(NOTESPATH).then(data => {
        notesData = JSON.parse(data);
        res.json(notesData);
    })
});

// POST API Route for creating a new note
app.post('/api/notes', (req, res) => {
    readFile(NOTESPATH).then(data => {
        notesData = JSON.parse(data);
        let newNote = req.body;
        let currentID = notesData.length;
        newNote.id = currentID + 1;
        // Add new note to the current notes list
        notesData.push(newNote);
        notesData = JSON.stringify(notesData);
        writeFile(NOTESPATH, notesData).then(data => {
            console.log("Notes JSON has been updated.");
        })
        res.json(notesData);
    })
});

// DELETE API Route for deleting a note
app.delete('/api/notes/:id', (req, res) => {
    let idToDelete = parseInt(req.params.id);
    //  Read DB (JSON file)
    readFile(NOTESPATH).then(data => {
        notesData = JSON.parse(data);
        for (let i = 0; i < notesData.length; i++) {
            if (idToDelete == notesData[i].id) {
                // modify the array by removing that note item in the array
                notesData.splice(i, 1);
            }
        }
        // Write the updated array of notes to the file
        writeFile(NOTESPATH, JSON.stringify(notesData)).then(data => {
            console.log("Note has been deleted");
        })
        res.json(notesData);
    })
});

app.listen(PORT, () => {
    console.log(`API server is running now on port ${PORT}!`);
});