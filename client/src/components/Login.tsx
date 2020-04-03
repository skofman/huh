import React, { useCallback, useState } from 'react';
import { Paper, TextField, Button, Typography, Link } from '@material-ui/core';
import TopBar from './TopBar';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import { Formik, Form, FormikValues, FormikErrors } from 'formik';

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

const validate = (values: FormikValues) => {
  const errors: FormikErrors<FormikValues> = {};

  const { username, password } = values;
  if (!username) {
    errors.username = 'Required';
  }
  if (!password) {
    errors.password = 'Required';
  }

  return errors;
};

const Login: React.FunctionComponent = () => {
  const classes = useStyles();
  const history = useHistory();

  const [error, setError] = useState(false);

  const login = useCallback(
    (values, actions) => {
      const { username, password } = values;

      fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
        .then((res) => {
          if (res.status !== 200) {
            return setError(true);
          }
          setError(false);
          actions.resetForm();

          history.push('/game');
        })
        .catch((e) => {
          setError(true);
        });
    },
    [history]
  );

  return (
    <div className={classes.root}>
      <TopBar />
      <Typography variant="h5" className={classes.title}>
        Log in
      </Typography>
      <Paper elevation={3} className={classes.paper}>
        <Formik
          validate={validate}
          initialValues={{ username: '', password: '' }}
          onSubmit={(values, actions) => login(values, actions)}
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
                name="username"
                error={touched.username && !!errors.username}
                helperText={errors.username}
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
              <Button fullWidth variant="contained" color="primary" className={classes.btn} type="submit">
                Log in
              </Button>
              {error && (
                <Typography variant="body2" className={classes.error}>
                  Error log in
                </Typography>
              )}
            </Form>
          )}
        </Formik>
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
