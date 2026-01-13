/**
 * VerifWeb - Popup Script
 * Gère l'interface utilisateur et l'affichage des résultats
 */

class VerifWebPopup {
  constructor() {
    this.init();
  }

  async init() {
    this.bindEvents();
    await this.runAnalysis();
  }

  bindEvents() {
    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', () => {
      this.runAnalysis();
    });

    // Test items toggle
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
      // Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url) {
        throw new Error('Impossible d\'accéder à l\'onglet actif');
      }

      // Check if it's a valid URL (not chrome://, about:, etc.)
      if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
        this.showError('Cette extension ne fonctionne que sur les sites web (http/https)');
        return;
      }

      // Send message to background script to run analysis
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

  showLoading(show) {
    document.getElementById('loading').classList.toggle('hidden', !show);
    document.getElementById('results').classList.toggle('hidden', show);
  }

  showError(message) {
    this.showLoading(false);
    document.getElementById('site-url').textContent = 'Erreur';
    document.querySelector('.score-value').textContent = '-';
    document.querySelectorAll('.test-description').forEach(el => {
      el.textContent = message;
    });
  }

  displayResults(results, url) {
    this.showLoading(false);

    // Display URL
    const urlObj = new URL(url);
    document.getElementById('site-url').textContent = urlObj.hostname;

    // Calculate and display global score
    const score = this.calculateScore(results);
    this.displayScore(score);

    // Display individual test results
    this.displayTestResult('test-https', results.https);
    this.displayTestResult('test-ssl', results.ssl);
    this.displayTestResult('test-cookies', results.cookies);
    this.displayTestResult('test-headers', results.headers);
    this.displayTestResult('test-mixed-content', results.mixedContent);
    this.displayTestResult('test-third-party', results.thirdParty);
    this.displayTestResult('test-storage', results.storage);

    // Display cookies details
    if (results.cookies && results.cookies.details) {
      this.displayCookiesDetails(results.cookies.details);
    }

    // Display headers details
    if (results.headers && results.headers.details) {
      this.displayHeadersDetails(results.headers.details);
    }
  }

  calculateScore(results) {
    let totalPoints = 0;
    let maxPoints = 0;

    const weights = {
      https: 25,
      ssl: 15,
      cookies: 20,
      headers: 20,
      mixedContent: 10,
      thirdParty: 5,
      storage: 5
    };

    for (const [key, weight] of Object.entries(weights)) {
      maxPoints += weight;
      if (results[key]) {
        if (results[key].status === 'pass') {
          totalPoints += weight;
        } else if (results[key].status === 'warning') {
          totalPoints += weight * 0.5;
        }
      }
    }

    return Math.round((totalPoints / maxPoints) * 100);
  }

  displayScore(score) {
    const scoreElement = document.getElementById('global-score');
    const scoreValue = scoreElement.querySelector('.score-value');
    
    scoreValue.textContent = score;
    
    // Remove all score classes
    scoreElement.classList.remove('score-excellent', 'score-good', 'score-medium', 'score-poor');
    
    // Add appropriate class
    if (score >= 80) {
      scoreElement.classList.add('score-excellent');
    } else if (score >= 60) {
      scoreElement.classList.add('score-good');
    } else if (score >= 40) {
      scoreElement.classList.add('score-medium');
    } else {
      scoreElement.classList.add('score-poor');
    }
  }

  displayTestResult(elementId, result) {
    const element = document.getElementById(elementId);
    if (!element || !result) return;

    const statusElement = element.querySelector('.test-status');
    const descriptionElement = element.querySelector('.test-description');

    // Update status
    statusElement.textContent = this.getStatusText(result.status);
    statusElement.className = 'test-status ' + this.getStatusClass(result.status);

    // Update description
    descriptionElement.textContent = result.message || '';
  }

  getStatusText(status) {
    const texts = {
      'pass': 'OK',
      'warning': 'Attention',
      'fail': 'Échec',
      'info': 'Info'
    };
    return texts[status] || status;
  }

  getStatusClass(status) {
    const classes = {
      'pass': 'status-pass',
      'warning': 'status-warning',
      'fail': 'status-fail',
      'info': 'status-info'
    };
    return classes[status] || '';
  }

  displayCookiesDetails(cookies) {
    const tbody = document.getElementById('cookies-list');
    tbody.innerHTML = '';

    if (!cookies || cookies.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Aucun cookie trouvé</td></tr>';
      return;
    }

    cookies.forEach(cookie => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td title="${cookie.name}">${this.truncate(cookie.name, 15)}</td>
        <td class="${cookie.secure ? 'badge-yes' : 'badge-no'}">${cookie.secure ? '✓' : '✗'}</td>
        <td class="${cookie.httpOnly ? 'badge-yes' : 'badge-no'}">${cookie.httpOnly ? '✓' : '✗'}</td>
        <td>${cookie.sameSite || 'Non défini'}</td>
      `;
      tbody.appendChild(row);
    });

    // Show details section
    const detailsSection = document.querySelector('#test-cookies .test-details');
    if (detailsSection) {
      detailsSection.classList.remove('hidden');
    }
  }

  displayHeadersDetails(headers) {
    const list = document.getElementById('headers-list');
    list.innerHTML = '';

    const securityHeaders = [
      { name: 'Content-Security-Policy', key: 'content-security-policy' },
      { name: 'X-Content-Type-Options', key: 'x-content-type-options' },
      { name: 'X-Frame-Options', key: 'x-frame-options' },
      { name: 'X-XSS-Protection', key: 'x-xss-protection' },
      { name: 'Strict-Transport-Security', key: 'strict-transport-security' },
      { name: 'Referrer-Policy', key: 'referrer-policy' },
      { name: 'Permissions-Policy', key: 'permissions-policy' }
    ];

    securityHeaders.forEach(header => {
      const isPresent = headers[header.key];
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="${isPresent ? 'header-present' : 'header-missing'}">
          ${isPresent ? '✓' : '✗'}
        </span>
        <span>${header.name}</span>
      `;
      list.appendChild(li);
    });
  }

  truncate(str, length) {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new VerifWebPopup();
});
