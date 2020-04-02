import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Landing from './Landing';
import Login from './Login';
import SignUp from './Signup';

const App: React.FunctionComponent = () => {
  return (
    <div id="main-app">
      <BrowserRouter>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Route exact path="/" component={Landing} />
      </BrowserRouter>
    </div>
  );
};

export default App;
