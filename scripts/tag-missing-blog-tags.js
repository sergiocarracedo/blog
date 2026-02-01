import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog');
const MAX_TAGS = 5;

const CANONICAL_TAGS = new Map([
  ['js', 'javascript'],
  ['javascript', 'javascript'],
  ['ecmascript', 'javascript'],
  ['ts', 'typescript'],
  ['typescript', 'typescript'],
  ['nodejs', 'node'],
  ['node', 'node'],
  ['reactjs', 'react'],
  ['react', 'react'],
  ['vuejs', 'vue'],
  ['vue', 'vue'],
  ['angular', 'angular'],
  ['svelte', 'svelte'],
  ['css', 'css'],
  ['scss', 'sass'],
  ['sass', 'sass'],
  ['html', 'html'],
  ['php', 'php'],
  ['laravel', 'laravel'],
  ['drupal', 'drupal'],
  ['wordpress', 'wordpress'],
  ['mysql', 'mysql'],
  ['postgres', 'postgresql'],
  ['postgresql', 'postgresql'],
  ['database', 'database'],
  ['sql', 'database'],
  ['docker', 'docker'],
  ['kubernetes', 'kubernetes'],
  ['ci', 'ci-cd'],
  ['cd', 'ci-cd'],
  ['devops', 'devops'],
  ['api', 'api'],
  ['backend', 'backend'],
  ['frontend', 'frontend'],
  ['testing', 'testing'],
  ['security', 'security'],
  ['linux', 'linux'],
  ['hardware', 'hardware'],
  ['productivity', 'productivity'],
  ['personal', 'personal'],
  ['opinion', 'opinion'],
  ['ai', 'ai'],
  ['architecture', 'architecture'],
  ['design', 'design'],
  ['ux', 'ux'],
  ['performance', 'performance'],
  ['charts', 'data-visualization'],
  ['visualization', 'data-visualization'],
  ['d3', 'data-visualization'],
  ['echarts', 'data-visualization'],
  ['golang', 'go'],
  ['go', 'go'],
]);

const KEYWORDS = [
  { tag: 'javascript', patterns: [/\bjavascript\b/i, /\bjs\b/i, /ecmascript/i] },
  { tag: 'typescript', patterns: [/\btypescript\b/i, /\bts\b/i] },
  { tag: 'node', patterns: [/node\.?js/i, /\bnodejs\b/i] },
  { tag: 'react', patterns: [/\breact\b/i, /reactjs/i] },
  { tag: 'vue', patterns: [/\bvue\b/i, /vuejs/i] },
  { tag: 'angular', patterns: [/\bangular\b/i] },
  { tag: 'svelte', patterns: [/\bsvelte\b/i] },
  { tag: 'css', patterns: [/\bcss\b/i] },
  { tag: 'sass', patterns: [/\bsass\b/i, /\bscss\b/i] },
  { tag: 'html', patterns: [/\bhtml\b/i] },
  { tag: 'php', patterns: [/\bphp\b/i] },
  { tag: 'laravel', patterns: [/\blaravel\b/i] },
  { tag: 'drupal', patterns: [/\bdrupal\b/i] },
  { tag: 'wordpress', patterns: [/\bwordpress\b/i] },
  { tag: 'mysql', patterns: [/\bmysql\b/i, /innodb/i, /myisam/i] },
  { tag: 'postgresql', patterns: [/\bpostgres\b/i, /postgresql/i] },
  { tag: 'database', patterns: [/\bdatabase\b/i, /\bsql\b/i] },
  { tag: 'docker', patterns: [/\bdocker\b/i] },
  { tag: 'kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { tag: 'ci-cd', patterns: [/\bci\b/i, /\bcd\b/i, /github actions/i, /workflows/i] },
  { tag: 'devops', patterns: [/\bdevops\b/i] },
  { tag: 'api', patterns: [/\bapi\b/i, /rest\b/i, /graphql/i] },
  { tag: 'backend', patterns: [/\bbackend\b/i, /server/i] },
  { tag: 'frontend', patterns: [/\bfrontend\b/i, /client-side/i] },
  { tag: 'testing', patterns: [/\btesting\b/i, /tests?/i] },
  { tag: 'security', patterns: [/\bsecurity\b/i, /vulnerability/i, /authentication/i] },
  { tag: 'linux', patterns: [/\blinux\b/i, /ubuntu/i, /debian/i] },
  { tag: 'hardware', patterns: [/\bkeyboard\b/i, /hardware/i, /laptop/i, /pc\b/i] },
  { tag: 'productivity', patterns: [/\bproductivity\b/i, /workflow/i, /habits?/i] },
  { tag: 'personal', patterns: [/\bpersonal\b/i, /diary/i, /experience/i] },
  { tag: 'opinion', patterns: [/\bopinion\b/i, /thoughts/i, /reflection/i] },
  { tag: 'ai', patterns: [/\bai\b/i, /\bllm\b/i, /machine learning/i, /generative/i] },
  { tag: 'architecture', patterns: [/\barchitecture\b/i, /hexagonal/i, /clean architecture/i] },
  { tag: 'design', patterns: [/\bdesign\b/i, /design system/i] },
  { tag: 'ux', patterns: [/\bux\b/i, /user experience/i] },
  { tag: 'performance', patterns: [/\bperformance\b/i, /optimization/i, /cache/i] },
  { tag: 'data-visualization', patterns: [/\bchart/i, /visualization/i, /\bd3\b/i, /echarts/i] },
  { tag: 'go', patterns: [/\bgolang\b/i, /\bgo\b/i] },
];

const normalizeTag = (tag) => {
  const lower = tag.trim().toLowerCase();
  return CANONICAL_TAGS.get(lower) ?? lower;
};

const getAllFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getAllFiles(fullPath);
    }
    if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
      return [fullPath];
    }
    return [];
  });
};

const extractExistingTags = (files) => {
  const tags = new Set();
  files.forEach((file) => {
    const raw = fs.readFileSync(file, 'utf8');
    const { data } = matter(raw);
    if (Array.isArray(data.tags)) {
      data.tags.map(normalizeTag).forEach((tag) => tags.add(tag));
    }
  });
  return tags;
};

const inferTags = (content, knownTags) => {
  const scores = new Map();
  KEYWORDS.forEach(({ tag, patterns }) => {
    const score = patterns.reduce((acc, pattern) => (pattern.test(content) ? acc + 1 : acc), 0);
    if (score > 0) {
      scores.set(tag, score);
    }
  });

  const sorted = Array.from(scores.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([tag]) => tag);

  const tags = sorted
    .map((tag) => normalizeTag(tag))
    .filter((tag, index, self) => self.indexOf(tag) === index);

  if (tags.length === 0) {
    return knownTags.has('personal') ? ['personal'] : ['general'];
  }

  return tags.slice(0, MAX_TAGS);
};

const files = getAllFiles(BLOG_DIR);
const knownTags = extractExistingTags(files);

const updated = [];

files.forEach((file) => {
  const raw = fs.readFileSync(file, 'utf8');
  const parsed = matter(raw);
  const currentTags = Array.isArray(parsed.data.tags) ? parsed.data.tags : [];
  const normalized = currentTags.map(normalizeTag).filter(Boolean);

  if (currentTags.length > 0) {
    const normalizedUnique = Array.from(new Set(normalized));
    if (normalizedUnique.join('|') !== currentTags.join('|')) {
      parsed.data.tags = normalizedUnique;
      const next = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(file, next);
      updated.push(file);
    }
    return;
  }

  const content = `${parsed.data.title ?? ''}\n${parsed.content}`;
  const tags = inferTags(content, knownTags);
  parsed.data.tags = tags;
  const next = matter.stringify(parsed.content, parsed.data);
  fs.writeFileSync(file, next);
  updated.push(file);
});

if (updated.length === 0) {
  console.log('No files updated.');
} else {
  console.log(`Updated ${updated.length} files:`);
  updated.forEach((file) => console.log(`- ${path.relative(process.cwd(), file)}`));
}
