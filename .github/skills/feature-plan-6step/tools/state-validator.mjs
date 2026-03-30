#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = { report: '', schema: '' };
  const positionals = [];
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    const value = argv[i + 1] || '';

    if (token === '--report') {
      args.report = value;
      i += 1;
      continue;
    }
    if (token.startsWith('--report=')) {
      args.report = token.slice('--report='.length);
      continue;
    }
    if (token === '--schema') {
      args.schema = value;
      i += 1;
      continue;
    }
    if (token.startsWith('--schema=')) {
      args.schema = token.slice('--schema='.length);
      continue;
    }
    if (!token.startsWith('--')) {
      positionals.push(token);
    }
  }

  if (!args.report && positionals[0]) {
    args.report = positionals[0];
  }
  if (!args.schema && positionals[1]) {
    args.schema = positionals[1];
  }

  if (!args.report && process.env.npm_config_report) {
    args.report = process.env.npm_config_report;
  }
  if (!args.schema && process.env.npm_config_schema) {
    args.schema = process.env.npm_config_schema;
  }

  if (!args.schema) {
    args.schema = '.github/skills/feature-plan-6step/state-schema.yaml';
  }

  return args;
}

function ensureFileExists(filePath, label) {
  if (!filePath) {
    throw new Error(`Missing required argument: --${label}`);
  }
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  return resolved;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) {
    return { hasFrontmatter: false, meta: {} };
  }
  const end = markdown.indexOf('\n---\n', 4);
  if (end < 0) {
    return { hasFrontmatter: false, meta: {} };
  }

  const section = markdown.slice(4, end);
  const meta = {};
  for (const line of section.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('- ')) {
      continue;
    }
    const idx = trimmed.indexOf(':');
    if (idx <= 0) {
      continue;
    }
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    meta[key] = value;
  }

  return { hasFrontmatter: true, meta };
}

function parseRequiredFieldsFromSchema(schemaText) {
  const required = [];
  const lines = schemaText.split(/\r?\n/);
  let inFields = false;
  let currentField = '';

  for (const line of lines) {
    if (!inFields) {
      if (line.trim() === 'fields:') {
        inFields = true;
      }
      continue;
    }

    if (line.startsWith('error_pattern:')) {
      break;
    }

    const fieldStart = line.match(/^\s{2}([a-zA-Z0-9_]+):\s*$/);
    if (fieldStart) {
      currentField = fieldStart[1];
      continue;
    }

    if (currentField && line.match(/^\s{4}required:\s*true\s*$/)) {
      required.push(currentField);
      currentField = '';
    }
  }

  return required;
}

function validate(reportText, requiredFields) {
  const checks = [];
  const { hasFrontmatter, meta } = parseFrontmatter(reportText);

  checks.push({
    id: 'frontmatter:exists',
    pass: hasFrontmatter,
    detail: 'report has frontmatter block',
  });

  for (const field of requiredFields) {
    checks.push({
      id: `field:${field}`,
      pass: Object.prototype.hasOwnProperty.call(meta, field),
      detail: `required field exists: ${field}`,
    });
  }

  if (Object.prototype.hasOwnProperty.call(meta, 'replay_mode')) {
    const value = String(meta.replay_mode || '').replace(/['"]/g, '');
    checks.push({
      id: 'field:replay_mode:enum',
      pass: value === 'reuse' || value === 'regenerate',
      detail: 'replay_mode in [reuse, regenerate]',
    });
  }

  if (Object.prototype.hasOwnProperty.call(meta, 'feedback_applied')) {
    const value = String(meta.feedback_applied || '').replace(/['"]/g, '');
    checks.push({
      id: 'field:feedback_applied:enum',
      pass: value === 'applied' || value === 'not_applied',
      detail: 'feedback_applied in [applied, not_applied]',
    });
  }

  return checks;
}

function printSummary(checks) {
  const failed = checks.filter((item) => !item.pass);
  const passed = checks.length - failed.length;

  console.log('State Schema Validation Summary');
  console.log(`- total: ${checks.length}`);
  console.log(`- passed: ${passed}`);
  console.log(`- failed: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\nFailed checks:');
    for (const item of failed) {
      console.log(`- [FAIL] ${item.id} :: ${item.detail}`);
    }
  } else {
    console.log('\nAll checks passed.');
  }

  return failed.length;
}

function main() {
  try {
    const args = parseArgs(process.argv);
    const reportPath = ensureFileExists(args.report, 'report');
    const schemaPath = ensureFileExists(args.schema, 'schema');

    const reportText = readText(reportPath);
    const schemaText = readText(schemaPath);

    const requiredFields = parseRequiredFieldsFromSchema(schemaText);
    const checks = validate(reportText, requiredFields);
    const failCount = printSummary(checks);

    process.exit(failCount === 0 ? 0 : 2);
  } catch (error) {
    console.error('State validator failed to execute.');
    console.error(String(error.message || error));
    process.exit(1);
  }
}

main();
