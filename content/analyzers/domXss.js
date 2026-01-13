/**
 * Analyse DOM-based XSS
 */
import { summarizeRisks, extractCodeSnippet } from './utils.js';

export function analyzeDOMXSS() {
  const risks = [];
  const scripts = document.querySelectorAll('script:not([src])');

  const sourcePatterns = [
    { pattern: /location\.(?:hash|search|href|pathname)/g, name: 'location.*' },
    { pattern: /document\.(?:URL|documentURI|referrer)/g, name: 'document.URL/referrer' },
    { pattern: /window\.name/g, name: 'window.name' }
  ];

  const sinkPatterns = [
    { pattern: /\.innerHTML\s*=/g, name: 'innerHTML' },
    { pattern: /\.outerHTML\s*=/g, name: 'outerHTML' },
    { pattern: /document\.write\s*\(/g, name: 'document.write' },
    { pattern: /eval\s*\(/g, name: 'eval()' },
    { pattern: /\$\([^)]*\)\.html\s*\(/g, name: 'jQuery.html()' }
  ];

  scripts.forEach((script, index) => {
    const content = script.textContent || '';
    if (!content.trim()) return;

    const foundSources = sourcePatterns.filter(s => s.pattern.test(content));
    const foundSinks = sinkPatterns.filter(s => s.pattern.test(content));

    if (foundSources.length > 0 && foundSinks.length > 0) {
      // Extraire un snippet du sink (plus dangereux)
      const sinkMatch = foundSinks[0];
      const snippet = extractCodeSnippet(content, sinkMatch.pattern);
      
      risks.push({
        type: 'dom-xss-flow',
        risk: 'high',
        description: `Flux DOM XSS: ${foundSources.map(s => s.name).join(', ')} → ${foundSinks.map(s => s.name).join(', ')}`,
        location: `Script inline #${index + 1}`,
        code: snippet
      });
    }
  });

  return summarizeRisks(risks, 'DOM XSS');
}
