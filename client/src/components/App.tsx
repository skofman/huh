import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Landing from "./Landing";
import Login from "./Login";
import SignUp from "./SignUp";
import Game from "./Game";

const App: React.FunctionComponent = () => {
  return (
    <div id="main-app">
      <BrowserRouter>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Route path="/game" component={Game} />
        <Route exact path="/" component={Landing} />
      </BrowserRouter>
    </div>
  );
};

export default App;
