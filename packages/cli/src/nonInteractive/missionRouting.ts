export type MissionLane = 'fast' | 'code' | 'research' | 'ops';

export interface RoutingDecision {
  lane: MissionLane;
  model: string;
  reason: string;
}

const codeKeywords = [
  'debug', 'bug', 'stack trace', 'exception', 'error',
  'fix', 'patch', 'refactor', 'code', 'test', 'build',
  'deploy', 'git ', 'npm ', 'tsconfig', 'package.json',
  '.ts', '.js', '.py', '.sh', '.yml', '.yaml', 'dockerfile'
];

const researchKeywords = [
  'deep research', 'research deeply', 'comprehensive',
  'landscape', 'market map', 'evaluation', 'playbook',
  'policy', 'architecture', 'roadmap', 'due diligence',
  'comparison', ' versus ', ' vs ', 'survey'
];

const opsKeywords = [
  'incident', 'outage', 'postmortem', 'runbook',
  'health check', 'healthcheck', 'qnap', 'qdrant',
  'cloudflare', 'n8n', 'notion', 'routing policy',
  'queue', 'worker', 'automation'
];

export type ExplicitMode = 'fast' | 'code' | 'research' | 'ops';

export function classifyMission(
  input: string,
  explicitMode?: ExplicitMode
): MissionLane {
  if (explicitMode) return explicitMode;

  const lowered = input.toLowerCase();

  if (codeKeywords.some(k => lowered.includes(k))) return 'code';
  if (opsKeywords.some(k => lowered.includes(k))) return 'ops';
  if (researchKeywords.some(k => lowered.includes(k))) return 'research';

  return 'fast';
}

function modelForLane(lane: MissionLane): string {
  switch (lane) {
    case 'fast':
      return process.env['PERPLEXITY_MODEL_FAST'] || 'sonar-pro';
    case 'code':
      return process.env['PERPLEXITY_MODEL_CODE'] || 'sonar-reasoning';
    case 'ops':
      return process.env['PERPLEXITY_MODEL_OPS'] || 'sonar-reasoning';
    case 'research':
      return process.env['PERPLEXITY_MODEL_RESEARCH'] || 'sonar-pro';
    default:
      return 'sonar-pro';
  }
}

export function routeMission(
  input: string,
  explicitMode?: ExplicitMode
): RoutingDecision {
  const lane = classifyMission(input, explicitMode);
  const model = modelForLane(lane);

  let reason: string;
  if (lane === 'code') {
    reason = 'Detected implementation/debugging intent; using code lane.';
  } else if (lane === 'ops') {
    reason = 'Detected mesh/operations/automation intent; using ops lane.';
  } else if (lane === 'research') {
    reason = 'Detected multi-source research intent; using research lane.';
  } else {
    reason = 'Defaulted to fast synthesis for general question.';
  }

  return { lane, model, reason };
}
