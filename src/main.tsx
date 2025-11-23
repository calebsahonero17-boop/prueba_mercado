import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './AppConRouter.tsx';
import './index.css';

// Importar tests de storage (disponibles en window)
import './lib/testStorage';
import './lib/testUploadDirecto';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
