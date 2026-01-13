/**
 * Utilitaires partagés pour les analyseurs
 */

/**
 * Extrait un snippet de code autour d'un pattern trouvé
 */
export function extractCodeSnippet(content, pattern, contextChars = 50) {
  // Reset lastIndex si c'est une regex globale
  if (pattern.global) pattern.lastIndex = 0;
  
  const match = content.match(pattern);
  if (!match || match.index === undefined) {
    // Chercher manuellement
    const strMatch = content.match(new RegExp(pattern.source));
    if (!strMatch) return null;
    const index = content.indexOf(strMatch[0]);
    if (index === -1) return null;
    
    const start = Math.max(0, index - contextChars);
    const end = Math.min(content.length, index + strMatch[0].length + contextChars);
    let snippet = content.substring(start, end).trim().replace(/\s+/g, ' ');
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    return snippet;
  }
  
  const index = match.index;
  const start = Math.max(0, index - contextChars);
  const end = Math.min(content.length, index + match[0].length + contextChars);
  
  let snippet = content.substring(start, end).trim().replace(/\s+/g, ' ');
  if (start > 0) snippet = '...' + snippet;
  if (end < content.length) snippet = snippet + '...';
  
  return snippet;
}

/**
 * Obtient un sélecteur CSS pour identifier un élément
 */
export function getElementSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ').filter(c => c).slice(0, 2).join('.');
    if (classes) return `${element.tagName.toLowerCase()}.${classes}`;
  }
  return element.tagName.toLowerCase();
}

/**
 * Résume les risques détectés
 */
export function summarizeRisks(risks, category) {
  if (risks.length === 0) {
    return { status: 'pass', message: `${category}: Aucun risque détecté`, details: [] };
  }

  const critical = risks.filter(r => r.risk === 'critical').length;
  const high = risks.filter(r => r.risk === 'high').length;
  const medium = risks.filter(r => r.risk === 'medium').length;

  let status = 'pass';
  if (critical > 0 || high > 0) status = 'fail';
  else if (medium > 0) status = 'warning';

  const summary = [];
  if (critical) summary.push(`${critical} critique(s)`);
  if (high) summary.push(`${high} élevé(s)`);
  if (medium) summary.push(`${medium} moyen(s)`);

  return {
    status,
    message: `${category}: ${risks.length} risque(s) - ${summary.join(', ') || 'faibles'}`,
    details: risks
  };
}
