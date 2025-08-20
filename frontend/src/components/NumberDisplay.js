import React from "react";
import "./NumberDisplay.css";

function NumberDisplay({ predictedNumber }) {
    return (
        <div className="number-display">
            <h2>Predicted Number:</h2>
            <p>{predictedNumber || "-"}</p>
        </div>
    );
}

export default NumberDisplay;
