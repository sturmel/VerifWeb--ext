/**
 * Documentation générale de VerifWeb
 * Système de scoring et limitations
 */

export const DOCUMENTATION = {
  title: "Comment fonctionne VerifWeb ?",
  
  intro: `VerifWeb analyse la sécurité visible d'un site web directement depuis votre navigateur. 
C'est un outil de sensibilisation, pas un audit de sécurité professionnel.`,

  scoring: {
    title: "🎯 Système de Score",
    description: `Le score sur 100 est calculé selon l'importance de chaque test :`,
    weights: [
      { test: "HTTPS", points: 20, desc: "Base de toute sécurité web" },
      { test: "Cookies", points: 15, desc: "Protection de vos sessions" },
      { test: "Headers de sécurité", points: 15, desc: "Protections du navigateur" },
      { test: "Certificat SSL", points: 10, desc: "Authentification du site" },
      { test: "Contenu mixte", points: 10, desc: "Cohérence du chiffrement" },
      { test: "Risques XSS", points: 8, desc: "Injection de scripts" },
      { test: "Formulaires", points: 6, desc: "Protection des données saisies" },
      { test: "Ressources tierces", points: 5, desc: "Dépendances externes" },
      { test: "Stockage local", points: 5, desc: "Données côté client" },
      { test: "SQL/Données", points: 3, desc: "Exposition d'informations" },
      { test: "DOM XSS", points: 3, desc: "Manipulation du DOM" }
    ],
    calculation: `
• Statut OK ou Info = 100% des points
• Statut Attention = 50% des points  
• Statut Échec = 0 point`
  },

  status: {
    title: "📊 Signification des Statuts",
    items: [
      { status: "OK", color: "vert", meaning: "Le test est passé. Cette protection est en place." },
      { status: "Info", color: "bleu", meaning: "Information neutre. Pas de problème, juste une info utile." },
      { status: "Attention", color: "orange", meaning: "Point d'attention. Pas critique mais pourrait être amélioré." },
      { status: "Échec", color: "rouge", meaning: "Problème détecté. Cette protection manque ou est mal configurée." }
    ]
  },

  limitations: {
    title: "⚠️ Limitations Importantes",
    
    falsePositives: {
      title: "Faux Positifs Possibles",
      description: "Un faux positif, c'est quand l'outil signale un problème qui n'en est pas un.",
      examples: [
        "innerHTML utilisé de façon sécurisée (avec du contenu sanitized)",
        "eval() utilisé par des bibliothèques légitimes (certains frameworks)",
        "Patterns SQL dans du contenu légitime (articles sur les bases de données)",
        "Ressources tierces de confiance signalées comme risque",
        "Cookies techniques sans flags (analytics, préférences non sensibles)"
      ],
      advice: "Un warning ne signifie pas forcément une faille. Évaluez le contexte."
    },

    falseNegatives: {
      title: "Faux Négatifs Possibles",
      description: "Un faux négatif, c'est quand l'outil ne détecte pas un vrai problème.",
      examples: [
        "Failles côté serveur (injections SQL réelles, authentification...)",
        "Code JavaScript obfusqué ou minifié",
        "Vulnérabilités dans les dépendances (bibliothèques tierces)",
        "Mauvaises pratiques dans du code généré dynamiquement",
        "Problèmes de logique métier",
        "Failles nécessitant une authentification pour être détectées"
      ],
      advice: "Un score de 100 ne garantit pas l'absence de failles. C'est un indicateur, pas une certification."
    }
  },

  whatWeCannotSee: {
    title: "🔍 Ce que VerifWeb NE PEUT PAS voir",
    items: [
      "La sécurité côté serveur (base de données, API, authentification)",
      "Les failles nécessitant des tests actifs (pentest)",
      "La qualité du code source original",
      "Les vulnérabilités des dépendances npm/composer/etc.",
      "La configuration du serveur (firewall, rate limiting...)",
      "Les sauvegardes et la politique de récupération",
      "La sécurité des processus internes de l'entreprise"
    ]
  },

  forDevelopers: {
    title: "👨‍💻 Pour les Développeurs",
    description: "VerifWeb est un premier niveau de vérification. Pour une sécurité complète :",
    recommendations: [
      "Utilisez des outils d'analyse statique (SonarQube, ESLint security plugins)",
      "Faites auditer votre code régulièrement",
      "Testez avec des outils spécialisés (OWASP ZAP, Burp Suite)",
      "Suivez les guidelines OWASP Top 10",
      "Formez vos équipes à la sécurité applicative",
      "Mettez en place des tests de sécurité automatisés (SAST/DAST)"
    ]
  },

  forUsers: {
    title: "👤 Pour les Utilisateurs",
    description: "Ce que le score vous indique :",
    interpretations: [
      { range: "80-100", meaning: "Le site applique les bonnes pratiques de sécurité visibles. Vous pouvez naviguer avec confiance." },
      { range: "60-79", meaning: "Le site est correct mais pourrait être mieux sécurisé. Restez vigilant avec vos données sensibles." },
      { range: "40-59", meaning: "Des améliorations sont nécessaires. Évitez d'entrer des informations très sensibles." },
      { range: "20-39", meaning: "Plusieurs problèmes détectés. Soyez très prudent sur ce site." },
      { range: "0-19", meaning: "Nombreux problèmes de sécurité. Évitez de saisir des informations personnelles." }
    ],
    warning: "Le score ne reflète que la sécurité VISIBLE. Un site peut avoir un bon score et être vulnérable côté serveur."
  }
};

/**
 * Génère le HTML de la documentation complète
 */
export function generateDocHTML() {
  const doc = DOCUMENTATION;
  
  return `
    <div class="doc-content">
      <h2>${doc.title}</h2>
      <p class="doc-intro">${doc.intro}</p>

      <section class="doc-section">
        <h3>${doc.scoring.title}</h3>
        <p>${doc.scoring.description}</p>
        <table class="doc-table">
          <thead><tr><th>Test</th><th>Points</th><th>Pourquoi</th></tr></thead>
          <tbody>
            ${doc.scoring.weights.map(w => `<tr><td>${w.test}</td><td>${w.points}</td><td>${w.desc}</td></tr>`).join('')}
          </tbody>
        </table>
        <pre class="doc-calc">${doc.scoring.calculation}</pre>
      </section>

      <section class="doc-section">
        <h3>${doc.status.title}</h3>
        <ul class="doc-status-list">
          ${doc.status.items.map(s => `<li><strong class="status-${s.status.toLowerCase()}">${s.status}</strong> (${s.color}) : ${s.meaning}</li>`).join('')}
        </ul>
      </section>

      <section class="doc-section doc-warning">
        <h3>${doc.limitations.title}</h3>
        
        <div class="doc-subsection">
          <h4>🟡 ${doc.limitations.falsePositives.title}</h4>
          <p>${doc.limitations.falsePositives.description}</p>
          <ul>${doc.limitations.falsePositives.examples.map(e => `<li>${e}</li>`).join('')}</ul>
          <p class="doc-advice">💡 ${doc.limitations.falsePositives.advice}</p>
        </div>

        <div class="doc-subsection">
          <h4>🔴 ${doc.limitations.falseNegatives.title}</h4>
          <p>${doc.limitations.falseNegatives.description}</p>
          <ul>${doc.limitations.falseNegatives.examples.map(e => `<li>${e}</li>`).join('')}</ul>
          <p class="doc-advice">💡 ${doc.limitations.falseNegatives.advice}</p>
        </div>
      </section>

      <section class="doc-section">
        <h3>${doc.whatWeCannotSee.title}</h3>
        <ul>${doc.whatWeCannotSee.items.map(i => `<li>${i}</li>`).join('')}</ul>
      </section>

      <section class="doc-section">
        <h3>${doc.forUsers.title}</h3>
        <p>${doc.forUsers.description}</p>
        <table class="doc-table">
          <thead><tr><th>Score</th><th>Interprétation</th></tr></thead>
          <tbody>
            ${doc.forUsers.interpretations.map(i => `<tr><td>${i.range}</td><td>${i.meaning}</td></tr>`).join('')}
          </tbody>
        </table>
        <p class="doc-warning-text">⚠️ ${doc.forUsers.warning}</p>
      </section>

      <section class="doc-section">
        <h3>${doc.forDevelopers.title}</h3>
        <p>${doc.forDevelopers.description}</p>
        <ul>${doc.forDevelopers.recommendations.map(r => `<li>${r}</li>`).join('')}</ul>
      </section>
    </div>
  `;
}
