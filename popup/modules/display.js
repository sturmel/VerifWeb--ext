/**
 * Affichage des résultats de tests
 */

import { getFullExplanation } from './riskExplanations.js';

export function getStatusText(status) {
  return { pass: 'OK', warning: 'Attention', fail: 'Échec', info: 'Info' }[status] || status;
}

export function getStatusClass(status) {
  return { pass: 'status-pass', warning: 'status-warning', fail: 'status-fail', info: 'status-info' }[status] || '';
}

/**
 * Mapping entre les IDs HTML et les clés d'explication
 */
const TEST_TYPE_MAP = {
  'test-https': 'https',
  'test-ssl': 'ssl',
  'test-cookies': 'cookies',
  'test-headers': 'headers',
  'test-mixed-content': 'mixedContent',
  'test-third-party': 'thirdParty',
  'test-storage': 'storage',
  'test-xss': 'xss',
  'test-forms': 'forms',
  'test-sql': 'sql',
  'test-dom-xss': 'domXss'
};

export function displayTestResult(elementId, result) {
  const element = document.getElementById(elementId);
  if (!element || !result) return;

  const statusEl = element.querySelector('.test-status');
  const descEl = element.querySelector('.test-description');

  statusEl.textContent = getStatusText(result.status);
  statusEl.className = 'test-status ' + getStatusClass(result.status);
  descEl.textContent = result.message || '';

  // Ajouter l'explication si pas déjà présente
  addExplanationToTest(element, elementId, result.status);
}

/**
 * Ajoute une explication au test quand il y a un problème
 */
function addExplanationToTest(element, elementId, status) {
  // Ne pas ajouter si déjà présent
  if (element.querySelector('.test-explanation')) return;

  const testType = TEST_TYPE_MAP[elementId];
  if (!testType) return;

  const explanation = getFullExplanation(testType);
  if (!explanation) return;

  // Créer le bloc d'explication
  const expDiv = document.createElement('div');
  expDiv.className = 'test-explanation';

  let html = `<p class="exp-simple"><span class="exp-label">💡 En clair : </span>${explanation.simple}</p>`;
  
  // Ajouter le risque seulement si pas OK
  if (status !== 'pass' && status !== 'info' && explanation.risk) {
    html += `<p class="exp-risk"><span class="exp-label">⚠️ Risque : </span>${explanation.risk}</p>`;
  }
  
  // Toujours afficher le conseil
  if (explanation.advice) {
    html += `<p class="exp-advice"><span class="exp-label">💬 Conseil : </span>${explanation.advice}</p>`;
  }

  expDiv.innerHTML = html;
  element.appendChild(expDiv);
}

export function displayCookiesDetails(cookies) {
  const tbody = document.getElementById('cookies-list');
  tbody.innerHTML = '';

  if (!cookies?.length) {
    tbody.innerHTML = '<tr><td colspan="4">Aucun cookie</td></tr>';
    return;
  }

  cookies.forEach(cookie => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td title="${cookie.name}">${cookie.name.substring(0, 15)}${cookie.name.length > 15 ? '...' : ''}</td>
      <td class="${cookie.secure ? 'badge-yes' : 'badge-no'}">${cookie.secure ? '✓' : '✗'}</td>
      <td class="${cookie.httpOnly ? 'badge-yes' : 'badge-no'}">${cookie.httpOnly ? '✓' : '✗'}</td>
      <td>${cookie.sameSite || '-'}</td>
    `;
    tbody.appendChild(row);
  });
}

export function displayHeadersDetails(headers) {
  const list = document.getElementById('headers-list');
  list.innerHTML = '';

  const secHeaders = [
    ['Content-Security-Policy', 'content-security-policy'],
    ['X-Content-Type-Options', 'x-content-type-options'],
    ['X-Frame-Options', 'x-frame-options'],
    ['X-XSS-Protection', 'x-xss-protection'],
    ['Strict-Transport-Security', 'strict-transport-security'],
    ['Referrer-Policy', 'referrer-policy'],
    ['Permissions-Policy', 'permissions-policy']
  ];

  secHeaders.forEach(([name, key]) => {
    const present = headers[key];
    const li = document.createElement('li');
    li.innerHTML = `<span class="${present ? 'header-present' : 'header-missing'}">${present ? '✓' : '✗'}</span><span>${name}</span>`;
    list.appendChild(li);
  });
}

export function displayRiskDetails(listId, risks) {
  const list = document.getElementById(listId);
  if (!list) return;
  
  list.innerHTML = '';
  risks.forEach(risk => {
    const li = document.createElement('li');
    li.className = 'risk-item';
    
    // En-tête avec badge et description
    const header = document.createElement('div');
    header.className = 'risk-header';
    header.innerHTML = `<span class="risk-badge ${risk.risk}">${risk.risk}</span><span class="risk-desc">${risk.description}</span>`;
    li.appendChild(header);
    
    // Location si présente
    if (risk.location) {
      const location = document.createElement('div');
      location.className = 'risk-location';
      location.textContent = `📍 ${risk.location}`;
      li.appendChild(location);
    }
    
    // Code snippet si présent
    if (risk.code) {
      const code = document.createElement('pre');
      code.className = 'risk-code';
      code.textContent = risk.code;
      li.appendChild(code);
    }
    
    list.appendChild(li);
  });

  const section = list.closest('.test-details');
  if (section) section.classList.remove('hidden');
}

export function displayStorageDetails(details) {
  const container = document.getElementById('storage-details');
  if (!container) return;
  
  container.innerHTML = '';
  
  // localStorage
  if (details.localStorage?.length) {
    const localSection = document.createElement('div');
    localSection.className = 'storage-section';
    localSection.innerHTML = '<h4>📦 localStorage</h4>';
    
    const table = createStorageTable(details.localStorage, details.sensitive);
    localSection.appendChild(table);
    container.appendChild(localSection);
  }
  
  // sessionStorage
  if (details.sessionStorage?.length) {
    const sessionSection = document.createElement('div');
    sessionSection.className = 'storage-section';
    sessionSection.innerHTML = '<h4>⏱️ sessionStorage</h4>';
    
    const table = createStorageTable(details.sessionStorage, details.sensitive);
    sessionSection.appendChild(table);
    container.appendChild(sessionSection);
  }
  
  if (!details.localStorage?.length && !details.sessionStorage?.length) {
    container.innerHTML = '<p class="no-data">Aucune donnée stockée</p>';
  }
  
  const section = container.closest('.test-details');
  if (section) section.classList.remove('hidden');
}

function createStorageTable(items, sensitiveItems) {
  const table = document.createElement('table');
  table.className = 'storage-table';
  table.innerHTML = '<thead><tr><th>Clé</th><th>Valeur</th></tr></thead>';
  
  const tbody = document.createElement('tbody');
  const sensitiveKeys = sensitiveItems?.map(item => item.key) || [];
  
  items.forEach(item => {
    const row = document.createElement('tr');
    const isSensitive = sensitiveKeys.includes(item.key);
    
    if (isSensitive) {
      row.className = 'sensitive-row';
    }
    
    row.innerHTML = `
      <td class="storage-key" title="${item.key}">
        ${isSensitive ? '⚠️ ' : ''}${item.key.substring(0, 25)}${item.key.length > 25 ? '...' : ''}
      </td>
      <td class="storage-value" title="${item.value}">${item.value.substring(0, 40)}${item.value.length > 40 ? '...' : ''}</td>
    `;
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  return table;
}
