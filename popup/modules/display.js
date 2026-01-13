/**
 * Affichage des résultats de tests
 */

export function getStatusText(status) {
  return { pass: 'OK', warning: 'Attention', fail: 'Échec', info: 'Info' }[status] || status;
}

export function getStatusClass(status) {
  return { pass: 'status-pass', warning: 'status-warning', fail: 'status-fail', info: 'status-info' }[status] || '';
}

export function displayTestResult(elementId, result) {
  const element = document.getElementById(elementId);
  if (!element || !result) return;

  const statusEl = element.querySelector('.test-status');
  const descEl = element.querySelector('.test-description');

  statusEl.textContent = getStatusText(result.status);
  statusEl.className = 'test-status ' + getStatusClass(result.status);
  descEl.textContent = result.message || '';
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
    li.innerHTML = `<span class="risk-badge ${risk.risk}">${risk.risk}</span><span>${risk.description}</span>`;
    list.appendChild(li);
  });

  const section = list.closest('.test-details');
  if (section) section.classList.remove('hidden');
}
