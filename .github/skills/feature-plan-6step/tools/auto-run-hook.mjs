#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';

function readStdin() {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    data += chunk;
  });
  process.stdin.on('end', () => {
    execute(data);
  });
}

function shouldRun(payloadText) {
  const text = String(payloadText || '').toLowerCase();
  return (
    text.includes('feature-plan') ||
    text.includes('feature-plan-chain') ||
    text.includes('feature-plan-6step')
  );
}

function extractReportPath(payloadText) {
  const text = String(payloadText || '');
  const regex = /(문서[\\/]+검증[\\/]+feature-plan-chain-[^\s"'`]+\.md)/gi;
  const matches = [...text.matchAll(regex)];
  if (!matches.length) {
    return '';
  }
  const lastMatch = matches[matches.length - 1][1];
  return lastMatch.replace(/\\/g, '/');
}

function execute(payloadText) {
  try {
    if (!shouldRun(payloadText)) {
      process.exit(0);
      return;
    }

    const scriptPath = path.resolve(
      process.cwd(),
      '.github/skills/feature-plan-6step/tools/harness-runner.mjs',
    );

    const reportPath = extractReportPath(payloadText);
    const runnerArgs = [scriptPath];
    if (reportPath) {
      runnerArgs.push('--report', reportPath);
    }

    const result = spawnSync(process.execPath, runnerArgs, {
      cwd: process.cwd(),
      encoding: 'utf8',
    });

    // Hook은 세션 종료를 막지 않도록 항상 0으로 종료한다.
    if ((result.stdout || '').trim()) {
      process.stdout.write(result.stdout);
    }
    if ((result.stderr || '').trim()) {
      process.stderr.write(result.stderr);
    }
    process.exit(0);
  } catch (error) {
    process.stderr.write(
      `auto-run-hook warning: ${String(error.message || error)}\n`,
    );
    process.exit(0);
  }
}

readStdin();
