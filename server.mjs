import Database from 'better-sqlite3';
import express from 'express';
import bodyParser from 'body-parser';


const PORT = 3000;


function initializeSchema(db) {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY,
            username TEXT,
            credentialHash TEXT
        );
    `).run();
    db.prepare(`
        CREATE TABLE IF NOT EXISTS Deck (
            id INTEGER PRIMARY KEY,
            name TEXT
        );
    `).run();
    db.prepare(`
        CREATE TABLE IF NOT EXISTS Card (
            id INTEGER PRIMARY KEY,
            front TEXT, back TEXT,
            deck INTEGER,
            FOREIGN KEY(deck) REFERENCES Deck(id)
        );
    `).run();
}

function createDeck(db, name) {
    const result = db.prepare(`
        INSERT INTO Deck (name) VALUES (@name);
    `).run({ name: name });

    return result.lastInsertRowid;
}

function getDecks(db) {
    const result = db.prepare(`
        SELECT d.id, d.name, COUNT(c.id) as cardCount
        FROM Deck d
        LEFT JOIN Card c
        on c.deck = d.id
        GROUP BY d.id;
    `).all();
    return result;
}

function createCard(db, deckId, front, back) {
    const result = db.prepare(`
        INSERT INTO Card (deck, front, back) VALUES (@deckId, @front, @back);
    `).run({ deckId: BigInt(deckId), front: front, back: back });
    return result.lastInsertRowid;
}

function getCardsInDeck(db, deckId) {
    const result = db.prepare(`
        SELECT c.id, c.front, c.back
        FROM Card c
        WHERE c.deck = @deckId;
    `).all({ deckId: deckId });
    return result;
}


function main() {
    let db = new Database('flashcards.db', { verbose: console.debug });
    db.pragma('journal_mode = WAL') // No clue what this does but the [README](https://www.npmjs.com/package/better-sqlite3) says it's recommended for performance

    initializeSchema(db);

    let app = express();
    app.use(bodyParser.json());

    app.get('/', (request, response) => {
        response.sendFile('static/index.html', { root: '.' });
    });

    app.use('/static', express.static('static'));

    app.post('/api/decks', (request, response) => {
        const { name } = request.body;

        if (name === undefined) {
            response.status(400);
            response.json({ 'status': 'failure', 'error': 'Decks require a name.' });
            return;
        }

        let deckId = createDeck(db, name);
        response.status(200);
        response.json({ 'status': 'success', 'deckId': deckId });
    });

    app.get('/api/decks', (request, response) => {
        let decks = getDecks(db);
        response.status(200);
        response.json({ 'status': 'success', 'decks': decks });
    });

    app.get('/api/decks/:deckId/cards', (request, response) => {
        const { deckId } = request.params;

        let cards = getCardsInDeck(db, deckId);
        response.status(200);
        response.json({ 'status': 'success', 'cards': cards });
    });

    app.post('/api/decks/:deckId/cards', (request, response) => {
        const { front, back } = request.body;
        let { deckId } = request.params;

        deckId = parseInt(deckId);

        console.log([deckId, front, back]);

        if ([front, back].includes(undefined) || deckId === NaN) {
            response.status(400);
            response.json({ 'status': 'failure', 'error': 'Card requires a deckId, front, and back.' });
            return;
        }

        let cardId = createCard(db, deckId, front, back);
        response.status(200);
        response.json({ 'status': 'success', 'cardId': cardId });
    });

    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

main();
