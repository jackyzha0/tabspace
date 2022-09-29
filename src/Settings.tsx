import React from 'react'
import { Link } from 'wouter'
import { useSettingsStore } from './storage';
import './Settings.css'

interface ICheckbox {
  state: boolean,
  toggle: () => void,
  name: string,
}

function Checkbox({ name, state, toggle }: ICheckbox) {
  return (<div className="config-item">
    <input id={name} type="checkbox" checked={state} onChange={toggle} />
    <label htmlFor={name} />
    <h3>{name}</h3>
  </div>)

}

function Settings() {
  const state = useSettingsStore();
  return (<div className="help">
    <Link href="/index.html"><h2 className="back">← Back</h2></Link>
    <p>Configure Tabspace to your liking.</p>
    <hr />
    <div className="config-items">
      <Checkbox state={state.isDarkmode} toggle={state.toggleTheme} name="Dark theme" />
      <Checkbox state={state.showVisualization} toggle={state.toggleVisualization} name="Show task visualization" />
    </div>
  </div>
  )
}

export default Settings
