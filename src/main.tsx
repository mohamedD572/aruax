import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { store } from './services/store';

if (typeof window !== 'undefined') {
  window.alert = (msg?: any) => {
    store.showDialog({
      type: 'info',
      title: 'Aurex Notice',
      message: String(msg ?? ''),
      primaryButtonText: 'OK',
    });
  };

  window.confirm = (msg?: string) => {
    store.showDialog({
      type: 'confirm',
      title: 'Confirmation',
      message: String(msg ?? 'Are you sure?'),
      primaryButtonText: 'Confirm',
      secondaryButtonText: 'Cancel',
    });
    return false;
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

