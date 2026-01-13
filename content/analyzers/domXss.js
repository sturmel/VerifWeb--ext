/**
 * VerifWeb - Analyse des risques DOM XSS
 */

window.VerifWeb = window.VerifWeb || {};
window.VerifWeb.Analyzers = window.VerifWeb.Analyzers || {};

window.VerifWeb.Analyzers.domXss = function() {
  const risks = [];
  const extractCodeSnippet = window.VerifWeb.extractCodeSnippet;
  const summarizeRisks = window.VerifWeb.summarizeRisks;
  
  // Sources de données non fiables
  const sourcePatterns = [
    { pattern: /location\.(hash|search|href)/g, name: 'location.*' },
    { pattern: /document\.(URL|referrer)/g, name: 'document.URL/referrer' }
  ];
  
  // Sinks dangereux
  const sinkPatterns = [
    { pattern: /\.innerHTML\s*=/g, name: 'innerHTML' },
    { pattern: /eval\s*\(/g, name: 'eval()' },
    { pattern: /document\.write/g, name: 'document.write' }
  ];
  
  const inlineScripts = document.querySelectorAll('script:not([src])');
  
  inlineScripts.forEach(function(script, scriptIndex) {
    const scriptContent = script.textContent || '';
    
    // Trouver les sources présentes
    const foundSources = sourcePatterns.filter(function(source) {
      return source.pattern.test(scriptContent);
    });
    
    // Trouver les sinks présents
    const foundSinks = sinkPatterns.filter(function(sink) {
      return sink.pattern.test(scriptContent);
    });
    
    // Si on a à la fois une source et un sink, c'est un risque
    if (foundSources.length > 0 && foundSinks.length > 0) {
      const sourceNames = foundSources.map(function(source) {
        return source.name;
      }).join(', ');
      
      const sinkNames = foundSinks.map(function(sink) {
        return sink.name;
      }).join(', ');
      
      const codeSnippet = extractCodeSnippet(scriptContent, foundSinks[0].pattern);
      
      risks.push({
        type: 'flow',
        risk: 'high',
        description: 'Flux DOM XSS: ' + sourceNames + ' → ' + sinkNames,
        location: 'Script inline #' + (scriptIndex + 1),
        code: codeSnippet
      });
    }
  });
  
  return summarizeRisks(risks, 'DOM XSS');
};
