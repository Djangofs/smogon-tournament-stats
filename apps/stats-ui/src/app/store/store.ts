import { configureStore } from '@reduxjs/toolkit';
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from '@reduxjs/toolkit/query';
import { tournamentsApi } from './apis/tournaments.api';
import { playersApi } from './apis/players.api';
import { matchesApi } from './apis/matches.api';

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [tournamentsApi.reducerPath]: tournamentsApi.reducer,
    [playersApi.reducerPath]: playersApi.reducer,
    [matchesApi.reducerPath]: matchesApi.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      tournamentsApi.middleware,
      playersApi.middleware,
      matchesApi.middleware
    ),
});

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
