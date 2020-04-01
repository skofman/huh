import React from 'react';
import TopBar from './TopBar';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
  root: {
    backgroundImage: 'url(/background.jpg)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    width: '100vw',
    height: '100vh'
  }
}));

const Landing: React.FunctionComponent = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <TopBar />
    </div>
  );
};

export default Landing;
