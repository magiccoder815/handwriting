import React, { useEffect, useRef, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const canvasRef = useRef(null)
  const boxLayerRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [lineWidth, setLineWidth] = useState(18)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])

  const W = 800, H = 160

  useEffect(() => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    // white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = lineWidth
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    ctx.lineWidth = lineWidth
  }, [lineWidth])

  const start = (x, y) => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    // snapshot for undo
    setHistory((h) => [...h.slice(-9), ctx.getImageData(0, 0, c.width, c.height)])
    ctx.beginPath()
    ctx.moveTo(x, y)
    setDrawing(true)
  }

  const draw = (x, y) => {
    if (!drawing) return
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const end = () => setDrawing(false)

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvasRef.current.width / rect.width)
    const y = (e.clientY - rect.top) * (canvasRef.current.height / rect.height)
    return { x, y }
  }

  const onMouseDown = (e) => { const {x,y}=pos(e); start(x,y) }
  const onMouseMove = (e) => { const {x,y}=pos(e); draw(x,y) }
  const onMouseUp = () => end()
  const onMouseLeave = () => end()

  const clear = () => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    ctx.clearRect(0,0,c.width,c.height)
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, c.width, c.height)
    setResult(null)
    drawBoxes([])
  }

  const undo = () => {
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    setHistory((h) => {
      if (h.length === 0) return h
      const last = h[h.length - 1]
      ctx.putImageData(last, 0, 0)
      return h.slice(0, -1)
    })
  }

  const drawBoxes = (boxes=[]) => {
    const layer = boxLayerRef.current
    const ctx = layer.getContext('2d')
    ctx.clearRect(0,0,layer.width,layer.height)
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(47,129,247,0.9)'
    boxes.forEach(([x1,y1,x2,y2]) => {
      ctx.strokeRect(x1, y1, x2-x1, y2-y1)
    })
  }

  const send = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const c = canvasRef.current
      // ensure white bg is kept
      const blob = await new Promise((res) => c.toBlob(res, 'image/png'))
      const form = new FormData()
      form.append('image', blob, 'drawing.png')
      const r = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: form
      })
      if (!r.ok) throw new Error(await r.text())
      const data = await r.json()
      setResult(data)
      drawBoxes(data.boxes)
    } catch (err) {
      alert(`Error: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Handwritten Number Recognizer</h1>
        <p className="label">Write digits left → right with small gaps (e.g., 23435). Click Recognize to see the prediction.</p>
        <div className="row toolbar" style={{margin: '12px 0'}}>
          <button className="btn" onClick={send} disabled={isLoading}>{isLoading ? 'Recognizing…' : 'Recognize'}</button>
          <button className="btn secondary" onClick={undo}>Undo</button>
          <button className="btn secondary" onClick={clear}>Clear</button>
          <div style={{marginLeft: 'auto'}}/>
          <span className="label">Pen width</span>
          <input type="range" min="6" max="36" value={lineWidth} onChange={e=>setLineWidth(+e.target.value)} />
        </div>

        <div className="canvasWrap" style={{width: W, height: H}}>
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            style={{ width: '100%', height: '100%', display: 'block', cursor: 'crosshair' }}
          />
          <canvas ref={boxLayerRef} className="boxLayer" width={W} height={H} />
        </div>

        <div style={{marginTop: 16}}>
          <div className="label">Prediction</div>
          <div className="pred">{result ? result.predicted : '—'}</div>
          {result?.per_digit && (
            <div className="label" style={{marginTop: 8}}>
              {result.per_digit.map((d,i)=>`#${i+1}:${d.digit} (${(d.prob*100).toFixed(1)}%)`).join('  ')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
