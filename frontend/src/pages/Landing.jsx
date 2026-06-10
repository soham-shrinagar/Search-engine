import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import GettingStarted from '../components/GettingStarted';
import { crawlApi } from '../api/client';

const features = [
  {
    title: 'Crawl',
    desc: 'Paste a URL and pull pages into your index.',
    link: '/crawl',
    linkLabel: 'Add pages',
  },
  {
    title: 'Index',
    desc: 'See what got indexed and how it ranks.',
    link: '/dashboard',
    linkLabel: 'Dashboard',
  },
  {
    title: 'Search',
    desc: 'Look up anything you\'ve crawled.',
    link: '/search',
    linkLabel: 'Search',
  },
];

export default function Landing() {
  const [hasPages, setHasPages] = useState(null);

  useEffect(() => {
    crawlApi.getPages({ limit: 1 })
      .then((res) => setHasPages(res.data.data.length > 0))
      .catch(() => setHasPages(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 pt-14 pb-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 mb-3">
          SearchSphere
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-[15px] leading-relaxed max-w-md mx-auto">
          Crawl pages, build a search index, find stuff fast.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Link to="/register" className="btn-primary text-sm px-6">Sign up</Link>
          <Link to="/login" className="btn-secondary text-sm px-6">Sign in</Link>
        </div>
      </div>

      <SearchBar large />

      <p className="hint text-center mt-3">
        Only searches pages you&apos;ve added.{' '}
        <Link to="/crawl" className="underline underline-offset-2 hover:text-neutral-700 dark:hover:text-neutral-300">
          Crawl something first
        </Link>
      </p>

      {hasPages !== null && <GettingStarted hasPages={hasPages} />}

      <div className="mt-12 grid gap-3 sm:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.title}
            to={feature.link}
            className="card p-4 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
          >
            <h3 className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-1">
              {feature.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {feature.desc}
            </p>
            <span className="text-xs text-neutral-400 mt-3 inline-block">
              {feature.linkLabel} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
