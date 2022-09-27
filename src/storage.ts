import { JSONContent } from "@tiptap/react";

type OutputData = JSONContent;
const DEFAULT_SAVE: OutputData = {
  type: "doc",
  content: [
    {
      type: "heading",
      attrs: { "level": 2 },
      content: [{ type: "text", text: "🪴 Welcome to your Tabspace" }]
    }, {
      type: "paragraph",
      content: [{ type: "text", text: "Treat this as your own little scratch space in the comfort of your new tab page. Your content is saved as you write and never leave your computer." }]
    }, {
      type: "paragraph",
      content: [{ type: "text", "marks": [{ type: "bold" }], "text": "This is your new digital home, set it up however you'd like!" }]
    }, {
      type: "heading",
      attrs: { "level": 3 },
      content: [{ type: "text", "text": "Getting Started" }]
    }, {
      type: "bulletList",
      content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", "text": "Not sure what you can do? Check out the " }, { type: "text", "marks": [{ type: "bold" }], "text": "help guide" }, { type: "text", "text": " by clicking on the information icon in the bottom right corner." }] }] }]
    }, {
      type: "bulletList",
      content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", "text": "Delete this start text and make this page your own! " }, { type: "text", "marks": [{ type: "timedTask", "attrs": { "time": 1664254800000, "uid": "RiDD0iLlc7SUnkfMWPe_W", "color": "#ffa33355" } }], "text": "due tonight" }] }] }]
    }, {
      type: "horizontalRule"
    }, {
      type: "paragraph",
      content: [{ type: "text", "text": "Found an issue or want to contribute a feature? Check out the code on " }, { type: "text", "marks": [{ type: "link", "attrs": { "href": "https://github.com/jackyzha0/tabspace", "target": "_blank", "class": null } }], "text": "Github!" }]
    }]
}

const STRINGIFIED_SAVE = JSON.stringify(DEFAULT_SAVE);

export function load(): OutputData {
  return JSON.parse(localStorage.getItem('blocks') || STRINGIFIED_SAVE)
};

export function save(blocks: OutputData) {
  localStorage.setItem('blocks', JSON.stringify(blocks));
};
