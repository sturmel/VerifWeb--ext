/**
 * VerifWeb - Content Script (point d'entrée)
 * Les analyseurs sont chargés depuis /content/analyzers/
 */

(function() {
  'use strict';

  /**
   * Orchestre l'analyse des risques d'injection
   * @returns {Object} Résultats des tests d'injection
   */
  function analyzeInjectionRisks() {
    const Analyzers = window.VerifWeb.Analyzers;
    
    const results = {
      xss: Analyzers.xss(),
      forms: Analyzers.forms(),
      sql: Analyzers.sql(),
      domXss: Analyzers.domXss(),
      validation: Analyzers.validation()
    };
    
    // Calculer le statut global
    const allResults = Object.values(results);
    const failCount = allResults.filter(function(result) {
      return result.status === 'fail';
    }).length;
    const warningCount = allResults.filter(function(result) {
      return result.status === 'warning';
    }).length;
    
    let globalStatus;
    let globalMessage;
    
    if (failCount) {
      globalStatus = 'fail';
      globalMessage = failCount + ' risque(s) élevé(s)';
    } else if (warningCount) {
      globalStatus = 'warning';
      globalMessage = warningCount + ' à surveiller';
    } else {
      globalStatus = 'pass';
      globalMessage = 'OK';
    }
    
    results.global = { 
      status: globalStatus, 
      message: globalMessage 
    };
    
    return results;
  }

  /**
   * Lance l'analyse complète de la page
   * @returns {Object} Résultats de tous les tests
   */
  function analyzeAll() {
    const Analyzers = window.VerifWeb.Analyzers;
    
    return {
      mixedContent: Analyzers.mixedContent(),
      thirdParty: Analyzers.thirdParty(),
      storage: Analyzers.storage(),
      injection: analyzeInjectionRisks()
    };
  }

  /**
   * Écoute les messages du popup/background
   */
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'analyze') {
      sendResponse(analyzeAll());
    }
    return true;
  });

})();
