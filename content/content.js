/**
 * VerifWeb - Content Script
 * Analyse le contenu de la page (DOM, ressources, stockage)
 */

(function() {
  'use strict';

  /**
   * Analyse le contenu mixte (HTTP sur HTTPS)
   */
  function analyzeMixedContent() {
    const isHttps = window.location.protocol === 'https:';
    
    if (!isHttps) {
      return {
        status: 'info',
        message: 'Le site n\'utilise pas HTTPS, analyse du contenu mixte non applicable'
      };
    }

    const mixedElements = [];

    // Check images
    document.querySelectorAll('img[src^="http:"]').forEach(el => {
      mixedElements.push({ type: 'image', src: el.src });
    });

    // Check scripts
    document.querySelectorAll('script[src^="http:"]').forEach(el => {
      mixedElements.push({ type: 'script', src: el.src });
    });

    // Check stylesheets
    document.querySelectorAll('link[rel="stylesheet"][href^="http:"]').forEach(el => {
      mixedElements.push({ type: 'stylesheet', src: el.href });
    });

    // Check iframes
    document.querySelectorAll('iframe[src^="http:"]').forEach(el => {
      mixedElements.push({ type: 'iframe', src: el.src });
    });

    // Check videos
    document.querySelectorAll('video source[src^="http:"], video[src^="http:"]').forEach(el => {
      mixedElements.push({ type: 'video', src: el.src });
    });

    // Check audio
    document.querySelectorAll('audio source[src^="http:"], audio[src^="http:"]').forEach(el => {
      mixedElements.push({ type: 'audio', src: el.src });
    });

    if (mixedElements.length === 0) {
      return {
        status: 'pass',
        message: 'Aucun contenu mixte détecté'
      };
    }

    return {
      status: 'fail',
      message: `${mixedElements.length} ressource(s) chargée(s) en HTTP sur une page HTTPS`,
      details: mixedElements
    };
  }

  /**
   * Analyse les ressources tierces
   */
  function analyzeThirdPartyResources() {
    const currentDomain = window.location.hostname;
    const thirdPartyDomains = new Set();
    const thirdPartyResources = [];

    // Helper to check if domain is third-party
    const isThirdParty = (url) => {
      try {
        const urlObj = new URL(url, window.location.origin);
        const domain = urlObj.hostname;
        // Check if it's a different domain (not subdomain)
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
    if (domainCount > 10) {
      status = 'warning';
    } else if (domainCount > 20) {
      status = 'fail';
    }

    return {
      status,
      message: `${thirdPartyResources.length} ressources provenant de ${domainCount} domaines tiers`,
      details: {
        domains: Array.from(thirdPartyDomains),
        resources: thirdPartyResources
      }
    };
  }

  /**
   * Analyse le stockage local
   */
  function analyzeStorage() {
    const storageInfo = {
      localStorage: { count: 0, keys: [] },
      sessionStorage: { count: 0, keys: [] }
    };

    try {
      // Check localStorage
      if (window.localStorage) {
        storageInfo.localStorage.count = localStorage.length;
        for (let i = 0; i < localStorage.length; i++) {
          storageInfo.localStorage.keys.push(localStorage.key(i));
        }
      }

      // Check sessionStorage
      if (window.sessionStorage) {
        storageInfo.sessionStorage.count = sessionStorage.length;
        for (let i = 0; i < sessionStorage.length; i++) {
          storageInfo.sessionStorage.keys.push(sessionStorage.key(i));
        }
      }
    } catch (error) {
      return {
        status: 'info',
        message: 'Accès au stockage refusé (mode privé ou bloqué)',
        details: storageInfo
      };
    }

    const totalItems = storageInfo.localStorage.count + storageInfo.sessionStorage.count;

    if (totalItems === 0) {
      return {
        status: 'pass',
        message: 'Aucune donnée stockée localement'
      };
    }

    // Check for potentially sensitive data
    const sensitivePatterns = ['token', 'auth', 'password', 'secret', 'key', 'session', 'credit', 'card'];
    const allKeys = [...storageInfo.localStorage.keys, ...storageInfo.sessionStorage.keys];
    const sensitiveKeys = allKeys.filter(key => 
      sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern))
    );

    let status = 'info';
    let message = `${totalItems} élément(s) en stockage local`;

    if (sensitiveKeys.length > 0) {
      status = 'warning';
      message = `${totalItems} élément(s) stockés. Attention : ${sensitiveKeys.length} clé(s) potentiellement sensible(s) détectée(s)`;
    }

    return {
      status,
      message,
      details: {
        ...storageInfo,
        sensitiveKeys
      }
    };
  }

  /**
   * Analyse complète de la page
   */
  function analyzeAll() {
    return {
      mixedContent: analyzeMixedContent(),
      thirdParty: analyzeThirdPartyResources(),
      storage: analyzeStorage()
    };
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'analyze') {
      const results = analyzeAll();
      sendResponse(results);
    }
    return true;
  });

})();
