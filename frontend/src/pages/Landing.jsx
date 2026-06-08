import SearchBar from '../components/SearchBar';

const features = [
  {
    title: 'Crawl the web',
    desc: 'Submit any URL and we\'ll extract, clean, and index the content for you.',
  },
  {
    title: 'Ranked results',
    desc: 'Every search is scored with TF-IDF so the most relevant pages come first.',
  },
  {
    title: 'Search your way',
    desc: 'Phrase queries, boolean operators, and fuzzy matching — all built in.',
  },
];

export default function Landing() {
  return (
    <div className="max-w-2xl mx-auto px-5 pt-24 pb-20">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50 mb-3">
          SearchSphere
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-[15px] leading-relaxed">
          A clean, fast search engine — crawl pages, build an index, find what matters.
        </p>
      </div>

      <SearchBar large />

      <div className="mt-20 grid gap-4">
        {features.map((feature) => (
          <div key={feature.title} className="card p-5">
            <h3 className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-1.5">
              {feature.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
