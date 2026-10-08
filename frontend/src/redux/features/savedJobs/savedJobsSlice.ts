import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TSavedJob } from "@/types/job";

interface SavedJobsState {
  savedJobs: TSavedJob[];
}

const initialState: SavedJobsState = {
  savedJobs: [],
};

const savedJobsSlice = createSlice({
  name: "savedJobs",
  initialState,
  reducers: {
    setSavedJobs: (state, action: PayloadAction<TSavedJob[]>) => {
      state.savedJobs = action.payload;
    },
    addSavedJob: (state, action: PayloadAction<TSavedJob>) => {
      if (!state.savedJobs.find((job) => job._id === action.payload._id)) {
        state.savedJobs.push(action.payload);
      }
    },
    removeSavedJob: (state, action: PayloadAction<string>) => {
      state.savedJobs = state.savedJobs.filter(
        (job) => job._id !== action.payload
      );
    },
    clearSavedJobs: (state) => {
      state.savedJobs = [];
    },
  },
});

export const { setSavedJobs, addSavedJob, removeSavedJob, clearSavedJobs } =
  savedJobsSlice.actions;

export default savedJobsSlice.reducer;
