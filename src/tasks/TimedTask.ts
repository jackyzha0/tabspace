import { Mark, markPasteRule, markInputRule, ExtendedRegExpMatchArray } from '@tiptap/core'
import * as chrono from 'chrono-node';

export interface TimedTaskOptions {
  HTMLAttributes: Record<string, any>,
}

const TRANSPARENCY = "55";
const OVERDUE = "#ff3333" + TRANSPARENCY;
const DUE_TODAY = "#ffa333" + TRANSPARENCY;
const DUE_SOON = "#fff000" + TRANSPARENCY;
const NOT_URGENT = "#777777" + TRANSPARENCY;

function calculateUrgency(deadline: Date) {
  const day = 86400000;
  const diff = deadline.getTime() - new Date().getTime();
  if (diff < 0) {
    return OVERDUE;
  } else if (diff < day) {

    return DUE_TODAY;
  } else if (diff < day * 3) {
    return DUE_SOON;
  } else {
    return NOT_URGENT;
  }
}

function parseTime(text: string | undefined) {
  const parsedResults = chrono.parse(text || "");
  if (parsedResults.length > 0) {
    const parsedTime = parsedResults[0];
    return { time: parsedTime.start.date().getTime() }
  } else {
    return false
  }
}

function getAttributes(match: ExtendedRegExpMatchArray) {
  const text = match.input;
  return parseTime(text);
}

export const TimedTask = Mark.create({
  name: 'timedTask',

  addAttributes() {
    return {
      time: {
        default: null,
        parseHTML: element => element.getAttribute('data-time') || new Date().getTime(),
        renderHTML: attributes => ({
          'data-time': attributes.time,
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
            color: calculateUrgency(new Date(timeMark.attrs.time)),
            time: timeMark.attrs.time,
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
        if (timeMark !== undefined) {
          const start = pos;
          const end = pos + node.nodeSize;
          const newTime = parseTime(node.text);
          if (newTime) {
            const newMark = this.type.create({
              ...newTime,
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
