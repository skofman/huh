import React, { useCallback, useState } from 'react';
import { Paper, TextField, Button, Typography, Link } from '@material-ui/core';
import TopBar from './TopBar';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles(() => ({
  root: {
    backgroundImage: 'url(/background.jpg)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    width: '100vw',
    height: '100vh'
  },
  paper: {
    width: '300px',
    padding: '16px',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginTop: '10px'
  },
  title: {
    color: 'white',
    width: '300px',
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: '30px'
  },
  btn: {
    marginTop: '10px'
  },
  message: {
    textAlign: 'center'
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: '10px'
  }
}));

const Login: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const login = useCallback(() => {
    if (!username || !password) {
      return;
    }

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then((res) => {
        if (res.status !== 200) {
          return setError(true);
        }
        setUsername('');
        setPassword('');
        setError(false);

        history.push('/home');
      })
      .catch((e) => {
        setError(true);
      });
  }, [username, password, history]);

  return (
    <div className={classes.root}>
      <TopBar />
      <Typography variant="h5" className={classes.title}>
        Log in
      </Typography>
      <Paper elevation={3} className={classes.paper}>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="dense"
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="dense"
          fullWidth
        />
        <Button fullWidth variant="contained" className={classes.btn} color="primary" onClick={login}>
          Log in
        </Button>
        {error && (
          <Typography variant="body2" className={classes.error}>
            Error log in
          </Typography>
        )}
      </Paper>
      <Paper elevation={3} className={classes.paper}>
        <Typography variant="body2" className={classes.message}>
          Don't have an account?{' '}
          <Link href="/signup" variant="body2">
            Sign up
          </Link>
        </Typography>
      </Paper>
    </div>
  );
};

export default Login;
