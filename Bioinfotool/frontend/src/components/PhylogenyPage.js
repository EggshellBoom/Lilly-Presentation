import React, { Component,useEffect,useState } from "react";
import Nav from "./Nav";
import Card from "./Card";
import { makeStyles } from "@material-ui/core/styles";
import Phylocanvas from 'phylocanvas';
import Button from "@material-ui/core/Button";
import { DataGrid } from "@material-ui/data-grid";
import AssessmentIcon from "@material-ui/icons/Assessment";
import Select from "@material-ui/core/Select";
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    Redirect,
    NavLink
  } from "react-router-dom";

const useStyles = makeStyles({
  home: {
    margin: "10%",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
  },


  phylocanvas:{
    width:"100%",
    height:"100em"
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

export default function PhylogenyPage(props) {
  const classes = useStyles();
  const [data, setData] = useState([]);
  const [ids, setIds] = useState([]);
  const [tree,setTree] = useState();

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
        var new_tree = Phylocanvas.createTree('phylocanvas');
        setTree(new_tree)
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  }, []);

  const loadTree = (nwk) =>{
    // var tree = Phylocanvas.createTree('phylocanvas');
    tree.setTreeType('rectangular');
    tree.alignLabels = true;
    tree.setNodeSize(10)
    tree.load(nwk);
  }

  const handleTree = () => {

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ids),
    };
    fetch("api/treeSequences", requestOptions)
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
        loadTree(data);
       
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  return (
    <div>
      <Nav title="Phylogeny Inference"/>
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
        <Button
            className={classes.formChild}
            variant="contained"
            color="secondary"
            startIcon={<AssessmentIcon />}
            onClick={handleTree}
          >
            Construct Tree
          </Button>
        <div id="phylocanvas"></div>
      </div>
    </div>
  );
}
