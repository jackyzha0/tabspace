import { JSONContent } from "@tiptap/react";

type OutputData = JSONContent;
const DEFAULT_SAVE: OutputData = {
  type: "doc",
  content: [],
}

const STRINGIFIED_SAVE = JSON.stringify(DEFAULT_SAVE);

export function load(): OutputData {
  return JSON.parse(localStorage.getItem('blocks') || STRINGIFIED_SAVE)
};

export function save(blocks: OutputData) {
  localStorage.setItem('blocks', JSON.stringify(blocks));
};
