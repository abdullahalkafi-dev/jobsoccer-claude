import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FollowState {
  followedEmployerIds: string[];
}

const initialState: FollowState = {
  followedEmployerIds: [],
};

const followSlice = createSlice({
  name: "follow",
  initialState,
  reducers: {
    addToFollowing: (state, action: PayloadAction<string>) => {
      if (!state.followedEmployerIds.includes(action.payload)) {
        state.followedEmployerIds.push(action.payload);
      }
    },
    removeFromFollowing: (state, action: PayloadAction<string>) => {
      state.followedEmployerIds = state.followedEmployerIds.filter(
        (id) => id !== action.payload
      );
    },
    setFollowedEmployers: (state, action: PayloadAction<string[]>) => {
      state.followedEmployerIds = action.payload;
    },
    clearFollowing: (state) => {
      state.followedEmployerIds = [];
    },
  },
});

export const {
  addToFollowing,
  removeFromFollowing,
  setFollowedEmployers,
  clearFollowing,
} = followSlice.actions;

export default followSlice.reducer;
