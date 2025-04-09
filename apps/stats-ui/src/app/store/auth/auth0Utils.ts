import { useAuth0 } from '@auth0/auth0-react';

// Create a singleton instance to access Auth0 methods outside of React components
let auth0Instance: ReturnType<typeof useAuth0> | null = null;

/**
 * Sets the Auth0 instance for use in non-React code
 * @param instance The Auth0 instance from useAuth0()
 */
export const setAuth0Instance = (instance: ReturnType<typeof useAuth0>) => {
  auth0Instance = instance;
};

/**
 * Gets the Auth0 access token for API requests
 * @returns A promise that resolves to the access token
 */
export const getAuth0Token = async (): Promise<string | null> => {
  try {
    if (!auth0Instance) {
      console.warn('Auth0 instance not set. Call setAuth0Instance first.');
      return null;
    }

    // Get the access token from Auth0
    const token = await auth0Instance.getAccessTokenSilently();
    return token;
  } catch (error) {
    console.error('Error getting Auth0 token:', error);
    return null;
  }
};
