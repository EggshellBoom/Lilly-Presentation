import React, { Component, useState, useEffect } from "react";
import Nav from "./Nav";
import Card from "./Card";
import { makeStyles } from "@material-ui/core/styles";
import { JsonToTable } from "react-json-to-table";
import AssessmentIcon from "@material-ui/icons/Assessment";
import Button from "@material-ui/core/Button";
import { DataGrid } from "@material-ui/data-grid";
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

  table:{
    overflow:"auto",
    margin: "5%"
  }

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

export default function AnalysisPage(props) {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [ids, setIds] = useState([]);
  const [analysis, setAnalysis] = useState([]);

  useEffect(() => {
    fetch("/api/viewSequence")
      .then(async (response) => {
        const data = await response.json();

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = (data && data.message) || response.status;
          return Promise.reject(error);
        }
        setData(data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  const handleAnalysis = () => {
    console.log(ids);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    };
    fetch("api/analyzeSequences", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setAnalysis(data)
        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = data.message;
          return Promise.reject(error);
        }
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  return (
    <div>
      <Nav title="Sequence Analysis" />
      <div className={classes.home}>
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid
            rows={data}
            columns={columns}
            checkboxSelection
            onSelectionChange={(newSelection) => {
              setIds(newSelection.rowIds.map((item)=>parseInt(item)));
            }}
          />
        </div>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AssessmentIcon />}
          onClick={handleAnalysis}
        >
          Perform Analysis
        </Button>
        {analysis.map((item)=> (<div className = {classes.table} ><JsonToTable json={item}  /></div>))}
      </div>
    </div>
  );
}

