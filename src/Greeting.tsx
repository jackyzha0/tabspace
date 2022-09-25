import React, { useEffect, useState } from 'react';
import './Greeting.css';

interface IGreeting {
  numTasks: number,
  numUrgentTasks: number,
}

function calculateGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning"
  } else if (hour < 18) {
    return "Good afternoon"
  } else {
    return "Good evening"
  }
}

function calculateTaskString(numTasks: number, numUrgentTasks: number) {
  if (numTasks === 0) {
    return "You have nothing due."
  }
  const tasks = numTasks === 1 ? 'task' : 'tasks'
  return `You have ${numTasks} ${tasks} due, ${numUrgentTasks} of which need to be done soon.`
}

function Greeting(props: IGreeting) {
  const greeting = calculateGreeting();
  const calcTime = () => new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric"});
  const [time, setTime] = useState(calcTime());

  useEffect(() => {
    const timer = setInterval(() => setTime(calcTime()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (<div className="overlay">
    <h1>{time}</h1>
    <p>{greeting}. {calculateTaskString(props.numTasks, props.numUrgentTasks)}</p>
  </div>)
}

export default Greeting
