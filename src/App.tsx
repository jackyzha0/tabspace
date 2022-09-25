import React, { useState } from 'react';
import './App.css';
import Darkmode from './Darkmode';
import Editor, { Tasks } from './Editor';

function App() {
  const [tasks, setTasks] = useState<Tasks[]>([]);
  console.log(tasks)
  return (
    <div className="App">
      <Darkmode />
      <Editor setTasks={setTasks} />
    </div>
  );
}

export default App;
