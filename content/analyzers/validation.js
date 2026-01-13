/**
 * Analyse de la validation des inputs
 */
export function analyzeInputValidation() {
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea');
  
  let withValidation = 0;
  let withoutValidation = 0;

  inputs.forEach(input => {
    const hasValidation = 
      input.required || input.pattern || input.minLength || input.maxLength ||
      input.min || input.max || ['email', 'url', 'tel', 'number', 'date'].includes(input.type);

    if (hasValidation) withValidation++;
    else withoutValidation++;
  });

  const total = withValidation + withoutValidation;
  if (total === 0) {
    return { status: 'info', message: 'Aucun champ de saisie détecté', details: [] };
  }

  const percent = Math.round((withValidation / total) * 100);
  
  return {
    status: percent >= 70 ? 'pass' : percent >= 40 ? 'warning' : 'fail',
    message: `${percent}% des champs validés (${withValidation}/${total})`,
    details: { withValidation, withoutValidation, percent }
  };
}
