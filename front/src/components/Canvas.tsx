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
  const lastPoint = useRef<Point | null>(null);

  // Initialisation et Socket Listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    // Fonction de redimensionnement
    const handleResize = () => {
      if (canvas && container) {
        // Sauvegarder l'image actuelle avant resize (optionnel, simple ici on reset)
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeStyle = 'black';
          ctx.lineWidth = 3;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Écoute des événements de dessin venant du serveur
    socket.on('draw', (data: { from: Point; to: Point }) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
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
  }, []);

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

    // Dessin local immédiat pour fluidité
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();

    // Envoi au serveur
    socket.emit('draw', { from: lastPoint.current, to: currentPoint });

    lastPoint.current = currentPoint;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', backgroundColor: 'white' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        style={{ 
          cursor: isDrawer ? 'crosshair' : 'default', 
          display: 'block'
        }}
      />
    </div>
  );
};

export default Canvas;
