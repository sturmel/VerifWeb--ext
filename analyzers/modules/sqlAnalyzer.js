/**
 * Module de détection de patterns SQL
 */

const SQL_PATTERNS = [
  { pattern: /(['"])\s*OR\s+\1?\s*\d+\s*=\s*\d+/gi, risk: 'high', description: 'Pattern OR 1=1 détecté' },
  { pattern: /UNION\s+(ALL\s+)?SELECT/gi, risk: 'high', description: 'UNION SELECT détecté' },
  { pattern: /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER)\s/gi, risk: 'high', description: 'Commande SQL dangereuse' },
  { pattern: /--\s*$/gm, risk: 'medium', description: 'Commentaire SQL détecté' },
  { pattern: /\/\*[\s\S]*?\*\//g, risk: 'low', description: 'Commentaire bloc SQL' },
  { pattern: /EXEC(\s+|\()+(sp_|xp_)/gi, risk: 'high', description: 'Exécution de procédure stockée' },
  { pattern: /WAITFOR\s+DELAY/gi, risk: 'high', description: 'Time-based injection pattern' }
];

export function analyzeSqlPatterns() {
  const issues = [];
  const pageText = document.body?.innerText || '';
  const html = document.documentElement.innerHTML;

  // Check patterns dans le contenu
  SQL_PATTERNS.forEach(({ pattern, risk, description }) => {
    pattern.lastIndex = 0;
    if (pattern.test(html)) {
      issues.push({ risk, description: `Dans HTML: ${description}` });
    }
    pattern.lastIndex = 0;
    if (pattern.test(pageText)) {
      issues.push({ risk, description: `Dans texte: ${description}` });
    }
  });

  // Messages d'erreur SQL exposés
  const errorPatterns = [
    /SQL syntax.*MySQL/i,
    /Warning.*mysql_/i,
    /PostgreSQL.*ERROR/i,
    /ORA-\d{5}/,
    /Microsoft SQL Server/i,
    /Unclosed quotation mark/i,
    /SQLSTATE\[/i
  ];

  errorPatterns.forEach(pattern => {
    if (pattern.test(pageText)) {
      issues.push({ risk: 'high', description: 'Message d\'erreur SQL exposé' });
    }
  });

  // Check URL
  const urlParams = new URLSearchParams(location.search);
  urlParams.forEach((value, key) => {
    SQL_PATTERNS.forEach(({ pattern, risk, description }) => {
      pattern.lastIndex = 0;
      if (pattern.test(value)) {
        issues.push({ risk: 'high', description: `Param "${key}": ${description}` });
      }
    });
  });

  return {
    status: issues.some(i => i.risk === 'high') ? 'fail' : issues.length ? 'warning' : 'pass',
    message: issues.length ? `${issues.length} pattern(s) SQL suspect(s)` : 'Aucun pattern SQL suspect',
    details: issues
  };
}
