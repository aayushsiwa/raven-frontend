import { useAuth } from './features/auth/useAuth';
import { useTheme } from './features/theme/useTheme';
import { MobileApp } from './interfaces/mobile/MobileApp';
import { OnboardingPage } from './interfaces/mobile/OnboardingPage';
import { WebApp } from './interfaces/web/WebApp';

const DEFAULT_BASE_URL = 'http://localhost:8080';

function App() {
  const auth = useAuth(DEFAULT_BASE_URL);
  const theme = useTheme();

  return (
    <>
      <div className="web-shell">
        {auth.user ? (
          <WebApp
            defaultBaseUrl={DEFAULT_BASE_URL}
            onLogout={auth.logout}
            savedArticles={auth.savedArticles}
            onSaveArticle={auth.saveArticleLocally}
            onRemoveSavedArticle={auth.removeLocalArticle}
            theme={theme}
          />
        ) : (
          <OnboardingPage
            loading={auth.loading}
            errorText={auth.errorText}
            onLogin={auth.login}
            onSignup={auth.signup}
            onOAuth={auth.oauthLogin}
            validateFields={auth.validateFields}
          />
        )}
      </div>
      <div className="mobile-shell-wrap">
        {auth.user ? (
          <MobileApp
            defaultBaseUrl={DEFAULT_BASE_URL}
            onLogout={auth.logout}
            savedArticles={auth.savedArticles}
            onSaveArticle={auth.saveArticleLocally}
            onRemoveSavedArticle={auth.removeLocalArticle}
            theme={theme}
          />
        ) : (
          <OnboardingPage
            loading={auth.loading}
            errorText={auth.errorText}
            onLogin={auth.login}
            onSignup={auth.signup}
            onOAuth={auth.oauthLogin}
            validateFields={auth.validateFields}
          />
        )}
      </div>
    </>
  );
}

export default App;
