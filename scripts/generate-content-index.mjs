import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const COLLECTIONS = [
  {
    name: 'posts',
    sourceDir: path.join(ROOT_DIR, 'src', 'content', 'posts'),
    outputFile: path.join(ROOT_DIR, 'public', 'content', 'posts', 'index.json'),
  },
  {
    name: 'reviews',
    sourceDir: path.join(ROOT_DIR, 'src', 'content', 'reviews'),
    outputFile: path.join(ROOT_DIR, 'public', 'content', 'reviews', 'index.json'),
  },
];

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFiles(directory) {
  if (!(await pathExists(directory))) {
    return [];
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json')
    .map((entry) => path.join(directory, entry.name))
    .sort((a, b) => a.localeCompare(b));

  return Promise.all(
    files.map(async (filePath) => {
      const raw = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(raw);
      const fileSlug = path.basename(filePath, '.json');

      return {
        slug: data.slug || fileSlug,
        ...data,
      };
    }),
  );
}

function sortByPublishDateDescending(items) {
  return [...items].sort((a, b) => {
    const left = new Date(a.publishDate || 0).getTime();
    const right = new Date(b.publishDate || 0).getTime();
    return right - left;
  });
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function generateCollectionIndex(collection) {
  const items = sortByPublishDateDescending(await readJsonFiles(collection.sourceDir)).map((item) => ({
    ...item,
    collection: collection.name,
    route: `/${collection.name}/${item.slug}`,
  }));

  await writeJson(collection.outputFile, items);
  console.log(`Generated ${path.relative(ROOT_DIR, collection.outputFile)} with ${items.length} item(s).`);
}

async function main() {
  for (const collection of COLLECTIONS) {
    await generateCollectionIndex(collection);
  }
}

main().catch((error) => {
  console.error('Content index generation failed.');
  console.error(error);
  process.exitCode = 1;
});
