import React, { Component, useState, useEffect } from "react";
import Nav from "./Nav";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import { makeStyles } from "@material-ui/core/styles";
import { DataGrid } from "@material-ui/data-grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import EditIcon from "@material-ui/icons/Edit";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  NavLink,
} from "react-router-dom";

const columns = [
  { field: "label", headerName: "Label", flex: 1.5 },
  { field: "seq_type", headerName: "Type", flex: 1 },
  {
    field: "sequence",
    headerName: "Sequence",
    flex: 10,
    sortComparator: (v1, v2, param1, param2) =>
      param1.row.sequence.length - param2.row.sequence.length,
  },
  { field: "created_at", headerName: "Time", type: "dateTime", flex: 2.5 },
];

const useStyles = makeStyles({
  home: {
    margin: "10%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },

  cards: {
    margin: "1%",
  },
});

const SubmitSequenceDialog = ({ open, handleClose, message }) => {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Submit Sequence</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Plese input a sequence you'd like to analyze. Please make sure the
            inputs are NUCLEOTIDE BASES and the labels are unique.
          </DialogContentText>
          <DialogContentText id="alert-dialog-description" color="red">
            {message}
          </DialogContentText>
          <InputLabel>Sequence Type</InputLabel>
          <Select id="type">
            <MenuItem value={"DNA"}>DNA</MenuItem>
            <MenuItem value={"RNA"}>RNA</MenuItem>
          </Select>
          <TextField
            autoFocus
            margin="dense"
            id="label"
            label="Label"
            fullWidth
          />

          <TextField
            autoFocus
            margin="dense"
            id="sequence"
            label="Sequence"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const EditSequenceDialog = ({
  open,
  handleClose,
  message,
  label,
  sequence,
}) => {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Update Sequence</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Plese edit the sequence you'd like to analyze. Please make sure the
            inputs are NUCLEOTIDE BASES.
          </DialogContentText>
          <DialogContentText id="alert-dialog-description" color="#DC143C">
            {message}
          </DialogContentText>
          <InputLabel>Sequence Type</InputLabel>
          <Select id="type_edit">
            <MenuItem value={"DNA"}>DNA</MenuItem>
            <MenuItem value={"RNA"}>RNA</MenuItem>
          </Select>
          <TextField
            autoFocus
            margin="dense"
            id="label_edit"
            label="Label"
            defaultValue={label}
            fullWidth
          />

          <TextField
            autoFocus
            margin="dense"
            id="sequence_edit"
            label="Sequence"
            defaultValue={sequence}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default function SequenceEntryPage(props) {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [open_edit, setOpenE] = useState(false);
  const [error, setError] = useState("");
  const [seqToEdit, setSeqToEdit] = useState("");
  const [labelToEdit, setLabelToEdit] = useState("");
  const [seqIdToEdit, setSeqIdToEdit] = useState("");
  const [disableUpdate, setDisableUpdate] = useState(true);
  const [refresh, setRefresh] = useState(-1);

  useEffect(() => {
    fetch("/api/viewSequence")
      .then(async (response) => {
        const data = await response.json();

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          alert(error);
          return Promise.reject(error);
        }
        setData(data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, [refresh]);

  const handleAddSequence = () => setOpen(true);

  const handleEditSequence = () => setOpenE(true);

  const handleSubmit = () => {
    const label = document.getElementById("label").value;
    const sequence = document.getElementById("sequence").value;
    const type = document.getElementById("type").innerText;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: label,
        sequence: sequence,
        seq_type: type,
      }),
    };
    fetch("api/createSequence", requestOptions)
      .then(async (response) => {
        const data = await response.json();

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = data.message;
          alert(error);
          setError(error);
          return Promise.reject(error);
        }
        setError("");
        setOpen(false);
        setRefresh(refresh+1);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  const handleUpdate = () => {
    const label = document.getElementById("label_edit").value;
    const sequence = document.getElementById("sequence_edit").value;
    const type = document.getElementById("type_edit").innerText;
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: label,
        sequence: sequence,
        seq_type: type,
        seq_id:seqIdToEdit
      }),
    };
    fetch("api/updateSequence", requestOptions)
      .then(async (response) => {
        const data = await response.json();

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = data.message;
          alert(error);
          setError(error);
          return Promise.reject(error);
        }

        setError("");
        setOpenE(false);
        setRefresh(refresh+1);

      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  return (
    <div>
      <EditSequenceDialog
        open={open_edit}
        handleClose={handleUpdate}
        message={error}
        sequence = {seqToEdit}
        label = {labelToEdit}
      />
      <SubmitSequenceDialog
        open={open}
        handleClose={handleSubmit}
        message={error}
      />
      <Nav title="Sequence Data Entry" />
      <div className={classes.home}>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={data}
            columns={columns}
            onSelectionChange={(newSelection) => {
              var id = newSelection.rowIds[0];
              var update = data.filter((data)=>data.id == id)[0];
              setSeqToEdit(update.sequence);
              setLabelToEdit(update.label);
              setSeqIdToEdit(update.seq_id);
              setDisableUpdate(false);
            }}
          />
        </div>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddCircleIcon />}
          onClick={handleAddSequence}
        >
          Add Sequence
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          disabled = {disableUpdate}
          onClick={handleEditSequence}
        >
          Edit Selected Sequence
        </Button>
      </div>
    </div>
  );
}
