import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import './App.css';
import SettingsBar from './SettingsBar';
import Editor, { IEditor, Tasks } from './Editor';
import Help from './Help';
import Visualization, { IVisualization } from './Visualization';
import { useSettingsStore } from './storage';
import Settings from './Settings';


function App() {
  const [location] = useLocation();
  const [tasks, setTasks] = useState<Tasks[]>([]);

  const isDarkmode = useSettingsStore(state => state.isDarkmode);
  useEffect(() => {
    document.documentElement.setAttribute('saved-theme', isDarkmode ? 'dark' : 'light');
  }, [isDarkmode])

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="App">
      <SettingsBar />
      <div className="App-content">
        <Switch>
          <Route path="/index.html/help">
            <Help />
          </Route>
          <Route path="/index.html/settings">
            <Settings />
          </Route>
          <Route path="/index.html">
            <Home tasks={tasks} setTasks={setTasks} />
          </Route>
        </Switch>
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
