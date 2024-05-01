import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState({});
  const [teamInfo, setTeamInfo] = useState({});
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [resultsShown, setResultsShown] = useState(false);

  const teamIds = ['13', '418', '131', '281', '985', '631', '31', '11', '148', '506', '5', '46', '12', '113', '583', '244', '1041', '162', '16', '27'];
  const teamNames = {
    '13': 'At. Madrid', '418': 'Real Madrid', '131': 'Barcelona', '281': 'Manchester City',
    '985': 'Manchester United', '631': 'Chelsea', '31': 'Liverpool', '11': 'Arsenal',
    '148': 'Tottenham', '506': 'Juventus', '5': 'Milan', '12': 'Roma',
    '113': 'Napoli', '46': 'Inter', '583': 'PSG', '244': 'Marseille',
    '1041': 'Lyon', '162': 'Monaco', '16': 'Borussia Dortmund', '27': 'Bayern Munich'
  };

  // Definição da função sleep
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    if (!isDataFetched) {
      const shuffledTeams = teamIds.sort(() => 0.5 - Math.random()).slice(0, 16);
      setSelectedTeamIds(shuffledTeams);

      async function fetchTeamImages() {
        const images = {};
        for (const teamId of shuffledTeams) {
          try {
            await sleep(1000); // Usando a função sleep definida acima
            const response = await axios({
              method: 'GET',
              url: 'https://transfermarket.p.rapidapi.com/clubs/get-header-info',
              params: { id: teamId, domain: 'de' },
              headers: {
                'X-RapidAPI-Key': '15cfe02b82msh84be3d25168c166p145b20jsn87329f715d09',
                'X-RapidAPI-Host': 'transfermarket.p.rapidapi.com'
              }
            });
            if (response.data && response.data.club && response.data.club.image) {
              images[teamId] = response.data.club.image;
            }
          } catch (error) {
            console.error(`Error fetching team image for ${teamId}:`, error);
          }
        }
        setTeamInfo(images);
      }
      
  
      async function fetchPlayers() {
        const fetchedPlayers = [];
        for (let i = 0; i < 10; i++) {
          const randomTeamId = shuffledTeams[Math.floor(Math.random() * shuffledTeams.length)];
          try {
            const response = await axios({
              method: 'GET',
              url: 'https://transfermarket.p.rapidapi.com/clubs/get-squad',
              params: { id: randomTeamId, domain: 'de' },
              headers: {
                'X-RapidAPI-Key': '15cfe02b82msh84be3d25168c166p145b20jsn87329f715d09',
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
  }, [isDataFetched, teamIds]); 

  const handleAttempt = (teamId) => {
    const isCorrect = players[currentIndex].teamId === teamId;
    setAttempts(prev => ({
      ...prev,
      [teamId]: isCorrect
    }));
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setResultsShown(true);
    }
  };

  const handleSkip = () => {
    if (currentIndex < players.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setResultsShown(true);
    }
  };

  if (resultsShown) {
    const correctCount = Object.values(attempts).filter(val => val === true).length;
    return <div className="App">
      <h1>ACABOU RESULTADO: {correctCount}/{players.length}</h1>
    </div>;
  }

  if (players.length === 0) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Football Bingo</h1>
      <div className="player-info">
        <img src={players[currentIndex]?.image} alt={players[currentIndex]?.name} />
        <h3>{players[currentIndex]?.name}</h3>
        <button onClick={handleSkip}>Skip</button>
        <p>Jogadores restantes: {players.length - currentIndex - 1}</p>
      </div>
      <div className="team-buttons">
        {selectedTeamIds.map((teamId) => (
          <button
            key={teamId}
            disabled={attempts[teamId] !== undefined}
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