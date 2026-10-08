import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CandidateShortlistState {
  shortlistedIds: string[];
}

const initialState: CandidateShortlistState = {
  shortlistedIds: [],
};

const candidateShortlistSlice = createSlice({
  name: "candidateShortlist",
  initialState,
  reducers: {
    addToShortlist: (state, action: PayloadAction<string>) => {
      if (!state.shortlistedIds.includes(action.payload)) {
        state.shortlistedIds.push(action.payload);
      }
    },
    removeFromShortlist: (state, action: PayloadAction<string>) => {
      state.shortlistedIds = state.shortlistedIds.filter(
        (id) => id !== action.payload
      );
    },
    setShortlistedIds: (state, action: PayloadAction<string[]>) => {
      state.shortlistedIds = action.payload;
    },
    clearShortlist: (state) => {
      state.shortlistedIds = [];
    },
  },
});

export const {
  addToShortlist,
  removeFromShortlist,
  setShortlistedIds,
  clearShortlist,
} = candidateShortlistSlice.actions;

export default candidateShortlistSlice.reducer;
