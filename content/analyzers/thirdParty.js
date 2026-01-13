/**
 * VerifWeb - Analyse des ressources tierces
 */

window.VerifWeb = window.VerifWeb || {};
window.VerifWeb.Analyzers = window.VerifWeb.Analyzers || {};

window.VerifWeb.Analyzers.thirdParty = function() {
  const currentDomain = location.hostname.split('.').slice(-2).join('.');
  const thirdPartyDomains = new Set();
  const thirdPartyResources = [];
  
  function isThirdParty(url) {
    try {
      const parsedUrl = new URL(url, location.origin);
      const resourceDomain = parsedUrl.hostname.split('.').slice(-2).join('.');
      return resourceDomain !== currentDomain;
    } catch (error) {
      return false;
    }
  }
  
  const resourceSelectors = [
    { selector: 'script[src]', property: 'src' },
    { selector: 'link[rel="stylesheet"][href]', property: 'href' },
    { selector: 'img[src]', property: 'src' },
    { selector: 'iframe[src]', property: 'src' }
  ];
  
  resourceSelectors.forEach(function(config) {
    document.querySelectorAll(config.selector).forEach(function(element) {
      const resourceUrl = element[config.property];
      if (isThirdParty(resourceUrl)) {
        const domain = new URL(resourceUrl).hostname;
        thirdPartyDomains.add(domain);
        thirdPartyResources.push({ domain: domain, src: resourceUrl });
      }
    });
  });
  
  const domainCount = thirdPartyDomains.size;
  
  if (domainCount === 0) {
    return { status: 'pass', message: 'Aucune ressource tierce' };
  }
  
  let status = 'pass';
  if (domainCount > 20) {
    status = 'fail';
  } else if (domainCount > 10) {
    status = 'warning';
  }
  
  return {
    status: status,
    message: `${thirdPartyResources.length} ressources de ${domainCount} domaines`,
    details: {
      domains: Array.from(thirdPartyDomains),
      resources: thirdPartyResources
    }
  };
};
