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
      const patterns = [[/innerHTML\s*=/,'high','innerHTML'],[/eval\s*\(/,'critical','eval()'],[/document\.write\s*\(/,'high','document.write'],[/new\s+Function\s*\(/,'critical','new Function()']];
      document.querySelectorAll('script:not([src])').forEach((s,i) => {
        const c = s.textContent || '';
        patterns.forEach(([p,r,d]) => { if (p.test(c)) risks.push({ type: 'script', risk: r, description: d, location: `#${i+1}` }); });
      });
      ['onclick','onerror','onload'].forEach(a => { const n = document.querySelectorAll(`[${a}]`).length; if (n) risks.push({ type: 'handler', risk: 'medium', description: `${n}× ${a}` }); });
      const js = document.querySelectorAll('[href^="javascript:"]').length;
      if (js) risks.push({ type: 'js-url', risk: 'high', description: `${js} lien(s) javascript:` });
      return summarizeRisks(risks, 'XSS');
    },

    forms: () => {
      const risks = [], forms = document.querySelectorAll('form');
      if (!forms.length) return { status: 'info', message: 'Aucun formulaire', details: [] };
      forms.forEach((f,i) => {
        // Détecter si géré par JavaScript (Vue, React, Angular, vanilla)
        // Note: Vue/React compilent les attributs donc on vérifie aussi si onsubmit est attaché programmatiquement
        const hasJsHandler = f.onsubmit !== null || 
                             f.hasAttribute('@submit') || f.hasAttribute('@submit.prevent') || 
                             f.hasAttribute('v-on:submit') || f.hasAttribute('ng-submit');
        // Heuristique: si action vide/absente et pas de method explicite, probablement géré par JS
        const noRealAction = !f.getAttribute('action') || f.getAttribute('action') === '' || f.getAttribute('action') === '#';
        const isJs = hasJsHandler || noRealAction;
        
        if (f.action?.startsWith('http://') && location.protocol === 'https:') 
          risks.push({ type: 'http-action', risk: 'critical', description: `Form #${i+1}: action HTTP` });
        
        // Sensible en GET uniquement si pas géré par JS
        const hasSensitive = f.querySelector('input[type="password"]') || f.querySelector('input[type="email"]');
        if (hasSensitive && f.method.toUpperCase() === 'GET' && !isJs) 
          risks.push({ type: 'get', risk: 'high', description: `Form #${i+1}: sensible en GET` });
        
        // CSRF uniquement pour vrais POST (pas JS)
        const csrf = [...f.querySelectorAll('input[type="hidden"]')].some(x => /csrf|token|xsrf/i.test(x.name || ''));
        if (!csrf && f.method.toUpperCase() === 'POST' && !isJs) 
          risks.push({ type: 'csrf', risk: 'medium', description: `Form #${i+1}: pas de CSRF` });
      });
      return summarizeRisks(risks, 'Formulaires');
    },

    sql: () => {
      const risks = [], html = document.documentElement.outerHTML;
      [/SQL syntax.*MySQL/i,/PostgreSQL.*ERROR/i,/ORA-\d{5}/i,/SQLite.*error/i].forEach(p => { if (p.test(html)) risks.push({ type: 'sql-error', risk: 'critical', description: 'Erreur SQL exposée' }); });
      (html.match(/<!--[\s\S]*?-->/g) || []).forEach(c => { if (/password|secret|api_key|token/i.test(c)) risks.push({ type: 'comment', risk: 'high', description: 'Commentaire sensible' }); });
      return summarizeRisks(risks, 'SQL/Données');
    },

    domXss: () => {
      const risks = [];
      const sources = [/location\.(hash|search|href)/g, /document\.(URL|referrer)/g];
      const sinks = [/\.innerHTML\s*=/g, /eval\s*\(/g, /document\.write/g];
      document.querySelectorAll('script:not([src])').forEach(s => {
        const c = s.textContent || '';
        if (sources.some(p => p.test(c)) && sinks.some(p => p.test(c))) risks.push({ type: 'flow', risk: 'high', description: 'Flux source→sink' });
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
