import React, { useCallback, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, IconButton, Typography, Button, Toolbar, MenuItem, Menu, Avatar } from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    marginLeft: 10
  },
  bar: {
    backgroundColor: "#1B1C1D"
  }
}));

interface Props {
  username: string;
  avatar: string | null;
  balance: number;
}

const TopBar: React.FunctionComponent<Props> = ({ username, avatar, balance }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const history = useHistory();

  const handleMenu = (e: React.MouseEvent) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const navigate = (route: string) => () => {
    handleClose();
    history.push(route);
  };

  const logout = useCallback(() => {
    fetch("/api/logout").then(() => {
      history.push("/");
    });
  }, [history]);

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.bar}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={handleMenu}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right"
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right"
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={navigate("/game/active")}>Active Game</MenuItem>
            <MenuItem onClick={navigate("/game/tables")}>Your tables</MenuItem>
            <MenuItem onClick={navigate("/game/join")}>Join table</MenuItem>
            <MenuItem onClick={navigate("/game/sessions")}>Past Sessions</MenuItem>
          </Menu>
          <Avatar src={avatar ? avatar : "images/avatars/none.png"} />
          <Typography variant="body2" className={classes.title}>
            {`Welcome ${username}, your balance is: ${balance}`}
          </Typography>
          <Button variant="contained" color="primary" onClick={logout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default TopBar;
