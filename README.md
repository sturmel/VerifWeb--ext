# VerifWeb - Extension Chrome de Sécurité 🛡️

Extension Chrome pour analyser la sécurité des sites web en temps réel. Vérifie HTTPS, cookies, headers de sécurité, vulnérabilités d'injection et bien plus.

## 🚀 Fonctionnalités

### Score de sécurité global

L'extension calcule un **score de 0 à 100** basé sur tous les tests :
- 🟢 **80-100** : Excellent
- 🟡 **60-79** : Bon
- 🟠 **40-59** : Moyen
- 🔴 **0-39** : Faible

---

## 📋 Tests de sécurité de base

### 🔒 HTTPS
Vérifie si le site utilise une connexion chiffrée.

| Statut | Condition |
|--------|-----------|
| ✅ Pass | URL commence par `https://` |
| ❌ Fail | URL commence par `http://` |

**Risque si échec :** Les données transitent en clair, interceptables par un attaquant (man-in-the-middle).

---

### 📜 Certificat SSL
Vérifie la présence d'un certificat SSL valide.

| Statut | Condition |
|--------|-----------|
| ✅ Pass | Connexion HTTPS active |
| ❌ Fail | Pas de HTTPS |

---

### 🍪 Cookies
Analyse les attributs de sécurité de chaque cookie.

**Attributs vérifiés :**

| Attribut | Rôle | Risque si absent |
|----------|------|------------------|
| `Secure` | Cookie transmis uniquement en HTTPS | Interception possible |
| `HttpOnly` | Inaccessible par JavaScript | Vol via XSS |
| `SameSite` | Protection contre CSRF | Requêtes cross-site |

**Calcul du statut :**
- ✅ Pass : 100% des cookies sont Secure ET HttpOnly
- ⚠️ Warning : 50-99% sécurisés
- ❌ Fail : <50% sécurisés

---

### 🛡️ Headers de sécurité HTTP
Vérifie la présence des headers de sécurité dans la réponse HTTP.

| Header | Importance | Rôle |
|--------|------------|------|
| `Content-Security-Policy` | 🔴 Critique | Bloque les injections XSS et données |
| `Strict-Transport-Security` | 🔴 Critique | Force HTTPS (HSTS) |
| `X-Frame-Options` | 🟠 Moyenne | Protection clickjacking |
| `X-Content-Type-Options` | 🟠 Moyenne | Empêche le MIME sniffing |
| `Referrer-Policy` | 🟠 Moyenne | Contrôle les infos de referrer |
| `Permissions-Policy` | 🟠 Moyenne | Limite les APIs navigateur |
| `X-XSS-Protection` | 🟢 Faible | Protection XSS legacy (obsolète) |

**Calcul du statut :**
- ❌ Fail : Header critique manquant (CSP ou HSTS)
- ⚠️ Warning : <70% des headers présents
- ✅ Pass : ≥70% présents, aucun critique manquant

---

### 🔀 Contenu mixte
Détecte les ressources HTTP chargées sur une page HTTPS.

**Éléments analysés :**
- `<img src="http://...">`
- `<script src="http://...">`
- `<link href="http://...">`
- `<iframe src="http://...">`

| Statut | Condition |
|--------|-----------|
| ✅ Pass | Aucune ressource HTTP |
| ❌ Fail | Ressources HTTP détectées |
| ℹ️ Info | Site non HTTPS (non applicable) |

**Risque :** Les ressources HTTP peuvent être interceptées/modifiées, compromettant la page HTTPS.

---

### 🌐 Ressources tierces
Identifie les domaines externes chargeant des ressources.

**Éléments analysés :** Scripts, CSS, images, iframes provenant d'autres domaines.

| Statut | Condition |
|--------|-----------|
| ✅ Pass | ≤10 domaines tiers |
| ⚠️ Warning | 11-20 domaines tiers |
| ❌ Fail | >20 domaines tiers |

**Risque :** Chaque domaine tiers est un vecteur d'attaque potentiel (supply chain attack).

---

### 💾 Stockage local
Analyse le contenu de `localStorage` et `sessionStorage`.

**Détection de données sensibles :**
Recherche de clés contenant : `token`, `auth`, `password`, `secret`, `key`, `session`

| Statut | Condition |
|--------|-----------|
| ✅ Pass | Aucun stockage |
| ℹ️ Info | Stockage sans données sensibles |
| ⚠️ Warning | Données sensibles détectées |

**Risque :** Les données en localStorage sont accessibles par JavaScript, vulnérables aux attaques XSS.

---

## 🔥 Tests d'injection

### ⚡ Risques XSS (Cross-Site Scripting)
Détecte les vecteurs potentiels d'injection XSS.

**Patterns détectés :**

| Pattern | Risque | Description |
|---------|--------|-------------|
| `innerHTML =` | 🔴 Élevé | Injection HTML directe |
| `eval()` | 🔴 Critique | Exécution de code arbitraire |
| `document.write()` | 🔴 Élevé | Écriture HTML dangereuse |
| `new Function()` | 🔴 Critique | Création de fonction dynamique |
| `onclick`, `onerror`, `onload` | 🟠 Moyen | Event handlers inline |
| `href="javascript:"` | 🔴 Élevé | Liens JavaScript |

---

### 📝 Sécurité des formulaires
Analyse la sécurité des balises `<form>`.

**Vérifications :**

| Problème | Risque | Condition |
|----------|--------|-----------|
| Action HTTP sur HTTPS | 🔴 Critique | `<form action="http://...">` sur page HTTPS |
| Données sensibles en GET | 🔴 Élevé | Email/password avec `method="GET"` |
| Pas de token CSRF | 🟠 Moyen | POST sans input hidden csrf/token |

**Note :** Les formulaires gérés par JavaScript (Vue, React, Angular) sont automatiquement exclus grâce à la détection de :
- `@submit.prevent` (Vue)
- `ng-submit` (Angular)
- `onsubmit` avec handler JS
- Absence d'attribut `action` (= géré par JS)

---

### 🗃️ Patterns SQL/Données
Détecte les fuites d'informations techniques.

**1. Erreurs SQL exposées :**

| Pattern | Base de données |
|---------|-----------------|
| `SQL syntax.*MySQL` | MySQL |
| `PostgreSQL.*ERROR` | PostgreSQL |
| `ORA-\d{5}` | Oracle |
| `SQLite.*error` | SQLite |

**2. Commentaires HTML sensibles :**

Recherche dans `<!-- -->` des mots-clés : `password`, `secret`, `api_key`, `token`

**Risque :** Révèle l'architecture technique et facilite les attaques ciblées.

---

### 🔗 DOM XSS
Analyse les flux dangereux source→sink dans les scripts.

**Sources (entrées utilisateur) :**
- `location.hash`, `location.search`, `location.href`
- `document.URL`, `document.referrer`

**Sinks (exécution dangereuse) :**
- `innerHTML`, `eval()`, `document.write()`

| Statut | Condition |
|--------|-----------|
| ❌ Fail | Flux direct source→sink détecté |
| ⚠️ Warning | >2 patterns dangereux |
| ✅ Pass | Aucun flux dangereux |

---

### ✅ Validation des entrées
Vérifie la validation HTML5 des champs de formulaire.

**Attributs de validation détectés :**
- `required`
- `pattern`
- `minlength` / `maxlength`
- `min` / `max`
- Types validants : `email`, `url`, `tel`, `number`, `date`

**Calcul du statut :**
- ✅ Pass : ≥70% des champs validés
- ⚠️ Warning : 40-69% validés
- ❌ Fail : <40% validés

---

## 📦 Installation

### Mode développeur

```bash
git clone https://github.com/votre-repo/VerifWeb--ext.git
cd VerifWeb--ext
```

1. Ouvrez Chrome → `chrome://extensions/`
2. Activez le **Mode développeur**
3. **Charger l'extension non empaquetée**
4. Sélectionnez le dossier `VerifWeb--ext`

---

## 🏗️ Architecture du projet

```
VerifWeb--ext/
├── manifest.json                 # Configuration Manifest V3
├── popup/
│   ├── popup.html               # Interface utilisateur
│   ├── popup.css                # Styles
│   ├── popup.js                 # Point d'entrée popup (104 lignes)
│   └── modules/
│       ├── score.js             # Calcul du score (46 lignes)
│       └── display.js           # Affichage résultats (81 lignes)
├── background/
│   └── background.js            # Service worker (94 lignes)
├── content/
│   ├── content.js               # Script injecté (132 lignes)
│   └── analyzers/               # Modules d'analyse DOM
│       ├── mixedContent.js
│       ├── thirdParty.js
│       ├── storage.js
│       ├── xss.js
│       ├── forms.js
│       ├── sql.js
│       ├── domXss.js
│       └── validation.js
├── analyzers/
│   ├── securityAnalyzer.js      # Point d'entrée sécurité (32 lignes)
│   ├── injectionAnalyzer.js     # Point d'entrée injection (74 lignes)
│   └── modules/
│       ├── httpsAnalyzer.js
│       ├── cookiesAnalyzer.js
│       ├── headersAnalyzer.js
│       ├── xssAnalyzer.js
│       ├── formsAnalyzer.js
│       ├── sqlAnalyzer.js
│       ├── domXssAnalyzer.js
│       └── validationAnalyzer.js
└── icons/
    └── icon{16,32,48,128}.{svg,png}
```

**Tous les fichiers JS font moins de 200 lignes** pour une meilleure maintenabilité.

---

## 🔧 Fonctionnement technique

### Flux d'analyse

```
┌─────────────────┐
│   Clic popup    │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Refresh page   │  ← Capture les headers HTTP
└────────┬────────┘
         ▼
┌─────────────────┐
│ background.js   │  ← Analyse HTTPS, SSL, Cookies, Headers
└────────┬────────┘
         ▼
┌─────────────────┐
│  content.js     │  ← Analyse DOM (XSS, forms, etc.)
└────────┬────────┘
         ▼
┌─────────────────┐
│   popup.js      │  ← Affiche les résultats
└─────────────────┘
```

### Permissions requises

```json
{
  "permissions": [
    "activeTab",      // Accès à l'onglet actif
    "tabs",           // Gestion des onglets
    "cookies",        // Lecture des cookies
    "storage",        // Stockage local extension
    "webRequest"      // Interception headers HTTP
  ],
  "host_permissions": ["<all_urls>"]
}
```

---

## 📝 Ajouter un nouveau test

### 1. Créer le module d'analyse

```javascript
// analyzers/modules/monAnalyse.js
export function analyzeMonTest() {
  const issues = [];
  
  // Logique d'analyse...
  
  return {
    status: 'pass' | 'warning' | 'fail' | 'info',
    message: 'Description du résultat',
    details: issues
  };
}
```

### 2. Intégrer dans content.js

```javascript
// Dans l'objet Analyzers
monTest: () => {
  // Analyse côté DOM
  return summarizeRisks(risks, 'Mon Test');
}
```

### 3. Ajouter l'UI dans popup.html

```html
<div class="test-item" id="test-mon-test">
  <div class="test-header">
    <span class="test-icon">🔍</span>
    <span class="test-name">Mon Test</span>
    <span class="test-status">-</span>
  </div>
  <p class="test-description"></p>
</div>
```

---

## 🎯 Roadmap

- [ ] Détection des scripts de tracking
- [ ] Analyse des politiques CORS
- [ ] Vérification des méta-tags de sécurité
- [ ] Analyse des Service Workers
- [ ] Détection des bibliothèques JS obsolètes
- [ ] Vérification DNSSEC
- [ ] Export des rapports (PDF/JSON)
- [ ] Mode comparaison (avant/après)
- [ ] Historique des analyses

---

## 📄 Licence

MIT License - voir [LICENSE](LICENSE)

---

## ⚠️ Disclaimer

Cette extension est un outil d'analyse et de sensibilisation. Elle détecte des **indicateurs** de problèmes potentiels mais ne garantit pas la sécurité complète d'un site. Une analyse professionnelle (pentest) reste nécessaire pour une évaluation exhaustive.
