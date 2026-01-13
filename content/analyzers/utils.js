/**
 * Utilitaire pour résumer les risques détectés
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
