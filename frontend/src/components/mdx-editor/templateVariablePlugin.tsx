import React from 'react'
import { realmPlugin, Cell, Signal, createRootEditorSubscription$, addActivePlugin$, addToolbarItem$ } from '@mdxeditor/editor'
import { TemplateVariableToolbarButton } from './TemplateVariableToolbarButton'
import { TemplateVariableModal } from './TemplateVariableModal'

// Plugin state cells
export const isModalOpen$ = Cell(false)
export const selectedDataset$ = Cell<string | null>(null)
export const selectedJsonPath$ = Cell<string | null>(null)
export const currentPinId$ = Cell<string | null>(null)

// Plugin signals
export const openModal$ = Signal<boolean>((r) => {
  r.link(openModal$, isModalOpen$)
})

export const closeModal$ = Signal<boolean>((r) => {
  r.link(r.pipe(closeModal$, () => false), isModalOpen$)
})

export const insertVariable$ = Signal<string>((r) => {
  r.pub(createRootEditorSubscription$, (editor) => {
    return editor.registerCommand(
      'INSERT_TEXT_COMMAND',
      (text: string) => {
        // Insert template variable into editor
        editor.dispatchCommand('INSERT_TEXT_COMMAND', text)
        return true
      },
      1
    )
  })
})

export const setCurrentPinId$ = Signal<string | null>((r) => {
  r.link(setCurrentPinId$, currentPinId$)
})

export const templateVariablePlugin = realmPlugin({
  init(realm) {
    realm.pubIn({
      [addActivePlugin$]: 'templateVariable'
    })
  }
})
