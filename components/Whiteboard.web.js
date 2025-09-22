// components/Whiteboard.web.js
import React, { useEffect, useRef, useState } from "react";

export default function Whiteboard() {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#111827");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const bgColor = "#ffffff";

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = wrapper.clientWidth;
    const cssHeight = Math.max(400, wrapper.clientHeight);

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? bgColor : strokeColor;
    ctx.lineWidth = strokeWidth;
    ctxRef.current = ctx;
  };

  useEffect(() => {
    resizeCanvas();
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = isEraser ? bgColor : strokeColor;
    ctx.lineWidth = strokeWidth;
  }, [strokeColor, strokeWidth, isEraser]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const t = e.touches?.[0] ?? e;
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  };

  const down = (e) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };
  const move = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = ctxRef.current;
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const up = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    ctxRef.current.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = isEraser ? bgColor : strokeColor;
    ctx.lineWidth = strokeWidth;
  };

  const downloadPNG = () => {
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "whiteboard.png";
    a.click();
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Color</span>
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => {
              setIsEraser(false);
              setStrokeColor(e.target.value);
            }}
            className="h-9 w-9 p-0 border rounded cursor-pointer"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Grosor</span>
          <input
            type="range"
            min={1}
            max={16}
            value={strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
          />
          <span className="text-sm text-gray-700 w-6 text-right">{strokeWidth}</span>
        </label>

        <button
          onClick={() => setIsEraser((v) => !v)}
          className={`px-3 py-2 rounded-xl border ${
            isEraser ? "bg-red-600 text-white border-red-600" : "bg-white border-gray-300"
          }`}
        >
          {isEraser ? "Borrador ON" : "Borrador"}
        </button>

        <button onClick={clearCanvas} className="px-3 py-2 rounded-xl bg-gray-200">
          Limpiar
        </button>

        <button onClick={downloadPNG} className="px-3 py-2 rounded-xl bg-emerald-600 text-white">
          Exportar PNG
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={wrapperRef}
        className="w-full rounded-xl border border-gray-200 overflow-hidden"
        style={{ height: 480 }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={down}
          onMouseMove={move}
          onMouseUp={up}
          onMouseLeave={up}
          onTouchStart={down}
          onTouchMove={move}
          onTouchEnd={up}
          style={{ display: "block", cursor: isEraser ? "cell" : "crosshair" }}
        />
      </div>
    </div>
  );
}
