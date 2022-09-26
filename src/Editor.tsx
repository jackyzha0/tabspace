import React, { ClipboardEventHandler, DragEvent, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import { Editor as TiptapEditor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { load, save } from './storage';
import './Editor.css';
import Focus from '@tiptap/extension-focus';
import Link from '@tiptap/extension-link';
import Typography from '@tiptap/extension-typography';
import Image from '@tiptap/extension-image';
import { TimedTask } from './tasks/TimedTask';

export interface Tasks {
  due: number, // JS date in milliseconds past epoch
  uid: string,
}

interface IEditor {
  setTasks: (cb: ((tasks: Tasks[]) => Tasks[])) => void,
}

const Editor = ({ setTasks }: IEditor) => {
  const refreshTasks = (editor: TiptapEditor) => {
    const newTasks: Tasks[] = []
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'text') {
        const timeMark = node.marks.find((mark) => mark.type.name === 'timedTask');
        if (timeMark !== undefined) {
          newTasks.push({ due: timeMark.attrs.time, uid: timeMark.attrs.uid })
        }
      }
    });

    setTasks((oldTasks: Tasks[]) => {
      if (JSON.stringify(oldTasks) !== JSON.stringify(newTasks)) {
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
        }
      }),
      Focus.configure({
        mode: 'deepest',
      }),
      Link.configure({
        protocols: ['mailto'],
      }),
      Typography,
      Image,
      TimedTask,
    ],
    content: load(),
    onCreate: ({ editor }) => refreshTasks(editor),
    onUpdate: ({ editor }) => {
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
  }, [editor]);

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

  if (!editor) {
    return null
  }

  return (
    <EditorContent onDrop={handleDrop} editor={editor} onPaste={handlePaste} />
  )
}

export default Editor;
