const stages = [
  'URL',
  'Download HTML',
  'Extract Text',
  'Tokenize',
  'Remove Stop Words',
  'Generate Inverted Index',
  'Store in database',
  'Ready for Search',
];

export default function CrawlPipeline() {
  return (
    <div className="card-flat">
      <h2 className="text-sm font-medium text-ink dark:text-ink-dark mb-4">
        What happens after you submit a URL
      </h2>
      <ol className="pipeline-list">
        {stages.map((label, i) => (
          <li key={label} className="pipeline-item">
            <div className="pipeline-marker">
              <span className="pipeline-dot" />
              {i < stages.length - 1 && <span className="pipeline-line" />}
            </div>
            <div className="pb-5 last:pb-0">
              <p className="text-sm font-medium text-ink dark:text-ink-dark">{label}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
