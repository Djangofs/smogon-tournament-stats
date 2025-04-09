import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { environment } from '../../../environments/environment';
import { getAuth0Token } from '../auth/auth0Utils';

export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: environment.apiUrl,
  prepareHeaders: async (headers) => {
    // Get the token from Auth0
    const token = await getAuth0Token();

    // If we have a token, add it to the headers
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});
