"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
    Bold, Italic, List, ListOrdered,
    Quote, Image as ImageIcon, Link as LinkIcon,
    Undo, Redo, Heading1, Heading2, Underline as UnderlineIcon,
    Code
} from 'lucide-react';
import React, { useRef } from 'react';

interface BlogEditorProps {
    content: string;
    onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) return null;

    const addLink = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setLink({ href: url }).run();
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                editor.chain().focus().setImage({ src: base64 }).run();
            };
            reader.readAsDataURL(file);
            e.target.value = ''; // Reset for consecutive identical file uploads
        }
    };

    return (
        <div className="flex flex-wrap gap-1 p-2 bg-[var(--muted)]/50 border-b border-[var(--border)] sticky top-0 z-10">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('bold') ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('italic') ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('underline') ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Underline"
            >
                <UnderlineIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-[var(--muted)]/80 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Heading 1"
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-[var(--muted)]/80 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('bulletList') ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('orderedList') ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Ordered List"
            >
                <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-[var(--muted)]/80 mx-1 self-center" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('blockquote') ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('code') ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Code"
            >
                <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-[var(--muted)]/80 mx-1 self-center" />
            <button
                type="button"
                onClick={addLink}
                className={`p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors ${editor.isActive('link') ? 'bg-[var(--muted)]/80 text-black' : 'text-[var(--muted-foreground)]'}`}
                title="Add Link"
            >
                <LinkIcon className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors text-[var(--muted-foreground)]"
                title="Add Image"
            >
                <ImageIcon className="w-4 h-4" />
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
            />
            <div className="flex-1" />
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors text-[var(--muted-foreground)]"
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="p-2 rounded-lg hover:bg-[var(--muted)]/80 transition-colors text-[var(--muted-foreground)]"
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </button>
        </div>
    );
};

export default function BlogEditor({ content, onChange }: BlogEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#FF2D78] underline',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl max-w-full h-auto my-8 border border-[var(--border)]',
                },
            }),
            Placeholder.configure({
                placeholder: 'Start writing your breakthrough strategy...',
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-slate max-w-none focus:outline-none min-h-[500px] px-8 py-10 prose-headings:font-black prose-p:font-medium prose-p:text-[var(--muted-foreground)] [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--border)]/70 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-[var(--muted-foreground)]',
            },
            handlePaste: (view, event) => {
                const items = Array.from(event.clipboardData?.items || []);
                for (const item of items) {
                    if (item.type.indexOf("image") === 0) {
                        const file = item.getAsFile();
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                const base64 = e.target?.result as string;
                                const node = view.state.schema.nodes.image.create({ src: base64 });
                                const transaction = view.state.tr.replaceSelectionWith(node);
                                view.dispatch(transaction);
                            };
                            reader.readAsDataURL(file);
                            return true; // prevent default paste
                        }
                    }
                }
                return false;
            },
            handleDrop: (view, event, slice, moved) => {
                if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
                    const file = event.dataTransfer.files[0];
                    if (file.type.indexOf("image") === 0) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const base64 = e.target?.result as string;
                            const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                            if (coordinates) {
                                const node = view.state.schema.nodes.image.create({ src: base64 });
                                const transaction = view.state.tr.insert(coordinates.pos, node);
                                view.dispatch(transaction);
                            }
                        };
                        reader.readAsDataURL(file);
                        return true;
                    }
                }
                return false;
            }
        },
    });

    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden focus-within:border-black transition-colors">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
