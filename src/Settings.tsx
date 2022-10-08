import React from 'react'
import { Link } from 'wouter'
import { useSettingsStore } from './storage';
import './Settings.css'

interface ICheckbox {
  state: boolean,
  toggle: () => void,
  name: string,
  description: string,
}

function Checkbox({ name, state, toggle, description }: ICheckbox) {
  return (<div className="config-item">
    <input id={name} type="checkbox" checked={state} onChange={toggle} />
    <label htmlFor={name} />
    <div className="desc">
      <h3>{name}</h3>
      <p>{description}</p>
    </div>
  </div>)
}


function Settings() {
  const state = useSettingsStore();
  return (<div className="help">
    <Link href="/index.html"><h2 className="back">← Back</h2></Link>
    <p>Configure Tabspace to your liking.</p>
    <hr />
    <div className="config-items">
      <Checkbox state={state.isDarkmode} toggle={state.toggleTheme} name="Dark theme" description="Change the colour theme of TabSpace. Checking this box will set it to Dark mode." />
      <Checkbox state={state.showVisualization} toggle={state.toggleVisualization} name="Show task visualization" description="Adds a task visualization widget to the top of your notes page. It visualized your due dates by representing the urgency of tasks through the size of blobs." />
      <Checkbox state={state.enableFadeIn} toggle={state.toggleFadeIn} name="Fade in page" description="Adds a subtle fade-in that cascades down the page." />
      <Checkbox state={state.enableTaskAnimation} toggle={state.toggleTaskAnimation} name="Task completion animation" description="Show an animation when a task is completed. This happens when an item with a due date is deleted." />
    </div>
  </div>
  )
}

export default Settings
