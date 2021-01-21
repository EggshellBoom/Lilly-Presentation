import React, { Component } from "react";
import AlignmentPage from "./AlignmentPage";
import AnalysisPage from "./AnalysisPage";
import PhylogenyPage from "./PhylogenyPage";
import HomePage from "./HomePage";
import SequenceEntryPage from "./SequenceEntryPage";
import CancerPredictionPage from "./CancerPredictionPage";
import Nav from "./Nav";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

export default class RoutePage extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route path="/alignment" component={AlignmentPage} />
          <Route path="/analysis" component={AnalysisPage} />
          <Route path="/phylogeny" component={PhylogenyPage} />
          <Route path="/entry" component={SequenceEntryPage} />
          <Route path="/cancer" component={CancerPredictionPage} />
        </Switch>
      </Router>
    );
  }
}
