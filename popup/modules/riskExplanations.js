/**
 * Explications des risques de sécurité en termes simples
 * Destiné à être compréhensible par tous
 */

export const RISK_EXPLANATIONS = {
  // === TESTS DE BASE ===
  
  https: {
    title: "Connexion HTTPS",
    simple: "HTTPS, c'est comme envoyer une lettre dans une enveloppe scellée plutôt qu'une carte postale. Sans HTTPS, tout ce que vous tapez (mots de passe, numéros de carte) peut être lu par n'importe qui sur le réseau.",
    risk: "Sur un site sans HTTPS, un pirate sur le même WiFi (café, aéroport, hôtel) peut voir tout ce que vous faites : identifiants, messages, achats...",
    advice: "Ne jamais entrer d'informations sensibles sur un site sans le cadenas 🔒 dans la barre d'adresse."
  },

  ssl: {
    title: "Certificat SSL",
    simple: "Le certificat SSL, c'est la carte d'identité du site. Il prouve que vous parlez bien au bon site et pas à un imposteur qui se fait passer pour lui.",
    risk: "Un certificat invalide ou expiré peut signifier que quelqu'un essaie de se faire passer pour le site (attaque \"man-in-the-middle\").",
    advice: "Si votre navigateur affiche un avertissement de certificat, ne continuez pas, surtout pour des sites bancaires ou importants."
  },

  cookies: {
    title: "Sécurité des Cookies",
    simple: "Les cookies sont des petits fichiers que les sites stockent sur votre ordinateur pour vous reconnaître. S'ils sont mal protégés, un pirate peut les voler et se connecter à votre place.",
    risk: "Un cookie volé = quelqu'un peut accéder à votre compte sans connaître votre mot de passe. C'est comme si on vous volait votre badge d'accès.",
    flags: {
      secure: "Secure : Le cookie ne voyage que sur connexion chiffrée (HTTPS)",
      httpOnly: "HttpOnly : Empêche les scripts malveillants de lire le cookie",
      sameSite: "SameSite : Empêche les sites tiers d'utiliser votre cookie"
    },
    advice: "Les cookies de session (connexion) doivent avoir les 3 protections. Sans ça, votre session peut être détournée."
  },

  headers: {
    title: "Headers de Sécurité",
    simple: "Les headers sont des instructions que le site envoie à votre navigateur pour lui dire comment se protéger. C'est comme un mode d'emploi de sécurité.",
    headers: {
      "Content-Security-Policy": "CSP : Définit quels scripts peuvent s'exécuter. Bloque les injections de code malveillant.",
      "X-Content-Type-Options": "Empêche le navigateur de mal interpréter les fichiers (un .txt exécuté comme .js).",
      "X-Frame-Options": "Empêche d'intégrer le site dans un cadre invisible pour vous piéger (clickjacking).",
      "X-XSS-Protection": "Protection basique contre les attaques XSS (ancienne, mais utile en backup).",
      "Strict-Transport-Security": "HSTS : Force le navigateur à toujours utiliser HTTPS.",
      "Referrer-Policy": "Contrôle quelles infos sont partagées quand vous cliquez sur un lien externe.",
      "Permissions-Policy": "Limite l'accès aux fonctions sensibles (caméra, micro, géolocalisation)."
    },
    risk: "Sans ces headers, le site est plus vulnérable aux attaques par injection de code et au détournement de clics.",
    advice: "Un bon site devrait avoir au minimum CSP, X-Frame-Options et HSTS."
  },

  mixedContent: {
    title: "Contenu Mixte",
    simple: "C'est quand un site HTTPS charge des éléments (images, scripts) en HTTP non sécurisé. C'est comme avoir une porte blindée mais une fenêtre grande ouverte.",
    risk: "Un pirate peut modifier ces éléments non sécurisés pour injecter du code malveillant, même si le reste du site est en HTTPS.",
    advice: "Les sites sérieux ne devraient jamais avoir de contenu mixte. Si vous voyez un cadenas barré, méfiance."
  },

  thirdParty: {
    title: "Ressources Tierces",
    simple: "Ce sont les éléments chargés depuis d'autres sites : analytics, publicités, polices, widgets sociaux... Chacun est un potentiel point d'entrée.",
    risk: "Si un de ces services tiers est compromis, tous les sites qui l'utilisent sont touchés. Plus il y a de tiers, plus la surface d'attaque est grande.",
    advice: "Beaucoup de ressources tierces = beaucoup de données partagées avec d'autres entreprises. Vérifiez vos bloqueurs de pub."
  },

  storage: {
    title: "Stockage Local",
    simple: "Le localStorage et sessionStorage permettent aux sites de stocker des données sur votre ordinateur. Contrairement aux cookies, ces données ne sont JAMAIS protégées par HttpOnly.",
    risk: "Si un pirate réussit une attaque XSS, il peut voler TOUT ce qui est stocké ici. Stocker des tokens d'authentification ici est risqué.",
    sensitive: "Données sensibles détectées : tokens, clés API, identifiants... Ces données ne devraient pas être stockées ici.",
    advice: "Les données vraiment sensibles devraient être dans des cookies HttpOnly, pas dans le localStorage."
  },

  // === TESTS D'INJECTION ===

  xss: {
    title: "Risques XSS (Cross-Site Scripting)",
    simple: "L'XSS, c'est quand un pirate arrive à faire exécuter son propre code JavaScript sur un site. C'est comme si quelqu'un pouvait parler à votre place.",
    patterns: {
      innerHTML: "innerHTML : Permet d'injecter du HTML qui sera interprété. Dangereux avec des données utilisateur.",
      "document.write": "document.write : Écrit directement dans la page. Peut être exploité pour injecter du code.",
      "eval()": "eval() : Exécute du texte comme du code. Extrêmement dangereux si les données viennent de l'extérieur.",
      "onclick inline": "Événements inline : onclick=\"...\" dans le HTML. Mélange structure et comportement, plus dur à sécuriser."
    },
    risk: "Un attaquant peut voler vos cookies, rediriger vers un faux site, modifier ce que vous voyez, ou agir en votre nom.",
    advice: "Ce test détecte des PATTERNS à risque, pas des failles confirmées. Le code peut être sécurisé malgré ces patterns."
  },

  forms: {
    title: "Sécurité des Formulaires",
    simple: "Les formulaires collectent vos données. S'ils sont mal configurés, ces données peuvent être interceptées ou envoyées au mauvais endroit.",
    issues: {
      httpAction: "Formulaire envoyé en HTTP : Vos données (mots de passe inclus) ne sont pas chiffrées pendant l'envoi.",
      getSensitive: "Données sensibles en GET : Les infos apparaissent dans l'URL, visibles dans l'historique et les logs serveur.",
      autocomplete: "Autocomplete sur mots de passe : Le navigateur peut mémoriser des mots de passe sur un ordinateur partagé."
    },
    risk: "Vos identifiants peuvent être visibles dans les logs, l'historique, ou interceptés sur le réseau.",
    advice: "Un bon formulaire de connexion doit : être en HTTPS, utiliser POST, et désactiver l'autocomplete."
  },

  sql: {
    title: "Patterns SQL / Données Exposées",
    simple: "Ce test cherche des indices que la base de données pourrait être mal protégée : erreurs SQL visibles, structures de données exposées...",
    patterns: {
      errorMessages: "Messages d'erreur SQL visibles : Révèlent la structure de la base de données aux attaquants.",
      debugInfo: "Informations de debug : Stack traces, versions de logiciels... Aide les pirates à cibler leurs attaques.",
      dataPatterns: "Patterns de données : Structures qui ressemblent à des requêtes ou des schémas de base de données."
    },
    risk: "Ces informations aident un attaquant à comprendre comment le site fonctionne et à cibler ses attaques SQL injection.",
    advice: "Les erreurs techniques ne doivent JAMAIS être visibles par les utilisateurs en production."
  },

  domXss: {
    title: "DOM XSS",
    simple: "Le DOM XSS se produit quand le JavaScript de la page utilise des données de l'URL (hash, paramètres) sans les vérifier.",
    sources: {
      "location.hash": "Données après le # dans l'URL. Souvent non filtrées car pas envoyées au serveur.",
      "location.search": "Paramètres de l'URL (?param=value). Peuvent contenir du code malveillant.",
      "document.referrer": "L'URL de la page précédente. Peut être manipulée."
    },
    risk: "Un lien piégé peut exécuter du code malveillant chez la victime, même si le serveur est bien protégé.",
    advice: "Méfiez-vous des liens suspects, même vers des sites de confiance. L'attaque vient de l'URL, pas du site lui-même."
  }
};

/**
 * Retourne l'explication simple pour un type de test
 */
export function getSimpleExplanation(testType) {
  return RISK_EXPLANATIONS[testType]?.simple || "Test de sécurité";
}

/**
 * Retourne le risque en termes simples pour un type de test
 */
export function getRiskExplanation(testType) {
  return RISK_EXPLANATIONS[testType]?.risk || "";
}

/**
 * Retourne le conseil pour un type de test
 */
export function getAdvice(testType) {
  return RISK_EXPLANATIONS[testType]?.advice || "";
}

/**
 * Retourne toutes les infos d'un test
 */
export function getFullExplanation(testType) {
  return RISK_EXPLANATIONS[testType] || null;
}
