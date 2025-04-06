import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from './contexts/AuthContext';


const root = createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
      <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);
reportWebVitals();