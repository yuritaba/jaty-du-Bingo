import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState({});
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [teamInfo, setTeamInfo] = useState({});


  const teamIds = ['13', '418', '131', '281', '985', '631', '31', '11', '148', '506', '5', '46', '12', '113', '583', '244', '1041', '162', '16', '27'];
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
    '12': 'Roma',
    '113': 'Napoli',
    '46': 'Inter',
    '583': 'PSG',
    '244': 'Marseille',
    '1041': 'Lyon',
    '162': 'Monaco',
    '16': 'Borussia Dortmund',
    '27': 'Bayern Munich'
  };

  useEffect(() => {
    if (!isDataFetched) {
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      
      async function fetchTeamImages() {
        const images = {};
        for (const teamId of teamIds) {
          try {
            await sleep(1000); // Delay de 1000 milissegundos (1 segundo) entre cada requisição
            const response = await axios({
              method: 'GET',
              url: 'https://transfermarket.p.rapidapi.com/clubs/get-header-info',
              params: { id: teamId, domain: 'de' },
              headers: {
                'X-RapidAPI-Key': '59d01fd325msh0cbeb1c495b6688p16dba7jsnfb27e9b142f7',
                'X-RapidAPI-Host': 'transfermarket.p.rapidapi.com'
              }
            });
            if (response.data && response.data.club && response.data.club.image) {
              images[teamId] = response.data.club.image; // Store the image using teamId as key
            }
          } catch (error) {
            console.error(`Error fetching team image for ${teamId}:`, error);
          }
        }
        setTeamInfo(images);
      }
      
  
      async function fetchPlayers() {
        const fetchedPlayers = [];
        for (let i = 0; i < 5; i++) { // define quantos jogadores serao colocados na lista.
          const randomTeamId = teamIds[Math.floor(Math.random() * teamIds.length)];
          try {
            const response = await axios({
              method: 'GET',
              url: 'https://transfermarket.p.rapidapi.com/clubs/get-squad',
              params: { id: randomTeamId, domain: 'de' },
              headers: {
                'X-RapidAPI-Key': '59d01fd325msh0cbeb1c495b6688p16dba7jsnfb27e9b142f7',
                'X-RapidAPI-Host': 'transfermarket.p.rapidapi.com'
              }
            });
            if (response.status === 200 && response.data.squad.length > 0) {
              const randomIndex = Math.floor(Math.random() * response.data.squad.length);
              fetchedPlayers.push({
                ...response.data.squad[randomIndex],
                teamId: randomTeamId
              });
            }
          } catch (error) {
            console.error(`Error fetching players:`, error);
          }
        }
        console.log("Lista de jogadores:", fetchedPlayers);
        setPlayers(fetchedPlayers);
        setIsDataFetched(true);
      }
    
      fetchPlayers();
      fetchTeamImages();

    }
  }, [isDataFetched]); 

  const handleAttempt = (teamId) => {
    const isCorrect = players[currentIndex].teamId === teamId;
    setAttempts(prev => ({
      ...prev,
      [teamId]: isCorrect // Set the attempt for the teamId, not tied to the player index
    }));
    if (currentIndex < players.length - 1) {
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1);
      }, 1000); // Advance to next player after a delay
    }
  };

  if (players.length === 0) return <div>Loading...</div>;

  const currentPlayer = players[currentIndex];

  return (
    <div className="App">
      <h1>Football Bingo</h1>
      <div className="player-info">
        <img src={currentPlayer.image} alt={currentPlayer.name} />
        <h3>{currentPlayer.name}</h3>
      </div>
      <div className="team-buttons">
        {teamIds.map((teamId) => (
          <button
            key={teamId}
            disabled={attempts[teamId] !== undefined} // Disable button if any attempt was made
            className={attempts[teamId] !== undefined ? (attempts[teamId] ? 'correct' : 'incorrect') : ''}
            onClick={() => handleAttempt(teamId)}
          >
            <img src={teamInfo[teamId] || ''} alt={teamNames[teamId]} style={{ width: '30px', height: '30px' }} />
            {teamNames[teamId]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
