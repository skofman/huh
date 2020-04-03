import React, { useState } from "react";
import {
  Card,
  Grid,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  grid: {
    margin: 30
  }
}));

interface Props {
  io: SocketIOClient.Socket | null;
}

const Tables: React.FunctionComponent<Props> = () => {
  const classes = useStyles();
  const [bb, setBB] = useState(2);

  return (
    <Grid container spacing={3} className={classes.grid}>
      <Grid item xs={4}>
        <Card>
          <CardContent>
            <Typography>New Table</Typography>
            <hr />
            <Typography>No Limit Texas Hold'em</Typography>
            <hr />
            <FormControl component="fieldset">
              <FormLabel component="legend">Select blinds level</FormLabel>
              <RadioGroup aria-label="gender" name="gender1" value={bb} onChange={(e) => setBB(Number(e.target.value))}>
                <FormControlLabel value={2} control={<Radio />} label="Blinds: 1/2. Min: 80 / Max: 300" />
                <FormControlLabel value={4} control={<Radio />} label="Blinds: 2/4. Min: 160 / Max: 600" />
                <FormControlLabel value={6} control={<Radio />} label="Blinds: 3/6. Min: 240 / Max: 900" />
                <FormControlLabel value={10} control={<Radio />} label="Blinds: 5/10. Min: 400 / Max: 1500" />
              </RadioGroup>
            </FormControl>
            <hr />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default Tables;
