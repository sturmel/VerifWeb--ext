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
  
  try {
    for (let index = 0; index < localStorage.length; index++) {
      storageInfo.localStorage.push(localStorage.key(index));
    }
    for (let index = 0; index < sessionStorage.length; index++) {
      storageInfo.sessionStorage.push(sessionStorage.key(index));
    }
  } catch (error) {
    return { 
      status: 'info', 
      message: 'Accès stockage refusé', 
      details: storageInfo 
    };
  }
  
  const allKeys = storageInfo.localStorage.concat(storageInfo.sessionStorage);
  
  if (!allKeys.length) {
    return { status: 'pass', message: 'Aucun stockage local' };
  }
  
  const sensitivePattern = /token|auth|password|secret|key|session/i;
  const sensitiveKeys = allKeys.filter(function(key) {
    return sensitivePattern.test(key);
  });
  
  let message;
  if (sensitiveKeys.length) {
    message = `${allKeys.length} élément(s), ${sensitiveKeys.length} sensible(s)`;
  } else {
    message = `${allKeys.length} élément(s)`;
  }
  
  return {
    status: sensitiveKeys.length ? 'warning' : 'info',
    message: message,
    details: {
      localStorage: storageInfo.localStorage,
      sessionStorage: storageInfo.sessionStorage,
      sensitive: sensitiveKeys
    }
  };
};
