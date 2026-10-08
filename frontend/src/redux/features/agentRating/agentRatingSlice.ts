import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AgentRatingState {
  hasRated: boolean;
  userRating: number | null;
}

const initialState: AgentRatingState = {
  hasRated: false,
  userRating: null,
};

const agentRatingSlice = createSlice({
  name: "agentRating",
  initialState,
  reducers: {
    setRatingStatus: (
      state,
      action: PayloadAction<{ hasRated: boolean; rating: number | null }>
    ) => {
      state.hasRated = action.payload.hasRated;
      state.userRating = action.payload.rating;
    },
    clearRatingStatus: (state) => {
      state.hasRated = false;
      state.userRating = null;
    },
  },
});

export const { setRatingStatus, clearRatingStatus } = agentRatingSlice.actions;
export default agentRatingSlice.reducer;
