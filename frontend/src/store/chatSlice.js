import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
  },
  reducers: {
    addMessage: (state, action) => {
      // Keep only the last 50 messages to save memory
      state.messages = [...state.messages, action.payload].slice(-50);
    },
    clearChat: (state) => {
      state.messages = [];
    }
  }
});

export const { addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;