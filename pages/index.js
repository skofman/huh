import React from 'react';
import TopBar from '../components/TopBar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    backgroundImage: 'url(/images/background.jpg)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    width: '100vw',
    height: '100vh'
  }
}));

const Landing = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TopBar />
    </div>
  );
};

export default Landing;
