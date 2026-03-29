import { createSlice } from '@reduxjs/toolkit';

const vibeSlice = createSlice({
  name: 'vibe',
  initialState: {
    vibeData: null,
    progress: 0,
    members: [], // For the Green Zone avatars
    currentTrack: null
  },
  reducers: {
    updateVibe: (state, action) => {
      state.vibeData = action.payload;
    },
    updateProgress: (state, action) => {
      state.progress = action.payload;
    },
    updateTrack: (state, action) => {
      state.currentTrack = action.payload;
    },
    updateMembers: (state, action) => {
      state.members = action.payload;
    }
  }
});

export const { updateVibe, updateProgress, updateTrack, updateMembers } = vibeSlice.actions;
export default vibeSlice.reducer;