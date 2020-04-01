import React, { useState } from 'react';
import { Paper, TextField, Button } from '@material-ui/core';
import TopBar from './TopBar';

const Login: React.FunctionComponent = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      <TopBar />
      <Paper elevation={3}>
        <TextField label="Username" variant="outlined" value={username} onChange={(e) => setUsername(e.target.value)} />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="username"
        />
        <Button>Log in</Button>
      </Paper>
    </div>
  );
};

export default Login;
