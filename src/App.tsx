import { useAuth } from './features/auth/useAuth'
import { MobileApp } from './interfaces/mobile/MobileApp'
import { OnboardingPage } from './interfaces/mobile/OnboardingPage'
import { WebApp } from './interfaces/web/WebApp'

const DEFAULT_BASE_URL = 'http://localhost:8080'

function App() {
  const auth = useAuth(DEFAULT_BASE_URL)

  return (
    <>
      <div className="web-shell">
        {auth.user ? (
          <WebApp defaultBaseUrl={DEFAULT_BASE_URL} username={auth.user.username} onLogout={auth.logout} />
        ) : (
          <OnboardingPage
            loading={auth.loading}
            errorText={auth.errorText}
            onLogin={auth.login}
            onSignup={auth.signup}
            onOAuth={auth.oauthLogin}
          />
        )}
      </div>
      <div className="mobile-shell-wrap">
        {auth.user ? (
          <MobileApp defaultBaseUrl={DEFAULT_BASE_URL} username={auth.user.username} onLogout={auth.logout} />
        ) : (
          <OnboardingPage
            loading={auth.loading}
            errorText={auth.errorText}
            onLogin={auth.login}
            onSignup={auth.signup}
            onOAuth={auth.oauthLogin}
          />
        )}
      </div>
    </>
  )
}

export default App
