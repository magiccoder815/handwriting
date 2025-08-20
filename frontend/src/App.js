import React, { useState } from "react";
import CanvasDrawArea from "./components/CanvasDrawArea";
import NumberDisplay from "./components/NumberDisplay";
import "./App.css";

function App() {
    const [predictedNumber, setPredictedNumber] = useState("");

    return (
        <div className="App">
            <h1>Real-Time Handwritten Number Recognition</h1>
            <CanvasDrawArea setPredictedNumber={setPredictedNumber} />
            <NumberDisplay predictedNumber={predictedNumber} />
        </div>
    );
}

export default App;
