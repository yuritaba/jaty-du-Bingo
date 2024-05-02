import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attempts, setAttempts] = useState({});
  const [teamInfo, setTeamInfo] = useState({});
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [resultsShown, setResultsShown] = useState(false);

  const allTeamIds = ['13', '418', '131', '281', '985', '631', '31', '11', '148', '506', '5', '46', '12', '113', '583', '244', '1041', '162', '16', '27'];
  const teamNames = {
    '13': 'At. Madrid', '418': 'Real Madrid', '131': 'Barcelona', '281': 'Manchester City',
    '985': 'Manchester United', '631': 'Chelsea', '31': 'Liverpool', '11': 'Arsenal',
    '148': 'Tottenham', '506': 'Juventus', '5': 'Milan', '12': 'Roma',
    '113': 'Napoli', '46': 'Inter', '583': 'PSG', '244': 'Marseille',
    '1041': 'Lyon', '162': 'Monaco', '16': 'Borussia Dortmund', '27': 'Bayern Munich'
  };
  const allSeleIds = ['3439', '3377', '3299', '3437', '3300', '3816', '3449', '3376', '3556'];
  const seleNames = {'3439': 'Brasil', '3377': 'França', '3299': 'Inglaterra', '3437': 'Argentina', '3300': 'Portugal', '3816': 'Colombia', '3449': 'Uruguai', '3376': 'Italia', '3556': 'Croacia'};

  // Definição da função sleep
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Definição da função getRandomElements
  function getRandomElements(arr, numElements) {
    if (arr.length < numElements) {
        return "A lista contém menos de " + numElements + " elementos.";
    }
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numElements);
  }

  // Embaralja os elementos da lista
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Troca elementos
    }
    return array;
  }
  

  useEffect(() => {
    const selectedTeamIds = getRandomElements(allTeamIds, 10);
    const selectedSeleIds = getRandomElements(allSeleIds, 6);
    setSelectedTeamIds(selectedTeamIds.concat(selectedSeleIds));
  
    async function fetchTeamImages() {
      const images = {};
      for (const Id of selectedTeamIds.concat(selectedSeleIds)) {
        try {
          await sleep(100); // Delay para evitar muitos pedidos simultâneos
          const response = await axios({
            method: 'GET',
            url: 'https://transfermarket.p.rapidapi.com/clubs/get-header-info',
            params: { id: Id, domain: 'de' },
            headers: {
              'X-RapidAPI-Key': 'dbdd1d09a4mshf3f47123a34ce0bp1fd8d3jsnb9806488c8d7',
              'X-RapidAPI-Host': 'transfermarket.p.rapidapi.com'
            }
          });
          if (response.data && response.data.club && response.data.club.image) {
            images[Id] = response.data.club.image;
          }
        } catch (error) {
          console.error(`Error fetching team image for ${Id}:`, error);
        }
      }
      setTeamInfo(images);
    }
  
    async function fetchPlayers() {
      const fetchedPlayers = [];
      // Busca 2 jogadores de cada time/seleção
      for (const teamId of selectedTeamIds.concat(selectedSeleIds)) {
        try {
          await sleep(10); // Delay para evitar muitos pedidos simultâneos
          const response = await axios({
            method: 'GET',
            url: 'https://transfermarket.p.rapidapi.com/clubs/get-squad',
            params: { id: teamId, domain: 'de' },
            headers: {
              'X-RapidAPI-Key': 'dbdd1d09a4mshf3f47123a34ce0bp1fd8d3jsnb9806488c8d7',
              'X-RapidAPI-Host': 'transfermarket.p.rapidapi.com'
            }
          });
          if (response.status === 200 && response.data.squad.length > 1) {
            const indexes = getRandomElements([...Array(response.data.squad.length).keys()], 2);
            indexes.forEach(index => {
              fetchedPlayers.push({
                ...response.data.squad[index],
                teamId: teamId
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching players from team ${teamId}:`, error);
        }
      }
      console.log("Lista de jogadores:", fetchedPlayers);
      setPlayers(shuffleArray(fetchedPlayers));
    }
  
    fetchPlayers();
    fetchTeamImages();
  
  }, []);
  
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
      <h1>ACABOU RESULTADO: {correctCount}/16</h1>
    </div>;
  }

  if (players.length === 0) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div className="App">
      <h1>Football Bingo</h1>
      <div className="player-info">
        <img src={players[currentIndex]?.image} alt={players[currentIndex]?.name} />
        <h3>{players[currentIndex]?.name}</h3>
        <button 
          onClick={handleSkip} 
          style={{
            fontFamily: 'Bebas Neue, sans-serif', 
            height: '30px', // Definindo a altura do botão
            padding: '5px 10px', // Ajuste o padding para melhor encaixe do texto, se necessário
            fontSize: '16px' // Ajuste o tamanho da fonte, se necessário
          }}
        >
          Skip
        </button>        
        <p>Jogadores restantes: {players.length - currentIndex - 1}</p>
      </div>
      <div className="team-buttons">
        {selectedTeamIds.map((teamId) => (
          <button
            key={teamId}
            disabled={attempts[teamId] !== undefined}
            className={attempts[teamId] !== undefined ? (attempts[teamId] ? 'correct' : 'incorrect') : ''}
            onClick={() => handleAttempt(teamId)}
            style={{
              backgroundImage: `url(${teamInfo[teamId] || ''})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              padding: '20px',
              height: '100px',
              width: '100px',
              border: '2px solid #fff',
              borderRadius: '10px'
            }}
            />
        ))}
      </div>
    </div>
  );
}

export default App;