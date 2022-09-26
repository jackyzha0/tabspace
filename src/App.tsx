import React, { useEffect, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import './App.css';
import SettingsBar, { loadDefault } from './SettingsBar';
import Editor, { IEditor, Tasks } from './Editor';
import Help from './Help';
import Visualization, { IVisualization } from './Visualization';

function App() {
  const [location] = useLocation();
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [theme, setTheme] = useState(loadDefault());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="App">
      <SettingsBar theme={theme} setTheme={setTheme} />
      <div className="App-content">
        <Switch>
          <Route path="/index.html/help">
            <Help />
          </Route>
          <Route path="/index.html">
            <Home tasks={tasks} theme={theme} setTasks={setTasks} />
          </Route>
        </Switch>
        </div>
    </div>
  );
}

type IHome = Pick<IVisualization & IEditor, 'tasks' | 'theme' | 'setTasks'>;
function Home({ tasks, theme, setTasks }: IHome) {
  return (<div>
    <Visualization tasks={tasks} theme={theme} />
    <Editor setTasks={setTasks} />
  </div>)
}

export default App;
