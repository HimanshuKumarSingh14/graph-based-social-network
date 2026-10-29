import { useEffect, useRef, useState, useCallback } from "react";
import ForceGraph2D from "react-force-graph-2d";

function GraphView({ graphData, height = 480, highlightEmail }) {
  const containerRef = useRef(null);
  const fgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [height]);

  const paintNode = useCallback(
    (node, ctx, globalScale) => {
      const radius = node.id === highlightEmail ? 10 : 7;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.avatarColor || node.color || "#6355f5";
      ctx.fill();

      if (node.id === highlightEmail) {
        ctx.lineWidth = 2 / globalScale;
        ctx.strokeStyle = "#181a2e";
        ctx.stroke();
      }

      const label = node.name || node.id;
      if (globalScale > 1.1) {
        ctx.font = `${11 / globalScale}px Inter, sans-serif`;
        ctx.fillStyle = "#181a2e";
        ctx.textAlign = "center";
        ctx.fillText(label, node.x, node.y + radius + 10 / globalScale);
      }
    },
    [highlightEmail]
  );

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={height}
        nodeId="id"
        linkColor={() => "#d6d8ee"}
        linkWidth={1}
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 9, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        cooldownTicks={80}
        onEngineStop={() => fgRef.current && fgRef.current.zoomToFit(400, 40)}
      />
    </div>
  );
}

export default GraphView;
