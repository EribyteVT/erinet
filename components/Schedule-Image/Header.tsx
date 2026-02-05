'use client'

import React from 'react'
import { Download, Save, FolderOpen, Loader2, Check } from 'lucide-react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'
export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'empty'

interface HeaderProps {
  onExport?: () => void
  onSave?: () => void
  onLoad?: () => void
  saveStatus?: SaveStatus
  loadStatus?: LoadStatus
  guildId?: string
}

export function Header({ onExport, onSave, onLoad, saveStatus = 'idle', loadStatus = 'idle', guildId }: HeaderProps) {
  const showTemplateButtons = true

  return (
    <header className="border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Schedule Image Builder</h1>
          <p className="text-sm text-muted-foreground">Create shareable stream schedules</p>
        </div>
        <div className="flex gap-2">
          {showTemplateButtons && (
            <>
              {/* Load Layout */}
              <button
                onClick={onLoad}
                disabled={loadStatus === 'loading'}
                className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-2"
              >
                {loadStatus === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : loadStatus === 'loaded' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <FolderOpen className="w-4 h-4" />
                )}
                {loadStatus === 'loading'
                  ? 'Loading…'
                  : loadStatus === 'loaded'
                  ? 'Loaded!'
                  : loadStatus === 'empty'
                  ? 'No Layout Saved'
                  : loadStatus === 'error'
                  ? 'Load Failed'
                  : 'Load Layout'}
              </button>

              {/* Save Layout */}
              <button
                onClick={onSave}
                disabled={saveStatus === 'saving'}
                className="px-4 py-2 rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 flex items-center gap-2"
              >
                {saveStatus === 'saving' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saveStatus === 'saved' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saveStatus === 'saving'
                  ? 'Saving…'
                  : saveStatus === 'saved'
                  ? 'Saved!'
                  : saveStatus === 'error'
                  ? 'Save Failed'
                  : 'Save Layout'}
              </button>
            </>
          )}

          {/* Export */}
          <button
            onClick={onExport}
            className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>
    </header>
  )
}