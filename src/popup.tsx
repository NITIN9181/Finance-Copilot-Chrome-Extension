/**
 * Extension Popup
 * 
 * Provides UI for:
 * - API key configuration
 * - Extension settings
 */

import { useState, useEffect } from "react"
import "./styles/globals.css"

function IndexPopup() {
  const [apiKey, setApiKey] = useState("")
  const [isConfigured, setIsConfigured] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    // Load API key status on mount
    loadApiKeyStatus()
  }, [])

  async function loadApiKeyStatus() {
    const result = await chrome.storage.local.get('nvidia_api_key')
    setIsConfigured(!!result.nvidia_api_key)
  }

  async function handleSave() {
    const trimmedKey = apiKey.trim()
    
    if (!trimmedKey) {
      setFeedback({ type: 'error', message: 'API key cannot be empty' })
      return
    }
    
    try {
      await chrome.storage.local.set({ 'nvidia_api_key': trimmedKey })
      setIsConfigured(true)
      setApiKey("")
      setFeedback({ type: 'success', message: 'API key saved successfully' })
    } catch (error) {
      setFeedback({ type: 'error', message: 'Failed to save API key' })
    }
  }

  return (
    <div className="w-80 p-4 bg-gray-900 text-white">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight mb-1">Finance Copilot</h1>
        <p className="text-sm text-gray-400">AI-powered financial analysis</p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          NVIDIA NIM API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          maxLength={512}
          placeholder="Enter your API key"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {isConfigured && (
          <p className="mt-2 text-sm text-green-400">✓ API Key Configured</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={!apiKey.trim()}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
      >
        Save API Key
      </button>

      {feedback && (
        <div className={`mt-3 p-2 rounded text-sm ${
          feedback.type === 'success' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
        }`}>
          {feedback.message}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-500">
          Get your API key from{' '}
          <a 
            href="https://build.nvidia.com/meta/llama-3_1-70b-instruct" 
            target="_blank"
            className="text-blue-400 hover:underline"
          >
            NVIDIA NIM
          </a>
        </p>
      </div>
    </div>
  )
}

export default IndexPopup
