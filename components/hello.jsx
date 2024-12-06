function App() {
  const [decks, setDecks] = React.useState([]);
  const [currentDeckId, setCurrentDeckId] = React.useState(null);
  const [cards, setCards] = React.useState([]);
  const [currentCardIndex, setCurrentCardIndex] = React.useState(0);
  const [isFront, setIsFront] = React.useState(true);
  const [showDeckForm, setShowDeckForm] = React.useState(false);
  const [showFlashcardForm, setShowFlashcardForm] = React.useState(false);

  const [deckName, setDeckName] = React.useState('');
  const [cardFront, setCardFront] = React.useState('');
  const [cardBack, setCardBack] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    fetchDecks();
  }, []);

  React.useEffect(() => {
    if (currentDeckId) {
      fetchCards(currentDeckId);
    }
  }, [currentDeckId]);

  const fetchDecks = async () => {
    const response = await fetch('/api/decks');
    const data = await response.json();
    setDecks(data.decks);
    if (data.decks.length > 0) setCurrentDeckId(data.decks[0].id);
  };

  const fetchCards = async (deckId) => {
    const response = await fetch(`/api/decks/${deckId}/cards`);
    const data = await response.json();
    setCards(data.cards);
    setCurrentCardIndex(0);
    console.log(data.cards);
  };

  const handleDeckChange = (e) => {
    setCurrentDeckId(e.target.value);
  };

  const handleCardClick = () => {
    setIsFront(!isFront);
  };

  const handleDeckFormSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: deckName }),
    });
    setDeckName('');
    setShowDeckForm(false);
    fetchDecks();
  };

  const handleFlashcardFormSubmit = async (e) => {
    e.preventDefault();
    await fetch(`/api/decks/${currentDeckId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front: cardFront, back: cardBack }),
    });
    setCardFront('');
    setCardBack('');
    setShowFlashcardForm(false);
    fetchCards(currentDeckId);
    console.log('see if work');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const credentialHash = 'evil hash...';
    await fetch(`/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', username: username, credentialHash: credentialHash}),
    });
  }

  return (
    <div>
      <form onSubmit={handleLoginSubmit} className="header">
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
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <h1>Flashcards</h1>
      <div className="container">
        <label htmlFor="decks">Choose a Deck:</label>
        <select id="decks" value={currentDeckId || ''} onChange={handleDeckChange}>
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </select>
        <button onClick={() => setShowDeckForm(true)}>Add Deck</button>
        <button onClick={() => setShowFlashcardForm(true)}>Add Card</button>
      </div>
      {cards.length > 0 && (
        <div className="flashcard" onClick={handleCardClick}>
          {isFront ? cards[currentCardIndex]?.front : cards[currentCardIndex]?.back}
        </div>
      )}
      
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
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App></App>);
