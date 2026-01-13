/**
 * Module d'analyse DOM XSS
 */

export function analyzeDomXss() {
  const issues = [];
  const scripts = document.querySelectorAll('script:not([src])');

  const dangerousSinks = [
    { pattern: /\.innerHTML\s*=/, description: 'innerHTML assignment' },
    { pattern: /\.outerHTML\s*=/, description: 'outerHTML assignment' },
    { pattern: /document\.write\s*\(/, description: 'document.write()' },
    { pattern: /document\.writeln\s*\(/, description: 'document.writeln()' },
    { pattern: /eval\s*\(/, description: 'eval()' },
    { pattern: /setTimeout\s*\(\s*["']/, description: 'setTimeout avec string' },
    { pattern: /setInterval\s*\(\s*["']/, description: 'setInterval avec string' },
    { pattern: /new\s+Function\s*\(/, description: 'new Function()' },
    { pattern: /\.insertAdjacentHTML\s*\(/, description: 'insertAdjacentHTML()' }
  ];

  const dangerousSources = [
    { pattern: /location\.(hash|search|href|pathname)/, description: 'lecture location' },
    { pattern: /document\.URL/, description: 'document.URL' },
    { pattern: /document\.referrer/, description: 'document.referrer' },
    { pattern: /window\.name/, description: 'window.name' },
    { pattern: /document\.cookie/, description: 'document.cookie' }
  ];

  scripts.forEach(script => {
    const code = script.textContent;

    dangerousSinks.forEach(({ pattern, description }) => {
      if (pattern.test(code)) {
        issues.push({ risk: 'medium', description: `Sink dangereux: ${description}` });
      }
    });

    // Source -> Sink direct
    dangerousSources.forEach(source => {
      dangerousSinks.forEach(sink => {
        const combined = new RegExp(`${source.pattern.source}[^;]*${sink.pattern.source}`);
        if (combined.test(code)) {
          issues.push({ risk: 'high', description: `${source.description} → ${sink.description}` });
        }
      });
    });
  });

  return {
    status: issues.some(i => i.risk === 'high') ? 'fail' : issues.length > 2 ? 'warning' : 'pass',
    message: issues.length ? `${issues.length} risque(s) DOM XSS` : 'Aucun risque DOM XSS détecté',
    details: issues
  };
}
