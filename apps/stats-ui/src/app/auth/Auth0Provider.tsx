import { Auth0Provider as BaseAuth0Provider } from '@auth0/auth0-react';
import { environment } from '../../environments/environment';
import { ReactNode } from 'react';

interface Auth0ProviderProps {
  children: ReactNode;
}

export function Auth0Provider({ children }: Auth0ProviderProps) {
  return (
    <BaseAuth0Provider
      domain={environment.auth0.domain}
      clientId={environment.auth0.clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: environment.auth0.audience,
      }}
    >
      {children}
    </BaseAuth0Provider>
  );
}
