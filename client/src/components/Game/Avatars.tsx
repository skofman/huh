import React, { useCallback } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, Avatar, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { IUser } from "./User";

const useStyles = makeStyles((theme) => ({
  large: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    cursor: "pointer"
  }
}));

interface Props {
  open: boolean;
  setStatus: (status: boolean) => void;
  setUser: (user: IUser) => void;
}

const Avatars: React.FunctionComponent<Props> = ({ open, setStatus, setUser }) => {
  const classes = useStyles();

  const updateAvatar = useCallback(
    (img) => {
      fetch("/api/updateUser", {
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
        body: JSON.stringify({ updates: [{ field: "avatar", value: img }] })
      }).then(async (res) => {
        if (res.status === 200) {
          const response = await res.json();
          setUser(response.user);
        }

        setStatus(false);
      });
    },
    [setStatus, setUser]
  );

  const handleClose = () => {
    setStatus(false);
  };

  return (
    <Dialog open={open}>
      <DialogTitle>Choose an avatar</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Avatar
              src="/images/avatars/cat.jpg"
              className={classes.large}
              onClick={() => updateAvatar("/images/avatars/cat.jpg")}
            />
          </Grid>
          <Grid item xs={3}>
            <Avatar
              src="/images/avatars/cow.jpg"
              className={classes.large}
              onClick={() => updateAvatar("/images/avatars/cow.jpg")}
            />
          </Grid>
          <Grid item xs={3}>
            <Avatar
              src="/images/avatars/dog.jpg"
              className={classes.large}
              onClick={() => updateAvatar("/images/avatars/dog.jpg")}
            />
          </Grid>
          <Grid item xs={3}>
            <Avatar
              src="/images/avatars/fox.jpg"
              className={classes.large}
              onClick={() => updateAvatar("/images/avatars/fox.jpg")}
            />
          </Grid>
          <Grid item xs={3}>
            <Avatar
              src="/images/avatars/monkey.jpg"
              className={classes.large}
              onClick={() => updateAvatar("/images/avatars/monkey.jpg")}
            />
          </Grid>
          <Grid item xs={3}>
            <Avatar
              src="/images/avatars/panda.jpg"
              className={classes.large}
              onClick={() => updateAvatar("/images/avatars/panda.jpg")}
            />
          </Grid>
          <Grid item xs={3}>
            <Avatar
              src="/images/avatars/pig.jpg"
              className={classes.large}
              onClick={() => updateAvatar("/images/avatars/pig.jpg")}
            />
          </Grid>
          <Grid item xs={3}>
            <Avatar
              src="/images/avatars/rooster.jpg"
              className={classes.large}
              onClick={() => updateAvatar("/images/avatars/rooster.jpg")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Avatars;
