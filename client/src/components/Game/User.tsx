import React, { useCallback, useState } from "react";
import { Paper, Grid, Typography, Button, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Lock, Edit } from "@material-ui/icons";
import Avatars from "./Avatars";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: "30px",
    padding: 16
  },
  header: {
    display: "flex"
  },
  btn: {
    marginLeft: 25
  },
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3)
  },
  flex: {
    display: "flex"
  },
  edit: {
    cursor: "pointer",
    marginLeft: 5
  },
  lock: {
    marginLeft: 5
  },
  reset: {
    marginLeft: 10
  }
}));

export interface IUser {
  id: string;
  avatar: string | null;
  balance: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  location: string | null;
}

interface Props {
  user: IUser | null;
  setUser: (user: IUser) => void;
}

const User: React.FunctionComponent<Props> = ({ user, setUser }) => {
  const classes = useStyles();
  const [changeAvatar, setChangeAvatar] = useState(false);
  const history = useHistory();

  const resetBalance = useCallback(() => {
    fetch("api/resetBalance").then(async (res) => {
      if (res.status === 200) {
        const response = await res.json();
        setUser(response.user);
      }
    });
  }, [setUser]);

  if (!user) {
    return null;
  }

  const { username, avatar, balance, firstName, lastName, location } = user;

  return (
    <Paper className={classes.paper}>
      <Avatars open={changeAvatar} setStatus={setChangeAvatar} setUser={setUser} />
      <Grid container spacing={2}>
        <Grid item xs={12} className={classes.header}>
          <Typography variant="h5">Player info</Typography>
          <Button variant="contained" color="primary" className={classes.btn} onClick={() => history.push("/tables")}>
            Start game
          </Button>
          <Button variant="contained" color="primary" className={classes.btn} onClick={() => history.push("/join")}>
            Join game
          </Button>
        </Grid>
        <Grid item xs={12}>
          <hr />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2">Username:</Typography>
        </Grid>
        <Grid item xs={8} className={classes.flex}>
          <Typography variant="body2">{username}</Typography>
          <Lock fontSize="small" className={classes.lock} />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2">Avatar:</Typography>
        </Grid>
        <Grid item xs={8} className={classes.flex}>
          <Avatar className={classes.avatar} src={avatar ? avatar : "images/avatars/none.png"} />
          <Edit fontSize="small" className={classes.edit} onClick={() => setChangeAvatar(true)} />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2">Balance:</Typography>
        </Grid>
        <Grid item xs={8} className={classes.flex}>
          <Typography variant="h6">{balance}</Typography>
          <Button
            variant="contained"
            size="small"
            color="primary"
            className={classes.reset}
            disabled={balance >= 500}
            onClick={resetBalance}
          >
            Reset balance
          </Button>
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2">First Name:</Typography>
        </Grid>
        <Grid item xs={8} className={classes.flex}>
          {firstName}
          <Edit fontSize="small" className={classes.edit} />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2">Last Name:</Typography>
        </Grid>
        <Grid item xs={8} className={classes.flex}>
          {lastName}
          <Edit fontSize="small" className={classes.edit} />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2">Location:</Typography>
        </Grid>
        <Grid item xs={8} className={classes.flex}>
          {location}
          <Edit fontSize="small" className={classes.edit} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default User;
