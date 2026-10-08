import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Resume {
  _id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

interface ResumeState {
  currentResume: Resume | null;
  isUploading: boolean;
}

const initialState: ResumeState = {
  currentResume: null,
  isUploading: false,
};

const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    setCurrentResume: (state, action: PayloadAction<Resume | null>) => {
      state.currentResume = action.payload;
    },
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    clearResume: (state) => {
      state.currentResume = null;
      state.isUploading = false;
    },
  },
});

export const { setCurrentResume, setIsUploading, clearResume } =
  resumeSlice.actions;

export default resumeSlice.reducer;
