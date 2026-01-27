/**
 * Copyright (c) 2026 Savour. All Rights Reserved.
 *
 * This software and associated documentation files are proprietary and confidential.
 * Unauthorized copying, distribution, modification, or use of this software,
 * via any medium, is strictly prohibited without express written permission from Savour.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'katex/dist/katex.min.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
