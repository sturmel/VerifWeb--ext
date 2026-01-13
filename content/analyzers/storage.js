/**
 * Analyse du stockage local (localStorage, sessionStorage)
 */
export function analyzeStorage() {
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
