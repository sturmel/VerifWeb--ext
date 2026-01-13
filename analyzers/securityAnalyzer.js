/**
 * VerifWeb - Security Analyzer (version modulaire < 200 lignes)
 * Point d'entrée pour les analyses de sécurité
 */

import { checkHttps, checkSSL } from './modules/httpsAnalyzer.js';
import { analyzeCookies } from './modules/cookiesAnalyzer.js';
import { analyzeHeaders } from './modules/headersAnalyzer.js';

/**
 * Classe principale d'analyse de sécurité
 */
export class SecurityAnalyzer {
  checkHttps(url) {
    return checkHttps(url);
  }

  checkSSL(url) {
    return checkSSL(url);
  }

  async analyzeCookies(url) {
    return analyzeCookies(url);
  }

  analyzeHeaders(headers) {
    return analyzeHeaders(headers);
  }
}

// Export par défaut
export default SecurityAnalyzer;
