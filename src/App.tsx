import { Calendar } from './components/Calendar'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <Calendar />
    </ErrorBoundary>
  )
}

export default App
