import Database from 'better-sqlite3';
import express from 'express';
import bodyParser from 'body-parser';


const PORT = 3000;


function initializeSchema(db) {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS User (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
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
    `).run({ name });

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
    `).run({ deckId: BigInt(deckId), front, back });
    return result.lastInsertRowid;
}

function getCardsInDeck(db, deckId) {
    const result = db.prepare(`
        SELECT c.id, c.front, c.back
        FROM Card c
        WHERE c.deck = @deckId;
    `).all({ deckId: BigInt(deckId) });
    return result;
}

function createUser(db, username, credentialHash) {
    const inserter = db.prepare(`
        INSERT INTO User (username, credentialHash) VALUES (@username, @credentialHash);
    `);

    let userid;
    
    try {
        const result = inserter.run({ username, credentialHash });
        userid = result.lastInsertRowid;
    } catch {
        userid = null;
    }

    return userid;
}

function validateUser(db, username, credentialHash) {
    const result = db.prepare(`
        SELECT u.id
        FROM User u
        WHERE u.username = @username
        AND u.credentialHash = @credentialHash;
    `).all({ username, credentialHash });
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
            response.json({ status: 'failure', error: 'Decks require a name.' });
            return;
        }

        let deckId = createDeck(db, name);
        response.status(200);
        response.json({ status: 'success', deckId });
    });

    app.get('/api/decks', (request, response) => {
        let decks = getDecks(db);
        response.status(200);
        response.json({ status: 'success', decks });
    });

    app.get('/api/decks/:deckId/cards', (request, response) => {
        const { deckId } = request.params;

        let cards = getCardsInDeck(db, deckId);
        response.status(200);
        response.json({ status: 'success', cards });
    });

    app.post('/api/decks/:deckId/cards', (request, response) => {
        const { front, back } = request.body;
        let { deckId } = request.params;

        deckId = parseInt(deckId);

        console.log([deckId, front, back]);

        if ([front, back].includes(undefined) || deckId === NaN) {
            response.status(400);
            response.json({ status: 'failure', error: 'Card requires a deckId, front, and back.' });
            return;
        }

        let cardId = createCard(db, deckId, front, back);
        response.status(200);
        response.json({ status: 'success', cardId });
    });

    app.post('/api/users', (request, response) => {
        const { action, username, credentialHash } = request.body;

        if ([action, username, credentialHash].includes(undefined)) {
            response.status(400);
            response.json({ status: 'failure', error: 'Must specify action, username, credentialHash.' });
            return;
        }

        if (action === 'create') {
            const userid = createUser(db, username, credentialHash);
            response.status(200);
            response.json((userid === null)? { status: 'failure', error: 'username is already taken' } : { status: 'success' });
            return;
        }
        
        if (action === 'validate') {
            const [ userid ] = validateUser(db, username, credentialHash);
            response.status(200);
            response.json({ status: (userid === undefined)? 'failure' : 'success', username: username});
            return;
        }

        response.status(400);
        response.json({ status: 'failure', error: 'action must be one of create or validate' });
        return;
    });

    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

main();
