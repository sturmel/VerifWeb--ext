/**
 * VerifWeb - Content Script (version optimisée < 200 lignes)
 * Point d'entrée - les analyseurs sont dans /content/analyzers/
 */

(function() {
  'use strict';

  // Utilitaire
  const summarizeRisks = (risks, cat) => {
    if (!risks.length) return { status: 'pass', message: `${cat}: Aucun risque`, details: [] };
    const c = risks.filter(r => r.risk === 'critical').length;
    const h = risks.filter(r => r.risk === 'high').length;
    const m = risks.filter(r => r.risk === 'medium').length;
    const status = (c || h) ? 'fail' : m ? 'warning' : 'pass';
    const sum = [c && `${c} critique(s)`, h && `${h} élevé(s)`, m && `${m} moyen(s)`].filter(Boolean).join(', ');
    return { status, message: `${cat}: ${risks.length} risque(s) - ${sum || 'faibles'}`, details: risks };
  };
  
  // Extrait un snippet de code autour d'un pattern
  const extractSnippet = (content, pattern, ctx = 40) => {
    const match = content.match(new RegExp(pattern.source || pattern));
    if (!match) return null;
    const idx = content.indexOf(match[0]);
    if (idx === -1) return null;
    const start = Math.max(0, idx - ctx);
    const end = Math.min(content.length, idx + match[0].length + ctx);
    let s = content.substring(start, end).trim().replace(/\s+/g, ' ');
    if (start > 0) s = '...' + s;
    if (end < content.length) s = s + '...';
    return s;
  };

  // Import dynamique des analyseurs (inline pour compatibilité content script)
  const Analyzers = {
    mixedContent: () => {
      if (location.protocol !== 'https:') return { status: 'info', message: 'Site non HTTPS' };
      const mixed = [];
      [['img[src^="http:"]','image'],['script[src^="http:"]','script'],['link[rel="stylesheet"][href^="http:"]','css'],['iframe[src^="http:"]','iframe']].forEach(([s,t]) => {
        document.querySelectorAll(s).forEach(e => mixed.push({ type: t, src: e.src || e.href }));
      });
      return mixed.length ? { status: 'fail', message: `${mixed.length} ressource(s) HTTP`, details: mixed } : { status: 'pass', message: 'Aucun contenu mixte' };
    },

    thirdParty: () => {
      const cur = location.hostname.split('.').slice(-2).join('.');
      const domains = new Set(), resources = [];
      const is3rd = url => { try { return new URL(url, location.origin).hostname.split('.').slice(-2).join('.') !== cur; } catch { return false; } };
      [['script[src]','src'],['link[rel="stylesheet"][href]','href'],['img[src]','src'],['iframe[src]','src']].forEach(([s,p]) => {
        document.querySelectorAll(s).forEach(e => { if (is3rd(e[p])) { const d = new URL(e[p]).hostname; domains.add(d); resources.push({ domain: d, src: e[p] }); } });
      });
      const n = domains.size;
      return n ? { status: n > 20 ? 'fail' : n > 10 ? 'warning' : 'pass', message: `${resources.length} ressources de ${n} domaines`, details: { domains: [...domains], resources } } : { status: 'pass', message: 'Aucune ressource tierce' };
    },

    storage: () => {
      const info = { localStorage: [], sessionStorage: [] };
      try {
        for (let i = 0; i < localStorage.length; i++) info.localStorage.push(localStorage.key(i));
        for (let i = 0; i < sessionStorage.length; i++) info.sessionStorage.push(sessionStorage.key(i));
      } catch { return { status: 'info', message: 'Accès stockage refusé', details: info }; }
      const all = [...info.localStorage, ...info.sessionStorage];
      if (!all.length) return { status: 'pass', message: 'Aucun stockage local' };
      const sensitive = all.filter(k => /token|auth|password|secret|key|session/i.test(k));
      return { status: sensitive.length ? 'warning' : 'info', message: `${all.length} élément(s)${sensitive.length ? `, ${sensitive.length} sensible(s)` : ''}`, details: { ...info, sensitive } };
    },

    xss: () => {
      const risks = [];
      const patterns = [[/innerHTML\s*=/,'high','innerHTML (risque XSS)'],[/eval\s*\(/,'critical','eval() - exécution de code'],[/document\.write\s*\(/,'high','document.write'],[/new\s+Function\s*\(/,'critical','new Function()']];
      document.querySelectorAll('script:not([src])').forEach((s,i) => {
        const c = s.textContent || '';
        patterns.forEach(([p,r,d]) => { 
          if (p.test(c)) {
            risks.push({ 
              type: 'script', 
              risk: r, 
              description: d, 
              location: `Script inline #${i+1}`,
              code: extractSnippet(c, p)
            }); 
          }
        });
      });
      ['onclick','onerror','onload'].forEach(a => { 
        let els = Array.from(document.querySelectorAll(`[${a}]`));
        
        // Filtrer les patterns légitimes (faux positifs)
        els = els.filter(el => {
          const handler = el.getAttribute(a) || '';
          const tag = el.tagName.toLowerCase();
          
          // Pattern loadCSS: <link onload="this.onload=null;this.rel='stylesheet'">
          if (tag === 'link' && a === 'onload' && /this\.onload\s*=\s*null/.test(handler)) {
            return false;
          }
          // Pattern image onload pour lazy loading
          if (tag === 'img' && a === 'onload' && /this\.onload\s*=\s*null/.test(handler)) {
            return false;
          }
          return true;
        });
        
        if (els.length) {
          const first = els[0];
          const tag = first.tagName.toLowerCase();
          const sample = first.getAttribute(a).substring(0, 50);
          risks.push({ 
            type: 'handler', 
            risk: 'medium', 
            description: `${els.length}× attribut ${a}`,
            location: `<${tag}>`,
            code: `<${tag} ${a}="${sample}${sample.length >= 50 ? '...' : ''}">`
          }); 
        }
      });
      const jsLinks = document.querySelectorAll('[href^="javascript:"]');
      if (jsLinks.length) {
        const first = jsLinks[0];
        risks.push({ 
          type: 'js-url', 
          risk: 'high', 
          description: `${jsLinks.length} lien(s) javascript:`,
          code: `<a href="${first.getAttribute('href').substring(0, 60)}...">`
        });
      }
      return summarizeRisks(risks, 'XSS');
    },

    forms: () => {
      const risks = [], forms = document.querySelectorAll('form');
      if (!forms.length) return { status: 'info', message: 'Aucun formulaire', details: [] };
      forms.forEach((f,i) => {
        const hasJsHandler = f.onsubmit !== null || 
                             f.hasAttribute('@submit') || f.hasAttribute('@submit.prevent') || 
                             f.hasAttribute('v-on:submit') || f.hasAttribute('ng-submit');
        const noRealAction = !f.getAttribute('action') || f.getAttribute('action') === '' || f.getAttribute('action') === '#';
        const isJs = hasJsHandler || noRealAction;
        const formId = f.id ? `#${f.id}` : (f.name ? `[name="${f.name}"]` : `Form #${i+1}`);
        const formCode = `<form${f.id ? ` id="${f.id}"` : ''}${f.getAttribute('action') ? ` action="${f.getAttribute('action')}"` : ''} method="${f.method}">`;
        
        if (f.action?.startsWith('http://') && location.protocol === 'https:') 
          risks.push({ type: 'http-action', risk: 'critical', description: `${formId}: action HTTP non sécurisée`, location: formId, code: formCode });
        
        const hasSensitive = f.querySelector('input[type="password"]') || f.querySelector('input[type="email"]');
        if (hasSensitive && f.method.toUpperCase() === 'GET' && !isJs) 
          risks.push({ type: 'get', risk: 'high', description: `${formId}: données sensibles en GET`, location: formId, code: formCode });
        
        const csrf = [...f.querySelectorAll('input[type="hidden"]')].some(x => /csrf|token|xsrf/i.test(x.name || ''));
        if (!csrf && f.method.toUpperCase() === 'POST' && !isJs) 
          risks.push({ type: 'csrf', risk: 'medium', description: `${formId}: pas de token CSRF visible`, location: formId, code: formCode });
      });
      return summarizeRisks(risks, 'Formulaires');
    },

    sql: () => {
      const risks = [], html = document.documentElement.outerHTML;
      // Patterns d'erreurs SQL réelles (plus stricts pour éviter les faux positifs)
      const sqlErrorPatterns = [
        { pattern: /You have an error in your SQL syntax/i, db: 'MySQL' },
        { pattern: /mysql_fetch|mysql_query|mysqli_/i, db: 'MySQL' },
        { pattern: /ERROR:\s+syntax error at or near/i, db: 'PostgreSQL' },
        { pattern: /pg_query|pg_exec|PG::Error/i, db: 'PostgreSQL' },
        { pattern: /ORA-\d{5}:/i, db: 'Oracle' },
        { pattern: /SQLite3::SQLException/i, db: 'SQLite' },
        { pattern: /SQLSTATE\[\d+\]/i, db: 'SQL' },
        { pattern: /Unclosed quotation mark/i, db: 'SQL Server' },
        { pattern: /quoted string not properly terminated/i, db: 'SQL' }
      ];
      sqlErrorPatterns.forEach(({ pattern, db }) => { 
        if (pattern.test(html)) {
          const match = html.match(pattern);
          risks.push({ 
            type: 'sql-error', 
            risk: 'critical', 
            description: `Erreur ${db} exposée`,
            code: match ? match[0].substring(0, 80) : null
          }); 
        }
      });
      // Commentaires HTML sensibles
      (html.match(/<!--[\s\S]*?-->/g) || []).forEach(c => { 
        if (/password\s*=|secret\s*=|api_key\s*=|token\s*=/i.test(c)) {
          risks.push({ 
            type: 'comment', 
            risk: 'high', 
            description: 'Commentaire sensible',
            code: c.substring(0, 100) + (c.length > 100 ? '...' : '')
          }); 
        }
      });
      return summarizeRisks(risks, 'SQL/Données');
    },

    domXss: () => {
      const risks = [];
      const sources = [
        { pattern: /location\.(hash|search|href)/g, name: 'location.*' },
        { pattern: /document\.(URL|referrer)/g, name: 'document.URL/referrer' }
      ];
      const sinks = [
        { pattern: /\.innerHTML\s*=/g, name: 'innerHTML' },
        { pattern: /eval\s*\(/g, name: 'eval()' },
        { pattern: /document\.write/g, name: 'document.write' }
      ];
      document.querySelectorAll('script:not([src])').forEach((s, i) => {
        const c = s.textContent || '';
        const foundSrc = sources.filter(x => x.pattern.test(c));
        const foundSink = sinks.filter(x => x.pattern.test(c));
        if (foundSrc.length && foundSink.length) {
          const snippet = extractSnippet(c, foundSink[0].pattern);
          risks.push({ 
            type: 'flow', 
            risk: 'high', 
            description: `Flux DOM XSS: ${foundSrc.map(x=>x.name).join(', ')} → ${foundSink.map(x=>x.name).join(', ')}`,
            location: `Script inline #${i+1}`,
            code: snippet
          });
        }
      });
      return summarizeRisks(risks, 'DOM XSS');
    },

    validation: () => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea');
      let ok = 0, ko = 0;
      inputs.forEach(i => { (i.required || i.pattern || i.minLength || i.maxLength || ['email','url','tel','number','date'].includes(i.type)) ? ok++ : ko++; });
      const t = ok + ko;
      if (!t) return { status: 'info', message: 'Aucun champ', details: [] };
      const p = Math.round(ok / t * 100);
      return { status: p >= 70 ? 'pass' : p >= 40 ? 'warning' : 'fail', message: `${p}% validés (${ok}/${t})`, details: { ok, ko, p } };
    }
  };

  // Orchestration injection
  const analyzeInjections = () => {
    const r = { xss: Analyzers.xss(), forms: Analyzers.forms(), sql: Analyzers.sql(), domXss: Analyzers.domXss(), validation: Analyzers.validation() };
    const all = Object.values(r);
    const fail = all.filter(x => x.status === 'fail').length;
    const warn = all.filter(x => x.status === 'warning').length;
    r.global = { status: fail ? 'fail' : warn ? 'warning' : 'pass', message: fail ? `${fail} risque(s) élevé(s)` : warn ? `${warn} à surveiller` : 'OK' };
    return r;
  };

  // Analyse complète
  const analyzeAll = () => ({
    mixedContent: Analyzers.mixedContent(),
    thirdParty: Analyzers.thirdParty(),
    storage: Analyzers.storage(),
    injection: analyzeInjections()
  });

  // Listener
  chrome.runtime.onMessage.addListener((msg, sender, respond) => {
    if (msg.action === 'analyze') respond(analyzeAll());
    return true;
  });

})();
