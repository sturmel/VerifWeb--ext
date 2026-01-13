/**
 * VerifWeb - Popup Script
 */

import { calculateScore, displayScore } from './modules/score.js';
import { displayTestResult, displayCookiesDetails, displayHeadersDetails, displayRiskDetails } from './modules/display.js';

class VerifWebPopup {
  constructor() {
    this.results = null;
    this.siteUrl = '';
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.runAnalysis();
  }

  bindEvents() {
    // Toggle view
    document.getElementById('btn-problems').addEventListener('click', () => this.setView('problems'));
    document.getElementById('btn-all').addEventListener('click', () => this.setView('all'));
    
    // Expand details on click
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

  setView(view) {
    const container = document.getElementById('tests-container');
    const btnProblems = document.getElementById('btn-problems');
    const btnAll = document.getElementById('btn-all');
    const summary = document.getElementById('problems-summary');
    
    if (view === 'all') {
      container.classList.add('show-all');
      btnAll.classList.add('active');
      btnProblems.classList.remove('active');
      summary.classList.add('hidden');
    } else {
      container.classList.remove('show-all');
      btnProblems.classList.add('active');
      btnAll.classList.remove('active');
      this.updateProblemsSummary();
    }
  }

  updateProblemsSummary() {
    const problems = document.querySelectorAll('.test-item:not(.is-pass)').length;
    const summary = document.getElementById('problems-summary');
    
    if (problems === 0) {
      summary.classList.remove('hidden');
    } else {
      summary.classList.add('hidden');
    }
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

      this.siteUrl = tab.url;

      this.results = await chrome.runtime.sendMessage({
        action: 'analyzeTab',
        tabId: tab.id,
        url: tab.url
      });

      this.displayResults(this.results, tab.url);
    } catch (error) {
      console.error('Analysis error:', error);
      this.showError(error.message);
    }
  }

  showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
    document.getElementById('results').classList.toggle('hidden', show);
  }

  showError(message) {
    this.showLoading(false);
    document.getElementById('site-url').textContent = 'Erreur';
    document.querySelector('.score-value').textContent = '-';
  }

  displayResults(results, url) {
    this.showLoading(false);
    document.getElementById('site-url').textContent = new URL(url).hostname;
    document.getElementById('analysis-date').textContent = new Date().toLocaleString('fr-FR');

    const score = calculateScore(results);
    displayScore(score);

    // Tests de base
    this.setTestStatus('test-https', results.https);
    this.setTestStatus('test-ssl', results.ssl);
    this.setTestStatus('test-cookies', results.cookies);
    this.setTestStatus('test-headers', results.headers);
    this.setTestStatus('test-mixed-content', results.mixedContent);
    this.setTestStatus('test-third-party', results.thirdParty);
    this.setTestStatus('test-storage', results.storage);

    // Tests injection
    if (results.injection) {
      this.setTestStatus('test-xss', results.injection.xss);
      this.setTestStatus('test-forms', results.injection.forms);
      this.setTestStatus('test-sql', results.injection.sql);
      this.setTestStatus('test-dom-xss', results.injection.domXss);
      this.setTestStatus('test-validation', results.injection.validation);

      if (results.injection.xss?.details?.length) displayRiskDetails('xss-list', results.injection.xss.details);
      if (results.injection.forms?.details?.length) displayRiskDetails('forms-list', results.injection.forms.details);
      if (results.injection.sql?.details?.length) displayRiskDetails('sql-list', results.injection.sql.details);
    }

    // Check if injection section has problems
    const injectionHasProblems = results.injection && 
      ['xss', 'forms', 'sql', 'domXss', 'validation'].some(k => 
        results.injection[k]?.status === 'fail' || results.injection[k]?.status === 'warning'
      );
    document.querySelector('.section-divider').classList.toggle('is-pass', !injectionHasProblems);

    if (results.cookies?.details) displayCookiesDetails(results.cookies.details);
    if (results.headers?.details) displayHeadersDetails(results.headers.details);

    this.updateProblemsSummary();
  }

  setTestStatus(elementId, result) {
    const element = document.getElementById(elementId);
    if (!element || !result) return;

    displayTestResult(elementId, result);
    
    // Mark as pass or problem
    const isPassing = result.status === 'pass' || result.status === 'info';
    element.classList.toggle('is-pass', isPassing);
  }

}

document.addEventListener('DOMContentLoaded', () => new VerifWebPopup());
