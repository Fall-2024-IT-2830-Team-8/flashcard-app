import React, { useState } from 'react';

const PORT = 3000;

const AddNotecard = ({ deckId }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  const submitCard = async (e) => {
    e.preventDefault();
    const response = await fetch(`/api/decks/${deckId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front, back }),
    });
    const result = await response.json();
    console.log('Notecard created:', result);
  };

  return (
    <form onSubmit={submitCard}>
      <input
        type="text"
        placeholder="Front"
        value={front}
        onChange={(e) => setFront(e.target.value)}
      />
      <input
        type="text"
        placeholder="Back"
        value={back}
        onChange={(e) => setBack(e.target.value)}
      />
      <button type="submit">Add Notecard</button>
    </form>
  );
};

export default AddNotecard;
