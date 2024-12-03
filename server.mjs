import Database from 'better-sqlite3';
import express from 'express';

const PORT = 3000;


function initializeSchema(db) {
    db.prepare(
        `CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY,
            username TEXT,
            credentialHash TEXT
        );`
    ).run();
    db.prepare(
        `CREATE TABLE IF NOT EXISTS Deck (
            id INTEGER PRIMARY KEY,
            name TEXT
        );`
    ).run();
    db.prepare(
        `CREATE TABLE IF NOT EXISTS Card (
            id INTEGER PRIMARY KEY,
            front TEXT, back TEXT,
            deck INTEGER,
            FOREIGN KEY(deck) REFERENCES Deck(id)
        );`
    ).run();
}

app.get('/api/decks', (req, res) => {
    const decks = db.prepare('SELECT id, name FROM Deck').all();
    res.json(decks);
});

app.get('/api/decks/:deckId/cards', (req, res) => {
    const { deckId } = req.params;
    const cards = db.prepare('SELECT id, front, back FROM Card WHERE deck = ?').all(deckId);
    res.json(cards);
});
//new deck
app.post('/api/decks', express.json(), (req, res) => { 
    const { name } = req.body;
    const result = db.prepare('INSERT INTO Deck (name) VALUES (?)').run(name);
    res.json({ id: result.lastInsertRowid });
});
//new flashcards
app.post('/api/decks/:deckId/cards', express.json(), (req, res) => {
    const { deckId } = req.params;
    const { front, back } = req.body;
    const result = db.prepare('INSERT INTO Card (front, back, deck) VALUES (?, ?, ?)').run(front, back, deckId);
    res.json({ id: result.lastInsertRowid });
});


function main() {
    let db = new Database('flashcards.db', {});
    db.pragma('journal_mode = WAL') // No clue what this does but the [README](https://www.npmjs.com/package/better-sqlite3) says it's recommended for performance

    initializeSchema(db);

    let app = express();

    app.get('/', (request, response) => {
        response.sendFile('static/index.html', { root: '.' });
    });

    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

main();
