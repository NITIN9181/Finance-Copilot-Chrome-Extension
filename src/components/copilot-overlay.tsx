/**
 * Copilot Overlay Component
 * 
 * Main container for all copilot features:
 * - Flux Analysis
 * - Chat Interface
 * - Migration Modal
 */

import { useState } from "react"

interface CopilotOverlayProps {
  dataset: any // TODO: Type this properly
}

export function CopilotOverlay({ dataset }: CopilotOverlayProps) {
  const [activeTab, setActiveTab] = useState<'flux' | 'chat' | 'migration'>('flux')
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 w-96 max-h-[80vh] bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-[9999]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Finance Copilot</h2>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('flux')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'flux'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Analysis
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chat'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Ask AI
        </button>
        <button
          onClick={() => setActiveTab('migration')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'migration'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Migrate
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
        {activeTab === 'flux' && (
          <div className="text-gray-400">Flux Analysis - Coming Soon</div>
        )}
        {activeTab === 'chat' && (
          <div className="text-gray-400">Chat Interface - Coming Soon</div>
        )}
        {activeTab === 'migration' && (
          <div className="text-gray-400">Migration View - Coming Soon</div>
        )}
      </div>
    </div>
  )
}
