import React, { useCallback, useState } from 'react';
import { Paper, TextField, Button, Typography } from '@material-ui/core';
import TopBar from './TopBar';
import { makeStyles } from '@material-ui/core/styles';
import { Formik, Form } from 'formik';
import Router from 'next/router';

const useStyles = makeStyles(() => ({
  root: {
    backgroundImage: 'url(/images/background.jpg)',
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

const validate = (values) => {
  const errors = {};

  const { username, password } = values;

  if (username.length < 3) {
    errors.username = 'Must be at least 3 characters';
  }
  if (password.length < 3) {
    errors.password = 'Must be at least 3 characters';
  }

  return errors;
};

const SignUp = () => {
  const classes = useStyles();

  const [error, setError] = useState('');

  const signUp = useCallback(
    async (values, actions) => {
      const { username, password } = values;
      fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
        .then(async (res) => {
          if (res.status !== 200) {
            const response = await res.json();
            return setError(response.error);
          }
          setError('');
          actions.resetForm();

          await Router.push('/game');
        })
        .catch((e) => {
          setError('Some error happened');
        });
    },
    [Router]
  );

  return (
    <div className={classes.root}>
      <TopBar />
      <Typography variant="h5" className={classes.title}>
        Sign up
      </Typography>
      <Paper elevation={3} className={classes.paper}>
        <Formik
          validate={validate}
          initialValues={{ username: '', password: '' }}
          onSubmit={(values, actions) => signUp(values, actions)}
          validateOnBlur={false}
          validateOnChange={false}
        >
          {({ values, handleSubmit, handleChange, errors, touched }) => (
            <Form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Username"
                variant="outlined"
                value={values.username}
                onChange={handleChange}
                margin="dense"
                error={touched.username && !!errors.username}
                helperText={errors.username}
                name="username"
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={values.password}
                onChange={handleChange}
                margin="dense"
                fullWidth
                name="password"
                error={touched.password && !!errors.password}
                helperText={errors.password}
              />
              <Button fullWidth variant="contained" className={classes.btn} color="primary" type="submit">
                Sign up
              </Button>
            </Form>
          )}
        </Formik>
        {!!error && (
          <Typography variant="body2" className={classes.error}>
            {error}
          </Typography>
        )}
      </Paper>
    </div>
  );
};

export default SignUp;
