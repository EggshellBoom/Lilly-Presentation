import React, { Component, useState, useEffect } from "react";
import Nav from "./Nav";
import { makeStyles } from "@material-ui/core/styles";
import TextareaAutosize from "@material-ui/core/TextareaAutosize";
import EditIcon from "@material-ui/icons/Edit";
import Button from "@material-ui/core/Button";

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

export default function CancerPredictionPage(props) {
  const classes = useStyles();
  const [prediction, setPrediction] = useState([]);

  const handleSubmit = () => {
    var data = document.getElementById("breast_input").value;
    console.log(data);
    data = data.replace(/(\r\n|\n|\r)/gm, "").split(";");
    data.pop();
    console.log(data);
    data = data.map((x) => x.split(",").map((y) => parseFloat(y)));
    console.log(data);

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };

    fetch("api/breastCancer", requestOptions)
      .then(async (response) => {
        const data = await response.json();

        // check for error response
        if (!response.ok) {
          // get error message from body or default to response status
          const error = data.message;
          alert(error);
          return Promise.reject(error);
        }
        console.log(data);
        setPrediction(data);
      })
      .catch((error) => {
        console.error("There was an error!", error);
      });
  };

  return (
    <div>
      <Nav title="Cancer Prediction" />
      <div className={classes.home}>
        <h2>Breast Cancer Prediction</h2>
        <p>
          Using basic Machine learning Algorithm such as Logistic Regression and
          Random Forest to predict the malignancy of a breast cancer tumor.
          Input should be list of tumor features such as
          radius_mean,texture_mean,perimeter_mean and area_mean. Model traning
          can be found in this{" "}
          <a href="https://github.com/EggshellBoom/Lilly-Presentation/blob/main/Bioinfotool/api/ML/Breast%20Cancer.ipynb">
            Link to Notebook
          </a>
        </p>
        <TextareaAutosize
          id="breast_input"
          aria-label="minimum height"
          rowsMin={10}
          placeholder="please input the samples, seperated by semicolons. Each sample consists of 29 features, seperated by a comma"
        />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<EditIcon />}
          onClick={handleSubmit}
        >
          Submit
        </Button>
        {prediction.map((x) =>
          x == 0 ? (
            <p>---------Benign----------</p>
          ) : (
            <p>--------Malignant--------</p>
          )
        )}
      </div>
    </div>
  );
}