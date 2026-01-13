/**
 * VerifWeb - Background Service Worker
 * Gère les analyses de sécurité en arrière-plan
 */

import { SecurityAnalyzer } from '../analyzers/securityAnalyzer.js';

// Store for security headers (captured via webRequest)
const headersCache = new Map();

// Listen for web requests to capture headers
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.type === 'main_frame') {
      const headers = {};
      details.responseHeaders.forEach(header => {
        headers[header.name.toLowerCase()] = header.value;
      });
      headersCache.set(details.tabId, headers);
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

// Clean up headers cache when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  headersCache.delete(tabId);
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzeTab') {
    handleAnalyzeTab(message.tabId, message.url)
      .then(sendResponse)
      .catch(error => {
        console.error('Analysis error:', error);
        sendResponse({ error: error.message });
      });
    return true; // Will respond asynchronously
  }
});

/**
 * Perform security analysis on a tab
 */
async function handleAnalyzeTab(tabId, url) {
  const analyzer = new SecurityAnalyzer();
  const results = {};

  try {
    // 1. HTTPS Check
    results.https = analyzer.checkHttps(url);

    // 2. SSL Certificate (basic check via HTTPS)
    results.ssl = analyzer.checkSSL(url);

    // 3. Cookies Analysis
    results.cookies = await analyzer.analyzeCookies(url);

    // 4. Security Headers
    let cachedHeaders = headersCache.get(tabId) || {};
    results.headers = analyzer.analyzeHeaders(cachedHeaders);

    // 5. Get content script analysis (mixed content, third party, storage, injection)
    try {
      const contentAnalysis = await chrome.tabs.sendMessage(tabId, { action: 'analyze' });
      results.mixedContent = contentAnalysis.mixedContent;
      results.thirdParty = contentAnalysis.thirdParty;
      results.storage = contentAnalysis.storage;
      results.injection = contentAnalysis.injection;
    } catch (error) {
      // Content script might not be loaded
      console.warn('Could not communicate with content script:', error);
      results.mixedContent = { status: 'info', message: 'Analyse non disponible' };
      results.thirdParty = { status: 'info', message: 'Analyse non disponible' };
      results.storage = { status: 'info', message: 'Analyse non disponible' };
      results.injection = {
        global: { status: 'info', message: 'Analyse non disponible' },
        xss: { status: 'info', message: 'Analyse non disponible', details: [] },
        forms: { status: 'info', message: 'Analyse non disponible', details: [] },
        sql: { status: 'info', message: 'Analyse non disponible', details: [] },
        domXss: { status: 'info', message: 'Analyse non disponible', details: [] },
        validation: { status: 'info', message: 'Analyse non disponible', details: [] }
      };
    }

  } catch (error) {
    console.error('Analysis error:', error);
    throw error;
  }

  return results;
}
