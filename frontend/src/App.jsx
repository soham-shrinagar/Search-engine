import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import Navbar from './components/Navbar';

const Landing = lazy(() => import('./pages/Landing'));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CrawlManagement = lazy(() => import('./pages/CrawlManagement'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Bookmarks = lazy(() => import('./pages/Bookmarks'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-5 h-5 border-2 border-neutral-950 dark:border-neutral-50 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookmarkProvider>
          <BrowserRouter>
            <Navbar />
            <main>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/crawl" element={<CrawlManagement />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                </Routes>
              </Suspense>
            </main>
          </BrowserRouter>
        </BookmarkProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
