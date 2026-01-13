/**
 * Analyse des patterns SQL et données sensibles
 */
import { summarizeRisks } from './utils.js';

export function analyzeSQLPatterns() {
  const risks = [];
  const html = document.documentElement.outerHTML;

  // Recherche de messages d'erreur SQL
  const sqlErrorPatterns = [
    /SQL syntax.*MySQL/i,
    /Warning.*mysql_/i,
    /PostgreSQL.*ERROR/i,
    /ORA-\d{5}/i,
    /Microsoft.*ODBC.*SQL Server/i,
    /SQLite.*error/i,
    /mysql_fetch_array/i,
    /Unclosed quotation mark/i,
    /quoted string not properly terminated/i
  ];

  sqlErrorPatterns.forEach(pattern => {
    if (pattern.test(html)) {
      risks.push({
        type: 'sql-error-exposed',
        risk: 'critical',
        description: 'Message d\'erreur SQL exposé (fuite d\'information)'
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

  // Commentaires HTML avec données sensibles
  const comments = html.match(/<!--[\s\S]*?-->/g) || [];
  comments.forEach(comment => {
    if (/password|secret|key|api_key|token/i.test(comment)) {
      risks.push({
        type: 'sensitive-comment',
        risk: 'high',
        description: 'Commentaire HTML avec données potentiellement sensibles'
      });
    }
  });

  return summarizeRisks(risks, 'SQL/Données');
}
