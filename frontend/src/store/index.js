import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import vibeReducer from './vibeSlice';
import chatReducer from './chatSlice'; // ✅ Ensure this is here!

export const store = configureStore({
  reducer: {
    auth: authReducer,
    vibe: vibeReducer,
    chat: chatReducer, // ✅ And here!
  },
});