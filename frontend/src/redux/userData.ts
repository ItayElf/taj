import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getInitial } from "./hooks";

interface userData {
  username: string;
  token: string;
}

const initialState: userData = {
  username: getInitial<string>("username") || "",
  token: getInitial<string>("token") || "",
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
  },
});

export const { setUsername, setToken } = userDataSlice.actions;
export default userDataSlice.reducer;
