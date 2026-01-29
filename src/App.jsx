import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { LoadScript } from '@react-google-maps/api';
import { AuthProvider } from './hooks/useAuth';
import { LanguageProvider, useTranslation } from './hooks/useTranslation';
import GamePage from './pages/GamePage';
import MultiplayerPage from './pages/MultiplayerPage';
import './App.css';

const libraries = ['places'];

function ApiKeyError() {
  const { t } = useTranslation();
  
  return (
    <div className='min-h-screen grid place-items-center text-center p-6'>
      <div>
        <h1 className='text-3xl font-bold mb-4'>{t('appName')}</h1>
        <p className='text-slate-600 dark:text-slate-400'>
          {t('apiKeyError')}{' '}
          <code className='bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded'>
            .env
          </code>{' '}
          {t('apiKeyWith')}{' '}
          <code className='bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded'>
            VITE_GOOGLE_MAPS_API_KEY=
          </code>
        </p>
      </div>
    </div>
  );
}

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <LanguageProvider>
        <ApiKeyError />
      </LanguageProvider>
    );
  }

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
            <div className='max-w-none mx-auto py-8 pb-12 flex flex-col gap-4'>
              <Routes>
                <Route path='/game' element={<GamePage />} />
                <Route path='/multiplayer' element={<MultiplayerPage />} />
                <Route path='/multiplayer/:roomCode' element={<MultiplayerPage />} />
                <Route path='/' element={<Navigate to='/game' replace />} />
              </Routes>
            </div>
          </LoadScript>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
