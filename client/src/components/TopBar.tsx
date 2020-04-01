import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { AppBar, Button, Toolbar, Typography, Avatar } from '@material-ui/core';
import { useHistory } from 'react-router-dom';

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

const TopBar: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();

  const login = () => {
    history.push('/login');
  };

  const signup = () => {
    history.push('/signup');
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.bar}>
        <Toolbar>
          <Avatar src="/logo.png" />
          <Typography variant="h6" className={classes.title}>
            Heads Up Holde'm
          </Typography>
          <Button variant="contained" onClick={login} className={classes.btn}>
            Log in
          </Button>
          <Button color="primary" variant="contained" onClick={signup}>
            Sign up
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default TopBar;
