import React, { useRef, useEffect, useState } from 'react';
import { socket } from '../services/socket';

interface CanvasProps {
  isDrawer: boolean;
}

type Point = { x: number; y: number };

const Canvas: React.FC<CanvasProps> = ({ isDrawer }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const lastPoint = useRef<Point | null>(null);

  const colors = [
    '#000000', '#ff0000', '#00ff00', '#0000ff', 
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', 
    '#8b4513', '#ffffff' // Blanc fait office de gomme
  ];

  // Initialisation et Socket Listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    const handleResize = () => {
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight - (isDrawer ? 60 : 0); // Ajustement pour la barre d'outils
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 3;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    socket.on('draw', (data: { from: Point; to: Point, color: string }) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.strokeStyle = data.color;
        ctx.moveTo(data.from.x, data.from.y);
        ctx.lineTo(data.to.x, data.to.y);
        ctx.stroke();
      }
    });

    socket.on('clear_canvas', () => {
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('draw');
      socket.off('clear_canvas');
    };
  }, [isDrawer]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    setIsDrawing(true);
    lastPoint.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer || !lastPoint.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPoint = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    socket.emit('draw', { from: lastPoint.current, to: currentPoint, color });

    lastPoint.current = currentPoint;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    socket.emit('clear_canvas');
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
      {isDrawer && (
        <div style={{ 
          height: '60px', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 15px', 
          gap: '15px', 
          borderBottom: '1px solid #ddd',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '25px',
                  height: '25px',
                  backgroundColor: c,
                  border: color === c ? '2px solid #2196F3' : '1px solid #ccc',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  padding: 0
                }}
              />
            ))}
          </div>
          <button 
            onClick={clearCanvas}
            style={{ 
              padding: '5px 12px', 
              backgroundColor: '#f44336', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Effacer tout
          </button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        style={{ 
          cursor: isDrawer ? 'crosshair' : 'default', 
          display: 'block',
          flex: 1
        }}
      />
    </div>
  );
};

export default Canvas;
