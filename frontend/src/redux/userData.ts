import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userData {
  username: string;
  password: string;
  idx: number;
}

const initialState: userData = {
  username: "",
  password: "",
  idx: -1,
};

export const userDataSlice = createSlice({
  name: "userData",
  initialState,
  reducers: {
    setUsername: (state, action: PayloadAction<string>) => {
      state.username = action.payload;
      localStorage.setItem("username", JSON.stringify(action.payload));
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
      localStorage.setItem("password", JSON.stringify(action.payload));
    },
    setIdx: (state, action: PayloadAction<number>) => {
      state.idx = action.payload;
      localStorage.setItem("idx", JSON.stringify(action.payload));
    },
  },
});

export const { setUsername, setPassword, setIdx } = userDataSlice.actions;
export default userDataSlice.reducer;
