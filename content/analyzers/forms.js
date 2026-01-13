/**
 * Analyse de la sécurité des formulaires
 */
import { summarizeRisks, getElementSelector } from './utils.js';

export function analyzeFormSecurity() {
  const risks = [];
  const forms = document.querySelectorAll('form');

  if (forms.length === 0) {
    return { status: 'info', message: 'Aucun formulaire détecté', details: [] };
  }

  forms.forEach((form, index) => {
    const formSelector = getElementSelector(form);
    const formLocation = form.id ? `#${form.id}` : (form.name ? `[name="${form.name}"]` : `Formulaire #${index + 1}`);
    
    // Détecter si le formulaire est géré par JavaScript (Vue, React, Angular, etc.)
    const hasJsHandler = form.onsubmit !== null ||
                        form.hasAttribute('@submit') || 
                        form.hasAttribute('@submit.prevent') ||
                        form.hasAttribute('v-on:submit') ||
                        form.hasAttribute('ng-submit');
    const noRealAction = !form.getAttribute('action') || form.getAttribute('action') === '' || form.getAttribute('action') === '#';
    const isJsHandled = hasJsHandler || noRealAction;

    // Générer un aperçu HTML du formulaire
    const formPreview = `<form${form.id ? ` id="${form.id}"` : ''}${form.action ? ` action="${form.getAttribute('action')}"` : ''} method="${form.method}">`;

    // Action HTTP sur page HTTPS
    if (form.action && form.action.startsWith('http://') && window.location.protocol === 'https:') {
      risks.push({
        type: 'insecure-action',
        risk: 'critical',
        description: `${formLocation}: action vers HTTP (non chiffré)`,
        location: formSelector,
        code: formPreview
      });
    }

    // Données sensibles en GET
    const hasPassword = form.querySelector('input[type="password"]');
    const hasEmail = form.querySelector('input[type="email"]');
    
    if ((hasPassword || hasEmail) && form.method.toUpperCase() === 'GET' && !isJsHandled) {
      risks.push({
        type: 'sensitive-get',
        risk: 'high',
        description: `${formLocation}: données sensibles en GET`,
        location: formSelector,
        code: formPreview
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
        description: `${formLocation}: pas de token CSRF visible`,
        location: formSelector,
        code: formPreview
      });
    }
  });

  return summarizeRisks(risks, 'Formulaires');
}
