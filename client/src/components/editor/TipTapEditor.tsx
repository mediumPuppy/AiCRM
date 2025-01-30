import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '../ui/button';
import {
  IconBold,
  IconItalic,
  IconList,
  IconListNumbers,
  IconQuote,
  IconH1,
  IconH2,
  IconH3,
  IconSeparator,
  IconLink,
  IconUnlink,
} from '@tabler/icons-react';
import React from 'react';

interface TipTapEditorProps {
  content: string;
  onEditor: (editor: Editor | null) => void;
  className?: string;
}

export function TipTapEditor({ content, onEditor, className = '' }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'font-bold',
          },
        },
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/80 transition-colors',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        validate: href => /^https?:\/\//.test(href),
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article...',
        emptyEditorClass: 'cursor-text before:content-[attr(data-placeholder)] before:text-gray-400 before:float-left before:pointer-events-none',
      }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onEditor(editor);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none max-w-none min-h-[200px] h-full',
      },
    },
    autofocus: false,
    editable: true,
  });

  // Update editor content when content prop changes
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      const currentSelection = editor.state.selection;
      editor.commands.setContent(content || '<p></p>');
      // Restore cursor position
      editor.commands.setTextSelection(currentSelection.from);
    }
  }, [editor, content]);

  // Ensure editor stays editable and notify parent
  React.useEffect(() => {
    if (editor) {
      editor.setEditable(true);
      onEditor(editor);
    }
    return () => {
      onEditor(null);
    };
  }, [editor, onEditor]);

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
      return;
    }

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL', previousUrl);
    
    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className={`border rounded-lg flex flex-col ${className}`}>
      <div className="border-b bg-gray-50/80 p-2 flex flex-wrap gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-gray-200' : ''}
          title="Bold (Ctrl+B)"
        >
          <IconBold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-gray-200' : ''}
          title="Italic (Ctrl+I)"
        >
          <IconItalic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}
          title="Heading 1 (Ctrl+Alt+1)"
        >
          <IconH1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
          title="Heading 2 (Ctrl+Alt+2)"
        >
          <IconH2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}
          title="Heading 3 (Ctrl+Alt+3)"
        >
          <IconH3 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'bg-gray-200' : ''}
          title="Bullet List (Ctrl+Shift+8)"
        >
          <IconList className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'bg-gray-200' : ''}
          title="Numbered List (Ctrl+Shift+7)"
        >
          <IconListNumbers className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'bg-gray-200' : ''}
          title="Quote (Ctrl+Shift+B)"
        >
          <IconQuote className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <IconSeparator className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLink}
          className={editor.isActive('link') ? 'bg-gray-200' : ''}
          title="Add Link (Ctrl+K)"
        >
          {editor.isActive('link') ? (
            <IconUnlink className="h-4 w-4" />
          ) : (
            <IconLink className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex-1 p-4">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
} 