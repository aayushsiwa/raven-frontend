import { MobileApp } from './interfaces/mobile/MobileApp'
import { WebApp } from './interfaces/web/WebApp'

const DEFAULT_BASE_URL = 'http://localhost:8080'

function App() {
  return (
    <>
      <div className="web-shell">
        <WebApp defaultBaseUrl={DEFAULT_BASE_URL} />
      </div>
      <div className="mobile-shell-wrap">
        <MobileApp defaultBaseUrl={DEFAULT_BASE_URL} />
      </div>
    </>
  )
}

export default App
