import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from '@/src/App';
import '@/src/LayoutStyles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
