/**
 * Module d'analyse des cookies
 */

import { isExcludedCookie } from './excludedCookies.js';

export async function analyzeCookies(url) {
  try {
    const urlObj = new URL(url);
    const currentHostname = urlObj.hostname;
    const allCookies = await chrome.cookies.getAll({ domain: currentHostname });
    
    // Filtrer pour ne garder que les cookies du domaine exact
    const cookies = allCookies.filter(cookie => {
      const cookieDomain = cookie.domain;
      
      // Cookie du domaine exact (lugh-web.fr)
      if (cookieDomain === currentHostname) return true;
      
      // Cookie wildcard du domaine exact (.lugh-web.fr)
      if (cookieDomain === '.' + currentHostname) return true;
      
      return false;
    });
    
    if (cookies.length === 0) {
      return { status: 'pass', message: 'Aucun cookie détecté sur ce site', details: [] };
    }

    // Séparer cookies applicatifs et cookies tiers/analytics
    const appCookies = cookies.filter(c => !isExcludedCookie(c.name));
    const excludedCookies = cookies.filter(c => isExcludedCookie(c.name));

    let secureCount = 0, httpOnlyCount = 0, sameSiteCount = 0;
    const cookieDetails = [];

    // Analyser uniquement les cookies applicatifs pour le score
    appCookies.forEach(cookie => {
      if (cookie.secure) secureCount++;
      if (cookie.httpOnly) httpOnlyCount++;
      if (cookie.sameSite && cookie.sameSite !== 'unspecified') sameSiteCount++;
    });

    // Mais afficher tous les cookies dans les détails
    cookies.forEach(cookie => {
      cookieDetails.push({
        name: cookie.name,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        domain: cookie.domain,
        path: cookie.path,
        expirationDate: cookie.expirationDate,
        session: cookie.session,
        excluded: isExcludedCookie(cookie.name)
      });
    });

    const total = appCookies.length;
    
    // Si aucun cookie applicatif, tout est OK
    if (total === 0) {
      return { 
        status: 'pass', 
        message: `${cookies.length} cookie(s) tiers/analytics uniquement`, 
        details: cookieDetails,
        stats: { total: cookies.length, secure: 0, httpOnly: 0, sameSite: 0, excluded: excludedCookies.length }
      };
    }

    const securePercent = Math.round((secureCount / total) * 100);
    const httpOnlyPercent = Math.round((httpOnlyCount / total) * 100);

    let status = 'pass', message = '';

    if (securePercent < 50 || httpOnlyPercent < 50) {
      status = 'fail';
      message = `${total} cookie(s) applicatif(s). Problèmes : ${total - secureCount} non sécurisés, ${total - httpOnlyCount} accessibles JS.`;
    } else if (securePercent < 100 || httpOnlyPercent < 100) {
      status = 'warning';
      message = `${total} cookie(s) applicatif(s). ${secureCount}/${total} sécurisés, ${httpOnlyCount}/${total} HttpOnly.`;
    } else {
      message = `${total} cookie(s) applicatif(s). Tous correctement sécurisés.`;
    }
    
    if (excludedCookies.length) {
      message += ` (+ ${excludedCookies.length} tiers)`;
    }

    return {
      status, message, details: cookieDetails,
      stats: { total, secure: secureCount, httpOnly: httpOnlyCount, sameSite: sameSiteCount, excluded: excludedCookies.length }
    };
  } catch (error) {
    return { status: 'info', message: 'Impossible d\'analyser les cookies: ' + error.message, details: [] };
  }
}
