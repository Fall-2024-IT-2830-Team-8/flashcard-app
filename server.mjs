import Database from 'better-sqlite3';
import express from 'express';

const PORT = 3000;


function main() {
    let db = new Database('flashcards.db', {});
    db.pragma('journal_mode = WAL') // No clue what this does but the [README](https://www.npmjs.com/package/better-sqlite3) says it's recommended for performance

    let app = express();

    app.get('/', (request, response) => {
        response.sendFile('static/index.html', { root: '.' });
    });

    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

main();