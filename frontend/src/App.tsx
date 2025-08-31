import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PredictResponse, Box } from "./types";

const API_URL =
    (import.meta as any).env?.VITE_API_URL || "http://localhost:8000";

const W = 800;
const H = 160;

export default function App() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const boxLayerRef = useRef<HTMLCanvasElement | null>(null);
    const [drawing, setDrawing] = useState(false);
    const [lineWidth, setLineWidth] = useState(18);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PredictResponse | null>(null);
    const [history, setHistory] = useState<ImageData[]>([]);

    useEffect(() => {
        const c = canvasRef.current!;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = lineWidth;
    }, []);

    useEffect(() => {
        const c = canvasRef.current!;
        const ctx = c.getContext("2d")!;
        ctx.lineWidth = lineWidth;
    }, [lineWidth]);

    const start = (x: number, y: number) => {
        const c = canvasRef.current!;
        const ctx = c.getContext("2d")!;
        setHistory((h) => [
            ...h.slice(-9),
            ctx.getImageData(0, 0, c.width, c.height),
        ]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        setDrawing(true);
    };

    const draw = (x: number, y: number) => {
        if (!drawing) return;
        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const end = () => setDrawing(false);

    const pos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect();
        const x =
            (e.clientX - rect.left) * (canvasRef.current!.width / rect.width);
        const y =
            (e.clientY - rect.top) * (canvasRef.current!.height / rect.height);
        return { x, y };
    };

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = pos(e);
        start(x, y);
    };
    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const { x, y } = pos(e);
        draw(x, y);
    };
    const onMouseUp = () => end();
    const onMouseLeave = () => end();

    const clear = () => {
        const c = canvasRef.current!;
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
        setResult(null);
        drawBoxes([]);
    };

    const undo = () => {
        const c = canvasRef.current!;
        const ctx = c.getContext("2d")!;
        setHistory((h) => {
            if (h.length === 0) return h;
            const last = h[h.length - 1];
            ctx.putImageData(last, 0, 0);
            return h.slice(0, -1);
        });
    };

    const drawBoxes = (boxes: Box[] = []) => {
        const layer = boxLayerRef.current!;
        const ctx = layer.getContext("2d")!;
        ctx.clearRect(0, 0, layer.width, layer.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(47,129,247,0.9)";
        boxes.forEach(([x1, y1, x2, y2]) => {
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        });
    };

    const send = async () => {
        try {
            setIsLoading(true);
            setResult(null);
            const c = canvasRef.current!;
            const blob: Blob = await new Promise(
                (res) => c.toBlob((b) => res(b as Blob), "image/png")!
            );
            const form = new FormData();
            form.append("image", blob, "drawing.png");
            const r = await fetch(`${API_URL}/predict`, {
                method: "POST",
                body: form,
            });
            if (!r.ok) throw new Error(await r.text());
            const data: PredictResponse = await r.json();
            setResult(data);
            drawBoxes(data.boxes);
        } catch (err) {
            alert(`Error: ${err}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[900px] mx-auto p-5 mt-10">
            <div className="bg-panel rounded-xl p-5 shadow-card">
                <h1 className="text-2xl font-bold">
                    Handwritten Number Recognizer
                </h1>
                <p className="text-muted text-sm mt-1">
                    Write digits left → right with small gaps (e.g., 23435).
                    Click Recognize to see the prediction.
                </p>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                        onClick={send}
                        disabled={isLoading}
                        className="bg-brand disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-xl"
                    >
                        {isLoading ? "Recognizing…" : "Recognize"}
                    </button>
                    <button
                        onClick={undo}
                        className="bg-[#39424e] text-white font-semibold px-4 py-2 rounded-xl"
                    >
                        Undo
                    </button>
                    <button
                        onClick={clear}
                        className="bg-[#39424e] text-white font-semibold px-4 py-2 rounded-xl"
                    >
                        Clear
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-muted text-sm">Pen width</span>
                        <input
                            type="range"
                            min={6}
                            max={36}
                            value={lineWidth}
                            onChange={(e) =>
                                setLineWidth(Number(e.target.value))
                            }
                        />
                    </div>
                </div>

                <div
                    className="relative border border-[#2a2f36] rounded-xl overflow-hidden mt-4"
                    style={{ width: W, height: H }}
                >
                    <canvas
                        ref={canvasRef}
                        width={W}
                        height={H}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseLeave}
                        style={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            cursor: "crosshair",
                        }}
                    />
                    <canvas
                        ref={boxLayerRef}
                        className="absolute inset-0 pointer-events-none"
                        width={W}
                        height={H}
                    />
                </div>

                <div className="mt-4">
                    <div className="text-muted text-sm">Prediction</div>
                    <div className="text-3xl font-extrabold tracking-wide2">
                        {result ? result.predicted : "—"}
                    </div>
                    {result?.per_digit && (
                        <div className="text-muted text-sm mt-2">
                            {result.per_digit
                                .map(
                                    (d, i) =>
                                        `#${i + 1}:${d.digit} (${(
                                            d.prob * 100
                                        ).toFixed(1)}%)`
                                )
                                .join("  ")}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
