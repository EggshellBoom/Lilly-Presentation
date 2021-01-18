import React, { Component, useState, useEffect } from "react";
import Nav from "./Nav";
import Card from "./Card";
import Button from "@material-ui/core/Button";
import { DataGrid } from "@material-ui/data-grid";
import { makeStyles } from "@material-ui/core/styles";
import AssessmentIcon from "@material-ui/icons/Assessment";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
  NavLink,
} from "react-router-dom";

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

  table: {
    overflow: "auto",
    margin: "5%",
  },

  form: {
    display: "flex",
    justifyContent: "space-around",
  },
  formChild: {
    flexGrow: "1",
  },
  sequenceView: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  sequence: {
    marginLeft: "10px",
    display: "flex",
    justifyContent: "flex-start",
  },
  label: {
    minWidth: "100px",
    maxWidth: "100px",
    overflowWrap: "break-word",
  },
  letter: {
    fontSize: "larger",
    width: "25px",
    height: "30px",
    textAlign: "center",
  },
  alignment: {
    overflow: "auto",
    margin: "5%",
  },
});

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

export default function AlignmentPage(props) {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [ids, setIds] = useState([]);
  const [alignment, setAlignment] = useState([]);
  const [algoSelect, setAlgoSelect] = useState("");

  useEffect(() => {
    fetch("/api/viewSequence")
      .then(async (response) => {
        const data = await response.json();

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          alert(error)
          return Promise.reject(error);
        }
        setData(data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  const handleAlignment = () => {
    const algo = document.getElementById("algo").value;
    setAlignment([]);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ids: ids,
        algo: algo,
      }),
    };
    fetch("api/alignSequences", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = data.message;
          alert(error)
          return Promise.reject(error);
        }
        console.log(data);
        setAlgoSelect(algo);
        setAlignment(data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  return (
    <div>
      <Nav title="Sequence Alignment" />
      <div className={classes.home}>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={data}
            columns={columns}
            checkboxSelection
            onSelectionChange={(newSelection) => {
              setIds(newSelection.rowIds.map((item) => parseInt(item)));
            }}
          />
        </div>
        <div className={classes.form}>
          <div className={classes.formChild}>
            <Select native defaultValue="" id="grouped-native-select" id="algo">
              <optgroup label="Pairwise Alignment">
                <option value={"G"}>Global Alignment</option>
                <option value={"L"}>Local Alignment</option>
              </optgroup>
              <optgroup label="Multiple Alignment">
                <option value={"M"}>MUSCLE Alignment</option>
              </optgroup>
            </Select>
          </div>

          <Button
            className={classes.formChild}
            variant="contained"
            color="secondary"
            startIcon={<AssessmentIcon />}
            onClick={handleAlignment}
          >
            Perform Alignment
          </Button>
        </div>
        {algoSelect == "M" ? (
          <div className={classes.alignment}>
            {alignment.map((aln) => {
              console.log(aln);
              console.log(algoSelect);
              return(
              <SequenceViewer label={aln.label} string={aln.sequence} />
            )})}
          </div>
        ) : (
          <div>
            {alignment.map((aln) => (
              <div className={classes.alignment}>
                <p>Score: {aln.score}</p>
                <SequenceViewer label="Sequence A" string={aln.seqA} />
                <SequenceViewer label="Sequence B" string={aln.seqB} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const ColorProfile = {
  A: "red",
  T: "chartreuse",
  C: "cyan",
  G: "darkorange",
  U: "chartreuse",
  "-": "white",
};

const SequenceViewer = ({ label, string }) => {
  const classes = useStyles();
  const array = string.split("");
  console.log(array);
  return (
    <div className={classes.sequenceView}>
      <div className={classes.label}>{label}</div>
      <div className={classes.sequence}>
        {array.map((letter) => {
          return (
            <div
              style={{ backgroundColor: ColorProfile[letter] }}
              className={classes.letter}
            >
              {letter}
            </div>
          );
        })}
      </div>
    </div>
  );
};
