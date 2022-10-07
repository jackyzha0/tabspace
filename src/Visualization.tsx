import React, { useCallback, useEffect, useRef } from 'react'
import { forceCollide, forceManyBody } from 'd3-force'
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { Tasks } from './Editor';
import { MS_IN_DAYS } from './tasks/TimedTask';
import { withSize } from 'react-sizeme';
import Greeting from './Greeting';
import './Visualization.css'
import { useSettingsStore } from './storage';

export interface IVisualization {
  tasks: Tasks[],
  size: {
    width: number,
    height: number,
  }
}

function daysDiff(date: number) {
  return Math.max(0, date - (new Date().getTime())) / MS_IN_DAYS
}

function dateToSize(date: number) {
  return 29 * Math.pow(1.5, -daysDiff(date)) + 1
}

function isDueSoon(task: Tasks) {
  return daysDiff(task.due) < 3

}

function Visualization(props: IVisualization) {
  const fgRef = useRef<ForceGraphMethods>();
  const isDark = useSettingsStore(state => state.isDarkmode);
  const show = useSettingsStore(state => state.showVisualization);
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
  }, [fgRef]);

  // @ts-ignore
  const paint = useCallback((node, ctx) => {
    ctx.fillStyle = isDark ? "#444444" : "#cacaca";
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4 * Math.sqrt(node.val), 0, 2 * Math.PI, false);
    ctx.fill();
  }, [isDark])

  if (!show) {
    return <div className="spacer"></div>;
  }

  return <div className="visualization">
    <Greeting numTasks={props.tasks.length} numUrgentTasks={props.tasks.filter(isDueSoon).length} />
    <ForceGraph2D
      ref={fgRef}
      height={300}
      width={props.size.width}
      nodeLabel=""
      warmupTicks={5}
      onNodeHover={(node, prev) => {
        // guard against no new hover target
        if (node && node.id) {
          const nodeEl = document.getElementById(node.id.toString());
          if (nodeEl) {
            nodeEl.classList.add("highlight");
          }
        }

        if (prev && prev.id) {
          const nodeEl = document.getElementById(prev.id.toString());
          if (nodeEl && nodeEl.classList.contains("highlight")) {
            setTimeout(() => nodeEl.classList.remove("highlight"), 100);
          }
        }
      }}
      onNodeClick={(node) => {
        const nodeEl = document.getElementById((node.id || "").toString());
        if (nodeEl) {
          nodeEl.classList.add("highlight");
          nodeEl.scrollIntoView();
          setTimeout(() => nodeEl.classList.remove("highlight"), 700);
        }
      }}
      enablePanInteraction={false}
      enableZoomInteraction={false}
      nodeCanvasObject={paint}
      graphData={{ nodes, links: [] }}
    />
  </div>
}

export default withSize()(Visualization);
