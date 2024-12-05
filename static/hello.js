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
  const fetchCards = async deckId => {
    const response = await fetch(`/api/decks/${deckId}/cards`);
    const data = await response.json();
    setCards(data.cards);
    setCurrentCardIndex(0);
  };
  const handleDeckChange = e => {
    setCurrentDeckId(e.target.value);
  };
  const handleCardClick = () => {
    setIsFront(!isFront);
  };
  const handleDeckFormSubmit = async e => {
    e.preventDefault();
    await fetch('/api/decks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: deckName
      })
    });
    setDeckName('');
    setShowDeckForm(false);
    fetchDecks();
  };
  const handleFlashcardFormSubmit = async e => {
    e.preventDefault();
    await fetch(`/api/decks/${currentDeckId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        front: cardFront,
        back: cardBack
      })
    });
    setCardFront('');
    setCardBack('');
    setShowFlashcardForm(false);
    fetchCards(currentDeckId);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", null, "Flashcards"), /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "decks"
  }, "Choose a Deck:"), /*#__PURE__*/React.createElement("select", {
    id: "decks",
    value: currentDeckId || '',
    onChange: handleDeckChange
  }, decks.map(deck => /*#__PURE__*/React.createElement("option", {
    key: deck.id,
    value: deck.id
  }, deck.name))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowDeckForm(true)
  }, "Add Deck")), cards.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "flashcard",
    onClick: handleCardClick
  }, isFront ? cards[currentCardIndex]?.front : cards[currentCardIndex]?.back), showDeckForm && /*#__PURE__*/React.createElement("form", {
    onSubmit: handleDeckFormSubmit
  }, /*#__PURE__*/React.createElement("h2", null, "Add Deck"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "deck-name"
  }, "Deck Name:"), /*#__PURE__*/React.createElement("input", {
    id: "deck-name",
    value: deckName,
    onChange: e => setDeckName(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit"
  }, "Save Deck")), showFlashcardForm && /*#__PURE__*/React.createElement("form", {
    onSubmit: handleFlashcardFormSubmit
  }, /*#__PURE__*/React.createElement("h2", null, "Add Flashcard"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "card-front"
  }, "Front:"), /*#__PURE__*/React.createElement("input", {
    id: "card-front",
    value: cardFront,
    onChange: e => setCardFront(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", {
    htmlFor: "card-back"
  }, "Back:"), /*#__PURE__*/React.createElement("input", {
    id: "card-back",
    value: cardBack,
    onChange: e => setCardBack(e.target.value),
    required: true
  })), /*#__PURE__*/React.createElement("button", {
    type: "submit"
  }, "Save Flashcard")));
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));