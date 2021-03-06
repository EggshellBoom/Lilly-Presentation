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
  NavLink,
} from "react-router-dom";

const useStyles = makeStyles({
  home: {
    margin: "10%",
    display: "flex",
    justifyContent: "center",
    flexWrap:"wrap"
  },

  cards: {
    margin: "1%",
  },
});

export default function HomePage(props) {
  const classes = useStyles();

  return (
    <div>
      <Nav title="Home"/>
      <div className={classes.home}>
        <NavLink to="/entry" className={classes.cards}>
          <Card
            title="Data Entry"
            image="/static/images/entry.jpg"
            description="Enter sequence data for analysis"
          />
        </NavLink>
        <NavLink to="/phylogeny" className={classes.cards}>
          <Card
            title="Phylogenetic Tree"
            image="/static/images/phylogeny.png"
            description="Turn Sequencing data into phylogenetic tree"
          />
        </NavLink>
        <NavLink to="/alignment" className={classes.cards}>
          <Card
            title="Sequence Alignment"
            image="/static/images/alignment.png"
            description="Align sequences and compute score"
          />
        </NavLink>
        <NavLink to="/analysis" className={classes.cards}>
          <Card
            title="Data Analysis"
            image="/static/images/analysis.jpg"
            description="Review dataset in detail"
          />
        </NavLink>
        <NavLink to="/cancer" className={classes.cards}>
          <Card
            title="Cancer Prediction"
            image="/static/images/cancer.png"
            description="Predict breast/skin cancer given dataset or image"
          />
        </NavLink>
        <a href="http://eggshellboom.github.io/Sequence-Alignment-Tutorial/"  className={classes.cards}>
          <Card
            title="Sequence Alignment Tutorial"
            image="/static/images/tutorial.png"
            description="Step by step tutorial for pairewise sequence alignment"
          />
        </a>
      </div>
    </div>
  );
}
