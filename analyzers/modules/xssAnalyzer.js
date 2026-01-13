/**
 * Module d'analyse XSS
 */

const XSS_PATTERNS = [
  { pattern: /<script\b[^>]*>[\s\S]*?<\/script>/gi, risk: 'high', description: 'Script inline détecté' },
  { pattern: /javascript:/gi, risk: 'high', description: 'Lien javascript: détecté' },
  { pattern: /on\w+\s*=\s*["'][^"']*["']/gi, risk: 'medium', description: 'Event handler inline détecté' },
  { pattern: /data:\s*text\/html/gi, risk: 'high', description: 'Data URI HTML détecté' },
  { pattern: /<iframe[^>]*src\s*=\s*["'](?!https?:\/\/)[^"']*["']/gi, risk: 'medium', description: 'iframe source suspecte' },
  { pattern: /<img[^>]*onerror\s*=/gi, risk: 'high', description: 'Image avec onerror handler' },
  { pattern: /eval\s*\(/gi, risk: 'high', description: 'Utilisation de eval()' },
  { pattern: /document\.write\s*\(/gi, risk: 'medium', description: 'Utilisation de document.write()' },
  { pattern: /innerHTML\s*=/gi, risk: 'medium', description: 'Assignation innerHTML directe' },
  { pattern: /outerHTML\s*=/gi, risk: 'medium', description: 'Assignation outerHTML directe' }
];

export function analyzeXss() {
  const issues = [];
  const html = document.documentElement.innerHTML;

  XSS_PATTERNS.forEach(({ pattern, risk, description }) => {
    pattern.lastIndex = 0;
    const matches = html.match(pattern);
    if (matches) {
      issues.push({ risk, description, count: matches.length });
    }
  });

  // Scripts inline
  document.querySelectorAll('script:not([src])').forEach(script => {
    if (script.textContent.trim()) {
      issues.push({ risk: 'medium', description: `Script inline (${script.textContent.length} chars)` });
    }
  });

  // Event handlers
  const eventAttrs = ['onclick', 'onerror', 'onload', 'onmouseover', 'onfocus', 'onblur'];
  eventAttrs.forEach(attr => {
    const els = document.querySelectorAll(`[${attr}]`);
    if (els.length) {
      issues.push({ risk: 'medium', description: `${els.length} élément(s) avec ${attr}`, count: els.length });
    }
  });

  const highRisks = issues.filter(i => i.risk === 'high').length;
  return {
    status: highRisks > 0 ? 'fail' : issues.length > 3 ? 'warning' : 'pass',
    message: issues.length ? `${issues.length} risque(s) XSS potentiel(s)` : 'Aucun risque XSS détecté',
    details: issues
  };
}
