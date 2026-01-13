/**
 * VerifWeb - Analyse de la validation des champs
 */

window.VerifWeb = window.VerifWeb || {};
window.VerifWeb.Analyzers = window.VerifWeb.Analyzers || {};

window.VerifWeb.Analyzers.validation = function() {
  const inputSelector = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea';
  const inputs = document.querySelectorAll(inputSelector);
  
  let validatedCount = 0;
  let unvalidatedCount = 0;
  
  const validatedTypes = ['email', 'url', 'tel', 'number', 'date'];
  
  inputs.forEach(function(input) {
    const hasRequiredAttribute = input.required;
    const hasPatternAttribute = input.pattern;
    const hasMinLengthAttribute = input.minLength > 0;
    const hasMaxLengthAttribute = input.maxLength > 0;
    const hasValidationType = validatedTypes.indexOf(input.type) !== -1;
    
    const hasValidation = hasRequiredAttribute || 
                          hasPatternAttribute || 
                          hasMinLengthAttribute || 
                          hasMaxLengthAttribute || 
                          hasValidationType;
    
    if (hasValidation) {
      validatedCount++;
    } else {
      unvalidatedCount++;
    }
  });
  
  const totalCount = validatedCount + unvalidatedCount;
  
  if (totalCount === 0) {
    return { status: 'info', message: 'Aucun champ', details: [] };
  }
  
  const validationPercentage = Math.round((validatedCount / totalCount) * 100);
  
  let status;
  if (validationPercentage >= 70) {
    status = 'pass';
  } else if (validationPercentage >= 40) {
    status = 'warning';
  } else {
    status = 'fail';
  }
  
  return {
    status: status,
    message: validationPercentage + '% validés (' + validatedCount + '/' + totalCount + ')',
    details: {
      validated: validatedCount,
      unvalidated: unvalidatedCount,
      percentage: validationPercentage
    }
  };
};
