/**
 * Analyse de la sécurité des formulaires
 */
import { summarizeRisks } from './utils.js';

export function analyzeFormSecurity() {
  const risks = [];
  const forms = document.querySelectorAll('form');

  if (forms.length === 0) {
    return { status: 'info', message: 'Aucun formulaire détecté', details: [] };
  }

  forms.forEach((form, index) => {
    // Détecter si le formulaire est géré par JavaScript (Vue, React, Angular, etc.)
    const hasJsHandler = form.onsubmit !== null ||
                        form.hasAttribute('@submit') || 
                        form.hasAttribute('@submit.prevent') ||
                        form.hasAttribute('v-on:submit') ||
                        form.hasAttribute('ng-submit');
    // Heuristique: si action vide/absente et pas de method explicite, probablement géré par JS
    const noRealAction = !form.getAttribute('action') || form.getAttribute('action') === '' || form.getAttribute('action') === '#';
    const isJsHandled = hasJsHandler || noRealAction;

    // Action HTTP sur page HTTPS
    if (form.action && form.action.startsWith('http://') && window.location.protocol === 'https:') {
      risks.push({
        type: 'insecure-action',
        risk: 'critical',
        description: `Formulaire #${index + 1}: action vers HTTP (non chiffré)`
      });
    }

    // Données sensibles en GET (seulement si pas géré par JS)
    const hasPassword = form.querySelector('input[type="password"]');
    const hasEmail = form.querySelector('input[type="email"]');
    
    if ((hasPassword || hasEmail) && form.method.toUpperCase() === 'GET' && !isJsHandled) {
      risks.push({
        type: 'sensitive-get',
        risk: 'high',
        description: `Formulaire #${index + 1}: données sensibles en GET`
      });
    }

    // Token CSRF
    const csrfPatterns = ['csrf', 'token', '_token', 'authenticity_token', 'xsrf'];
    const hasCSRF = Array.from(form.querySelectorAll('input[type="hidden"]')).some(input => 
      csrfPatterns.some(p => input.name?.toLowerCase().includes(p))
    );

    if (!hasCSRF && form.method.toUpperCase() === 'POST') {
      risks.push({
        type: 'no-csrf',
        risk: 'medium',
        description: `Formulaire #${index + 1}: pas de token CSRF détecté`
      });
    }
  });

  return summarizeRisks(risks, 'Formulaires');
}
