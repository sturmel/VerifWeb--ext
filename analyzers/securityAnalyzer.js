/**
 * SecurityAnalyzer - Module d'analyse de sécurité
 * Contient toutes les logiques de vérification de sécurité
 */

export class SecurityAnalyzer {
  
  /**
   * Vérifie si le site utilise HTTPS
   */
  checkHttps(url) {
    const isHttps = url.startsWith('https://');
    
    return {
      status: isHttps ? 'pass' : 'fail',
      message: isHttps 
        ? 'La connexion est sécurisée avec HTTPS'
        : 'ATTENTION : Ce site n\'utilise pas HTTPS. Vos données ne sont pas chiffrées.',
      details: { isHttps }
    };
  }

  /**
   * Vérifie le certificat SSL (vérification basique)
   */
  checkSSL(url) {
    const isHttps = url.startsWith('https://');
    
    if (!isHttps) {
      return {
        status: 'fail',
        message: 'Pas de certificat SSL (le site n\'utilise pas HTTPS)',
        details: { hasSSL: false }
      };
    }

    // Pour une vérification plus poussée, on pourrait utiliser une API externe
    return {
      status: 'pass',
      message: 'Certificat SSL présent (connexion HTTPS active)',
      details: { hasSSL: true }
    };
  }

  /**
   * Analyse les cookies du site
   */
  async analyzeCookies(url) {
    try {
      const urlObj = new URL(url);
      const cookies = await chrome.cookies.getAll({ domain: urlObj.hostname });
      
      if (cookies.length === 0) {
        return {
          status: 'pass',
          message: 'Aucun cookie détecté sur ce site',
          details: []
        };
      }

      let secureCount = 0;
      let httpOnlyCount = 0;
      let sameSiteCount = 0;
      const cookieDetails = [];

      cookies.forEach(cookie => {
        if (cookie.secure) secureCount++;
        if (cookie.httpOnly) httpOnlyCount++;
        if (cookie.sameSite && cookie.sameSite !== 'unspecified') sameSiteCount++;

        cookieDetails.push({
          name: cookie.name,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
          domain: cookie.domain,
          path: cookie.path,
          expirationDate: cookie.expirationDate,
          session: cookie.session
        });
      });

      const total = cookies.length;
      const securePercent = Math.round((secureCount / total) * 100);
      const httpOnlyPercent = Math.round((httpOnlyCount / total) * 100);

      let status = 'pass';
      let message = '';

      if (securePercent < 50 || httpOnlyPercent < 50) {
        status = 'fail';
        message = `${total} cookies détectés. Problèmes de sécurité : ${total - secureCount} non sécurisés, ${total - httpOnlyCount} accessibles par JavaScript.`;
      } else if (securePercent < 100 || httpOnlyPercent < 100) {
        status = 'warning';
        message = `${total} cookies détectés. ${secureCount}/${total} sécurisés, ${httpOnlyCount}/${total} HttpOnly.`;
      } else {
        message = `${total} cookies détectés. Tous sont correctement sécurisés.`;
      }

      return {
        status,
        message,
        details: cookieDetails,
        stats: {
          total,
          secure: secureCount,
          httpOnly: httpOnlyCount,
          sameSite: sameSiteCount
        }
      };
    } catch (error) {
      return {
        status: 'info',
        message: 'Impossible d\'analyser les cookies: ' + error.message,
        details: []
      };
    }
  }

  /**
   * Analyse les headers de sécurité
   */
  analyzeHeaders(headers) {
    const securityHeaders = {
      'content-security-policy': {
        name: 'Content-Security-Policy',
        importance: 'high',
        description: 'Protège contre les attaques XSS et injection de données'
      },
      'x-content-type-options': {
        name: 'X-Content-Type-Options',
        importance: 'medium',
        expected: 'nosniff',
        description: 'Empêche le sniffing MIME'
      },
      'x-frame-options': {
        name: 'X-Frame-Options',
        importance: 'medium',
        description: 'Protège contre le clickjacking'
      },
      'x-xss-protection': {
        name: 'X-XSS-Protection',
        importance: 'low',
        description: 'Protection XSS du navigateur (obsolète)'
      },
      'strict-transport-security': {
        name: 'Strict-Transport-Security',
        importance: 'high',
        description: 'Force l\'utilisation de HTTPS'
      },
      'referrer-policy': {
        name: 'Referrer-Policy',
        importance: 'medium',
        description: 'Contrôle les informations de référent'
      },
      'permissions-policy': {
        name: 'Permissions-Policy',
        importance: 'medium',
        description: 'Contrôle les fonctionnalités du navigateur'
      }
    };

    let presentCount = 0;
    let highPriorityMissing = [];
    const headerDetails = {};

    for (const [key, config] of Object.entries(securityHeaders)) {
      const isPresent = headers.hasOwnProperty(key);
      headerDetails[key] = isPresent;
      
      if (isPresent) {
        presentCount++;
      } else if (config.importance === 'high') {
        highPriorityMissing.push(config.name);
      }
    }

    const total = Object.keys(securityHeaders).length;
    const percent = Math.round((presentCount / total) * 100);

    let status = 'pass';
    let message = '';

    if (highPriorityMissing.length > 0) {
      status = 'fail';
      message = `Headers critiques manquants : ${highPriorityMissing.join(', ')}`;
    } else if (percent < 70) {
      status = 'warning';
      message = `${presentCount}/${total} headers de sécurité présents (${percent}%)`;
    } else {
      status = 'pass';
      message = `Bonne configuration : ${presentCount}/${total} headers présents`;
    }

    return {
      status,
      message,
      details: headerDetails,
      stats: {
        present: presentCount,
        total,
        percent
      }
    };
  }
}
