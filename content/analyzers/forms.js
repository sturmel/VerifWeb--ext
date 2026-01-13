/**
 * VerifWeb - Analyse de la sécurité des formulaires
 */

window.VerifWeb = window.VerifWeb || {};
window.VerifWeb.Analyzers = window.VerifWeb.Analyzers || {};

window.VerifWeb.Analyzers.forms = function() {
  const risks = [];
  const summarizeRisks = window.VerifWeb.summarizeRisks;
  const forms = document.querySelectorAll('form');
  
  if (!forms.length) {
    return { status: 'info', message: 'Aucun formulaire', details: [] };
  }
  
  forms.forEach(function(form, formIndex) {
    // Détecter si le formulaire est géré par JavaScript
    const hasJsHandler = form.onsubmit !== null ||
                         form.hasAttribute('@submit') ||
                         form.hasAttribute('@submit.prevent') ||
                         form.hasAttribute('v-on:submit') ||
                         form.hasAttribute('ng-submit');
    
    const actionAttribute = form.getAttribute('action');
    const hasNoRealAction = !actionAttribute || 
                            actionAttribute === '' || 
                            actionAttribute === '#';
    const isJsHandled = hasJsHandler || hasNoRealAction;
    
    // Identifiant du formulaire pour les messages
    let formIdentifier;
    if (form.id) {
      formIdentifier = '#' + form.id;
    } else if (form.name) {
      formIdentifier = '[name="' + form.name + '"]';
    } else {
      formIdentifier = 'Form #' + (formIndex + 1);
    }
    
    // Code HTML du formulaire pour affichage
    let formHtmlPreview = '<form';
    if (form.id) {
      formHtmlPreview += ' id="' + form.id + '"';
    }
    if (actionAttribute) {
      formHtmlPreview += ' action="' + actionAttribute + '"';
    }
    formHtmlPreview += ' method="' + form.method + '">';
    
    // Vérifier action HTTP sur page HTTPS
    const formAction = form.action;
    if (formAction && formAction.startsWith('http://') && location.protocol === 'https:') {
      risks.push({
        type: 'http-action',
        risk: 'critical',
        description: formIdentifier + ': action HTTP non sécurisée',
        location: formIdentifier,
        code: formHtmlPreview
      });
    }
    
    // Vérifier données sensibles en GET
    const hasPasswordField = form.querySelector('input[type="password"]');
    const hasEmailField = form.querySelector('input[type="email"]');
    const hasSensitiveData = hasPasswordField || hasEmailField;
    const isGetMethod = form.method.toUpperCase() === 'GET';
    
    if (hasSensitiveData && isGetMethod && !isJsHandled) {
      risks.push({
        type: 'get',
        risk: 'high',
        description: formIdentifier + ': données sensibles en GET',
        location: formIdentifier,
        code: formHtmlPreview
      });
    }
  });
  
  return summarizeRisks(risks, 'Formulaires');
};
