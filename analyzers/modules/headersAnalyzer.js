/**
 * Module d'analyse des headers de sécurité
 */

const SECURITY_HEADERS = {
  'content-security-policy': { name: 'Content-Security-Policy', importance: 'high', description: 'Protège contre XSS et injection' },
  'x-content-type-options': { name: 'X-Content-Type-Options', importance: 'medium', expected: 'nosniff', description: 'Empêche le sniffing MIME' },
  'x-frame-options': { name: 'X-Frame-Options', importance: 'medium', description: 'Protège contre le clickjacking' },
  'x-xss-protection': { name: 'X-XSS-Protection', importance: 'low', description: 'Protection XSS navigateur (obsolète)' },
  'strict-transport-security': { name: 'Strict-Transport-Security', importance: 'high', description: 'Force HTTPS' },
  'referrer-policy': { name: 'Referrer-Policy', importance: 'medium', description: 'Contrôle les informations de référent' },
  'permissions-policy': { name: 'Permissions-Policy', importance: 'medium', description: 'Contrôle les fonctionnalités navigateur' }
};

export function analyzeHeaders(headers) {
  let presentCount = 0;
  const highPriorityMissing = [];
  const headerDetails = {};

  for (const [key, config] of Object.entries(SECURITY_HEADERS)) {
    const isPresent = headers.hasOwnProperty(key);
    headerDetails[key] = isPresent;
    
    if (isPresent) presentCount++;
    else if (config.importance === 'high') highPriorityMissing.push(config.name);
  }

  const total = Object.keys(SECURITY_HEADERS).length;
  const percent = Math.round((presentCount / total) * 100);

  let status = 'pass', message = '';

  if (highPriorityMissing.length > 0) {
    status = 'fail';
    message = `Headers critiques manquants : ${highPriorityMissing.join(', ')}`;
  } else if (percent < 70) {
    status = 'warning';
    message = `${presentCount}/${total} headers de sécurité présents (${percent}%)`;
  } else {
    message = `Bonne configuration : ${presentCount}/${total} headers présents`;
  }

  return { status, message, details: headerDetails, stats: { present: presentCount, total, percent } };
}
