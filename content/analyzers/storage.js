/**
 * VerifWeb - Analyse du stockage local
 */

window.VerifWeb = window.VerifWeb || {};
window.VerifWeb.Analyzers = window.VerifWeb.Analyzers || {};

window.VerifWeb.Analyzers.storage = function() {
  const storageInfo = {
    localStorage: [],
    sessionStorage: []
  };
  
  /**
   * Tronque une valeur si elle est trop longue
   */
  function truncateValue(value, maxLength) {
    maxLength = maxLength || 100;
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  }
  
  try {
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      storageInfo.localStorage.push({
        key: key,
        value: truncateValue(localStorage.getItem(key))
      });
    }
    for (let index = 0; index < sessionStorage.length; index++) {
      const key = sessionStorage.key(index);
      storageInfo.sessionStorage.push({
        key: key,
        value: truncateValue(sessionStorage.getItem(key))
      });
    }
  } catch (error) {
    return { 
      status: 'info', 
      message: 'Accès stockage refusé', 
      details: storageInfo 
    };
  }
  
  const allItems = storageInfo.localStorage.concat(storageInfo.sessionStorage);
  
  if (!allItems.length) {
    return { status: 'pass', message: 'Aucun stockage local' };
  }
  
  const sensitivePattern = /token|auth|password|secret|key|session/i;
  const sensitiveItems = allItems.filter(function(item) {
    return sensitivePattern.test(item.key);
  });
  
  let message;
  if (sensitiveItems.length) {
    message = `${allItems.length} élément(s), ${sensitiveItems.length} sensible(s)`;
  } else {
    message = `${allItems.length} élément(s)`;
  }
  
  return {
    status: sensitiveItems.length ? 'warning' : 'info',
    message: message,
    details: {
      localStorage: storageInfo.localStorage,
      sessionStorage: storageInfo.sessionStorage,
      sensitive: sensitiveItems
    }
  };
};
