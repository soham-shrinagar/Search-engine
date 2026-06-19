import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const Landing = lazy(() => import('./pages/Landing'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CrawlManagement = lazy(() => import('./pages/CrawlManagement'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));
const Account = lazy(() => import('./pages/Account'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-4 h-4 border-2 border-ink/20 dark:border-ink-dark/30 border-t-ink dark:border-t-ink-dark rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookmarkProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-page dark:bg-page-dark">
              <Navbar />
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/crawl" element={<CrawlManagement />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                      path="/bookmarks"
                      element={(
                        <ProtectedRoute>
                          <Bookmarks />
                        </ProtectedRoute>
                      )}
                    />
                    <Route
                      path="/account"
                      element={(
                        <ProtectedRoute>
                          <Account />
                        </ProtectedRoute>
                      )}
                    />
                  </Routes>
                </Suspense>
              </main>
            </div>
          </BrowserRouter>
        </BookmarkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
