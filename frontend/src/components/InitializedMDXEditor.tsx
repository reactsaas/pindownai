'use client'

import type { ForwardedRef } from 'react'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  codeBlockPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  toolbarPlugin,
  diffSourcePlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  BlockTypeSelect,
  DiffSourceToggleWrapper,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import './mdx-editor-custom.css'

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        // Essential plugins
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        codeBlockPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin(),
        tablePlugin(),
        diffSourcePlugin({ viewMode: 'rich-text' }),
        
        // Toolbar plugin with responsive layout
        toolbarPlugin({
          toolbarContents: () => (
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <DiffSourceToggleWrapper>
                <div className="flex items-center gap-1">
                  <UndoRedo />
                  <BlockTypeSelect />
                </div>
                <div className="flex items-center gap-1">
                  <BoldItalicUnderlineToggles />
                  <CodeToggle />
                </div>
                <div className="flex items-center gap-1">
                  <ListsToggle />
                  <CreateLink />
                </div>
                <div className="flex items-center gap-1">
                  <InsertImage />
                  <InsertTable />
                  <InsertThematicBreak />
                </div>
              </DiffSourceToggleWrapper>
            </div>
          )
        })
      ]}
      {...props}
      ref={editorRef}
    />
  )
}
