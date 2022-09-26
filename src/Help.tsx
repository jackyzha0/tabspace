import React, { ReactElement, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import './Help.css'
import exampleImg from './example-img.png'

interface HelpItem {
  name: string,
  wide?: boolean,
  description: string,
  howToCreate: ReactElement,
  preview: ReactElement,
}

interface HelpSection {
  heading: string,
  items: HelpItem[],
}

const DOCS: HelpSection[] = [
  {
    heading: "Tasks",
    items: [
      {
        name: "Due date",
        wide: true,
        description: "Turn a block into a task that will be highlighted depending on how soon it is due. Red corresponds to overdue, orange is due today, yellow is due within the next 3 days, and grey is any non-urgent task. It will also appear in the visualization. Works with natural language (you can specific dates and times like 'tomorrow', 'tonight', etc).",
        howToCreate: <>pressing ⌘D to insert a due date, or typing <code>(due TIME)</code> after your task where <code>TIME</code> is some due date</>,
        preview: <ul>
          <li>Assignment 1 <span data-time locale-string="Sept 25, 12:00 PM" style={{ background: "#ff333355" }}>due sept 25 at noon</span></li>
          <li>Assignment 2 <span data-time locale-string="Sept 27, 8:00 PM" style={{ background: "#ffa33355" }}>due tomorrow night</span></li>
          <li>Essay 2 <span data-time locale-string="Sept 28, 12:00 PM" style={{ background: "#fff00055" }}>due in two days</span></li>
          <li>Midterm <span data-time locale-string="Oct 1, 12:15 PM" style={{ background: "#99999933" }}>due oct 1</span></li>
        </ul>,
      },
    ],
  },
  {
    heading: "Lists",
    items: [
      {
        name: "Numbered List",
        description: "A list that counts the number of items it contains.",
        howToCreate: <>typing <code>1.</code> followed by a space.</>,
        preview: <ol>
          <li>Item 1</li>
          <li>Item 2
            <ol>
              <li>Item 2.1</li>
            </ol>
          </li>
        </ol>
      },
      {
        name: "Bulleted List",
        description: "A regular bulleted list.",
        howToCreate: <>typing a dash <code>-</code> followed by a space.</>,
        preview: <ul>
          <li>Item 1</li>
          <li>Item 2
            <ul>
              <li>Item 2.1</li>
            </ul>
          </li>
        </ul>
      }
    ],
  },
  {
    heading: "Headers",
    items: [
      {
        name: "Title",
        description: "Equivalent to an H1. Each header takes up a full line.",
        howToCreate: <>typing <code>#</code> followed by a space.</>,
        preview: <div><h1>Header</h1><p>Lorem ipsum</p></div>
      },
      {
        name: "Sub-heading",
        description: "Slightly smaller than a title. Equivalent to an H2",
        howToCreate: <>typing <code>##</code> followed by a space.</>,
        preview: <div><h2>Header</h2><p>Lorem ipsum</p></div>
      }, {
        name: "Sub-sub-heading",
        description: "An even smaller heading. Equivalent to an H3",
        howToCreate: <>typing <code>###</code> followed by a space.</>,
        preview: <div><h3>Header</h3><p>Lorem ipsum</p></div>
      }
    ],
  },
  {
    heading: "Text formatting",
    items: [
      {
        name: "Bold",
        description: "",
        howToCreate: <>selecting some text then pressing ⌘B</>,
        preview: <p>Some text with a <strong>bold portion</strong></p>,
      },
      {
        name: "Italics",
        description: "",
        howToCreate: <>selecting some text then pressing ⌘I</>,
        preview: <p>Some text with an <em>italicized portion</em></p>,
      },
      {
        name: "Strikethrough",
        description: "",
        howToCreate: <>selecting some text then pressing ⌘⇧X</>,
        preview: <p>Some text with portions <s>removed</s></p>,
      },
      {
        name: "Code",
        description: "Display some inline code. Code in Tabspace is not formatted.",
        howToCreate: <>selecting some text then pressing ⌘E</>,
        preview: <p>Some text with inline code: <code>print("Hello world")</code></p>,
      },
      {
        name: "Blockquote",
        description: "An extended quotation or excerpt, good for making callouts.",
        howToCreate: <>selecting some text then pressing ⌘⇧B</>,
        preview: <blockquote><p>You can nest other formatting like <strong>bold</strong> or headers</p></blockquote>,
      },
    ],
  },
  {
    heading: "Miscellaneous",
    items: [
      {
        name: "Images",
        description: "Images are stored in local storage so there may be a cap on number of images you can include.",
        howToCreate: <>either dragging and dropping an image into the page or pasting an image directly</>,
        preview: <><p>Here's an image</p><img src={`.${exampleImg}`} alt="Example" /></>
      },
      {
        name: "Horizontal Rule",
        description: "A horizontal divider to seperate content.",
        howToCreate: <>typing <code>---</code> followed by pressing Enter.</>,
        preview: <p>Some text <hr /> Woah! There's a break</p>
      }
    ],
  }
]

function Help() {
  return (<div className="help">
    <Link href="/index.html"><h2>← Back</h2></Link>
    <p>Below is a list of all the notable supported keyboard shortcuts.</p>
    {DOCS.map(section => (<div className="section">
      <hr />
      <h2>{section.heading}</h2>
      <div className="item-container">
        {section.items.map(item => (<div className={`item ${item.wide ? 'wide' : ''}`}>
          <h3>{item.name}</h3>
          <p>{item.description} Create by {item.howToCreate}</p>
          <div className="preview">{item.preview}</div>
        </div>))}
      </div>
    </div>))}
  </div>
  )
}

export default Help
