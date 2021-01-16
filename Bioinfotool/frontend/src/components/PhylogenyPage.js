import React, { Component } from "react";
import Nav from "./Nav";
import Card from "./Card";
import { makeStyles } from "@material-ui/core/styles";
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
  },

  cards:{
      margin: "1%"
  }
});

export default function PhylogenyPage(props) {
  const classes = useStyles();

  return (
    <div>
      <Nav title="Phylogeny Inference"/>
      <div className={classes.home}>
        <p>Phylogeny page</p>
      </div>
    </div>
  );
}
