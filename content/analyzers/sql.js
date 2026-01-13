/**
 * Analyse des patterns SQL et données sensibles
 */
import { summarizeRisks } from './utils.js';

export function analyzeSQLPatterns() {
  const risks = [];
  const html = document.documentElement.outerHTML;

  // Recherche de messages d'erreur SQL (patterns stricts pour éviter les faux positifs)
  const sqlErrorPatterns = [
    { pattern: /You have an error in your SQL syntax/i, db: 'MySQL' },
    { pattern: /Warning.*mysql_fetch|Warning.*mysql_query/i, db: 'MySQL' },
    { pattern: /ERROR:\s+syntax error at or near/i, db: 'PostgreSQL' },
    { pattern: /pg_query\(\)|pg_exec\(\)|PG::Error/i, db: 'PostgreSQL' },
    { pattern: /ORA-\d{5}:/i, db: 'Oracle' },
    { pattern: /Microsoft.*ODBC.*SQL Server/i, db: 'SQL Server' },
    { pattern: /SQLite3::SQLException/i, db: 'SQLite' },
    { pattern: /SQLSTATE\[\d+\]/i, db: 'PDO/SQL' },
    { pattern: /mysql_fetch_array\(\)/i, db: 'MySQL' },
    { pattern: /Unclosed quotation mark after the character string/i, db: 'SQL Server' },
    { pattern: /quoted string not properly terminated/i, db: 'Oracle' }
  ];

  sqlErrorPatterns.forEach(({ pattern, db }) => {
    if (pattern.test(html)) {
      const match = html.match(pattern);
      risks.push({
        type: 'sql-error-exposed',
        risk: 'critical',
        description: `Message d'erreur ${db} exposé (fuite d'information)`,
        code: match ? match[0].substring(0, 100) : null
      });
    }
  });

  // URLs avec paramètres suspects
  const urlParams = new URLSearchParams(window.location.search);
  const suspiciousValues = ["'", '"', '--', ';', 'OR 1=1', 'UNION', 'SELECT'];
  
  for (const [key, value] of urlParams) {
    if (suspiciousValues.some(s => value.toUpperCase().includes(s))) {
      risks.push({
        type: 'sql-injection-attempt',
        risk: 'warning',
        description: `Paramètre "${key}" contient des caractères SQL suspects`
      });
    }
  }

  // Commentaires HTML avec données sensibles (plus strict: doit contenir un "=")
  const comments = html.match(/<!--[\s\S]*?-->/g) || [];
  comments.forEach(comment => {
    if (/password\s*=|secret\s*=|api_key\s*=|token\s*=/i.test(comment)) {
      risks.push({
        type: 'sensitive-comment',
        risk: 'high',
        description: 'Commentaire HTML avec données potentiellement sensibles'
      });
    }
  });

  return summarizeRisks(risks, 'SQL/Données');
}
