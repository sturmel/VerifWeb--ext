# VerifWeb - Extension Chrome de Sécurité 🛡️

Extension Chrome pour vérifier la sécurité des sites web. Analyse HTTPS, cookies, headers de sécurité et bien plus.

## 🚀 Fonctionnalités actuelles

### Tests de sécurité implémentés :

| Test | Description | Statut |
|------|-------------|--------|
| **HTTPS** | Vérifie si le site utilise une connexion sécurisée | ✅ |
| **Certificat SSL** | Vérifie la présence d'un certificat SSL valide | ✅ |
| **Cookies** | Analyse les attributs de sécurité des cookies (Secure, HttpOnly, SameSite) | ✅ |
| **Headers de sécurité** | Vérifie la présence des headers HTTP de sécurité | ✅ |
| **Contenu mixte** | Détecte les ressources HTTP chargées sur une page HTTPS | ✅ |
| **Ressources tierces** | Identifie les domaines tiers chargeant des ressources | ✅ |
| **Stockage local** | Analyse localStorage et sessionStorage | ✅ |

### Headers de sécurité analysés :
- Content-Security-Policy (CSP)
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security (HSTS)
- Referrer-Policy
- Permissions-Policy

## 📦 Installation

### Mode développeur (recommandé pour le développement)

1. Clonez ce repository
2. Ouvrez Chrome et allez dans `chrome://extensions/`
3. Activez le **Mode développeur** (toggle en haut à droite)
4. Cliquez sur **Charger l'extension non empaquetée**
5. Sélectionnez le dossier `VerifWeb--ext`

### Génération des icônes PNG

Les icônes sont fournies en SVG. Pour les convertir en PNG (si nécessaire) :

```bash
# Avec ImageMagick
for size in 16 32 48 128; do
  convert -background none "icons/icon${size}.svg" "icons/icon${size}.png"
done
```

Ou utilisez un convertisseur en ligne comme [CloudConvert](https://cloudconvert.com/svg-to-png).

## 🏗️ Structure du projet

```
VerifWeb--ext/
├── manifest.json           # Configuration de l'extension
├── README.md               # Documentation
├── popup/
│   ├── popup.html          # Interface utilisateur
│   ├── popup.css           # Styles
│   └── popup.js            # Logique de l'interface
├── background/
│   └── background.js       # Service worker (analyse en arrière-plan)
├── content/
│   └── content.js          # Script injecté dans les pages
├── analyzers/
│   └── securityAnalyzer.js # Module d'analyse de sécurité
└── icons/
    ├── icon16.svg/png
    ├── icon32.svg/png
    ├── icon48.svg/png
    └── icon128.svg/png
```

## 🔧 Architecture modulaire

L'extension est conçue pour être facilement extensible :

- **`analyzers/`** : Ajoutez de nouveaux modules d'analyse ici
- **`securityAnalyzer.js`** : Classe principale avec méthodes pour chaque test
- **`content.js`** : Analyses nécessitant l'accès au DOM
- **`background.js`** : Orchestration et analyse des headers HTTP

## 📝 Ajouter un nouveau test

### 1. Dans `securityAnalyzer.js` (tests sans accès DOM)

```javascript
/**
 * Nouveau test de sécurité
 */
checkNewFeature(url) {
  // Votre logique ici
  return {
    status: 'pass' | 'warning' | 'fail' | 'info',
    message: 'Description du résultat',
    details: { /* données supplémentaires */ }
  };
}
```

### 2. Dans `content.js` (tests nécessitant le DOM)

```javascript
function analyzeNewFeature() {
  // Accès au DOM de la page
  return {
    status: 'pass' | 'warning' | 'fail' | 'info',
    message: 'Description du résultat'
  };
}
```

### 3. Mettre à jour l'interface (`popup.html` et `popup.js`)

Ajoutez un nouveau bloc de test dans `popup.html` et gérez son affichage dans `popup.js`.

## 🎯 Roadmap - Tests à venir

- [ ] Analyse des formulaires (autocomplete, CSRF tokens)
- [ ] Détection des scripts de tracking
- [ ] Analyse des politiques CORS
- [ ] Vérification des méta-tags de sécurité
- [ ] Analyse des Service Workers
- [ ] Détection des vulnérabilités connues (bibliothèques obsolètes)
- [ ] Scan des ports ouverts
- [ ] Vérification DNSSEC
- [ ] Analyse des sous-domaines
- [ ] Export des rapports (PDF/JSON)

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour ajouter un nouveau test :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/nouveau-test`)
3. Implémentez votre test en suivant l'architecture existante
4. Testez votre code
5. Créez une Pull Request

## 📄 Licence

MIT License - voir [LICENSE](LICENSE)

## ⚠️ Disclaimer

Cette extension est un outil d'analyse et d'information. Elle ne garantit pas la sécurité complète d'un site web. Utilisez-la comme un indicateur parmi d'autres dans votre évaluation de la sécurité.
