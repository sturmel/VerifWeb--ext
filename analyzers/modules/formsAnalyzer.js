/**
 * Module d'analyse des formulaires
 */

export function analyzeForms() {
  const issues = [];
  const forms = document.querySelectorAll('form');

  forms.forEach((form, i) => {
    const formName = form.name || form.id || `Form #${i + 1}`;
    const action = form.getAttribute('action') || '';
    const method = (form.method || 'get').toUpperCase();

    // Détecter si le formulaire est géré par JavaScript (Vue, React, Angular, etc.)
    const hasJsHandler = form.onsubmit !== null ||
                        form.hasAttribute('@submit') || 
                        form.hasAttribute('@submit.prevent') ||
                        form.hasAttribute('v-on:submit') ||
                        form.hasAttribute('ng-submit');
    // Heuristique: si action vide/absente et pas de method explicite, probablement géré par JS
    const noRealAction = !form.getAttribute('action') || form.getAttribute('action') === '' || form.getAttribute('action') === '#';
    const isJsHandled = hasJsHandler || noRealAction;

    // HTTP action sur HTTPS
    if (action.startsWith('http://') && location.protocol === 'https:') {
      issues.push({ risk: 'high', description: `${formName}: Action HTTP sur page HTTPS` });
    }

    // POST sans HTTPS (seulement si pas géré par JS)
    if (method === 'POST' && location.protocol !== 'https:' && !isJsHandled) {
      issues.push({ risk: 'high', description: `${formName}: POST sans HTTPS` });
    }

    // Données sensibles en GET (seulement si pas géré par JS)
    const hasPassword = form.querySelector('input[type="password"]');
    const hasEmail = form.querySelector('input[type="email"]');
    if ((hasPassword || hasEmail) && method === 'GET' && !isJsHandled) {
      issues.push({ risk: 'high', description: `${formName}: sensible en GET` });
    }

    // Autocomplete sur données sensibles
    const sensitiveInputs = form.querySelectorAll('input[type="password"], input[type="credit-card"], input[name*="card"], input[name*="cvv"]');
    sensitiveInputs.forEach(input => {
      if (input.getAttribute('autocomplete') !== 'off') {
        issues.push({ risk: 'medium', description: `${formName}: Autocomplete actif sur champ sensible` });
      }
    });

    // Token CSRF (seulement pour vrais POST, pas JS)
    const hasToken = form.querySelector('input[name*="csrf"], input[name*="token"], input[name*="_token"]');
    if (method === 'POST' && !hasToken && !isJsHandled) {
      issues.push({ risk: 'medium', description: `${formName}: Pas de token CSRF visible` });
    }

    // target="_blank"
    if (form.target === '_blank' && !form.rel?.includes('noopener')) {
      issues.push({ risk: 'low', description: `${formName}: target="_blank" sans rel="noopener"` });
    }
  });

  return {
    status: issues.some(i => i.risk === 'high') ? 'fail' : issues.length > 2 ? 'warning' : 'pass',
    message: issues.length ? `${issues.length} problème(s) de formulaire` : `${forms.length} formulaire(s) vérifié(s) - OK`,
    details: issues
  };
}
