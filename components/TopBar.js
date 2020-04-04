import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Button, Toolbar, Typography, Avatar } from '@material-ui/core';
import Router from 'next/router';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1
  },
  title: {
    flexGrow: 1,
    marginLeft: '10px'
  },
  bar: {
    backgroundColor: '#1B1C1D'
  },
  btn: {
    marginRight: '10px'
  }
}));

const TopBar = () => {
  const classes = useStyles();

  const login = async () => {
    await Router.push('/login');
  };

  const signUp = async () => {
    await Router.push('/signup');
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.bar}>
        <Toolbar>
          <Avatar src="/images/logo.png" />
          <Typography variant="h6" className={classes.title}>
            Heads Up Holde'm
          </Typography>
          <Button variant="contained" onClick={login} className={classes.btn}>
            Log in
          </Button>
          <Button color="primary" variant="contained" onClick={signUp}>
            Sign up
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default TopBar;
