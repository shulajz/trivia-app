const pickRandom = (items, count) => {
  const copy = [...items];
  const picked = [];

  while (picked.length < count && copy.length > 0) {
    const index = Math.floor(Math.random() * copy.length);
    picked.push(copy.splice(index, 1)[0]);
  }

  return picked;
};

const categoryFocusPools = {
  History: [
    'ancient civilizations (Egypt, Greece, Rome, Mesopotamia)',
    'medieval and Renaissance Europe',
    'colonialism and independence movements',
    '20th-century events outside the most common WWII questions',
    'Middle Eastern and Islamic history',
    'Asian history (China, Japan, India, Korea)',
    'African history',
    'Latin American history',
    'women and social movements in history',
    'scientific discoveries and their historical context',
    'economic history and trade routes',
    'cold War era (beyond the most cliché facts)',
  ],
  Geography: [
    'world capitals and major cities',
    'rivers, lakes, and bodies of water',
    'mountains and natural landmarks',
    'countries and borders',
    'climate and biomes',
    'islands and archipelagos',
    'population and demographics',
    'flags and national symbols',
  ],
  Science: [
    'biology and human body',
    'chemistry and elements',
    'physics and space',
    'earth science and geology',
    'inventions and discoveries',
    'famous scientists and their work',
    'environment and ecology',
  ],
  'General Knowledge': [
    'arts and literature',
    'sports records',
    'food and culture',
    'technology milestones',
    'mythology and folklore',
    'languages and words',
  ],
  Israel: [
    'modern Israeli state and politics',
    'geography and cities of Israel',
    'Israeli culture, language, and daily life',
    'ancient Israel and biblical-era history',
    'wars and peace agreements (specific facts, not clichés)',
    'Israeli innovations and economy',
    'diverse ethnic and religious communities in Israel',
  ],
  Bible: [
    'Old Testament narratives and figures',
    'New Testament events and parables',
    'geography of biblical lands',
    'prophets and books of the Bible',
    'lesser-known biblical characters',
    'archaeology related to biblical history',
  ],
  Movies: [
    'classic Hollywood cinema',
    'international and indie films',
    'directors and screenwriters',
    'actors and awards (specific years or roles)',
    'film quotes and plot details (not the most overused)',
    'animation and documentary',
  ],
};

const getFocusPool = (category) => {
  if (categoryFocusPools[category]) {
    return categoryFocusPools[category];
  }

  if (category === 'Any Category') {
    return Object.values(categoryFocusPools).flat();
  }

  return [
    `different eras and subtopics within ${category}`,
    `specific names, places, and events in ${category}`,
    `lesser-known but verifiable facts in ${category}`,
    `comparisons and "which of these" style questions in ${category}`,
    `numbers, dates, and records in ${category}`,
  ];
};

const overusedBans = {
  History: [
    'Do NOT ask who was the first US president unless phrased in a genuinely novel way.',
    'Do NOT ask when World War II started or ended.',
    'Do NOT ask when World War I started.',
    'Do NOT ask when the Declaration of Independence was signed (unless angle is unusual).',
    'Do NOT ask who discovered America in the elementary-school phrasing.',
    'Avoid repeating "who was the first..." unless the answer is surprising.',
    'Cover at least 5 different time periods or regions across the 10 questions.',
  ],
};

const defaultBans = [
  'Every question must cover a different subtopic — no two questions about the same person, war, or event.',
  'Avoid the most obvious textbook questions players have seen dozens of times.',
  'Prefer specific, interesting facts over generic overview questions.',
];

export const buildVarietyHints = (category) => {
  const pool = getFocusPool(category);
  const focusAreas = pickRandom(pool, Math.min(5, pool.length));
  const bans = overusedBans[category] || defaultBans;
  const batchId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return {
    batchId,
    focusLine: `For this unique round (batch ${batchId}), draw questions from these angles: ${focusAreas.join('; ')}.`,
    banLines: bans.map((line) => `* ${line}`).join('\n'),
  };
};
