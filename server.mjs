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