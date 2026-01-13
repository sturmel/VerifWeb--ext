/**
 * VerifWeb - Injection Analyzer (version modulaire < 200 lignes)
 * Point d'entrée pour les analyses d'injection
 */

import { analyzeXss } from './modules/xssAnalyzer.js';
import { analyzeForms } from './modules/formsAnalyzer.js';
import { analyzeSqlPatterns } from './modules/sqlAnalyzer.js';
import { analyzeDomXss } from './modules/domXssAnalyzer.js';
import { analyzeInputValidation } from './modules/validationAnalyzer.js';

/**
 * Analyseur d'injection principal
 */
export class InjectionAnalyzer {
  constructor() {
    this.results = {};
  }

  /**
   * Lance toutes les analyses d'injection
   */
  analyzeAll() {
    this.results = {
      xss: this.safeAnalyze(analyzeXss),
      forms: this.safeAnalyze(analyzeForms),
      sql: this.safeAnalyze(analyzeSqlPatterns),
      domXss: this.safeAnalyze(analyzeDomXss),
      validation: this.safeAnalyze(analyzeInputValidation)
    };

    return this.results;
  }

  /**
   * Exécute une analyse de manière sécurisée
   */
  safeAnalyze(analyzeFn) {
    try {
      return analyzeFn();
    } catch (error) {
      console.error(`Injection analysis error:`, error);
      return {
        status: 'error',
        message: `Erreur d'analyse: ${error.message}`,
        details: []
      };
    }
  }

  /**
   * Obtient un résumé des risques
   */
  getSummary() {
    const allIssues = [];
    
    Object.values(this.results).forEach(result => {
      if (result.details) {
        allIssues.push(...result.details);
      }
    });

    return {
      total: allIssues.length,
      high: allIssues.filter(i => i.risk === 'high').length,
      medium: allIssues.filter(i => i.risk === 'medium').length,
      low: allIssues.filter(i => i.risk === 'low').length,
      results: this.results
    };
  }
}

// Export par défaut pour utilisation simple
export default InjectionAnalyzer;
