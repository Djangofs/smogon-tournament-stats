import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import * as ReactDOM from 'react-dom/client';
import App from './app/app';
import { Auth0Provider } from './app/auth/Auth0Provider';
import { Auth0Initializer } from './app/auth/Auth0Initializer';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <Auth0Provider>
      <Auth0Initializer>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Initializer>
    </Auth0Provider>
  </StrictMode>
);
