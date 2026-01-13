/**
 * Module d'analyse HTTPS/SSL
 */

export function checkHttps(url) {
  const isHttps = url.startsWith('https://');
  return {
    status: isHttps ? 'pass' : 'fail',
    message: isHttps 
      ? 'La connexion est sécurisée avec HTTPS'
      : 'ATTENTION : Ce site n\'utilise pas HTTPS. Vos données ne sont pas chiffrées.',
    details: { isHttps }
  };
}

export function checkSSL(url) {
  const isHttps = url.startsWith('https://');
  
  if (!isHttps) {
    return {
      status: 'fail',
      message: 'Pas de certificat SSL (le site n\'utilise pas HTTPS)',
      details: { hasSSL: false }
    };
  }

  return {
    status: 'pass',
    message: 'Certificat SSL présent (connexion HTTPS active)',
    details: { hasSSL: true }
  };
}
