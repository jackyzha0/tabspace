import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import './App.css';
import SettingsBar from './SettingsBar';
import Editor, { IEditor, Tasks } from './Editor';
import Help from './Help';
import Visualization, { IVisualization } from './Visualization';
import { useSettingsStore } from './storage';
import Settings from './Settings';
import { motion, AnimatePresence } from "framer-motion";

const AnimationSettings = {
  transition: { duration: 0.6 },
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  default: { ease: "linear" },
}

function App() {
  const [location] = useLocation();
  const [tasks, setTasks] = useState<Tasks[]>([]);

  const state = useSettingsStore();
  useEffect(() => {
    document.documentElement.setAttribute('saved-theme', state.isDarkmode ? 'dark' : 'light');
    document.documentElement.setAttribute('fade-in', state.enableFadeIn ? 'true' : 'false');
    document.documentElement.setAttribute('task-animation', state.enableTaskAnimation ? 'true' : 'false');
  }, [state])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="App">
      <div id="effects-layer"></div>
      <SettingsBar />
      <div className="App-content">
        <AnimatePresence initial={false}>
          <Switch key={location} location={location}>
            <Route path="/index.html/help">
              <motion.div {...AnimationSettings}>
                <Help />
              </motion.div>
            </Route>
            <Route path="/index.html/settings">
              <motion.div {...AnimationSettings}>
                <Settings />
              </motion.div>
            </Route>
            <motion.div {...AnimationSettings}>
              <Home tasks={tasks} setTasks={setTasks} />
            </motion.div>
          </Switch>
        </AnimatePresence>
      </div>
    </div>
  );
}

type IHome = Pick<IVisualization & IEditor, 'tasks' | 'setTasks'>;
function Home({ tasks, setTasks }: IHome) {
  return (<div>
    <Visualization tasks={tasks} />
    <Editor setTasks={setTasks} />
  </div>)
}

export default App;
