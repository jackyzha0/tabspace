import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { load, save } from './storage';

const Editor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: load(),
    onUpdate: ({ editor }) => save(editor.getJSON())
  });

  useEffect(() => {
    const updateClosure = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;
      if (event.key === 'blocks' && event.newValue !== null) {
        if (editor) {
          editor.commands.setContent(JSON.parse(event.newValue));
        }
      }
    };
    window.addEventListener('storage', updateClosure);
    return () => window.removeEventListener('storage', updateClosure);
  }, [editor]);

  return (
    <EditorContent editor={editor} />
  )
}

export default Editor
