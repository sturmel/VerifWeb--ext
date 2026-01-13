/**
 * Module d'analyse de validation des entrées
 */

export function analyzeInputValidation() {
  const issues = [];
  const inputs = document.querySelectorAll('input, textarea, select');

  inputs.forEach((input, i) => {
    const name = input.name || input.id || `Input #${i + 1}`;
    const type = input.type || 'text';

    // Champs sans validation
    if (['text', 'email', 'tel', 'url', 'number'].includes(type)) {
      const hasValidation = input.pattern || input.required || input.minLength || input.maxLength || 
                           input.min || input.max || input.getAttribute('data-validate');
      
      if (!hasValidation && !input.readOnly && !input.disabled) {
        issues.push({ risk: 'low', description: `${name}: Pas de validation côté client` });
      }
    }

    // Email sans pattern
    if (type === 'email' && !input.pattern) {
      issues.push({ risk: 'low', description: `${name}: Email sans pattern de validation` });
    }

    // Maxlength recommandé
    if (['text', 'password', 'search'].includes(type) && !input.maxLength) {
      issues.push({ risk: 'low', description: `${name}: Pas de maxlength défini` });
    }
  });

  // Textarea sans maxlength
  document.querySelectorAll('textarea:not([maxlength])').forEach((ta, i) => {
    issues.push({ risk: 'low', description: `Textarea ${ta.name || '#' + (i + 1)}: Pas de maxlength` });
  });

  const criticalCount = issues.filter(i => i.risk !== 'low').length;
  return {
    status: criticalCount > 0 ? 'warning' : issues.length > 5 ? 'warning' : 'pass',
    message: issues.length ? `${issues.length} amélioration(s) de validation suggérée(s)` : 'Validation des entrées OK',
    details: issues
  };
}
