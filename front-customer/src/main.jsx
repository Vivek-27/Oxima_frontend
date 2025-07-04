import { createRoot } from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'react-hot-toast';
import App from './App';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Toaster position="top-center mt-10" />
    <App />
  </BrowserRouter>
);
