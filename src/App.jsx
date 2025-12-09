import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import { AuthProvider } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import GamePage from './pages/GamePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const libraries = ['places'];

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className='app app--centered'>
        <h1>Mapix</h1>
        <p>
          Adicione sua chave do Google Maps em um arquivo <code>.env</code> com:{' '}
          <code>VITE_GOOGLE_MAPS_API_KEY=</code>
        </p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Router>
        <LoadScript
          googleMapsApiKey={apiKey}
          libraries={libraries}
        >
          <div className='app'>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/game"
                element={
                  <ProtectedRoute>
                    <GamePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/game" replace />} />
            </Routes>
          </div>
        </LoadScript>
      </Router>
    </AuthProvider>
  );
}

export default App;
