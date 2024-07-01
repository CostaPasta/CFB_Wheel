import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeamWeights.css';

function TeamWeights() {
  const [teams, setTeams] = useState([]);
  const [originalTeams, setOriginalTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showWeights, setShowWeights] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/teams')
      .then(response => {
        setTeams(response.data);
        setOriginalTeams(response.data);
      })
      .catch(error => console.error('Error fetching teams', error));
  }, []);

  const handleWeightChange = (teamId, newWeight) => {
    console.log(`Changing weight for team ID ${teamId} to ${newWeight}`);
    setTeams(prevTeams => 
      prevTeams.map(team => 
        team.id === teamId ? { ...team, stars: newWeight } : team
      )
    );
    axios.post('http://localhost:5000/update_weight', { teamId, newWeight })
      .then(response => {
        console.log('Weight update response:', response.data);
      })
      .catch(error => console.error('Error updating weight', error));
  };

  const handleSpin = () => {
    axios.get('http://localhost:5000/spin')
      .then(response => {
        console.log('Spin response:', response.data);
        setSelectedTeam(response.data.team);
        console.log('Selected Team Logo URL:', response.data.team.logo);
      })
      .catch(error => console.error('Error spinning the wheel', error));
  };

  const toggleWeights = () => {
    setShowWeights(!showWeights);
  };

  const resetWeights = () => {
    setTeams(originalTeams);
    originalTeams.forEach(team => {
      axios.post('http://localhost:5000/update_weight', { teamId: team.id, newWeight: team.stars })
        .catch(error => console.error('Error resetting weight', error));
    });
  };

  return (
    <div className="container">
      <button onClick={toggleWeights}>
        {showWeights ? 'Hide' : 'Adjust'} Team Weights
      </button>
      {showWeights && (
        <div>
          <ul>
            {teams.map(team => (
              <li key={team.id}>
                {team.school} - {team.stars} stars
                <input 
                  type="number" 
                  value={team.stars} 
                  min="1" 
                  max="6" 
                  onChange={e => handleWeightChange(team.id, parseInt(e.target.value))} 
                />
              </li>
            ))}
          </ul>
          <button onClick={resetWeights}>Reset Weights</button>
        </div>
      )}
      <button onClick={handleSpin}>Spin the Wheel</button>
      {selectedTeam && (
        <div className="team-display">
          <h2>{selectedTeam.school}</h2>
          <p>{selectedTeam.nickname}</p>
          <p>{selectedTeam.conference}</p>
          <img src={selectedTeam.logo} alt={`${selectedTeam.school} logo`} />
        </div>
      )}
    </div>
  );
}

export default TeamWeights;
