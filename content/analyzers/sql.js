/**
 * VerifWeb - Analyse des patterns SQL et données sensibles
 */

window.VerifWeb = window.VerifWeb || {};
window.VerifWeb.Analyzers = window.VerifWeb.Analyzers || {};

window.VerifWeb.Analyzers.sql = function() {
  const risks = [];
  const summarizeRisks = window.VerifWeb.summarizeRisks;
  const pageHtml = document.documentElement.outerHTML;
  
  // Patterns d'erreurs SQL réelles (stricts pour éviter les faux positifs)
  const sqlErrorPatterns = [
    { pattern: /You have an error in your SQL syntax/i, database: 'MySQL' },
    { pattern: /mysql_fetch|mysql_query|mysqli_/i, database: 'MySQL' },
    { pattern: /ERROR:\s+syntax error at or near/i, database: 'PostgreSQL' },
    { pattern: /pg_query|pg_exec|PG::Error/i, database: 'PostgreSQL' },
    { pattern: /ORA-\d{5}:/i, database: 'Oracle' },
    { pattern: /SQLite3::SQLException/i, database: 'SQLite' },
    { pattern: /SQLSTATE\[\d+\]/i, database: 'SQL' },
    { pattern: /Unclosed quotation mark/i, database: 'SQL Server' },
    { pattern: /quoted string not properly terminated/i, database: 'SQL' }
  ];
  
  sqlErrorPatterns.forEach(function(config) {
    if (config.pattern.test(pageHtml)) {
      const match = pageHtml.match(config.pattern);
      const codeSnippet = match ? match[0].substring(0, 80) : null;
      
      risks.push({
        type: 'sql-error',
        risk: 'critical',
        description: 'Erreur ' + config.database + ' exposée',
        code: codeSnippet
      });
    }
  });
  
  // Commentaires HTML sensibles
  const htmlComments = pageHtml.match(/<!--[\s\S]*?-->/g) || [];
  const sensitiveCommentPattern = /password\s*=|secret\s*=|api_key\s*=|token\s*=/i;
  
  htmlComments.forEach(function(comment) {
    if (sensitiveCommentPattern.test(comment)) {
      let truncatedComment = comment;
      if (comment.length > 100) {
        truncatedComment = comment.substring(0, 100) + '...';
      }
      
      risks.push({
        type: 'comment',
        risk: 'high',
        description: 'Commentaire sensible',
        code: truncatedComment
      });
    }
  });
  
  return summarizeRisks(risks, 'SQL/Données');
};
