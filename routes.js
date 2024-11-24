const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
router.use(express.json());
let notes = [];

// Функції для роботи з нотатками
function saveNotesToFile() {
    // Збереження нотаток у файл
}

function loadNotesFromFile() {
    // Завантаження нотаток з файлу
}

// Swagger документація для маршруту
/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes
 *     description: Returns a list of all notes.
 *     responses:
 *       200:
 *         description: A list of notes
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
router.get('/notes', (req, res) => {
    res.status(200).send(notes);
});

/**
 * @swagger
 * /notes/{name}:
 *   get:
 *     summary: Get a specific note
 *     description: Returns a note by its name.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: The name of the note to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The note text
 *       404:
 *         description: Note not found
 */
router.get('/notes/:name', (req, res) => {
    const note = notes.find(n => n.name === req.params.name);
    if (note) {
        res.status(200).send(note);
    } else {
        res.status(404).send({ message: 'Note not found' });
    }
});


/**
 * @swagger
 * /delete/{name}:
 *   delete:
 *     summary: Delete a note
 *     description: Deletes a note by its name.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: The name of the note to delete.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Note deleted
 *       404:
 *         description: Note not found
 */
router.delete('/delete/:name', (req, res) => {
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
 * /notes/{name}:
 *   put:
 *     summary: Update a note
 *     description: Updates a note by its name.
 *     parameters:
 *       - name: name
 *         in: path
 *         required: true
 *         description: The name of the note to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated
 *       404:
 *         description: Note not found
 */
router.put('/notes/:name', (req, res) => {
    const note = notes.find(n => n.name === req.params.name);
    if (note) {
        note.text = req.body.text;
        saveNotesToFile(); // Збереження нотаток у файл
        res.status(200).send(note);
    } else {
        res.status(404).send({ message: 'Note not found' });
    }
});

module.exports = router;