/**
 * VerifWeb - Utilitaires partagés pour les analyseurs
 */

window.VerifWeb = window.VerifWeb || {};

/**
 * Résume les risques détectés en un objet standardisé
 */
window.VerifWeb.summarizeRisks = function(risks, category) {
  if (!risks.length) {
    return { status: 'pass', message: `${category}: Aucun risque`, details: [] };
  }
  
  const criticalCount = risks.filter(function(risk) { return risk.risk === 'critical'; }).length;
  const highCount = risks.filter(function(risk) { return risk.risk === 'high'; }).length;
  const mediumCount = risks.filter(function(risk) { return risk.risk === 'medium'; }).length;
  
  let status = 'pass';
  if (criticalCount || highCount) {
    status = 'fail';
  } else if (mediumCount) {
    status = 'warning';
  }
  
  const summaryParts = [
    criticalCount && `${criticalCount} critique(s)`,
    highCount && `${highCount} élevé(s)`,
    mediumCount && `${mediumCount} moyen(s)`
  ].filter(Boolean);
  
  return {
    status: status,
    message: `${category}: ${risks.length} risque(s) - ${summaryParts.join(', ') || 'faibles'}`,
    details: risks
  };
};

/**
 * Extrait un snippet de code autour d'un pattern trouvé
 */
window.VerifWeb.extractCodeSnippet = function(content, pattern, contextLength) {
  contextLength = contextLength || 40;
  
  const regex = new RegExp(pattern.source || pattern);
  const match = content.match(regex);
  if (!match) return null;
  
  const matchIndex = content.indexOf(match[0]);
  if (matchIndex === -1) return null;
  
  const startIndex = Math.max(0, matchIndex - contextLength);
  const endIndex = Math.min(content.length, matchIndex + match[0].length + contextLength);
  
  let snippet = content.substring(startIndex, endIndex).trim().replace(/\s+/g, ' ');
  
  if (startIndex > 0) snippet = '...' + snippet;
  if (endIndex < content.length) snippet = snippet + '...';
  
  return snippet;
};
