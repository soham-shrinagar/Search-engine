const stages = [
  { label: 'URL', description: 'You submit a web address to index.' },
  { label: 'Download HTML', description: 'The crawler fetches the page content.' },
  { label: 'Extract Text', description: 'Headings and paragraphs are pulled from the HTML.' },
  { label: 'Tokenize', description: 'Text is split into searchable words.' },
  { label: 'Remove Stop Words', description: 'Common words like "the" and "and" are filtered out.' },
  { label: 'Generate Inverted Index', description: 'Each term is mapped to the pages where it appears.' },
  { label: 'Store in database', description: 'Pages, terms, and postings are saved to the database.' },
  { label: 'Ready for Search', description: 'The page can now appear in search results.' },
];

export default function CrawlPipeline() {
  return (
    <div className="card-flat">
      <h2 className="text-sm font-medium text-ink dark:text-ink-dark mb-1">
        What happens after you submit a URL?
      </h2>
      <p className="text-xs text-ink-muted dark:text-ink-dark-muted mb-5 leading-relaxed">
        Each step runs automatically — you only need to paste a link and click index.
      </p>
      <ol className="pipeline-list">
        {stages.map((stage, i) => (
          <li key={stage.label} className="pipeline-item">
            <div className="pipeline-marker">
              <span className="pipeline-dot" />
              {i < stages.length - 1 && <span className="pipeline-line" />}
            </div>
            <div className="pb-5 last:pb-0">
              <p className="text-sm font-medium text-ink dark:text-ink-dark">{stage.label}</p>
              <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-0.5 leading-relaxed">
                {stage.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
