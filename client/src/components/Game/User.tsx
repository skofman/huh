import React from "react";
import { Paper, Grid, Typography, Button, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Lock, Edit } from "@material-ui/icons";

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

interface User {
  id: string;
  avatar: string | null;
  balance: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  location: string | null;
}

interface Props {
  user: User | null;
}

const User: React.FunctionComponent<Props> = ({ user }) => {
  const classes = useStyles();

  if (!user) {
    return null;
  }

  const { username, avatar, balance, firstName, lastName, location } = user;

  return (
    <Paper className={classes.paper}>
      <Grid container spacing={2}>
        <Grid item xs={12} className={classes.header}>
          <Typography variant="h5">Player info</Typography>
          <Button variant="contained" color="primary" className={classes.btn}>
            Start game
          </Button>
          <Button variant="contained" color="primary" className={classes.btn}>
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
          <Edit fontSize="small" className={classes.edit} />
        </Grid>
        <Grid item xs={4}>
          <Typography variant="subtitle2">Balance:</Typography>
        </Grid>
        <Grid item xs={8} className={classes.flex}>
          <Typography variant="h6">{balance}</Typography>
          <Button variant="contained" size="small" color="primary" className={classes.reset}>
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
