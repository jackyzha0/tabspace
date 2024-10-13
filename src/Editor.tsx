import React, { ClipboardEventHandler, DragEvent, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import { Editor as TiptapEditor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { load, save } from './storage';
import './Editor.scss';
import Focus from '@tiptap/extension-focus';
import Typography from '@tiptap/extension-typography';
import Blockquote from '@tiptap/extension-blockquote';
import Image from '@tiptap/extension-image';
import { TimedTask } from './tasks/TimedTask';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import { Mark } from 'prosemirror-model';

export interface Tasks {
  due: number, // JS date in milliseconds past epoch
  uid: string,
}

export interface Position {
  top: number,
  bottom: number,
  left: number,
  right: number,
}

export interface IEditor {
  setTasks: (cb: ((tasks: Tasks[]) => Tasks[])) => void,
}

function traverseMarks(editor: TiptapEditor, cb: (timedMark: Mark) => void) {
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'text') {
      const timeMark = node.marks.find((mark) => mark.type.name === 'timedTask');
      if (timeMark !== undefined) {
        // @ts-ignore
        cb(timeMark)
      }
    }
  });
}

const Editor = ({ setTasks }: IEditor) => {
  const positions = useRef<Map<string, DOMRect>>(new Map());

  const refreshPositions = (editor: TiptapEditor) => {
    const newPositions: Map<string, DOMRect> = new Map(positions.current);
    traverseMarks(editor, (timeMark) => {
      const id = timeMark.attrs.uid;
      const spanEl = document.getElementById(id);
      if (spanEl && spanEl.parentElement) {
        newPositions.set(id, spanEl.parentElement.getBoundingClientRect())
      }
    })
    positions.current = newPositions
  }

  const refreshTasks = (editor: TiptapEditor) => {
    const newTasks: Tasks[] = [];
    traverseMarks(editor, (timeMark) => newTasks.push({ due: timeMark.attrs.time, uid: timeMark.attrs.uid }))
    setTasks((oldTasks: Tasks[]) => {
      if (JSON.stringify(oldTasks) !== JSON.stringify(newTasks)) {
        // check for deleted tasks here
        const completedTasks = oldTasks
          .filter(({ uid }) => !newTasks.find((task: Tasks) => task.uid === uid))
          .map(t => t.uid)

        // only animate one task because reflow screws the rest of them up
        if (completedTasks.length === 1) {
          const id = completedTasks[0]
          const boundingRect = positions.current.get(id);
          const effectLayer = document.getElementById("effects-layer");
          if (effectLayer && boundingRect) {
            const { top, left, width, height } = boundingRect;
            const effect = document.createElement("div");
            effect.classList.add("effect");
            Object.assign(effect.style, {
              width: `${width}px`,
              height: `${height}px`,
              top: `${top + window.scrollY}px`,
              left: `${left + window.scrollX}px`,
            });
            effectLayer.appendChild(effect);
            positions.current.delete(id);
            setTimeout(() => effect.remove(), 500)
          }
        }
        return newTasks;
      } else {
        return oldTasks;
      }
    })
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'highlight'
          }
        },
        blockquote: false,
      }),
      Blockquote.extend({
        priority: 100
      }),
      Focus.configure({
        mode: 'deepest',
      }),
      Link,
      Placeholder.configure({
        placeholder: "What's on your mind?",
      }),
      Typography,
      Image,
      TimedTask,
      TaskItem,
    ],
    content: load(),
    onCreate: ({ editor }) => refreshTasks(editor),
    // this triggers after reflow
    onTransaction: ({ editor }) => refreshPositions(editor),
    onUpdate: ({ editor }) => {
      document.documentElement.setAttribute('fade-in', 'false');
      refreshTasks(editor);
      save(editor.getJSON())
    }
  });

  // @ts-ignore
  window['tabspace'] = {
    dump: () => editor ? editor.getJSON() : null
  };

  useEffect(() => {
    const updateClosure = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key === 'blocks' && event.newValue !== null) {
        if (editor) {
          editor.commands.setContent(JSON.parse(event.newValue));
          refreshTasks(editor);
        }
      }
    };
    window.addEventListener('storage', updateClosure);
    return () => window.removeEventListener('storage', updateClosure);
  });

  const insertImage = (img: File) => {
    const reader = new FileReader();
    reader.addEventListener('load', (evt) => {
      if (evt.target && editor) {
        const uploaded_image = "" + evt.target.result;
        editor.chain().focus().setImage({ src: uploaded_image }).run()
      }
    });
    reader.readAsDataURL(img);
  }

  const handleDrop = (evt: DragEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    const fileList = evt.dataTransfer.files;
    if (fileList.length >= 1) {
      const file = fileList[0];
      insertImage(file);
    }
  }

  const handlePaste: ClipboardEventHandler<HTMLInputElement> = (evt) => {
    if (evt.clipboardData.files.length > 0) {
      const file = evt.clipboardData.files[0];
      insertImage(file);
    }
  }

  const handleInsertNewline = () => {
    if (editor) {
      editor.commands.focus('end')
      editor.commands.enter()
    }
  }

  if (!editor) {
    return null
  }

  return (
    <>
      <EditorContent onDrop={handleDrop} editor={editor} onPaste={handlePaste} id="editor" />
      <div className="newline-handle" onClick={handleInsertNewline}>
        <p>+ Click here to insert a new line</p>
      </div>
    </>
  )
}

export default Editor;
