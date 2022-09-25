import React, { useState } from 'react';
import './App.css';
import Darkmode, { loadDefault } from './Darkmode';
import Editor, { Tasks } from './Editor';
import Visualization from './Visualization';

function App() {
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [theme, setTheme] = useState(loadDefault());
  return (
    <div className="App">
      <Darkmode theme={theme} setTheme={setTheme} />
      <Visualization tasks={tasks} theme={theme} />
      <Editor setTasks={setTasks} />
    </div>
  );
}

export default App;
