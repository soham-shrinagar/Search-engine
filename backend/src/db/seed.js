require('dotenv').config();
const { query, pool } = require('../config/database');
const { crawlRecursive } = require('../services/crawler');
const { getStorageStats, formatStorageLine } = require('./storage');

const BATCH_SIZE = 3;
const WIKI_DOMAIN = 'en.wikipedia.org';
const MAX_WIKI_SHARE = 0.48;

const DEFAULT_ORDER = [
  'tourism',
  'books',
  'india',
  'gk',
  'tech',
  'arxiv',
  'sports',
  'culture',
  'nature',
  'lifestyle',
  'wikipedia',
];

const INDEXES = {
  sports: {
    label: 'Sports',
    target: 12000,
    primaryDomain: WIKI_DOMAIN,
    wikiHeavy: true,
    delayMs: 500,
    maxDepth: 2,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://en.wikipedia.org/wiki/Category:Sport',
      'https://en.wikipedia.org/wiki/Category:Sports',
      'https://en.wikipedia.org/wiki/Category:Football',
      'https://en.wikipedia.org/wiki/Category:Association_football',
      'https://en.wikipedia.org/wiki/Category:Cricket',
      'https://en.wikipedia.org/wiki/Category:Tennis',
      'https://en.wikipedia.org/wiki/Category:Basketball',
      'https://en.wikipedia.org/wiki/Category:Baseball',
      'https://en.wikipedia.org/wiki/Category:Olympic_sports',
      'https://en.wikipedia.org/wiki/Category:Combat_sports',
      'https://en.wikipedia.org/wiki/Category:Motor_racing',
      'https://en.wikipedia.org/wiki/Category:Golf',
      'https://en.wikipedia.org/wiki/Category:Swimming',
      'https://en.wikipedia.org/wiki/Category:Athletics_(track_and_field)',
      'https://en.wikipedia.org/wiki/Category:Badminton',
      'https://en.wikipedia.org/wiki/Category:Volleyball',
      'https://en.wikipedia.org/wiki/Category:Hockey',
      'https://en.wikipedia.org/wiki/Category:Rugby_union',
      'https://en.wikipedia.org/wiki/Category:Boxing',
      'https://en.wikipedia.org/wiki/Category:Wrestling',
      'https://en.wikipedia.org/wiki/FIFA_World_Cup',
      'https://en.wikipedia.org/wiki/Cricket_World_Cup',
      'https://en.wikipedia.org/wiki/Olympic_Games',
      'https://en.wikipedia.org/wiki/UEFA_Champions_League',
      'https://en.wikipedia.org/wiki/Premier_League',
      'https://en.wikipedia.org/wiki/National_Football_League',
      'https://en.wikipedia.org/wiki/Formula_One',
      'https://en.wikipedia.org/wiki/Wimbledon_Championships',
      'https://en.wikipedia.org/wiki/Tour_de_France',
      'https://en.wikipedia.org/wiki/Super_Bowl',
      'https://www.olympics.com/en/sports',
    ],
  },
  tourism: {
    label: 'Tourism & Travel',
    target: 25000,
    primaryDomain: 'en.wikivoyage.org',
    wikiHeavy: false,
    delayMs: 500,
    maxDepth: 3,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://en.wikivoyage.org/wiki/Main_Page',
      'https://en.wikivoyage.org/wiki/Travel_topics',
      'https://en.wikivoyage.org/wiki/Category:Countries',
      'https://en.wikivoyage.org/wiki/Category:Continents',
      'https://en.wikivoyage.org/wiki/Category:Asia',
      'https://en.wikivoyage.org/wiki/Category:Europe',
      'https://en.wikivoyage.org/wiki/Category:North_America',
      'https://en.wikivoyage.org/wiki/Category:South_America',
      'https://en.wikivoyage.org/wiki/Category:Africa',
      'https://en.wikivoyage.org/wiki/Category:Oceania',
      'https://en.wikivoyage.org/wiki/India',
      'https://en.wikivoyage.org/wiki/Paris',
      'https://en.wikivoyage.org/wiki/London',
      'https://en.wikivoyage.org/wiki/New_York_City',
      'https://en.wikivoyage.org/wiki/Tokyo',
      'https://en.wikivoyage.org/wiki/Dubai',
      'https://en.wikivoyage.org/wiki/Bali',
      'https://en.wikivoyage.org/wiki/Goa',
      'https://en.wikivoyage.org/wiki/Switzerland',
      'https://en.wikivoyage.org/wiki/Thailand',
      'https://en.wikivoyage.org/wiki/Italy',
      'https://en.wikivoyage.org/wiki/Spain',
      'https://en.wikivoyage.org/wiki/Egypt',
      'https://en.wikivoyage.org/wiki/Maldives',
      'https://en.wikivoyage.org/wiki/Singapore',
      'https://en.wikivoyage.org/wiki/Sydney',
      'https://en.wikivoyage.org/wiki/Rome',
      'https://en.wikivoyage.org/wiki/Barcelona',
      'https://en.wikivoyage.org/wiki/Amsterdam',
      'https://en.wikivoyage.org/wiki/Istanbul',
      'https://en.wikivoyage.org/wiki/Hong_Kong',
      'https://en.wikivoyage.org/wiki/Las_Vegas',
      'https://en.wikivoyage.org/wiki/Cancún',
      'https://en.wikivoyage.org/wiki/Kathmandu',
      'https://en.wikivoyage.org/wiki/Category:National_parks',
      'https://en.wikivoyage.org/wiki/Category:Itineraries',
    ],
  },
  india: {
    label: 'India (Sports, Travel, GK)',
    target: 18000,
    primaryDomain: 'en.wikivoyage.org',
    wikiHeavy: false,
    delayMs: 500,
    maxDepth: 3,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://en.wikivoyage.org/wiki/India',
      'https://en.wikivoyage.org/wiki/Mumbai',
      'https://en.wikivoyage.org/wiki/Delhi',
      'https://en.wikivoyage.org/wiki/Bangalore',
      'https://en.wikivoyage.org/wiki/Chennai',
      'https://en.wikivoyage.org/wiki/Kolkata',
      'https://en.wikivoyage.org/wiki/Hyderabad',
      'https://en.wikivoyage.org/wiki/Jaipur',
      'https://en.wikivoyage.org/wiki/Agra',
      'https://en.wikivoyage.org/wiki/Kerala',
      'https://en.wikivoyage.org/wiki/Rajasthan',
      'https://en.wikivoyage.org/wiki/Goa',
      'https://en.wikipedia.org/wiki/Indian_Premier_League',
      'https://en.wikipedia.org/wiki/India_national_cricket_team',
      'https://en.wikipedia.org/wiki/Bollywood',
      'https://en.wikipedia.org/wiki/Category:Festivals_of_India',
      'https://en.wikipedia.org/wiki/Category:Indian_cuisine',
      'https://en.wikipedia.org/wiki/Category:Tourist_attractions_in_India',
      'https://en.wikipedia.org/wiki/Category:States_and_union_territories_of_India',
      'https://simple.wikipedia.org/wiki/India',
      'https://simple.wikipedia.org/wiki/Mumbai',
      'https://simple.wikipedia.org/wiki/Delhi',
    ],
  },
  gk: {
    label: 'General Knowledge',
    target: 18000,
    primaryDomain: 'simple.wikipedia.org',
    wikiHeavy: false,
    delayMs: 500,
    maxDepth: 3,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://simple.wikipedia.org/wiki/Main_Page',
      'https://simple.wikipedia.org/wiki/Category:Geography',
      'https://simple.wikipedia.org/wiki/Category:History',
      'https://simple.wikipedia.org/wiki/Category:Science',
      'https://simple.wikipedia.org/wiki/Category:Animals',
      'https://simple.wikipedia.org/wiki/Category:Countries',
      'https://simple.wikipedia.org/wiki/Category:People',
      'https://simple.wikipedia.org/wiki/Category:Food',
      'https://simple.wikipedia.org/wiki/Category:Technology',
      'https://simple.wikipedia.org/wiki/Category:Culture',
      'https://en.wikipedia.org/wiki/Lists_of_topics',
      'https://en.wikipedia.org/wiki/List_of_countries',
      'https://en.wikipedia.org/wiki/List_of_capitals',
      'https://en.wikipedia.org/wiki/List_of_largest_cities',
      'https://en.wikipedia.org/wiki/List_of_Nobel_laureates',
      'https://en.wikipedia.org/wiki/List_of_presidents_of_the_United_States',
      'https://en.wikipedia.org/wiki/List_of_prime_ministers_of_India',
      'https://en.wikipedia.org/wiki/List_of_elements',
      'https://en.wikipedia.org/wiki/List_of_planets',
      'https://en.wikipedia.org/wiki/List_of_World_Heritage_Sites',
      'https://en.wikipedia.org/wiki/Portal:Current_events',
      'https://en.wikipedia.org/wiki/Category:Trivia',
      'https://en.wikipedia.org/wiki/Category:Records',
      'https://en.wikiquote.org/wiki/Main_Page',
      'https://en.wikiquote.org/wiki/Category:People',
    ],
  },
  culture: {
    label: 'Culture & Festivals',
    target: 12000,
    primaryDomain: WIKI_DOMAIN,
    wikiHeavy: true,
    delayMs: 500,
    maxDepth: 2,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://en.wikipedia.org/wiki/Category:Festivals',
      'https://en.wikipedia.org/wiki/Category:World_Heritage_Sites',
      'https://en.wikipedia.org/wiki/Category:Museums',
      'https://en.wikipedia.org/wiki/Category:Monuments_and_memorials',
      'https://en.wikipedia.org/wiki/Category:Art',
      'https://en.wikipedia.org/wiki/Category:Sculpture',
      'https://en.wikipedia.org/wiki/Category:Architecture',
      'https://en.wikipedia.org/wiki/Category:Opera',
      'https://en.wikipedia.org/wiki/Category:Ballet',
      'https://en.wikipedia.org/wiki/Category:Folk_music',
      'https://en.wikipedia.org/wiki/Category:Holidays',
      'https://en.wikipedia.org/wiki/Category:Traditions',
      'https://en.wikipedia.org/wiki/Category:Religion',
      'https://en.wikipedia.org/wiki/Category:Mythology',
      'https://en.wikipedia.org/wiki/Category:Archaeological_sites',
    ],
  },
  nature: {
    label: 'Nature & Wildlife',
    target: 12000,
    primaryDomain: 'simple.wikipedia.org',
    wikiHeavy: true,
    delayMs: 500,
    maxDepth: 2,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://en.wikipedia.org/wiki/Category:Animals',
      'https://en.wikipedia.org/wiki/Category:Mammals',
      'https://en.wikipedia.org/wiki/Category:Birds',
      'https://en.wikipedia.org/wiki/Category:Fish',
      'https://en.wikipedia.org/wiki/Category:Plants',
      'https://en.wikipedia.org/wiki/Category:Trees',
      'https://en.wikipedia.org/wiki/Category:Flowers',
      'https://en.wikipedia.org/wiki/Category:National_parks',
      'https://en.wikipedia.org/wiki/Category:Mountains',
      'https://en.wikipedia.org/wiki/Category:Rivers',
      'https://en.wikipedia.org/wiki/Category:Lakes',
      'https://en.wikipedia.org/wiki/Category:Oceans',
      'https://en.wikipedia.org/wiki/Category:Deserts',
      'https://en.wikipedia.org/wiki/Category:Forests',
      'https://en.wikipedia.org/wiki/Category:Endangered_species',
      'https://en.wikipedia.org/wiki/Category:Natural_disasters',
      'https://simple.wikipedia.org/wiki/Category:Animals',
      'https://simple.wikipedia.org/wiki/Category:Plants',
    ],
  },
  books: {
    label: 'Books & Recipes (Wikibooks)',
    target: 15000,
    primaryDomain: 'en.wikibooks.org',
    wikiHeavy: false,
    delayMs: 500,
    maxDepth: 3,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://en.wikibooks.org/wiki/Cookbook',
      'https://en.wikibooks.org/wiki/Cookbook:Cuisine',
      'https://en.wikibooks.org/wiki/Cookbook:Appetizers',
      'https://en.wikibooks.org/wiki/Cookbook:Main_dishes',
      'https://en.wikibooks.org/wiki/Cookbook:Desserts',
      'https://en.wikibooks.org/wiki/Cookbook:Beverages',
      'https://en.wikibooks.org/wiki/Cookbook:Indian_cuisine',
      'https://en.wikibooks.org/wiki/Cookbook:Italian_cuisine',
      'https://en.wikibooks.org/wiki/Cookbook:Chinese_cuisine',
      'https://en.wikibooks.org/wiki/Cookbook:Mexican_cuisine',
      'https://en.wikibooks.org/wiki/Cookbook:Vegetarian_recipes',
      'https://en.wikibooks.org/wiki/Cookbook:Baking',
      'https://en.wikibooks.org/wiki/Category:Cookbook',
      'https://en.wikibooks.org/wiki/Category:Recipes',
    ],
  },
  lifestyle: {
    label: 'Lifestyle & Entertainment',
    target: 12000,
    primaryDomain: WIKI_DOMAIN,
    wikiHeavy: true,
    delayMs: 500,
    maxDepth: 2,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://en.wikipedia.org/wiki/Category:Food_and_drink',
      'https://en.wikipedia.org/wiki/Category:Cooking',
      'https://en.wikipedia.org/wiki/Category:Recipes',
      'https://en.wikipedia.org/wiki/Category:Fashion',
      'https://en.wikipedia.org/wiki/Category:Films',
      'https://en.wikipedia.org/wiki/Category:Television',
      'https://en.wikipedia.org/wiki/Category:Music',
      'https://en.wikipedia.org/wiki/Category:Video_games',
      'https://en.wikipedia.org/wiki/Category:Entertainment',
      'https://en.wikipedia.org/wiki/Category:Comics',
      'https://en.wikipedia.org/wiki/Category:Celebrities',
      'https://en.wikipedia.org/wiki/Category:Restaurants',
      'https://en.wikipedia.org/wiki/Category:Cuisine',
      'https://en.wikipedia.org/wiki/Category:Dance',
      'https://en.wikipedia.org/wiki/Category:Theatre',
      'https://en.wikipedia.org/wiki/Category:Photography',
      'https://en.wikipedia.org/wiki/Category:Beauty',
      'https://en.wikipedia.org/wiki/Category:Health',
      'https://en.wikipedia.org/wiki/Category:Fitness',
      'https://en.wikipedia.org/wiki/Category:Pets',
      'https://en.wikipedia.org/wiki/Category:Board_games',
      'https://en.wikipedia.org/wiki/Category:Card_games',
      'https://en.wikipedia.org/wiki/Category:Anime',
      'https://en.wikipedia.org/wiki/Category:Streaming_media',
      'https://en.wikipedia.org/wiki/Category:Reality_television',
      'https://en.wikipedia.org/wiki/Category:Hobbies',
      'https://en.wikipedia.org/wiki/Category:Yoga',
      'https://en.wikipedia.org/wiki/Category:Meditation',
    ],
  },
  wikipedia: {
    label: 'Encyclopedia (Science & History)',
    target: 8000,
    primaryDomain: WIKI_DOMAIN,
    wikiHeavy: true,
    delayMs: 700,
    maxDepth: 2,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://en.wikipedia.org/wiki/Category:Science',
      'https://en.wikipedia.org/wiki/Category:History',
      'https://en.wikipedia.org/wiki/Category:Geography',
      'https://en.wikipedia.org/wiki/Category:Mathematics',
      'https://en.wikipedia.org/wiki/Category:Physics',
      'https://en.wikipedia.org/wiki/Category:Chemistry',
      'https://en.wikipedia.org/wiki/Category:Biology',
      'https://en.wikipedia.org/wiki/Category:Medicine',
      'https://en.wikipedia.org/wiki/Category:Politics',
      'https://en.wikipedia.org/wiki/Category:Economics',
      'https://en.wikipedia.org/wiki/Category:Philosophy',
      'https://en.wikipedia.org/wiki/Category:Psychology',
      'https://en.wikipedia.org/wiki/Category:Engineering',
      'https://en.wikipedia.org/wiki/Category:Astronomy',
      'https://en.wikipedia.org/wiki/Category:Biography',
      'https://en.wikipedia.org/wiki/Category:Countries',
      'https://en.wikipedia.org/wiki/Category:Cities',
      'https://en.wikipedia.org/wiki/Category:Religion',
      'https://en.wikipedia.org/wiki/Category:Law',
      'https://en.wikipedia.org/wiki/Category:Education',
    ],
  },
  tech: {
    label: 'Technical Content',
    target: 12000,
    primaryDomain: 'developer.mozilla.org',
    wikiHeavy: false,
    delayMs: 350,
    maxDepth: 3,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      'https://developer.mozilla.org/en-US/docs/Web/HTML',
      'https://developer.mozilla.org/en-US/docs/Web/CSS',
      'https://developer.mozilla.org/en-US/docs/Learn',
      'https://developer.mozilla.org/en-US/docs/Web/API',
      'https://react.dev/learn',
      'https://nodejs.org/en/docs/guides',
      'https://www.postgresql.org/docs/current/',
      'https://docs.python.org/3/tutorial/',
      'https://vitejs.dev/guide/',
    ],
  },
  arxiv: {
    label: 'Research Papers',
    target: 6000,
    primaryDomain: 'arxiv.org',
    wikiHeavy: false,
    maxDepth: 2,
    maxPagesPerSeed: BATCH_SIZE,
    seeds: [
      'https://arxiv.org/list/cs.AI/recent?show=200',
      'https://arxiv.org/list/cs.LG/recent?show=200',
      'https://arxiv.org/list/cs.CL/recent?show=200',
      'https://arxiv.org/list/cs.CV/recent?show=200',
    ],
  },
};

function buildDefaultTargets() {
  const targets = {};
  for (const [key, config] of Object.entries(INDEXES)) {
    targets[key] = config.target;
  }
  return targets;
}

function parseArgs() {
  const opts = {
    indexes: [...DEFAULT_ORDER],
    targets: buildDefaultTargets(),
    sequential: false,
  };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg === '--only') opts.indexes = process.argv[++i].split(',').map((s) => s.trim());
    else if (arg === '--sequential') opts.sequential = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg.startsWith('--') && INDEXES[arg.slice(2)]) {
      const key = arg.slice(2);
      opts.targets[key] = parseInt(process.argv[++i], 10);
    }
  }

  return opts;
}

async function getIndexedCount() {
  const result = await query(
    "SELECT COUNT(*)::int AS count FROM pages WHERE crawl_status = 'indexed'"
  );
  return result.rows[0].count;
}

async function getDomainCounts() {
  const result = await query(`
    SELECT substring(url from 'https?://([^/]+)') AS domain,
           COUNT(*)::int AS count
    FROM pages WHERE crawl_status = 'indexed'
    GROUP BY 1 ORDER BY count DESC
  `);
  const counts = {};
  let total = 0;
  for (const row of result.rows) {
    counts[row.domain] = row.count;
    total += row.count;
  }
  return { counts, total };
}

function pickDiverseOrder(dueKeys, domainCounts, total) {
  const wikiShare = total > 0 ? (domainCounts[WIKI_DOMAIN] || 0) / total : 0;

  return [...dueKeys].sort((a, b) => {
    const configA = INDEXES[a];
    const configB = INDEXES[b];
    const aPaused = wikiShare > MAX_WIKI_SHARE && configA.wikiHeavy;
    const bPaused = wikiShare > MAX_WIKI_SHARE && configB.wikiHeavy;
    if (aPaused !== bPaused) return aPaused ? 1 : -1;

    const shareA = total > 0 ? (domainCounts[configA.primaryDomain] || 0) / total : 0;
    const shareB = total > 0 ? (domainCounts[configB.primaryDomain] || 0) / total : 0;
    return shareA - shareB;
  });
}

async function logDomainMix(prefix = '') {
  const { counts, total } = await getDomainCounts();
  if (total === 0) return;
  const top = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([d, n]) => `${d} ${n} (${((n / total) * 100).toFixed(0)}%)`)
    .join(', ');
  const wikiPct = (((counts[WIKI_DOMAIN] || 0) / total) * 100).toFixed(0);
  console.log(`${prefix}Domain mix (${total} pages): ${top} | wiki cap ${MAX_WIKI_SHARE * 100}% now ${wikiPct}%`);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

let storageCapHit = false;
let lastStorageStats = null;

function createStorageChecker(intervalMs = 45000) {
  let lastCheck = 0;
  let pagesSinceCheck = 0;
  const checkEveryPages = 15;

  return async function checkStorageCap(context) {
    pagesSinceCheck++;
    const now = Date.now();
    if (
      lastStorageStats?.atCap ||
      (now - lastCheck < intervalMs && pagesSinceCheck < checkEveryPages && lastStorageStats)
    ) {
      return !storageCapHit;
    }

    lastCheck = now;
    pagesSinceCheck = 0;

    const stats = await getStorageStats();
    lastStorageStats = stats;

    if (stats.atCap) {
      storageCapHit = true;
      console.warn(`\n⚠ Storage cap reached during ${context}.`);
      console.warn(formatStorageLine(stats));
      console.warn('Stopping seed to stay within Neon free-tier limits.\n');
      return false;
    }
    return true;
  };
}

async function logStorage(prefix = '') {
  const stats = await getStorageStats();
  console.log(`${prefix}${formatStorageLine(stats)}`);
  return stats;
}

function initIndexState(indexKeys, targets) {
  const state = {};
  for (const key of indexKeys) {
    const config = INDEXES[key];
    if (!config || !targets[key] || targets[key] <= 0) continue;
    state[key] = {
      target: targets[key],
      indexed: 0,
      seedIndex: 0,
      staleSeeds: 0,
    };
  }
  return state;
}

function isIndexActive(state, key) {
  const s = state[key];
  return s && s.indexed < s.target && s.staleSeeds < INDEXES[key].seeds.length * 3;
}

async function runOneBatch(key, indexState, checkStorageCap) {
  const config = INDEXES[key];
  const s = indexState[key];
  if (!config || !s) return 0;

  if (!(await checkStorageCap(`${config.label} batch`))) return 0;

  const seed = config.seeds[s.seedIndex % config.seeds.length];
  const remaining = s.target - s.indexed;
  const batchSize = Math.min(config.maxPagesPerSeed, remaining);

  await logStorage(`[${config.label}] `);
  console.log(
    `[${config.label}] Seed ${s.seedIndex + 1}/${config.seeds.length}: ${seed} ` +
      `(batch ${batchSize}, ${s.indexed}/${s.target})`
  );

  let newPages = 0;

  try {
    const before = await getIndexedCount();
    const { summary } = await crawlRecursive(seed, {
      maxDepth: config.maxDepth,
      maxPages: batchSize,
      sameDomainOnly: true,
      delayMs: config.delayMs,
      shouldContinue: () => checkStorageCap('crawl'),
    });

    const after = await getIndexedCount();
    newPages = after - before;
    s.indexed += newPages;

    console.log(
      `[${config.label}] Done — indexed: ${summary.indexed}, skipped: ${summary.skipped}, ` +
        `failed: ${summary.failed}, new: ${newPages}`
    );

    if (newPages === 0 && summary.indexed === 0) {
      s.staleSeeds++;
      console.log(`[${config.label}] No new pages, rotating to next seed…`);
    } else {
      s.staleSeeds = 0;
    }
  } catch (err) {
    console.error(`[${config.label}] Seed failed (${seed}): ${err.message}`);
    s.staleSeeds++;
    if (/Connection terminated|ECONNRESET|socket hang up/i.test(err.message)) {
      console.warn(`[${config.label}] DB disconnect — waiting 5s before next batch…`);
      await sleep(5000);
    }
  }

  s.seedIndex++;
  await sleep(1500);
  return newPages;
}

async function runDiverseSeed(indexKeys, targets) {
  const state = initIndexState(indexKeys, targets);
  const activeKeys = indexKeys.filter((k) => state[k]);
  const checkStorageCap = createStorageChecker();

  if (activeKeys.length === 0) return;

  console.log('\n=== Diversity-first seeding ===');
  console.log(`Non-Wikipedia sources first. Wiki-heavy buckets pause above ${MAX_WIKI_SHARE * 100}% share.`);
  console.log(`${BATCH_SIZE} pages per batch, storage cap enforced.\n`);
  await logDomainMix('Start — ');

  let round = 0;
  while (!storageCapHit) {
    const due = activeKeys.filter((k) => isIndexActive(state, k));
    if (due.length === 0) break;

    round++;
    const { counts, total } = await getDomainCounts();
    const order = pickDiverseOrder(due, counts, total);

    console.log(`\n--- Round ${round} ---`);
    await logDomainMix('');

    for (const key of order) {
      if (storageCapHit) break;
      const config = INDEXES[key];
      const wikiShare = total > 0 ? (counts[WIKI_DOMAIN] || 0) / total : 0;
      if (wikiShare > MAX_WIKI_SHARE && config.wikiHeavy) {
        console.log(`[${config.label}] Skipped — Wikipedia at ${(wikiShare * 100).toFixed(0)}%, boosting other topics`);
        continue;
      }
      await runOneBatch(key, state, checkStorageCap);
    }
  }

  for (const key of activeKeys) {
    const s = state[key];
    console.log(`[${INDEXES[key].label}] Total this run: ${s.indexed} pages`);
  }
}

async function runIndexSequential(key, targetPages) {
  const config = INDEXES[key];
  if (!config) {
    console.error(`Unknown index: ${key}`);
    return 0;
  }

  const checkStorageCap = createStorageChecker();

  console.log(`\n=== ${config.label} (target: ${targetPages.toLocaleString()} pages) ===`);

  const state = { [key]: { target: targetPages, indexed: 0, seedIndex: 0, staleSeeds: 0 } };

  while (state[key].indexed < targetPages && !storageCapHit && isIndexActive(state, key)) {
    await runOneBatch(key, state, checkStorageCap);
  }

  return state[key].indexed;
}

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    console.log(`
SearchSphere database seeder

Usage:
  npm run seed
  npm run seed -- --only sports,tourism,gk
  npm run seed -- --sports 5000 --tourism 5000

Indexes (diversity-first order):
  tourism, books, india, gk, tech, arxiv, sports, culture, nature, lifestyle, wikipedia

Options:
  --only a,b,c    Run only listed indexes
  --sports N      Target pages per index (--tourism, --gk, etc.)
  --sequential    Finish one index before the next (default: round-robin)

Storage (Neon free tier):
  NEON_STORAGE_LIMIT_MB=512
  SEED_MAX_FILL_PERCENT=83
`);
    process.exit(0);
  }

  const targets = opts.targets;
  const totalTarget = opts.indexes.reduce((sum, k) => sum + (targets[k] || 0), 0);

  console.log('SearchSphere seed starting…');
  console.log(`Database: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}`);
  console.log(`Indexes: ${opts.indexes.join(', ')}`);
  console.log(`Mode: ${opts.sequential ? 'sequential' : 'round-robin (diverse)'}`);
  console.log(`Total target: ~${totalTarget.toLocaleString()} pages`);
  await logStorage('Neon storage cap: ');
  console.log('Seeding stops automatically at the storage cap.\n');

  const startTotal = await getIndexedCount();
  console.log(`Currently indexed: ${startTotal} pages`);

  if (opts.sequential) {
    for (const key of opts.indexes) {
      if (storageCapHit) break;
      const target = targets[key];
      if (!target || target <= 0) continue;
      await runIndexSequential(key, target);
    }
  } else {
    await runDiverseSeed(opts.indexes, targets);
  }

  const endTotal = await getIndexedCount();
  await logStorage('Final: ');
  await logDomainMix('Final — ');

  if (storageCapHit) {
    console.log(
      `\nSeed stopped at storage cap. Indexed ${endTotal} pages (+${endTotal - startTotal} this run).`
    );
  } else {
    console.log(`\nSeed complete. Total indexed pages: ${endTotal} (+${endTotal - startTotal} this run)`);
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => pool.end());
