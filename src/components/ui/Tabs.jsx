import { useState } from 'react'
import { cn } from '../../lib/utils'

export function Tabs({ tabs, defaultTab, onChange }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    onChange?.(tabId)
  }

  return (
    <div className="border-b border-gray-200">
      <nav className="flex gap-4 -mb-px overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'mr-2 py-0.5 px-2 rounded-full text-xs',
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}

export function TabsContent({ children, value, activeValue }) {
  if (value !== activeValue) return null
  return <div className="py-4">{children}</div>
}
