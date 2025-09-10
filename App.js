import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, query, addDoc, getDocs } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = __firebase_config;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Handle authentication to get a userId
const getUserId = async () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, user => {
      if (user) {
        resolve(user.uid);
      } else {
        signInAnonymously(auth).then(cred => {
          resolve(cred.user.uid);
        }).catch(reject);
      }
    });
  });
};

// HOMEPAGE COMPONENT
function HomePage({ latestNews, liveStreamUrl }) {
  const shareText = "¡Mira la transmisión en vivo del torneo de fútbol! No te pierdas la acción.";
  const shareUrl = "https://torneodefutbol.app"; // Replace with the actual app URL

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-6">Inicio</h2>
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-blue-700">Transmisión en Vivo</h3>
        {liveStreamUrl ? (
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              className="w-full h-full rounded-lg"
              src={liveStreamUrl}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Live stream of the match"
            ></iframe>
          </div>
        ) : (
          <p className="text-center text-gray-500">Transmisión no disponible en este momento.</p>
        )}
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-blue-700">Última Información</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{latestNews || 'No hay noticias recientes.'}</p>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}%20${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors">
          <i className="fab fa-whatsapp"></i> Compartir en WhatsApp
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
          <i className="fab fa-facebook"></i> Compartir en Facebook
        </a>
      </div>
    </div>
  );
}

// FIXTURE PAGE COMPONENT
function FixturePage({ groups, knockoutStage }) {
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-6">Fixture</h2>
      
      {/* Group Stage */}
      <h3 className="text-2xl font-semibold text-blue-700 mb-4">Fase de Grupos</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-xl font-bold mb-4 text-center">{group.name}</h4>
            <ul className="space-y-4">
              {group.matches.map((match, matchIndex) => (
                <li key={matchIndex} className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between items-center text-gray-800">
                    <span className="font-semibold">{match.team1} vs {match.team2}</span>
                    <span className="font-bold text-lg">{match.score1} - {match.score2}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Knockout Stage */}
      <h3 className="text-2xl font-semibold text-blue-700 mb-4">Fase Eliminatoria</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {knockoutStage.map((stage, stageIndex) => (
          <div key={stageIndex} className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-xl font-bold mb-4 text-center">{stage.name}</h4>
            <ul className="space-y-4">
              {stage.matches.map((match, matchIndex) => (
                <li key={matchIndex} className="border-b border-gray-200 pb-2">
                  <div className="flex justify-between items-center text-gray-800">
                    <span className="font-semibold">{match.team1} vs {match.team2}</span>
                    <span className="font-bold text-lg">{match.score1} - {match.score2}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// STATS PAGE COMPONENT
function StatsPage({ topScorers, leastBeatenKeepers }) {
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-6">Estadísticas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Scorers Table */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">Goleadores</h3>
          <ul className="space-y-4">
            {topScorers.length > 0 ? (
              topScorers.map((player, index) => (
                <li key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-bold text-lg text-gray-800">{index + 1}. {player.name}</span>
                  <span className="text-xl font-semibold text-red-600">{player.goals} goles</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-center">No hay datos de goleadores aún.</p>
            )}
          </ul>
        </div>
        
        {/* Least Beaten Keepers */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">Valla Menos Vencida</h3>
          <ul className="space-y-4">
            {leastBeatenKeepers.length > 0 ? (
              leastBeatenKeepers.map((keeper, index) => (
                <li key={index} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-bold text-lg text-gray-800">{index + 1}. {keeper.name}</span>
                  <span className="text-xl font-semibold text-green-600">{keeper.goalsConceded} goles en contra</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-center">No hay datos de vallas aún.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// MEDIA GALLERY COMPONENT
function MediaPage() {
  const photos = [
    { url: 'https://images.unsplash.com/photo-1517466801968-3e421043325e?q=80&w=2940&auto=format&fit=crop', description: 'Celebración del equipo ganador' },
    { url: 'https://images.unsplash.com/photo-1510425330882-628d4e9d727b?q=80&w=2940&auto=format&fit=crop', description: 'Jugadores en el campo' },
    { url: 'https://images.unsplash.com/photo-1549480111-e25f82216a9a?q=80&w=2940&auto=format&fit=crop', description: 'Foto del equipo finalista' },
    { url: 'https://images.unsplash.com/photo-1506180327318-62d08a562470?q=80&w=2940&auto=format&fit=crop', description: 'Entrada de los equipos' },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-6">Fotos y Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo, index) => (
          <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src={photo.url} alt={photo.description} className="w-full h-48 object-cover transition-transform transform hover:scale-105" />
            <div className="p-4">
              <p className="text-gray-700 text-sm">{photo.description}</p>
              <div className="mt-4 flex justify-center space-x-2">
                <a href={`https://wa.me/?text=${encodeURIComponent(`Mira esta foto del torneo: ${photo.description}`)}%20${encodeURIComponent(photo.url)}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-600 transition-colors">
                  <i className="fab fa-whatsapp text-2xl"></i>
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(photo.url)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                  <i className="fab fa-facebook text-2xl"></i>
                </a>
                <a href={`https://www.instagram.com/?url=${encodeURIComponent(photo.url)}`} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600 transition-colors">
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// BETTING PAGE COMPONENT
function BettingPage({ groups, userId, userBets }) {
  const [selectedMatch, setSelectedMatch] = useState('');
  const [selectedWinner, setSelectedWinner] = useState('');
  const [message, setMessage] = useState('');
  const userBetsColRef = collection(db, `artifacts/${appId}/users/${userId}/bets`);

  const handleBetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMatch || !selectedWinner) {
      setMessage('Por favor, selecciona un partido y un ganador.');
      return;
    }

    // Find the selected match to get team names
    let matchDetails;
    groups.forEach(group => {
      const foundMatch = group.matches.find(match => match.team1 === selectedMatch.split(' vs ')[0] && match.team2 === selectedMatch.split(' vs ')[1]);
      if (foundMatch) {
        matchDetails = foundMatch;
      }
    });

    try {
      await addDoc(userBetsColRef, {
        match: selectedMatch,
        team1: matchDetails.team1,
        team2: matchDetails.team2,
        betOn: selectedWinner,
        timestamp: new Date(),
        userId: userId
      });
      setMessage('¡Apuesta realizada con éxito! Tu boleto ha sido guardado.');
      setSelectedMatch('');
      setSelectedWinner('');
    } catch (e) {
      console.error("Error adding document: ", e);
      setMessage('Ocurrió un error al realizar la apuesta.');
    }
  };

  const getTicketId = (timestamp) => {
    const date = new Date(timestamp);
    return `TICKET-${date.getTime()}`;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-800 mb-6">Apuestas Virtuales</h2>
      
      {/* Betting Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-semibold mb-4 text-blue-700">Realiza tu Apuesta</h3>
        <form onSubmit={handleBetSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Selecciona un Partido:</label>
            <select 
              className="w-full p-3 border rounded-lg"
              value={selectedMatch}
              onChange={(e) => {
                setSelectedMatch(e.target.value);
                setSelectedWinner('');
              }}
            >
              <option value="">-- Elige un partido --</option>
              {groups.flatMap(group => 
                group.matches.map((match, index) => 
                  <option key={`${group.name}-${index}`} value={`${match.team1} vs ${match.team2}`}>{match.team1} vs {match.team2}</option>
                )
              )}
            </select>
          </div>
          {selectedMatch && (
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Elige el Ganador:</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="winner"
                    value={selectedMatch.split(' vs ')[0]}
                    checked={selectedWinner === selectedMatch.split(' vs ')[0]}
                    onChange={(e) => setSelectedWinner(e.target.value)}
                    className="mr-2"
                  />
                  <span>{selectedMatch.split(' vs ')[0]}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="winner"
                    value={selectedMatch.split(' vs ')[1]}
                    checked={selectedWinner === selectedMatch.split(' vs ')[1]}
                    onChange={(e) => setSelectedWinner(e.target.value)}
                    className="mr-2"
                  />
                  <span>{selectedMatch.split(' vs ')[1]}</span>
                </label>
              </div>
            </div>
          )}
          <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-colors">
            Apostar 5 Puntos
          </button>
        </form>
        {message && (
          <div className="mt-4 p-4 text-center text-white bg-green-500 rounded-lg shadow-md">
            {message}
          </div>
        )}
      </div>

      {/* User's Bets */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-semibold mb-4 text-blue-700">Tus Boletos</h3>
        <ul className="space-y-4">
          {userBets.length > 0 ? (
            userBets.map((bet, index) => (
              <li key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-lg text-gray-800">Boleto: {getTicketId(bet.timestamp.toDate())}</span>
                  <span className="text-sm text-gray-500">{bet.timestamp.toDate().toLocaleString()}</span>
                </div>
                <p className="text-gray-700">Partido: <span className="font-semibold">{bet.match}</span></p>
                <p className="text-gray-700">Tu Predicción: <span className="font-bold text-blue-600">{bet.betOn}</span></p>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center">No has realizado ninguna apuesta aún.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

// ADMIN PANEL COMPONENT
function AdminPanel({ data, updateTournamentData, onLogout, allBets }) {
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fixtureData, setFixtureData] = useState(data.groups);
  const [statsData, setStatsData] = useState({ topScorers: data.topScorers, leastBeatenKeepers: data.leastBeatenKeepers });
  const [latestNews, setLatestNews] = useState(data.latestNews);
  const [liveStreamUrl, setLiveStreamUrl] = useState(data.liveStreamUrl);
  const [viewing, setViewing] = useState('main'); // 'main' or 'bets'

  const adminPassword = 'admin123'; // WARNING: Use a more secure password in production.

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsLoggedIn(true);
    } else {
      alert('Contraseña incorrecta.');
    }
  };

  const handleUpdate = () => {
    const newData = {
      ...data,
      groups: fixtureData,
      topScorers: statsData.topScorers,
      leastBeatenKeepers: statsData.leastBeatenKeepers,
      latestNews,
      liveStreamUrl
    };
    updateTournamentData(newData);
    alert('Información actualizada con éxito.');
  };

  if (!isLoggedIn) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen flex justify-center items-center">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
          <h2 className="text-2xl font-bold text-center mb-6">Acceso de Administrador</h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg"
            />
            <button type="submit" className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-colors">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-800">Panel de Administrador</h2>
        <button onClick={() => { setIsLoggedIn(false); onLogout(); }} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
          Cerrar Sesión
        </button>
      </div>
      
      <div className="flex space-x-4 mb-8">
        <button 
          onClick={() => setViewing('main')} 
          className={`py-2 px-4 rounded-lg font-bold transition-colors ${viewing === 'main' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
        >
          Administrar Contenido
        </button>
        <button 
          onClick={() => setViewing('bets')} 
          className={`py-2 px-4 rounded-lg font-bold transition-colors ${viewing === 'bets' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
        >
          Ver Apuestas
        </button>
      </div>

      {viewing === 'main' && (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-blue-700">Actualizar Fixture y Resultados</h3>
            {fixtureData.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                <h4 className="text-xl font-bold mb-2">{group.name}</h4>
                {group.matches.map((match, matchIndex) => (
                  <div key={matchIndex} className="flex items-center space-x-4 mb-2">
                    <span className="w-32 font-semibold text-gray-700">{match.team1} vs {match.team2}</span>
                    <input
                      type="number"
                      value={fixtureData[groupIndex].matches[matchIndex].score1}
                      onChange={(e) => {
                        const newFixture = [...fixtureData];
                        newFixture[groupIndex].matches[matchIndex].score1 = e.target.value;
                        setFixtureData(newFixture);
                      }}
                      className="w-16 p-2 border rounded-lg text-center"
                    />
                    <span className="font-bold">-</span>
                    <input
                      type="number"
                      value={fixtureData[groupIndex].matches[matchIndex].score2}
                      onChange={(e) => {
                        const newFixture = [...fixtureData];
                        newFixture[groupIndex].matches[matchIndex].score2 = e.target.value;
                        setFixtureData(newFixture);
                      }}
                      className="w-16 p-2 border rounded-lg text-center"
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-blue-700">Actualizar Goleadores y Vallas</h3>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Goleadores (Formato: nombre,goles;)</label>
              <textarea
                className="w-full p-2 border rounded-lg h-24"
                value={statsData.topScorers.map(p => `${p.name},${p.goals}`).join(';')}
                onChange={(e) => {
                  const newStats = e.target.value.split(';').map(s => {
                    const parts = s.split(',');
                    return { name: parts[0].trim(), goals: parseInt(parts[1]) || 0 };
                  });
                  setStatsData({ ...statsData, topScorers: newStats });
                }}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-2">Valla Menos Vencida (Formato: nombre,goles_en_contra;)</label>
              <textarea
                className="w-full p-2 border rounded-lg h-24"
                value={statsData.leastBeatenKeepers.map(p => `${p.name},${p.goalsConceded}`).join(';')}
                onChange={(e) => {
                  const newStats = e.target.value.split(';').map(s => {
                    const parts = s.split(',');
                    return { name: parts[0].trim(), goalsConceded: parseInt(parts[1]) || 0 };
                  });
                  setStatsData({ ...statsData, leastBeatenKeepers: newStats });
                }}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-blue-700">Actualizar Noticias y Transmisión</h3>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Última Noticia</label>
              <textarea
                className="w-full p-2 border rounded-lg h-24"
                value={latestNews}
                onChange={(e) => setLatestNews(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">URL de Transmisión en Vivo (iframe)</label>
              <input
                type="text"
                className="w-full p-2 border rounded-lg"
                value={liveStreamUrl}
                onChange={(e) => setLiveStreamUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={handleUpdate} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
              Guardar Cambios
            </button>
          </div>
        </>
      )}

      {viewing === 'bets' && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">Apuestas de Usuarios</h3>
          <ul className="space-y-4">
            {allBets.length > 0 ? (
              allBets.map((bet, index) => (
                <li key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-semibold text-sm text-gray-600">ID de Usuario: {bet.userId}</p>
                  <p className="font-bold text-lg text-gray-800">Partido: {bet.match}</p>
                  <p className="text-green-600 font-semibold">Apuesta por: {bet.betOn}</p>
                  <p className="text-sm text-gray-500">Fecha: {bet.timestamp.toDate().toLocaleString()}</p>
                </li>
              ))
            ) : (
              <p className="text-gray-500 text-center">No se han realizado apuestas aún.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

// MAIN APP COMPONENT
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [tournamentData, setTournamentData] = useState({
    groups: [
      { name: 'Grupo A', matches: [{ team1: 'Equipo A1', team2: 'Equipo A2', score1: 0, score2: 0 }, { team1: 'Equipo A3', team2: 'Equipo A4', score1: 0, score2: 0 }] },
      { name: 'Grupo B', matches: [{ team1: 'Equipo B1', team2: 'Equipo B2', score1: 0, score2: 0 }, { team1: 'Equipo B3', team2: 'Equipo B4', score1: 0, score2: 0 }] },
      { name: 'Grupo C', matches: [{ team1: 'Equipo C1', team2: 'Equipo C2', score1: 0, score2: 0 }, { team1: 'Equipo C3', team2: 'Equipo C4', score1: 0, score2: 0 }] },
      { name: 'Grupo D', matches: [{ team1: 'Equipo D1', team2: 'Equipo D2', score1: 0, score2: 0 }, { team1: 'Equipo D3', team2: 'Equipo D4', score1: 0, score2: 0 }] },
    ],
    knockoutStage: [
      { name: 'Cuartos de Final', matches: [{ team1: 'TBD', team2: 'TBD', score1: 0, score2: 0 }, { team1: 'TBD', team2: 'TBD', score1: 0, score2: 0 }, { team1: 'TBD', team2: 'TBD', score1: 0, score2: 0 }, { team1: 'TBD', team2: 'TBD', score1: 0, score2: 0 }] },
      { name: 'Semifinal', matches: [{ team1: 'TBD', team2: 'TBD', score1: 0, score2: 0 }, { team1: 'TBD', team2: 'TBD', score1: 0, score2: 0 }] },
      { name: 'Final', matches: [{ team1: 'TBD', team2: 'TBD', score1: 0, score2: 0 }] },
      { name: 'Tercer Puesto', matches: [{ team1: 'TBD', team2: 'TBD', score1: 0, score2: 0 }] },
    ],
    topScorers: [],
    leastBeatenKeepers: [],
    latestNews: 'Bienvenidos al Torneo de Fútbol. ¡Mucha suerte a todos los equipos!',
    liveStreamUrl: '',
  });
  const [userBets, setUserBets] = useState([]);
  const [allBets, setAllBets] = useState([]);

  // Firestore Document and Collection references
  const tournamentDocRef = doc(db, 'torneos', 'torneo-fixture');
  const allBetsColRef = collection(db, `artifacts/${appId}/public/data/bets`);

  // Effect to initialize authentication and load data
  useEffect(() => {
    const initialize = async () => {
      try {
        const uid = await getUserId();
        setUserId(uid);

        // Subscribe to tournament data
        const unsubscribeTournament = onSnapshot(tournamentDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setTournamentData(docSnap.data());
          } else {
            setDoc(tournamentDocRef, tournamentData);
          }
        }, (error) => {
          console.error("Error fetching tournament data:", error);
        });

        // Subscribe to current user's bets
        const userBetsColRef = collection(db, `artifacts/${appId}/users/${uid}/bets`);
        const unsubscribeUserBets = onSnapshot(userBetsColRef, (querySnapshot) => {
          const bets = [];
          querySnapshot.forEach(doc => {
            bets.push({ id: doc.id, ...doc.data() });
          });
          setUserBets(bets.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()));
        }, (error) => {
          console.error("Error fetching user's bets:", error);
        });

        // Subscribe for admin to view all bets
        const unsubscribeAllBets = onSnapshot(allBetsColRef, (querySnapshot) => {
          const allBetsList = [];
          querySnapshot.forEach(doc => {
            allBetsList.push({ id: doc.id, ...doc.data() });
          });
          setAllBets(allBetsList.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate()));
        }, (error) => {
          console.error("Error fetching all bets:", error);
        });

        setLoading(false);

        // Clean up subscriptions
        return () => {
          unsubscribeTournament();
          unsubscribeUserBets();
          unsubscribeAllBets();
        };

      } catch (error) {
        console.error("Error initializing the app:", error);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const updateTournamentData = async (newData) => {
    try {
      await setDoc(tournamentDocRef, newData);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage latestNews={tournamentData.latestNews} liveStreamUrl={tournamentData.liveStreamUrl} />;
      case 'fixture':
        return <FixturePage groups={tournamentData.groups} knockoutStage={tournamentData.knockoutStage} />;
      case 'stats':
        return <StatsPage topScorers={tournamentData.topScorers} leastBeatenKeepers={tournamentData.leastBeatenKeepers} />;
      case 'media':
        return <MediaPage />;
      case 'bets':
        return <BettingPage groups={tournamentData.groups} userId={userId} userBets={userBets} />;
      case 'admin':
        return <AdminPanel data={tournamentData} updateTournamentData={updateTournamentData} onLogout={() => setCurrentPage('home')} allBets={allBets} />;
      default:
        return <HomePage />;
    }
  };

  if (loading || !userId) {
    return <div className="flex justify-center items-center h-screen text-xl font-bold">Cargando...</div>;
  }

  return (
    <div className="bg-gray-200 min-h-screen">
      {/* Header and Navigation */}
      <nav className="bg-blue-800 text-white p-4 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0">Torneo de Fútbol</h1>
          <div className="flex flex-wrap justify-center space-x-2 md:space-x-4">
            <button onClick={() => setCurrentPage('home')} className={`py-2 px-4 rounded-full font-bold transition-colors ${currentPage === 'home' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>Inicio</button>
            <button onClick={() => setCurrentPage('fixture')} className={`py-2 px-4 rounded-full font-bold transition-colors ${currentPage === 'fixture' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>Fixture</button>
            <button onClick={() => setCurrentPage('stats')} className={`py-2 px-4 rounded-full font-bold transition-colors ${currentPage === 'stats' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>Goleadores y Vallas</button>
            <button onClick={() => setCurrentPage('media')} className={`py-2 px-4 rounded-full font-bold transition-colors ${currentPage === 'media' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>Fotos y Videos</button>
            <button onClick={() => setCurrentPage('bets')} className={`py-2 px-4 rounded-full font-bold transition-colors ${currentPage === 'bets' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>Apuestas</button>
            <button onClick={() => setCurrentPage('admin')} className={`py-2 px-4 rounded-full font-bold transition-colors bg-green-500 hover:bg-green-600`}>Admin</button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="container mx-auto py-8">
        {renderPage()}
      </main>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
