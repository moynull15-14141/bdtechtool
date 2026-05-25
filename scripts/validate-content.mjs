import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const VALID_LANGUAGES = new Set(['bn', 'en']);
const VALID_CATEGORIES = new Set(['ai', 'tech', 'tutorials', 'tools']);
const REQUIRED_FIELDS = ['slug', 'language', 'category', 'title', 'seoDescription', 'publishDate'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLLECTIONS = [
  {
    name: 'posts',
    dir: path.join(ROOT_DIR, 'src', 'content', 'posts'),
  },
  {
    name: 'reviews',
    dir: path.join(ROOT_DIR, 'src', 'content', 'reviews'),
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

async function getJsonFiles(directory) {
  if (!(await pathExists(directory))) {
    return [];
  }

  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'index.json')
    .map((entry) => path.join(directory, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value) {
  return isNonEmptyString(value) && !Number.isNaN(new Date(value).getTime());
}

function relativePath(filePath) {
  return path.relative(ROOT_DIR, filePath).replaceAll(path.sep, '/');
}

function validateItem(data, filePath, collectionName, slugRegistry) {
  const errors = [];
  const fileLabel = relativePath(filePath);

  for (const field of REQUIRED_FIELDS) {
    if (!isNonEmptyString(data[field])) {
      errors.push(`${fileLabel}: missing or empty required field "${field}".`);
    }
  }

  if (isNonEmptyString(data.slug) && !SLUG_PATTERN.test(data.slug)) {
    errors.push(`${fileLabel}: slug "${data.slug}" must be lowercase kebab-case using only a-z, 0-9, and hyphens.`);
  }

  if (isNonEmptyString(data.language) && !VALID_LANGUAGES.has(data.language)) {
    errors.push(`${fileLabel}: language "${data.language}" must be one of: ${Array.from(VALID_LANGUAGES).join(', ')}.`);
  }

  if (isNonEmptyString(data.category) && !VALID_CATEGORIES.has(data.category)) {
    errors.push(`${fileLabel}: category "${data.category}" must be one of: ${Array.from(VALID_CATEGORIES).join(', ')}.`);
  }

  if (isNonEmptyString(data.publishDate) && !isValidDate(data.publishDate)) {
    errors.push(`${fileLabel}: publishDate "${data.publishDate}" is not a valid date.`);
  }

  if (isNonEmptyString(data.thumbnail) && !data.thumbnail.startsWith('/') && !/^https?:\/\//.test(data.thumbnail)) {
    errors.push(`${fileLabel}: thumbnail must be an absolute site path or http(s) URL.`);
  }

  if (isNonEmptyString(data.monetizationUrl) && !/^https?:\/\//.test(data.monetizationUrl)) {
    errors.push(`${fileLabel}: monetizationUrl must be a valid http(s) URL when provided.`);
  }

  if (isNonEmptyString(data.slug)) {
    const existing = slugRegistry.get(data.slug);
    if (existing) {
      errors.push(`${fileLabel}: slug "${data.slug}" duplicates ${existing}. Slugs must be globally unique.`);
    } else {
      slugRegistry.set(data.slug, `${collectionName}:${fileLabel}`);
    }
  }

  return errors;
}

async function validateJsonFile(filePath, collectionName, slugRegistry) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return [`${relativePath(filePath)}: content file must contain one JSON object.`];
    }

    return validateItem(data, filePath, collectionName, slugRegistry);
  } catch (error) {
    return [`${relativePath(filePath)}: invalid JSON. ${error.message}`];
  }
}

async function main() {
  const slugRegistry = new Map();
  const errors = [];
  let fileCount = 0;

  for (const collection of COLLECTIONS) {
    const files = await getJsonFiles(collection.dir);
    fileCount += files.length;

    for (const filePath of files) {
      errors.push(...(await validateJsonFile(filePath, collection.name, slugRegistry)));
    }
  }

  if (errors.length > 0) {
    console.error(`Content validation failed with ${errors.length} error(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Content validation passed for ${fileCount} JSON file(s).`);
}

main().catch((error) => {
  console.error('Content validation failed unexpectedly.');
  console.error(error);
  process.exitCode = 1;
});
