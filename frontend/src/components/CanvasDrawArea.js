import React, { useRef } from "react";
import CanvasDraw from "react-canvas-draw";
import { predictNumber } from "../api/api";
import "./CanvasDrawArea.css";

function CanvasDrawArea({ setPredictedNumber }) {
    const canvasRef = useRef(null);

    const handleEnd = async () => {
        if (canvasRef.current) {
            const base64Image =
                canvasRef.current.canvas.drawing.toDataURL("image/png");
            try {
                const result = await predictNumber(base64Image);
                setPredictedNumber(result.number);
            } catch (error) {
                console.error("Prediction failed:", error);
            }
        }
    };

    const handleClear = () => {
        if (canvasRef.current) {
            canvasRef.current.clear();
            setPredictedNumber("");
        }
    };

    return (
        <div>
            <div className="canvas-container">
                <CanvasDraw
                    ref={canvasRef}
                    brushRadius={6}
                    lazyRadius={0}
                    brushColor="#000"
                    canvasWidth={800}
                    canvasHeight={300}
                    onChange={handleEnd}
                />
            </div>
            <button className="clear" onClick={handleClear}>
                Clear
            </button>
        </div>
    );
}

export default CanvasDrawArea;
