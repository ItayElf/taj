import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface userData {
  username: string;
  token: string;
  idx: number;
}

const initialState: userData = {
  username: "",
  token: "",
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
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem("token", JSON.stringify(action.payload));
    },
    setIdx: (state, action: PayloadAction<number>) => {
      state.idx = action.payload;
      localStorage.setItem("idx", JSON.stringify(action.payload));
    },
  },
});

export const { setUsername, setToken, setIdx } = userDataSlice.actions;
export default userDataSlice.reducer;
