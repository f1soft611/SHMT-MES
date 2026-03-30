#!/usr/bin/env node
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

function parseArgs(argv) {
  const args = {
    plan: '.github/prompts/feature-plan-sample-template.md',
    report: '',
    schema: '.github/skills/feature-plan-6step/state-schema.yaml',
    strict: false,
  };
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
    if (token === '--schema') {
      args.schema = value;
      i += 1;
      continue;
    }
    if (token.startsWith('--schema=')) {
      args.schema = token.slice('--schema='.length);
      continue;
    }
    if (token === '--strict') {
      args.strict = true;
      continue;
    }
    if (token === '--strict=true') {
      args.strict = true;
      continue;
    }
    if (token === '--strict=false') {
      args.strict = false;
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

  return args;
}

function findLatestReport() {
  const reportDir = path.resolve(process.cwd(), '문서/검증');
  if (!fs.existsSync(reportDir)) {
    return '';
  }

  const candidates = fs
    .readdirSync(reportDir)
    .filter((name) => /^feature-plan-chain-.*\.md$/i.test(name))
    .map((name) => {
      const fullPath = path.join(reportDir, name);
      const stat = fs.statSync(fullPath);
      return { fullPath, mtimeMs: stat.mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  return candidates[0]?.fullPath || '';
}

function ensurePathExists(filePath, label) {
  if (!filePath) {
    throw new Error(`Missing required argument: --${label}`);
  }
  const resolved = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  return resolved;
}

function runNodeScript(scriptPath, scriptArgs) {
  const result = spawnSync(process.execPath, [scriptPath, ...scriptArgs], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function printStepResult(title, result) {
  console.log(`\n=== ${title} ===`);
  if (result.stdout.trim()) {
    console.log(result.stdout.trim());
  }
  if (result.stderr.trim()) {
    console.log(result.stderr.trim());
  }
  console.log(`exitCode: ${result.status}`);
}

function pad2(value) {
  return String(value).padStart(2, '0');
}

function buildTimestamp(now) {
  const yyyy = now.getFullYear();
  const mm = pad2(now.getMonth() + 1);
  const dd = pad2(now.getDate());
  const hh = pad2(now.getHours());
  const mi = pad2(now.getMinutes());
  const ss = pad2(now.getSeconds());
  return {
    filePart: `${yyyy}${mm}${dd}-${hh}${mi}`,
    isoLike: `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`,
  };
}

function writeDetailedSummary({
  plan,
  report,
  schema,
  branchResult,
  gateResult,
  stateResult,
  status,
}) {
  const now = new Date();
  const ts = buildTimestamp(now);
  const reportDir = path.resolve(process.cwd(), '문서/검증');
  fs.mkdirSync(reportDir, { recursive: true });

  const normalizedStatus = status === 'PASSED' ? 'passed' : 'failed';
  const fileName = `feature-plan-harness-summary-${ts.filePart}-${normalizedStatus}.md`;
  const fullPath = path.join(reportDir, fileName);

  const lines = [
    '---',
    `workflow_state: HARNESS_${status}`,
    `execution_timestamp: '${ts.isoLike}'`,
    `plan: '${plan}'`,
    `report: '${report}'`,
    `schema: '${schema}'`,
    '---',
    '',
    `# Feature Plan Harness ${status} Summary`,
    '',
    '## Summary',
    `- result: ${status}`,
    '- branch: see STEP-A',
    '- gate: see STEP-B',
    '- state: see STEP-C',
    '',
    '## STEP-A BRANCH DECIDE',
    `- exitCode: ${branchResult.status}`,
    '```text',
    (branchResult.stdout || '').trim() || '(no stdout)',
    '```',
    branchResult.stderr?.trim()
      ? ['```text', branchResult.stderr.trim(), '```'].join('\n')
      : '',
    '',
    '## STEP-B GATE CHECK',
    `- exitCode: ${gateResult.status}`,
    '```text',
    (gateResult.stdout || '').trim() || '(no stdout)',
    '```',
    gateResult.stderr?.trim()
      ? ['```text', gateResult.stderr.trim(), '```'].join('\n')
      : '',
    '',
    '## STEP-C STATE VALIDATE',
    `- exitCode: ${stateResult.status}`,
    '```text',
    (stateResult.stdout || '').trim() || '(no stdout)',
    '```',
    stateResult.stderr?.trim()
      ? ['```text', stateResult.stderr.trim(), '```'].join('\n')
      : '',
    '',
  ];

  fs.writeFileSync(fullPath, lines.filter(Boolean).join('\n'), 'utf8');
  return fullPath;
}

function writeOnePageSummary({
  plan,
  report,
  schema,
  branchResult,
  gateResult,
  stateResult,
  status,
}) {
  const now = new Date();
  const ts = buildTimestamp(now);
  const reportDir = path.resolve(process.cwd(), '문서/검증');
  fs.mkdirSync(reportDir, { recursive: true });

  const normalizedStatus = status === 'PASSED' ? 'passed' : 'failed';
  const fileName = `feature-plan-harness-onepage-${ts.filePart}-${normalizedStatus}.md`;
  const fullPath = path.join(reportDir, fileName);

  const lines = [
    '# Feature Plan Harness One-Page',
    '',
    `- execution_timestamp: ${ts.isoLike}`,
    `- result: ${status}`,
    '',
    '## Inputs',
    `- plan: ${plan}`,
    `- report: ${report}`,
    `- schema: ${schema}`,
    '',
    '## Step Status',
    `- STEP-A BRANCH DECIDE: ${branchResult.status === 0 ? 'PASS' : 'FAIL'} (exitCode=${branchResult.status})`,
    `- STEP-B GATE CHECK: ${gateResult.status === 0 ? 'PASS' : 'FAIL'} (exitCode=${gateResult.status})`,
    `- STEP-C STATE VALIDATE: ${stateResult.status === 0 ? 'PASS' : 'FAIL'} (exitCode=${stateResult.status})`,
    '',
    '## Quick Notes',
    '- 상세 로그는 feature-plan-harness-summary 파일을 참조한다.',
  ];

  fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
  return fullPath;
}

function main() {
  try {
    const args = parseArgs(process.argv);
    const plan = ensurePathExists(args.plan, 'plan');
    const resolvedReportArg = args.report || findLatestReport();
    if (!resolvedReportArg) {
      console.log(
        'Harness runner skipped: no report file found under 문서/검증.',
      );
      process.exit(0);
    }
    const report = ensurePathExists(resolvedReportArg, 'report');
    const schema = ensurePathExists(args.schema, 'schema');

    const base = path.resolve(
      process.cwd(),
      '.github/skills/feature-plan-6step/tools',
    );
    const branchScript = path.join(base, 'branch-decider.mjs');
    const gateScript = path.join(base, 'gate-checker.mjs');
    const stateScript = path.join(base, 'state-validator.mjs');

    const branchResult = runNodeScript(branchScript, ['--input', plan]);
    const gateResult = runNodeScript(gateScript, [
      '--plan',
      plan,
      '--report',
      report,
    ]);
    const stateResult = runNodeScript(stateScript, [
      '--report',
      report,
      '--schema',
      schema,
    ]);

    printStepResult('STEP-A BRANCH DECIDE', branchResult);
    printStepResult('STEP-B GATE CHECK', gateResult);
    printStepResult('STEP-C STATE VALIDATE', stateResult);

    const failed = [branchResult, gateResult, stateResult].some(
      (r) => r.status !== 0,
    );

    const overallStatus = failed ? 'FAILED' : 'PASSED';
    const detailedSummaryPath = writeDetailedSummary({
      plan,
      report,
      schema,
      branchResult,
      gateResult,
      stateResult,
      status: overallStatus,
    });
    const onePageSummaryPath = writeOnePageSummary({
      plan,
      report,
      schema,
      branchResult,
      gateResult,
      stateResult,
      status: overallStatus,
    });

    console.log('\n=== HARNESS SUMMARY ===');
    console.log(`plan: ${plan}`);
    console.log(`report: ${report}`);
    console.log(`schema: ${schema}`);
    console.log(`strict_mode: ${args.strict ? 'true' : 'false'}`);
    console.log(`result: ${overallStatus}`);
    console.log(`detailed_summary: ${detailedSummaryPath}`);
    console.log(`onepage_summary: ${onePageSummaryPath}`);

    process.exit(failed && args.strict ? 2 : 0);
  } catch (error) {
    console.error('Harness runner failed to execute.');
    console.error(String(error.message || error));
    process.exit(1);
  }
}

main();
