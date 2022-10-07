import { Mark, markPasteRule, markInputRule, ExtendedRegExpMatchArray } from '@tiptap/core'
import { nanoid } from 'nanoid';
import chrono from '../utils/ModdedChrono';

export interface TimedTaskOptions {
  HTMLAttributes: Record<string, any>,
}

const TRANSPARENCY = "55";
const OVERDUE = "#ff3333" + TRANSPARENCY;
const DUE_TODAY = "#ffa333" + TRANSPARENCY;
const DUE_SOON = "#fff000" + TRANSPARENCY;
const NOT_URGENT = "#99999933";
export const MS_IN_DAYS = 86400000;

function calculateUrgency(deadline: Date) {
  const diff = deadline.getTime() - new Date().getTime();
  if (diff < 0) {
    return OVERDUE;
  } else if (diff <= MS_IN_DAYS) {

    return DUE_TODAY;
  } else if (diff <= MS_IN_DAYS * 3) {
    return DUE_SOON;
  } else {
    return NOT_URGENT;
  }
}

function parseTime(text: string | undefined) {
  const parsedResults = chrono.parse(text || "", undefined, { forwardDate: true });
  if (parsedResults.length > 0) {
    const parsedTime = parsedResults[0];
    return { time: parsedTime.start.date().getTime(), text }
  } else {
    return false
  }
}

function getAttributes(match: ExtendedRegExpMatchArray) {
  const text = match.input;
  return parseTime(text);
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    timedTask: {
      setDue: () => ReturnType,
    }
  }
}

export const TimedTask = Mark.create({
  name: 'timedTask',
  exitable: true,
  keepOnSplit: false,
  addAttributes() {
    return {
      time: {
        default: '',
        parseHTML: element => element.getAttribute('data-time') || new Date().getTime(),
        renderHTML: attributes => ({
          'data-time': attributes.time,
          'locale-string': new Date(attributes.time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          }),
        })
      },
      text: {
        default: '',
        parseHTML: element => element.innerText,
      },
      uid: {
        default: nanoid(),
        renderHTML: attributes => ({
          id: attributes.uid
        })
      },
      color: {
        default: NOT_URGENT,
        renderHTML: attributes => ({
          style: `background: ${attributes.color}`
        })
      }
    }
  },

  addCommands() {
    return {
      setDue: () => ({commands}) => {
        commands.setMark(this.name)
        return commands.insertContent("due\u00A0")
      }
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-d': () => this.editor.commands.setDue(),
      'Mod-D': () => this.editor.commands.setDue(),
    }
  },

  onCreate() {
    const transaction = this.editor.state.tr;
    this.editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'text') {
        const timeMark = node.marks.find((mark) => mark.type.name === this.name);
        if (timeMark !== undefined) {
          const start = pos;
          const end = pos + node.nodeSize;
          transaction.removeMark(start, end, timeMark);
          const newMark = this.type.create({
            ...timeMark.attrs,
            text: node.text,
            color: calculateUrgency(new Date(timeMark.attrs.time)),
            uid: nanoid(),
          })
          transaction.addMark(start, end, newMark);
        }
      }
    });

    transaction.setMeta('addToHistory', false);
    transaction.setMeta('preventUpdate', true);
    this.editor.view.dispatch(transaction);
  },

  onUpdate() {
    const transaction = this.editor.state.tr;
    this.editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'text') {
        const timeMark = node.marks.find((mark) => mark.type.name === this.name);
        if (timeMark !== undefined && node.text !== timeMark.attrs.text) {
          const start = pos;
          const end = pos + node.nodeSize;
          const newTime = parseTime(node.text);
          if (newTime) {
            const newMark = this.type.create({
              ...newTime,
              uid: timeMark.attrs.uid,
              color: calculateUrgency(new Date(newTime.time))
            })
            transaction.removeMark(start, end, timeMark);
            transaction.addMark(start, end, newMark);
          }
        }
      }
    });

    transaction.setMeta('addToHistory', false);
    transaction.setMeta('preventUpdate', true);
    this.editor.view.dispatch(transaction);
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-time]',
      },
    ]
  },

  addInputRules() {
    return [
      markInputRule({
        find: /(?:\s\()(due\s.+)(?:\))/,
        type: this.type,
        getAttributes
      }),
    ]
  },

  addPasteRules() {
    return [
      markPasteRule({
        find: /(?:\s\()(due\s.+)(?:\))/g,
        type: this.type,
        getAttributes
      }),
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      HTMLAttributes,
      0,
    ]
  },
})
