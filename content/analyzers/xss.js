/**
 * Analyse des risques XSS (Cross-Site Scripting)
 */
import { summarizeRisks } from './utils.js';

export function analyzeXSSRisks() {
  const risks = [];
  
  // 1. Scripts inline
  const inlineScripts = document.querySelectorAll('script:not([src])');
  inlineScripts.forEach((script, index) => {
    const content = script.textContent || '';
    
    const dangerousPatterns = [
      { pattern: /innerHTML\s*=/, risk: 'high', desc: 'innerHTML (risque XSS)' },
      { pattern: /outerHTML\s*=/, risk: 'high', desc: 'outerHTML (risque XSS)' },
      { pattern: /document\.write\s*\(/, risk: 'high', desc: 'document.write (risque XSS)' },
      { pattern: /eval\s*\(/, risk: 'critical', desc: 'eval() (risque critique)' },
      { pattern: /new\s+Function\s*\(/, risk: 'critical', desc: 'new Function() (critique)' },
      { pattern: /setTimeout\s*\(\s*['"`]/, risk: 'high', desc: 'setTimeout avec string' },
      { pattern: /setInterval\s*\(\s*['"`]/, risk: 'high', desc: 'setInterval avec string' },
      { pattern: /\.insertAdjacentHTML\s*\(/, risk: 'medium', desc: 'insertAdjacentHTML' }
    ];

    dangerousPatterns.forEach(({ pattern, risk, desc }) => {
      if (pattern.test(content)) {
        risks.push({ type: 'inline-script', risk, description: desc, location: `Script #${index + 1}` });
      }
    });
  });

  // 2. Event handlers inline
  const eventHandlers = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onsubmit'];
  eventHandlers.forEach(attr => {
    const elements = document.querySelectorAll(`[${attr}]`);
    if (elements.length > 0) {
      risks.push({
        type: 'inline-handler',
        risk: 'medium',
        description: `${elements.length} élément(s) avec ${attr}`,
        count: elements.length
      });
    }
  });

  // 3. javascript: URLs
  const jsUrls = document.querySelectorAll('[href^="javascript:"], [src^="javascript:"]');
  if (jsUrls.length > 0) {
    risks.push({
      type: 'javascript-url',
      risk: 'high',
      description: `${jsUrls.length} lien(s) javascript:`,
      count: jsUrls.length
    });
  }

  // 4. data: URLs dangereuses
  const dataUrls = document.querySelectorAll('script[src^="data:"], iframe[src^="data:"]');
  if (dataUrls.length > 0) {
    risks.push({
      type: 'data-url',
      risk: 'high',
      description: `${dataUrls.length} ressource(s) data:`,
      count: dataUrls.length
    });
  }

  return summarizeRisks(risks, 'XSS');
}
