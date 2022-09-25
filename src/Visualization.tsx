import React, { useCallback, useEffect, useRef } from 'react'
import { forceCollide, forceManyBody } from 'd3-force'
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Tasks } from './Editor';
import { MS_IN_DAYS } from './tasks/TimedTask';
import { withSize } from 'react-sizeme';

interface IVisualization {
  tasks: Tasks[],
  theme: string,
  size: {
    width: number,
    height: number,
  }
}

function dateToSize(date: number) {
  const daysDiff = Math.max(0, date - (new Date().getTime())) / MS_IN_DAYS
  return 29 * Math.pow(1.5, -daysDiff) + 1
}

function Visualization(props: IVisualization) {
  const fgRef = useRef<ForceGraphMethods>();
  const nodes = props.tasks.map(task => ({
    id: task.uid,
    val: dateToSize(task.due)
  }))

  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      fg.d3Force('charge', forceManyBody().strength(15));
      // @ts-ignore
      fg.d3Force('collide', forceCollide().radius(node => 4 * Math.sqrt(node.val)));
      fg.d3ReheatSimulation();
    }
  }, [fgRef.current]);

  // @ts-ignore
  const paint = useCallback((node, ctx) => {
    const isDark = props.theme === 'dark';
    ctx.fillStyle = isDark ? "#444444" : "#cacaca";
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4 * Math.sqrt(node.val), 0, 2 * Math.PI, false);
    ctx.fill();
  }, [props.theme])

  return <ForceGraph2D
    ref={fgRef}
    height={400}
    width={props.size.width}
    nodeLabel=""
    onNodeClick={(node) => {
      const nodeEl = document.getElementById((node.id || "").toString());
      if (nodeEl) {
        nodeEl.classList.add("highlight");
        nodeEl.scrollIntoView();
        setTimeout(() => nodeEl.classList.remove("highlight"), 800);
      }
    }}
    enablePanInteraction={false}
    enableZoomInteraction={false}
    nodeCanvasObject={paint}
    graphData={{ nodes, links: [] }}
  />
}

export default withSize()(Visualization);
