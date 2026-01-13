/**
 * VerifWeb - Popup Script (version modulaire < 200 lignes)
 */

import { calculateScore, displayScore } from './modules/score.js';
import { displayTestResult, displayCookiesDetails, displayHeadersDetails, displayRiskDetails } from './modules/display.js';

class VerifWebPopup {
  constructor() {
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.runAnalysis();
  }

  bindEvents() {
    document.getElementById('refresh-btn').addEventListener('click', () => this.runAnalysis());
    document.querySelectorAll('.test-item').forEach(item => {
      item.addEventListener('click', () => {
        const details = item.querySelector('.test-details');
        if (details) {
          details.classList.toggle('hidden');
          item.classList.toggle('expanded');
        }
      });
    });
  }

  async runAnalysis() {
    this.showLoading(true);

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab?.url) throw new Error('Impossible d\'accéder à l\'onglet');
      if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
        this.showError('Extension limitée aux sites web (http/https)');
        return;
      }

      // Rafraîchir la page pour capturer les headers frais
      await this.refreshAndWait(tab.id);

      const results = await chrome.runtime.sendMessage({
        action: 'analyzeTab',
        tabId: tab.id,
        url: tab.url
      });

      this.displayResults(results, tab.url);
    } catch (error) {
      console.error('Analysis error:', error);
      this.showError(error.message);
    }
  }

  // Rafraîchit la page et attend que le chargement soit terminé
  async refreshAndWait(tabId) {
    return new Promise((resolve) => {
      const listener = (updatedTabId, changeInfo) => {
        if (updatedTabId === tabId && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          // Petit délai pour s'assurer que le content script est injecté
          setTimeout(resolve, 300);
        }
      };
      
      chrome.tabs.onUpdated.addListener(listener);
      chrome.tabs.reload(tabId, { bypassCache: true });
      
      // Timeout de sécurité (5s max)
      setTimeout(() => {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }, 5000);
    });
  }

  showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
    document.getElementById('results').classList.toggle('hidden', show);
  }

  showError(message) {
    this.showLoading(false);
    document.getElementById('site-url').textContent = 'Erreur';
    document.querySelector('.score-value').textContent = '-';
    document.querySelectorAll('.test-description').forEach(el => el.textContent = message);
  }

  displayResults(results, url) {
    this.showLoading(false);
    document.getElementById('site-url').textContent = new URL(url).hostname;

    // Score
    const score = calculateScore(results);
    displayScore(score);

    // Tests de base
    displayTestResult('test-https', results.https);
    displayTestResult('test-ssl', results.ssl);
    displayTestResult('test-cookies', results.cookies);
    displayTestResult('test-headers', results.headers);
    displayTestResult('test-mixed-content', results.mixedContent);
    displayTestResult('test-third-party', results.thirdParty);
    displayTestResult('test-storage', results.storage);

    // Tests injection
    if (results.injection) {
      displayTestResult('test-xss', results.injection.xss);
      displayTestResult('test-forms', results.injection.forms);
      displayTestResult('test-sql', results.injection.sql);
      displayTestResult('test-dom-xss', results.injection.domXss);
      displayTestResult('test-validation', results.injection.validation);

      if (results.injection.xss?.details?.length) displayRiskDetails('xss-list', results.injection.xss.details);
      if (results.injection.forms?.details?.length) displayRiskDetails('forms-list', results.injection.forms.details);
      if (results.injection.sql?.details?.length) displayRiskDetails('sql-list', results.injection.sql.details);
    }

    // Détails
    if (results.cookies?.details) displayCookiesDetails(results.cookies.details);
    if (results.headers?.details) displayHeadersDetails(results.headers.details);
  }
}

document.addEventListener('DOMContentLoaded', () => new VerifWebPopup());
