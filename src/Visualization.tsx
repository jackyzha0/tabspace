import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { forceCollide, forceManyBody } from 'd3-force'
import ForceGraph2D, { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { Tasks } from './Editor';
import { MS_IN_DAYS } from './tasks/TimedTask';
import { withSize } from 'react-sizeme';
import Greeting from './Greeting';
import './Visualization.css'
import { useSettingsStore } from './storage';
import { interpolateLab } from 'd3-interpolate';

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

const TRANSITION_TIME = 300;
function nowAddTransitionTime(): number {
  const now = new Date();
  return now.getTime() + TRANSITION_TIME;
}

function Visualization(props: IVisualization) {
  const fgRef = useRef<ForceGraphMethods>();
  const [hover, setHover] = useState<string>();
  const [hoverPrev, setHoverPrev] = useState<string>();
  const [hoverFinishTime, setHoverFinishTime] = useState<number>(new Date().getTime());
  const isDark = useSettingsStore(state => state.isDarkmode);
  const show = useSettingsStore(state => state.showVisualization);

  const data = useMemo(() => {
    const nodes = props.tasks.map(task => ({
      id: task.uid,
      val: dateToSize(task.due)
    }))
    return { nodes, links: [] }
  }, [props.tasks])

  useEffect(() => {
    const fg = fgRef.current;
    if (fg) {
      fg.d3Force('charge', forceManyBody().strength(15));
      // @ts-ignore
      fg.d3Force('collide', forceCollide().radius(node => 4 * Math.sqrt(node.val)));
      fg.d3ReheatSimulation();
    }
  }, [fgRef]);

  const paint = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D) => {
    const t = 1 - Math.max((hoverFinishTime - new Date().getTime()) / TRANSITION_TIME, 0);
    const hoverCol = isDark ? "#6b879a" : "#284b63";
    const normalCol = isDark ? "#444444" : "#cacaca";
    if (node.id === hover) {
      ctx.fillStyle = interpolateLab(normalCol, hoverCol)(t)
    } else if (node.id === hoverPrev) {
      ctx.fillStyle = interpolateLab(hoverCol, normalCol)(t)
    } else {
      ctx.fillStyle = normalCol;
    }
    ctx.beginPath();
    // @ts-ignore
    ctx.arc(node.x, node.y, 4 * Math.sqrt(node.val), 0, 2 * Math.PI, false);
    ctx.fill();
  }, [isDark, hover, hoverFinishTime, hoverPrev])

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
        if (node && node.id) {
          const nodeEl = document.getElementById(node.id.toString());
          if (nodeEl) {
            setHoverPrev(hover);
            setHover(node.id + "");
            setHoverFinishTime(nowAddTransitionTime());
            nodeEl.classList.add("highlight");
          }
        } else {
          setHoverPrev(hover);
          setHover(undefined);
          setHoverFinishTime(nowAddTransitionTime());
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
          nodeEl.scrollIntoView({
            behavior: 'smooth'
          });
          setTimeout(() => nodeEl.classList.remove("highlight"), 700);
        }
      }}
      enablePanInteraction={false}
      enableZoomInteraction={false}
      autoPauseRedraw={false}
      nodeCanvasObject={paint}
      graphData={data}
    />
  </div>
}

export default withSize()(Visualization);
