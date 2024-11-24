const express = require("express");
const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const setupSwagger = require('./swagger'); // Імпорт Swagger конфігурації

const program = new Command();

program
    .requiredOption('-h, --host <host>', 'Server Address')
    .requiredOption('-p, --port <port>', 'Server Port')
    .requiredOption('-c, --cache <cache>', 'Cache directory path');

program.parse(process.argv);

const options = program.opts();

const cacheDirectory = path.resolve(options.cache);
if (!fs.existsSync(cacheDirectory)) {
    console.error(`Directory cache path is invalid`);
    process.exit(1);
}

const notesFilePath = path.join(cacheDirectory, 'notes.json');

function saveNotesToFile() {
    fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
}

function loadNotesFromFile() {
    if (fs.existsSync(notesFilePath)) {
        const data = fs.readFileSync(notesFilePath);
        return JSON.parse(data);
    }
    return [];
}

let notes = loadNotesFromFile();

const app = express();
app.use(express.json());
const upload = multer();
setupSwagger(app);


app.get('/', (req, res) => {
    debugger;
    res.send("Hello сука!");
});

const server = app.listen(options.port,  () => {
    console.log(`Server shluha at http://${options.host}:${options.port}`);
});

server.on('error', (err) => {
    console.error("server error: ", err);
});

app.get(`/notes/:name`, (req, res) => {
    const name = req.params.name;

    const note = notes.find(note => note.name === name);

    if (!note) {
        console.log(`Note not found: ${name}`);
        return res.status(404).send("Note not found!");
    }
    
    res.send(note.text);
});

/**
 * @swagger
 * /notes/write:
 *   post:
 *     description: Create a new note
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note_name
 *             properties:
 *               note_name:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *       400:
 *         description: Invalid request
 */

app.post('/notes/write', upload.fields([{ name: 'note_name' }, { name: 'note' }]), (req, res) => {
    const name = req.body.note_name;
    const text = req.body.note;

    if (!name) {
        return res.status(400).send("Name parameter is required.");
    }

    console.log(`Received request to create note with name: ${name}`);

    const existingNote = notes.find(note => note.name === name);

    if (existingNote) {
        return res.status(400).send("Note already exists!");
    }

    const newNote = {
        name: name,
        text: text || "No text provided"
    };

    notes.push(newNote);
    saveNotesToFile(); 
    console.log(notes);
    debugger;
    return res.status(201).send(newNote);
});

app.get('/notes', (req, res) => {
    debugger;
    res.status(200).send(notes);
});

app.put("/notes/:name", (req, res) => {
    const newText = req.body.text;
    const name = req.params.name; 

    const note = notes.find(note => note.name === name);
    if (!note) {
        return res.status(404).send(`Note ${name} not found!`);
    }

    note.text = newText;
    saveNotesToFile(); 
    res.status(201).send(`Note ${name} updated successfully!`);
});

app.delete('/delete/:name', (req, res) => {
    const name = req.params.name;

    const note = notes.findIndex(note => note.name === name);
    if (note === -1) {
        return res.status(404).send(`Note ${name} not found!`);
    }
    try {
        notes.splice(note, 1);
        saveNotesToFile();
        res.send(`Note ${name} deleted succesfully!`);
    } catch (err) {
        console.log(`Error deleting note ${note.name}: `, err);
        res.status(404).send("Note not found!");
    }
});
/**
 * @swagger
 * /UploadForm.html:
 *   get:
 *     summary: Get HTML-code for UploadForm
 *     description: Returns HTML-code of Uploading Form.
 *     responses:
 *       200:
 *         description: Form
 *         content:
 *           application/json:
 *             schema:
 *               type: array    
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   text:
 *                     type: string
 */
app.get("/UploadForm.html", (req, res) => {
    res.status(200).sendFile(path.join(__dirname, "UploadForm.html"));

})