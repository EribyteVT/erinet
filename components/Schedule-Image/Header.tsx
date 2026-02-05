'use client'

import React from 'react'
import { Download } from 'lucide-react'

interface HeaderProps {
  onExport?: () => void
}

export function Header({ onExport }: HeaderProps) {
  return (
    <header className="border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Schedule Image Builder</h1>
          <p className="text-sm text-muted-foreground">Create shareable stream schedules</p>
        </div>
        <div className="flex gap-2">
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