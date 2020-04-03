import React, { useEffect, useState } from "react";
import { BrowserRouter, useHistory, Route } from "react-router-dom";
import TopBar from "./TopBar";
import User, { IUser } from "./User";
import socketIO from "socket.io-client";
import Tables from "./Tables";

const Game: React.FunctionComponent = () => {
  const history = useHistory();
  const [user, setUser] = useState<IUser | null>(null);
  const [io, setIO] = useState<SocketIOClient.Socket | null>(null);

  useEffect(() => {
    const io = socketIO();
    io.on("connect", () => {
      console.log("test");
    });
    io.on("test", (data: SocketIOClientStatic) => {
      console.log(data);
    });
    setIO(io);
  }, []);

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
        <Route path="/tables" render={(routeProps) => <Tables {...routeProps} io={io} />} />
        <Route exact path="/" render={(routeProps) => <User {...routeProps} user={user} setUser={setUser} />} />
      </BrowserRouter>
    </div>
  );
};

export default Game;
