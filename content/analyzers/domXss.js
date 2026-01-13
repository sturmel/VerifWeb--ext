/**
 * Analyse DOM-based XSS
 */
import { summarizeRisks } from './utils.js';

export function analyzeDOMXSS() {
  const risks = [];
  const scripts = document.querySelectorAll('script:not([src])');

  const sourcePatterns = [
    /location\.(?:hash|search|href|pathname)/g,
    /document\.(?:URL|documentURI|referrer)/g,
    /window\.name/g
  ];

  const sinkPatterns = [
    /\.innerHTML\s*=/g,
    /\.outerHTML\s*=/g,
    /document\.write\s*\(/g,
    /eval\s*\(/g,
    /\$\([^)]*\)\.html\s*\(/g
  ];

  scripts.forEach((script) => {
    const content = script.textContent || '';
    if (!content.trim()) return;

    let hasSource = sourcePatterns.some(p => p.test(content));
    let hasSink = sinkPatterns.some(p => p.test(content));

    if (hasSource && hasSink) {
      risks.push({
        type: 'dom-xss-flow',
        risk: 'high',
        description: 'Flux source→sink DOM XSS potentiel détecté'
      });
    }
  });

  return summarizeRisks(risks, 'DOM XSS');
}
