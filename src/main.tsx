import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import RenderErrorBoundary from './components/RenderErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <RenderErrorBoundary><App /></RenderErrorBoundary>
        </BrowserRouter>
    </React.StrictMode>,
);
