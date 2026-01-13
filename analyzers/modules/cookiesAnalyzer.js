/**
 * Module d'analyse des cookies
 */

export async function analyzeCookies(url) {
  try {
    const urlObj = new URL(url);
    const cookies = await chrome.cookies.getAll({ domain: urlObj.hostname });
    
    if (cookies.length === 0) {
      return { status: 'pass', message: 'Aucun cookie détecté sur ce site', details: [] };
    }

    let secureCount = 0, httpOnlyCount = 0, sameSiteCount = 0;
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

    let status = 'pass', message = '';

    if (securePercent < 50 || httpOnlyPercent < 50) {
      status = 'fail';
      message = `${total} cookies. Problèmes : ${total - secureCount} non sécurisés, ${total - httpOnlyCount} accessibles JS.`;
    } else if (securePercent < 100 || httpOnlyPercent < 100) {
      status = 'warning';
      message = `${total} cookies. ${secureCount}/${total} sécurisés, ${httpOnlyCount}/${total} HttpOnly.`;
    } else {
      message = `${total} cookies. Tous correctement sécurisés.`;
    }

    return {
      status, message, details: cookieDetails,
      stats: { total, secure: secureCount, httpOnly: httpOnlyCount, sameSite: sameSiteCount }
    };
  } catch (error) {
    return { status: 'info', message: 'Impossible d\'analyser les cookies: ' + error.message, details: [] };
  }
}
