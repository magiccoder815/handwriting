import React from "react";
import "./NumberDisplay.css";

function NumberDisplay({ predictedNumber }) {
    return (
        <div className="number-display">
            <p>Predicted Number:</p>
            <p>{predictedNumber || "-"}</p>
        </div>
    );
}

export default NumberDisplay;
