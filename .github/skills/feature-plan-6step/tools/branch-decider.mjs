#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const args = { input: '' };
  const positionals = [];
  for (let i = 2; i < argv.length; i += 1) {
    const token = argv[i];
    const value = argv[i + 1] || '';

    if (token === '--input') {
      args.input = value;
      i += 1;
      continue;
    }
    if (token.startsWith('--input=')) {
      args.input = token.slice('--input='.length);
      continue;
    }
    if (!token.startsWith('--')) {
      positionals.push(token);
    }
  }

  if (!args.input && positionals[0]) {
    args.input = positionals[0];
  }
  if (!args.input && process.env.npm_config_input) {
    args.input = process.env.npm_config_input;
  }

  return args;
}

function ensureFileExists(filePath) {
  if (!filePath) {
    throw new Error('Missing required argument: --input');
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

function extractValue(markdown, label) {
  const pattern = new RegExp(`-\\s*${label}\\s*:\\s*(.*)$`, 'm');
  const match = markdown.match(pattern);
  return (match?.[1] || '').trim();
}

function normalizeApproval(rawValue) {
  const value = String(rawValue || '')
    .trim()
    .toLowerCase();
  if (!value) {
    return 'pending';
  }

  if (
    value === '승인' ||
    value === 'yes' ||
    value === 'y' ||
    value === 'approved' ||
    value === 'ok'
  ) {
    return 'approved';
  }

  if (
    value === '거부' ||
    value === 'no' ||
    value === 'n' ||
    value === 'rejected'
  ) {
    return 'rejected';
  }

  return 'pending';
}

function decide(markdown) {
  const frontendImpact = extractValue(markdown, '프론트 영향 범위');
  const apiChanged = extractValue(markdown, 'API 계약 변경 여부');
  const uiUxChanged = extractValue(markdown, 'UI/UX 변경 요청 여부');
  const securityImpact = extractValue(markdown, '보안 영향 범위');
  const authChanged = extractValue(markdown, '인증/인가 정책 변경 여부');
  const inputValidationChanged = extractValue(
    markdown,
    '입력검증 로직 변경 여부',
  );
  const sensitiveLogChanged = extractValue(
    markdown,
    '민감정보 처리/로그 노출 변경 여부',
  );
  const step3ReplacementValidation = extractValue(
    markdown,
    'STEP-3 대체 검증 항목',
  );
  const step5ReplacementValidation = extractValue(
    markdown,
    'STEP-5 대체 검증 항목',
  );
  const userChoice = extractValue(markdown, '분기 희망');
  const step3ApprovalRaw = extractValue(markdown, 'STEP-3 스킵 승인');
  const step5ApprovalRaw = extractValue(markdown, 'STEP-5 경량화 승인');

  const step3Allowed =
    frontendImpact === '없음' &&
    apiChanged === '없음' &&
    uiUxChanged === '없음' &&
    Boolean(step3ReplacementValidation);

  const step5Candidate =
    authChanged === '없음' &&
    inputValidationChanged === '없음' &&
    sensitiveLogChanged === '없음' &&
    Boolean(step5ReplacementValidation);
  const step3Approval = normalizeApproval(step3ApprovalRaw);
  const step5Approval = normalizeApproval(step5ApprovalRaw);

  const step3FinalMode =
    step3Allowed && step3Approval === 'approved' ? 'skip' : 'execute';
  const step5FinalMode =
    step5Candidate && step5Approval === 'approved' ? 'lighten' : 'execute';

  const result = {
    input: {
      frontendImpact,
      apiChanged,
      uiUxChanged,
      securityImpact,
      authChanged,
      inputValidationChanged,
      sensitiveLogChanged,
      step3ReplacementValidation,
      step5ReplacementValidation,
      userChoice,
      step3Approval,
      step5Approval,
    },
    decisions: {
      STEP_3_FRONTEND: {
        mode: step3Allowed ? 'skip-candidate' : 'execute',
        reason: step3Allowed
          ? 'frontend/api/uiux impact are none and replacement validation exists'
          : 'required frontend skip conditions are not fully met',
      },
      STEP_5_SECURITY: {
        mode: step5Candidate ? 'lighten-candidate' : 'execute',
        reason: step5Candidate
          ? 'security conditions are none and replacement validation exists'
          : 'required security lighten conditions are not fully met',
      },
    },
    approval: {
      required: step3Allowed || step5Candidate,
      STEP_3_FRONTEND: {
        status: step3Approval,
        required: step3Allowed,
      },
      STEP_5_SECURITY: {
        status: step5Approval,
        required: step5Candidate,
      },
    },
    final_plan: {
      STEP_3_FRONTEND: {
        mode: step3FinalMode,
        reason:
          step3FinalMode === 'skip'
            ? 'candidate approved by user'
            : 'approval missing/rejected or candidate not met',
      },
      STEP_5_SECURITY: {
        mode: step5FinalMode,
        reason:
          step5FinalMode === 'lighten'
            ? 'candidate approved by user'
            : 'approval missing/rejected or candidate not met',
      },
    },
    policy: {
      defaultPath: 'STEP-1 -> STEP-6',
      branchMode: 'conservative',
      approvalGate: 'without explicit approval, default to execute',
    },
  };

  return result;
}

function main() {
  try {
    const args = parseArgs(process.argv);
    const inputPath = ensureFileExists(args.input);
    const markdown = readText(inputPath);
    const result = decide(markdown);

    console.log('Branch Decision Result');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Branch decider failed to execute.');
    console.error(String(error.message || error));
    process.exit(1);
  }
}

main();
