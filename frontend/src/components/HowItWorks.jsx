const steps = [
  {
    number: 1,
    title: 'Submit URL',
    description: 'Provide a webpage that you want SearchSphere to crawl.',
  },
  {
    number: 2,
    title: 'Crawl & Index',
    description:
      'The crawler downloads the page, extracts readable text, tokenizes it, removes stop words, and stores an inverted index.',
  },
  {
    number: 3,
    title: 'Search',
    description: 'Search only across pages that have already been indexed.',
  },
  {
    number: 4,
    title: 'Rank Results',
    description: 'Results are ranked using TF-IDF and other relevance signals before being displayed.',
  },
];

function Arrow() {
  return (
    <div className="flex justify-center py-2 sm:py-0 sm:px-2 text-ink-faint dark:text-ink-dark-faint" aria-hidden>
      <svg className="w-5 h-5 sm:rotate-0 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section className="animate-fade-in">
      <h2 className="text-center text-sm font-medium text-ink dark:text-ink-dark mb-6 sm:mb-8">
        How it works
      </h2>
      <div className="flex flex-col sm:flex-row sm:items-stretch sm:justify-center gap-0 sm:gap-0">
        {steps.map((step, i) => (
          <div key={step.number} className="contents sm:flex sm:items-stretch">
            <div className="workflow-card flex-1 sm:max-w-[200px]">
              <span className="workflow-step-num">{step.number}</span>
              <h3 className="text-sm font-medium text-ink dark:text-ink-dark mt-3">{step.title}</h3>
              <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-2 leading-relaxed">
                {step.description}
              </p>
            </div>
            {i < steps.length - 1 && <Arrow />}
          </div>
        ))}
      </div>
    </section>
  );
}
