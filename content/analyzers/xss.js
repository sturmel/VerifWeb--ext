/**
 * VerifWeb - Analyse des risques XSS
 */

window.VerifWeb = window.VerifWeb || {};
window.VerifWeb.Analyzers = window.VerifWeb.Analyzers || {};

window.VerifWeb.Analyzers.xss = function() {
  const risks = [];
  const extractCodeSnippet = window.VerifWeb.extractCodeSnippet;
  const summarizeRisks = window.VerifWeb.summarizeRisks;
  
  // Patterns dangereux dans les scripts inline
  const dangerousPatterns = [
    { pattern: /innerHTML\s*=/, risk: 'high', description: 'innerHTML (risque XSS)' },
    { pattern: /eval\s*\(/, risk: 'critical', description: 'eval() - exécution de code' },
    { pattern: /document\.write\s*\(/, risk: 'high', description: 'document.write' },
    { pattern: /new\s+Function\s*\(/, risk: 'critical', description: 'new Function()' }
  ];
  
  // Analyser les scripts inline
  const inlineScripts = document.querySelectorAll('script:not([src])');
  inlineScripts.forEach(function(script, scriptIndex) {
    const scriptContent = script.textContent || '';
    
    dangerousPatterns.forEach(function(config) {
      if (config.pattern.test(scriptContent)) {
        risks.push({
          type: 'script',
          risk: config.risk,
          description: config.description,
          location: `Script inline #${scriptIndex + 1}`,
          code: extractCodeSnippet(scriptContent, config.pattern)
        });
      }
    });
  });
  
  // Analyser les attributs event handlers
  const eventAttributes = ['onclick', 'onerror', 'onload'];
  
  eventAttributes.forEach(function(attribute) {
    var elementsWithAttribute = Array.from(document.querySelectorAll('[' + attribute + ']'));
    
    // Filtrer les patterns légitimes (faux positifs)
    elementsWithAttribute = elementsWithAttribute.filter(function(element) {
      const handlerCode = element.getAttribute(attribute) || '';
      const tagName = element.tagName.toLowerCase();
      
      // Pattern loadCSS: <link onload="this.onload=null;this.rel='stylesheet'">
      if (tagName === 'link' && attribute === 'onload') {
        if (/this\.onload\s*=\s*null/.test(handlerCode)) {
          return false;
        }
      }
      
      // Pattern image lazy loading
      if (tagName === 'img' && attribute === 'onload') {
        if (/this\.onload\s*=\s*null/.test(handlerCode)) {
          return false;
        }
      }
      
      return true;
    });
    
    if (elementsWithAttribute.length) {
      const firstElement = elementsWithAttribute[0];
      const tagName = firstElement.tagName.toLowerCase();
      const handlerCode = firstElement.getAttribute(attribute);
      const handlerSample = handlerCode.substring(0, 50);
      const isTruncated = handlerCode.length > 50;
      
      risks.push({
        type: 'handler',
        risk: 'medium',
        description: `${elementsWithAttribute.length}× attribut ${attribute}`,
        location: `<${tagName}>`,
        code: `<${tagName} ${attribute}="${handlerSample}${isTruncated ? '...' : ''}">`
      });
    }
  });
  
  // Analyser les liens javascript:
  const javascriptLinks = document.querySelectorAll('[href^="javascript:"]');
  if (javascriptLinks.length) {
    const firstLink = javascriptLinks[0];
    const hrefValue = firstLink.getAttribute('href');
    const hrefSample = hrefValue.substring(0, 60);
    
    risks.push({
      type: 'js-url',
      risk: 'high',
      description: `${javascriptLinks.length} lien(s) javascript:`,
      code: `<a href="${hrefSample}...">`
    });
  }
  
  return summarizeRisks(risks, 'XSS');
};
