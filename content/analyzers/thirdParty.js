/**
 * Analyse des ressources tierces
 */
export function analyzeThirdPartyResources() {
  const currentDomain = window.location.hostname;
  const thirdPartyDomains = new Set();
  const thirdPartyResources = [];

  // Helper to check if domain is third-party
  const isThirdParty = (url) => {
    try {
      const urlObj = new URL(url, window.location.origin);
      const domain = urlObj.hostname;
      const currentParts = currentDomain.split('.').slice(-2).join('.');
      const resourceParts = domain.split('.').slice(-2).join('.');
      return currentParts !== resourceParts;
    } catch {
      return false;
    }
  };

  // Check scripts
  document.querySelectorAll('script[src]').forEach(el => {
    if (isThirdParty(el.src)) {
      const domain = new URL(el.src).hostname;
      thirdPartyDomains.add(domain);
      thirdPartyResources.push({ type: 'script', domain, src: el.src });
    }
  });

  // Check stylesheets
  document.querySelectorAll('link[rel="stylesheet"][href]').forEach(el => {
    if (isThirdParty(el.href)) {
      const domain = new URL(el.href).hostname;
      thirdPartyDomains.add(domain);
      thirdPartyResources.push({ type: 'stylesheet', domain, src: el.href });
    }
  });

  // Check images
  document.querySelectorAll('img[src]').forEach(el => {
    if (isThirdParty(el.src)) {
      const domain = new URL(el.src).hostname;
      thirdPartyDomains.add(domain);
      thirdPartyResources.push({ type: 'image', domain, src: el.src });
    }
  });

  // Check iframes
  document.querySelectorAll('iframe[src]').forEach(el => {
    if (isThirdParty(el.src)) {
      const domain = new URL(el.src).hostname;
      thirdPartyDomains.add(domain);
      thirdPartyResources.push({ type: 'iframe', domain, src: el.src });
    }
  });

  const domainCount = thirdPartyDomains.size;

  if (domainCount === 0) {
    return {
      status: 'pass',
      message: 'Aucune ressource tierce détectée'
    };
  }

  let status = 'pass';
  if (domainCount > 10) status = 'warning';
  if (domainCount > 20) status = 'fail';

  return {
    status,
    message: `${thirdPartyResources.length} ressources provenant de ${domainCount} domaines tiers`,
    details: {
      domains: Array.from(thirdPartyDomains),
      resources: thirdPartyResources
    }
  };
}
