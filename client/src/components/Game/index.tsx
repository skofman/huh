import React, { useEffect, useState } from "react";
import { BrowserRouter, useHistory, Route } from "react-router-dom";
import TopBar from "./TopBar";
import User from "./User";

const Game: React.FunctionComponent = () => {
  const history = useHistory();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then(async (res) => {
        if (res.status !== 200) {
          setUser(null);
          return history.push("/");
        }

        const { user } = await res.json();
        setUser(user);
      })
      .catch((e) => {
        setUser(null);
        history.push("/");
      });
  }, [history]);

  if (!user) {
    return null;
  }

  const { username, avatar, balance } = user;

  return (
    <div>
      <TopBar username={username} avatar={avatar} balance={balance} />
      <BrowserRouter basename="/game">
        <Route exact path="/" render={(routeProps) => <User {...routeProps} user={user} />} />
      </BrowserRouter>
    </div>
  );
};

export default Game;
