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
import '@mdxeditor/editor/style.css'
import './mdx-editor-custom.css'

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  currentPinId,
  ...props
}: { 
  editorRef: ForwardedRef<MDXEditorMethods> | null
  currentPinId?: string | null
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
              <DiffSourceToggleWrapper>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2">
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
                    <TemplateVariableToolbarButton currentPinId={currentPinId} />
                  </div>
                  <ConditionalContents
                    options={[
                      { when: (editor) => editor?.editorType === 'codeblock', contents: () => <ChangeCodeMirrorLanguage /> },
                      { fallback: () => (<InsertCodeBlock />) }
                    ]}
                  />
                </div>
              </DiffSourceToggleWrapper>
            )
          })
        ]}
        {...props}
        ref={editorRef}
      />
    </>
  )
}
