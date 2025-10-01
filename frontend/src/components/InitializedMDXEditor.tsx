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
  ConditionalContents,
  codeMirrorPlugin,
  ChangeCodeMirrorLanguage,
  InsertCodeBlock
} from '@mdxeditor/editor'
import { templateVariablePlugin } from './mdx-editor/templateVariablePlugin'
import { TemplateVariableToolbarButton } from './mdx-editor/TemplateVariableToolbarButton'
import { AIEditToolbarButton } from './mdx-editor/AIEditToolbarButton'
import '@mdxeditor/editor/style.css'
import './mdx-editor-custom.css'

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  currentPinId,
  onAIEdit,
  ...props
}: { 
  editorRef: ForwardedRef<MDXEditorMethods> | null
  currentPinId?: string | null
  onAIEdit?: (prompt: string, selectedDocs: any[], researchData: any[]) => void
} & MDXEditorProps) {
  return (
    <>
      <MDXEditor
        plugins={[
          // Essential plugins
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: 'JavaScript',
              ts: 'TypeScript',
              tsx: 'TSX',
              jsx: 'JSX',
              css: 'CSS',
              json: 'JSON',
              bash: 'Bash',
              python: 'Python',
              py: 'Python',
              html: 'HTML',
              xml: 'XML',
              sql: 'SQL',
              yaml: 'YAML',
              yml: 'YAML'
            }
          }),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          tablePlugin(),
          diffSourcePlugin({ viewMode: 'rich-text' }),
          
          // Template Variable Plugin
          templateVariablePlugin(),
          
          // Toolbar plugin with responsive layout
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 w-full">
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                
                {/* Lists - hide on very small screens */}
                <div className="hidden sm:flex">
                  <ListsToggle />
                </div>
                
                {/* Desktop: Show all tools (only on very large screens) */}
                <div className="hidden 2xl:flex items-center gap-1">
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <InsertThematicBreak />
                  <CodeToggle />
                  <ConditionalContents
                    options={[
                      { when: (editor) => editor?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
                      { fallback: () => (<InsertCodeBlock />) }
                    ]}
                  />
                </div>
                
                {/* Overflow menu (shows on most screens) */}
                <div className="2xl:hidden">
                  <details className="relative toolbar-overflow-menu">
                    <summary className="list-none cursor-pointer px-2 py-1 hover:bg-accent rounded transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline-block">
                        <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
                        <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                        <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
                      </svg>
                    </summary>
                    <div className="absolute top-full left-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-2 flex flex-col gap-1 z-50 min-w-[180px]">
                      {/* Lists - only show on small screens */}
                      <div className="sm:hidden toolbar-menu-item" onClick={(e) => { const btn = e.currentTarget.querySelector('button'); btn?.click(); }}>
                        <ListsToggle />
                        <span>Lists</span>
                      </div>
                      
                      <div className="toolbar-menu-item" onClick={(e) => { const btn = e.currentTarget.querySelector('button'); btn?.click(); }}>
                        <CreateLink />
                        <span>Link</span>
                      </div>
                      <div className="toolbar-menu-item" onClick={(e) => { const btn = e.currentTarget.querySelector('button'); btn?.click(); }}>
                        <InsertImage />
                        <span>Image</span>
                      </div>
                      <div className="toolbar-menu-item" onClick={(e) => { const btn = e.currentTarget.querySelector('button'); btn?.click(); }}>
                        <InsertTable />
                        <span>Table</span>
                      </div>
                      <div className="toolbar-menu-item" onClick={(e) => { const btn = e.currentTarget.querySelector('button'); btn?.click(); }}>
                        <InsertThematicBreak />
                        <span>Divider</span>
                      </div>
                      <div className="toolbar-menu-item" onClick={(e) => { const btn = e.currentTarget.querySelector('button'); btn?.click(); }}>
                        <CodeToggle />
                        <span>Code</span>
                      </div>
                      <div className="toolbar-menu-item" onClick={(e) => { const btn = e.currentTarget.querySelector('button'); btn?.click(); }}>
                        <ConditionalContents
                          options={[
                            { when: (editor) => editor?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
                            { fallback: () => (<InsertCodeBlock />) }
                          ]}
                        />
                        <span>Code Block</span>
                      </div>
                    </div>
                  </details>
                </div>
                
                <div className="flex items-center gap-1 ml-auto">
                  <TemplateVariableToolbarButton currentPinId={currentPinId} />
                  <AIEditToolbarButton onAIEdit={onAIEdit} />
                  <DiffSourceToggleWrapper>
                    <></>
                  </DiffSourceToggleWrapper>
                </div>
              </div>
            )
          })
        ]}
        {...props}
        ref={editorRef}
      />
    </>
  )
}
