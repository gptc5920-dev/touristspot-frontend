import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter/wght.css'
import { Provider as TooltipProvider } from '@radix-ui/react-tooltip'
import './index.css'
import App from './App.jsx'
import { SiteSettingsProvider } from './contexts/SiteSettingsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TooltipProvider delayDuration={350} skipDelayDuration={100}><SiteSettingsProvider><App /></SiteSettingsProvider></TooltipProvider>
  </StrictMode>,
)
