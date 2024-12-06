function Flashcard({ id, front, back }) {
    const [isFront, setIsFront] = React.useState(true);

    return (
        <div
            className="flashcard"
            key={id}
            onClick={() => setIsFront(!isFront)}
        >
            {isFront ? front : back}
        </div>
    );
}

function MainApp({ username, credentialHash }) {
    const [decks, setDecks] = React.useState([]);
    const [currentDeckId, setCurrentDeckId] = React.useState(null);
    const [cards, setCards] = React.useState([]);
    const [showDeckForm, setShowDeckForm] = React.useState(false);
    const [showFlashcardForm, setShowFlashcardForm] = React.useState(false);

    const [deckName, setDeckName] = React.useState("");
    const [cardFront, setCardFront] = React.useState("");
    const [cardBack, setCardBack] = React.useState("");

    React.useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        const response = await fetch("/api/decks", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${username} ${credentialHash}`,
            },
        });
        const data = await response.json();
        setDecks(data.decks);
    };

    const fetchCards = async (deckId) => {
        const response = await fetch(`/api/decks/${deckId}/cards`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${username} ${credentialHash}`,
            },
        });
        const data = await response.json();
        setCards(data.cards);
    };

    const handleDeckChange = (e) => {
        setCurrentDeckId(e.target.value);
        fetchCards(e.target.value);
    };

    const handleDeckFormSubmit = async (e) => {
        e.preventDefault();
        await fetch("/api/decks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${username} ${credentialHash}`,
            },
            body: JSON.stringify({
                name: deckName,
                auth: { username, credentialHash },
            }),
        });
        setDeckName("");
        setShowDeckForm(false);
        await fetchDecks();
    };

    const handleFlashcardFormSubmit = async (e) => {
        e.preventDefault();
        await fetch(`/api/decks/${currentDeckId}/cards`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${username} ${credentialHash}`,
            },
            body: JSON.stringify({
                front: cardFront,
                back: cardBack,
                auth: { username, credentialHash },
            }),
        });
        setCardFront("");
        setCardBack("");
        setShowFlashcardForm(false);
        await fetchCards(currentDeckId);
    };

    return (
        <>
            <h1>Flashcards</h1>
            <div className="container">
                <label htmlFor="decks">Deck:</label>
                <select
                    id="decks"
                    value={currentDeckId || "0"}
                    onChange={handleDeckChange}
                >
                    <option disabled value="0">Choose a deck.</option>
                    {decks.map((deck) => (
                        <option key={deck.id} value={deck.id}>
                            {deck.name}
                        </option>
                    ))}
                </select>
                <button onClick={() => setShowDeckForm(true)}>Add Deck</button>
                <button onClick={() => setShowFlashcardForm(true)}>
                    Add Card
                </button>
            </div>
            {cards.map((card) => (
                <Flashcard front={card.front} back={card.back} />
            ))}

            {showDeckForm && (
                <form onSubmit={handleDeckFormSubmit}>
                    <h2>Add Deck</h2>
                    <div>
                        <label htmlFor="deck-name">Deck Name:</label>
                        <input
                            id="deck-name"
                            value={deckName}
                            onChange={(e) => setDeckName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Save Deck</button>
                </form>
            )}
            {showFlashcardForm && (
                <form onSubmit={handleFlashcardFormSubmit}>
                    <h2>Add Flashcard</h2>
                    <div>
                        <label htmlFor="card-front">Front:</label>
                        <input
                            id="card-front"
                            value={cardFront}
                            onChange={(e) => setCardFront(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="card-back">Back:</label>
                        <input
                            id="card-back"
                            value={cardBack}
                            onChange={(e) => setCardBack(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Save Flashcard</button>
                </form>
            )}
        </>
    );
}

function App() {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [credentialHash, setCredentialHash] = React.useState("");

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const credentialHash = md5(`${username}${password}`); // username is the salt
        const response = await fetch(`/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${username} ${credentialHash}`,
            },
            body: JSON.stringify({
                action: "validate",
                username: username,
                credentialHash: credentialHash,
            }),
        });
        const data = await response.json();
        if (data.status === "success") {
            setCredentialHash(credentialHash);
        }
    };

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        const credentialHash = md5(`${username}${password}`); // username is the salt
        await fetch(`/api/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${username} ${credentialHash}`,
            },
            body: JSON.stringify({
                action: "create",
                username: username,
                credentialHash: credentialHash,
            }),
        });
        const data = await response.json();
        if (data.status === "success") {
            setCredentialHash(credentialHash);
        }
    };

    return (
        <div>
            <div className="header">
                <div className="current-user">
                    {credentialHash != "" ? username : "Not logged in"}
                </div>
                <div className="login-form">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button onClick={handleLoginSubmit}>Login</button>
                    <button onClick={handleCreateAccount}>
                        Create Account
                    </button>
                </div>
            </div>
            <main>
                {credentialHash == "" && <p>Please log in to view decks.</p>}
                {credentialHash && (
                    <MainApp
                        username={username}
                        credentialHash={credentialHash}
                    />
                )}
            </main>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App></App>);
