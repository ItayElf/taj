import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import RepoPage from "./pages/Repo";

ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <React.StrictMode>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signIn" element={<Auth signIn key="signIn" />} />
          <Route
            path="/signUp"
            element={<Auth signIn={false} key="signUp" />}
          />
          <Route path="/user/:username" element={<Profile />} />
          <Route path="/repo/:repo" element={<RepoPage />} />
        </Routes>
      </React.StrictMode>
    </BrowserRouter>
  </Provider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
