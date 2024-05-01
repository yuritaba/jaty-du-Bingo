import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [players, setPlayers] = useState([]);
  const [attempts, setAttempts] = useState({}); // Armazena as tentativas e seus resultados

  const teamIds = ['13', '418', '131', '281', '985', '631', '31', '11', '148', '506', '5', '46', '12', '113', '46', '583', '244', '1041', '162', '16', '27'];
  const teamNames = {
    '13': 'At. Madrid',
    '418': 'Real Madrid',
    '131': 'Barcelona',
    '281': 'Manchester City',
    '985': 'Manchester United',
    '631': 'Chelsea',
    '31': 'Liverpool',
    '11': 'Arsenal',
    '148': 'Tottenham',
    '506': 'Juventus',
    '5': 'Milan',
    '46': 'Inter',
    '12': 'Roma',
    '113': 'Napoli',
    '46': 'Lazio',
    '583': 'PSG',
    '244': 'Marseille',
    '1041': 'Lyon',
    '162': 'Monaco',
    '16': 'Borussia Dortmund',
    '27': 'Bayern Munich'
  };

  useEffect(() => {
    async function fetchPlayers() {
      const promises = teamIds.map(teamId => axios({
        method: 'GET',
        url: 'https://transfermarket.p.rapidapi.com/clubs/get-squad',
        params: { id: teamId, domain: 'de' },
        headers: {
          'X-RapidAPI-Key': '59d01fd325msh0cbeb1c495b6688p16dba7jsnfb27e9b142f7',
          'X-RapidAPI-Host': 'transfermarket.p.rapidapi.com'
        }
      }).then(response => {
        const squad = response.data.squad.map(player => ({
          ...player,
          teamId
        }));
        return squad;
      }).catch(error => {
        console.error(`Erro ao buscar jogadores do time ${teamId}:`, error);
      }));

      Promise.all(promises).then(results => {
        let fetchedPlayers = [];
        results.forEach(squad => {
          if (squad) {
            const randomPlayer = squad[Math.floor(Math.random() * squad.length)];
            fetchedPlayers.push(randomPlayer);
          }
        });
        fetchedPlayers = fetchedPlayers.slice(0, 2); // Limita a 2 jogadores
        setPlayers(fetchedPlayers);
      });
    }

    fetchPlayers();
  }, []);

  const handleAttempt = (playerId, teamId) => {
    const isCorrect = players[currentPlayerIndex].teamId === teamId;
    setAttempts(prev => ({ ...prev, [playerId]: isCorrect }));
    if (isCorrect && currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    }
  };

  const currentPlayer = players[currentPlayerIndex];

  if (players.length === 0) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Football Bingo</h1>
      <ul>
        <li key={currentPlayer.id} className={`player-item ${attempts[currentPlayer.id] ? 'correct' : 'incorrect'}`}>
          <div className="player-info">
            <img src={currentPlayer.image} alt={currentPlayer.name} />
            <h3>{currentPlayer.name}</h3>
          </div>
          <div className="team-buttons">
            {teamIds.map((teamId) => (
              <button
                key={teamId}
                disabled={attempts[currentPlayer.id] !== undefined}
                className={attempts[currentPlayer.id] === true ? 'correct' : 'incorrect'}
                onClick={() => handleAttempt(currentPlayer.id, teamId)}
              >
                {teamNames[teamId]}
              </button>
            ))}
          </div>
        </li>
      </ul>
    </div>
  );
}

export default App;
