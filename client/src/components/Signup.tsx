import React, { useCallback, useState } from 'react';
import { Paper, TextField, Button, Typography } from '@material-ui/core';
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

const Signup: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const signup = useCallback(() => {
    setUsernameError('');
    setPasswordError('');
    if (username.length < 3) {
      return setUsernameError('Has to be min 3 characters');
    }
    if (password.length < 3) {
      return setPasswordError('Has to be min 3 characters');
    }

    fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
      .then((res) => {
        if (res.status !== 200) {
          return setError('Some error happened');
        }
        setUsername('');
        setPassword('');
        setError('');

        history.push('/home');
      })
      .catch((e) => {
        setError('Some error happened');
      });
  }, [username, password, history]);

  return (
    <div className={classes.root}>
      <TopBar />
      <Typography variant="h5" className={classes.title}>
        Sign up
      </Typography>
      <Paper elevation={3} className={classes.paper}>
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="dense"
          error={!!usernameError}
          helperText={usernameError}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="dense"
          fullWidth
          error={!!passwordError}
          helperText={passwordError}
        />
        <Button fullWidth variant="contained" className={classes.btn} color="primary" onClick={signup}>
          Sign up
        </Button>
        {error && (
          <Typography variant="body2" className={classes.error}>
            Error sign up
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default Signup;
