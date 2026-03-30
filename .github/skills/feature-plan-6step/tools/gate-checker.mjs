#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_META_KEYS = [
  'workflow_state',
  'execution_timestamp',
  'input_signature',
  'replay_mode',
  'chain_state_version',
  'current_step',
  'completed_steps',
  'skip_decisions',
  'feedback_applied',
];

const REQUIRED_BODY_PATTERNS = [
  '수정 파일 목록',
  '잔여 위험 항목',
  '저장 결과: 파일 생성 완료',
  'STEP-1-LEADER',
  'STEP-2-BACKEND',
  'STEP-3-FRONTEND',
  'STEP-4-QUALITY',
  'STEP-5-SECURITY',
  'STEP-6-REPORT',
];

function parseArgs(argv) {
  const args = { plan: '', report: '' };
  const positionals = [];
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    const value = argv[i + 1] || '';
    if (token === '--plan') {
      args.plan = value;
      i += 1;
      continue;
    }
    if (token.startsWith('--plan=')) {
      args.plan = token.slice('--plan='.length);
      continue;
    }
    if (token === '--report') {
      args.report = value;
      i += 1;
      continue;
    }
    if (token.startsWith('--report=')) {
      args.report = token.slice('--report='.length);
      continue;
    }
    if (!token.startsWith('--')) {
      positionals.push(token);
    }
  }

  if (!args.plan && positionals[0]) {
    args.plan = positionals[0];
  }
  if (!args.report && positionals[1]) {
    args.report = positionals[1];
  }
  if (!args.plan && process.env.npm_config_plan) {
    args.plan = process.env.npm_config_plan;
  }
  if (!args.report && process.env.npm_config_report) {
    args.report = process.env.npm_config_report;
  }
  return args;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) {
    return { meta: {}, hasFrontmatter: false };
  }
  const endIndex = markdown.indexOf('\n---\n', 4);
  if (endIndex < 0) {
    return { meta: {}, hasFrontmatter: false };
  }

  const frontmatterBody = markdown.slice(4, endIndex);
  const meta = {};
  for (const line of frontmatterBody.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('- ')) {
      continue;
    }
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex <= 0) {
      continue;
    }
    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    if (key) {
      meta[key] = value;
    }
  }
  return { meta, hasFrontmatter: true };
}

function checkPlanInput(planText) {
  const checks = [];
  const requiredMarkers = [
    '[요청 개요]',
    '[대상 경로]',
    '[제약사항]',
    '- 프론트 대상 경로:',
    '- 백엔드 대상 경로:',
    '- 매퍼 대상 경로:',
  ];

  for (const marker of requiredMarkers) {
    checks.push({
      id: `plan:${marker}`,
      pass: planText.includes(marker),
      detail: `plan includes marker: ${marker}`,
    });
  }
  return checks;
}

function checkReport(reportText) {
  const checks = [];
  const { meta, hasFrontmatter } = parseFrontmatter(reportText);

  checks.push({
    id: 'report:frontmatter',
    pass: hasFrontmatter,
    detail: 'report has frontmatter block',
  });

  for (const key of REQUIRED_META_KEYS) {
    checks.push({
      id: `meta:${key}`,
      pass: Object.prototype.hasOwnProperty.call(meta, key),
      detail: `frontmatter contains key: ${key}`,
    });
  }

  if (hasFrontmatter) {
    checks.push({
      id: 'meta:workflow_state',
      pass: String(meta.workflow_state || '').includes('REPORT_DONE'),
      detail: 'workflow_state is REPORT_DONE',
    });
  }

  for (const pattern of REQUIRED_BODY_PATTERNS) {
    checks.push({
      id: `body:${pattern}`,
      pass: reportText.includes(pattern),
      detail: `report body includes: ${pattern}`,
    });
  }

  const nextInputCount = (reportText.match(/##\s*다음\s*단계\s*입력/g) || [])
    .length;
  checks.push({
    id: 'body:next-step-input-count',
    pass: nextInputCount >= 5,
    detail: `count of '## 다음 단계 입력' >= 5 (actual: ${nextInputCount})`,
  });

  return checks;
}

function printSummary(checks) {
  const failed = checks.filter((item) => !item.pass);
  const passed = checks.length - failed.length;

  console.log('Feature Plan Gate Check Summary');
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

function main() {
  try {
    const args = parseArgs(process.argv);
    const planPath = ensureFileExists(args.plan, 'plan');
    const reportPath = ensureFileExists(args.report, 'report');

    const planText = readText(planPath);
    const reportText = readText(reportPath);

    const checks = [...checkPlanInput(planText), ...checkReport(reportText)];
    const failCount = printSummary(checks);
    process.exit(failCount === 0 ? 0 : 2);
  } catch (error) {
    console.error('Gate check failed to execute.');
    console.error(String(error.message || error));
    process.exit(1);
  }
}

main();
