import React, { useCallback, useState } from "react";
import { TextField } from "@material-ui/core";
import { CheckCircleOutline, CancelOutlined } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { IUser } from "./User";

const useStyles = makeStyles(() => ({
  icon: {
    cursor: "pointer"
  }
}));

interface Props {
  value: string;
  close: () => void;
  field: string;
  setUser: (user: IUser) => void;
}

const FieldUpdate: React.FunctionComponent<Props> = ({ value, close, field, setUser }) => {
  const [updatedValue, setUpdatedValue] = useState(value);
  const classes = useStyles();

  const updateUser = useCallback(() => {
    if (updatedValue === value) {
      return close();
    }

    fetch("/api/updateUser", {
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      body: JSON.stringify({ updates: [{ field, value: updatedValue }] })
    }).then(async (res) => {
      if (res.status === 200) {
        const response = await res.json();
        setUser(response.user);
      }

      close();
    });
  }, [updatedValue, value, field, setUser, close]);

  const handleChange = (e: React.ChangeEvent) => {
    // @ts-ignore
    setUpdatedValue(e.target.value);
  };

  return (
    <div>
      <TextField value={updatedValue} onChange={handleChange} />
      <CheckCircleOutline className={classes.icon} onClick={updateUser} />
      <CancelOutlined className={classes.icon} onClick={close} />
    </div>
  );
};

export default FieldUpdate;
