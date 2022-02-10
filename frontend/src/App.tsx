import React from "react";
import "./App.css";
import Footer from "./component/Footer";
import Header from "./component/Header";
import Home from "./pages/Home";

function App() {
  return (
    <div className="h-full w-full">
      <Header username="" />
      <Home />
      <Footer />
    </div>
  );
}

export default App;
