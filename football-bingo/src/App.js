import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

//at. madri 13
//real madrid 418
//barcelona 131
//manchester city 281
//manchester united 985
//chelsea 631
//liverpool 31
//arsenal 11
//tottenham 148
//juventus 506
//milan 5
//inter 46
//roma 12
//napoli 113
//lazio 46
//psg 583
//marseille 244
//lyon 1041
//monaco 162
//borussia dortmund 16
//bayern munich 27
//leverkusen
//leipzig
 
function App() {
  const [players, setPlayers] = useState([]);

  const teamIds = [ '13', '418', '131', '281', '985', '631', '31', '11', '148', '506', '5', '46', '12', '113', '46', '583', '244', '1041', '162', '16', '27' ]; // Defina os IDs dos times conforme necessário

  useEffect(() => {
    async function fetchPlayers() {
      let fetchedPlayers = [];
      const promises = teamIds.map(teamId => {
        return axios({
          method: 'GET',
          url: 'https://transfermarket.p.rapidapi.com/clubs/get-squad',
          params: { id: teamId, domain: 'de' },
          headers: {
            'X-RapidAPI-Key': 'db12a99c6emshc24ad16c77e801bp106006jsn1a05386ecb20',
            'X-RapidAPI-Host': 'transfermarket.p.rapidapi.com'
          }
        }).then(response => {
          const squad = response.data.squad;
          return squad;
        }).catch(error => {
          console.error(`Erro ao buscar jogadores do time ${teamId}:`, error);
        });
      });

      Promise.all(promises).then(results => {
        results.forEach(squad => {
          if (squad && squad.length > 0) {
            // Embaralha e pega um jogador aleatório de cada time
            const randomPlayer = squad[Math.floor(Math.random() * squad.length)];
            fetchedPlayers.push(randomPlayer);
          }
        });
        // Limita o array a 10 jogadores, se houver mais
        fetchedPlayers = fetchedPlayers.slice(0, 10);
        setPlayers(fetchedPlayers);
      });
    }

    fetchPlayers();
  }, []);

  return (
    <div className="App">
      <h1>Jogadores Aleatórios</h1>
      <ul>
        {players.map((player, index) => (
          <li key={index} className="player-item">
            <h3>{player.name}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
