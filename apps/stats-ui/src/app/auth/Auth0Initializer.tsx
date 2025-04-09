import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { setAuth0Instance } from '../store/auth/auth0Utils';

interface Auth0InitializerProps {
  children: React.ReactNode;
}

/**
 * Component that initializes the Auth0 instance for use in API calls
 * This should be placed high in the component tree, but after the Auth0Provider
 */
export function Auth0Initializer({ children }: Auth0InitializerProps) {
  const auth0 = useAuth0();

  useEffect(() => {
    // Set the Auth0 instance for use in API calls
    setAuth0Instance(auth0);
  }, [auth0]);

  return <>{children}</>;
}
