import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TAppliedJob } from "@/types/job";

interface JobApplicationState {
  appliedJobs: TAppliedJob[];
}

const initialState: JobApplicationState = {
  appliedJobs: [],
};

const jobApplicationSlice = createSlice({
  name: "jobApplication",
  initialState,
  reducers: {
    setAppliedJobs: (state, action: PayloadAction<TAppliedJob[]>) => {
      state.appliedJobs = action.payload;
    },
    addAppliedJob: (state, action: PayloadAction<TAppliedJob>) => {
      if (!state.appliedJobs.find((job) => job._id === action.payload._id)) {
        state.appliedJobs.push(action.payload);
      }
    },
    removeAppliedJob: (state, action: PayloadAction<string>) => {
      state.appliedJobs = state.appliedJobs.filter(
        (job) => job._id !== action.payload
      );
    },
    clearApplications: (state) => {
      state.appliedJobs = [];
    },
  },
});

export const {
  setAppliedJobs,
  addAppliedJob,
  removeAppliedJob,
  clearApplications,
} = jobApplicationSlice.actions;

export default jobApplicationSlice.reducer;
