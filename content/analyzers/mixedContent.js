/**
 * VerifWeb - Analyse du contenu mixte (HTTP sur HTTPS)
 */

window.VerifWeb = window.VerifWeb || {};
window.VerifWeb.Analyzers = window.VerifWeb.Analyzers || {};

window.VerifWeb.Analyzers.mixedContent = function() {
  if (location.protocol !== 'https:') {
    return { status: 'info', message: 'Site non HTTPS' };
  }
  
  const mixedResources = [];
  
  const selectors = [
    { selector: 'img[src^="http:"]', type: 'image' },
    { selector: 'script[src^="http:"]', type: 'script' },
    { selector: 'link[rel="stylesheet"][href^="http:"]', type: 'css' },
    { selector: 'iframe[src^="http:"]', type: 'iframe' }
  ];
  
  selectors.forEach(function(config) {
    document.querySelectorAll(config.selector).forEach(function(element) {
      mixedResources.push({
        type: config.type,
        src: element.src || element.href
      });
    });
  });
  
  if (mixedResources.length) {
    return {
      status: 'fail',
      message: `${mixedResources.length} ressource(s) HTTP`,
      details: mixedResources
    };
  }
  
  return { status: 'pass', message: 'Aucun contenu mixte' };
};
