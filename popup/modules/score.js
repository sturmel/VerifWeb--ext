/**
 * Gestion de l'affichage du score
 */

const SCORE_COMMENTS = {
  perfect: [
    "🏆 Même la NSA est jalouse. Tony Stark approuverait.",
    "🧙 \"You shall not pass!\" — Gandalf aux hackers. Littéralement.",
    "🖖 Spock trouve ça fascinant. Moi aussi, j'avoue.",
    "🤖 \"I'll be back\" qu'il disait. Bah non, pas ici.",
    "🎮 Achievement Unlocked: Le dev sécu a eu sa prime."
  ],
  excellent: [
    "🦇 Presque Batman. Manque juste la Batcave et les milliards.",
    "🛡️ Le hacker moyen passera son chemin. Le bon aussi, probablement.",
    "🌌 \"May the Force be with you.\" Elle l'est. Presque trop.",
    "🐉 Dracarys sur les vulnérabilités. Il en reste une ou deux.",
    "😌 Paranoïaque assumé. J'aime ça."
  ],
  good: [
    "🤷 \"With great power...\" Ouais, on n'y est pas encore, Peter.",
    "🧙 Dumbledore dirait : \"Pas mal, Harry. Mais peut mieux faire.\"",
    "🎮 Tutoriel terminé. Le vrai boss arrive bientôt.",
    "☕ Passable. Vous visez la médiocrité ou c'est un accident ?",
    "🚀 Houston, on a presque décollé. Presque."
  ],
  medium: [
    "😬 \"I've got a bad feeling about this.\" — Moi, en voyant ça.",
    "🤖 C-3PO calcule 87.6% de chances de hack. Optimiste.",
    "🏚️ \"Winter is coming.\" Pour vos données surtout.",
    "🎰 La sécurité par la chance. Stratégie audacieuse, je dois dire.",
    "🧟 The Walking Dead, mais c'est votre site le zombie."
  ],
  poor: [
    "💀 \"Game over, man!\" — Même Hudson aurait fait mieux.",
    "🦖 \"Life finds a way.\" Les hackers aussi, visiblement.",
    "🚢 \"I'm the captain now.\" — Signé : n'importe quel script kiddie.",
    "🔮 Mon Skyblog de 2007 était plus sécurisé. Et j'avais 14 ans.",
    "🎮 Dark Souls avait l'air plus accueillant."
  ],
  disaster: [
    "🤡 \"Why so serious?\" — Le Joker a fait le code review.",
    "💣 Thanos claque des doigts et vos données disparaissent.",
    "👾 \"All your base are belong to us.\" Littéralement.",
    "☠️ Ce n'est pas un site, c'est un honeypot involontaire.",
    "🎪 Le cirque Barnum de la cybersécurité. Entrée gratuite."
  ]
};

function getRandomComment(category) {
  const comments = SCORE_COMMENTS[category];
  return comments[Math.floor(Math.random() * comments.length)];
}

function getScoreCategory(score) {
  if (score === 100) return 'perfect';
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'poor';
  return 'disaster';
}

export function displayScore(score) {
  const scoreElement = document.getElementById('global-score');
  const scoreValue = scoreElement.querySelector('.score-value');
  const commentElement = document.getElementById('score-comment');
  
  scoreValue.textContent = score;
  scoreElement.classList.remove('score-excellent', 'score-good', 'score-medium', 'score-poor', 'score-disaster');
  commentElement.classList.remove('comment-excellent', 'comment-good', 'comment-medium', 'comment-poor', 'comment-disaster');
  
  const category = getScoreCategory(score);
  
  // Appliquer la classe de couleur
  if (score >= 80) {
    scoreElement.classList.add('score-excellent');
    commentElement.classList.add('comment-excellent');
  } else if (score >= 60) {
    scoreElement.classList.add('score-good');
    commentElement.classList.add('comment-good');
  } else if (score >= 40) {
    scoreElement.classList.add('score-medium');
    commentElement.classList.add('comment-medium');
  } else if (score >= 20) {
    scoreElement.classList.add('score-poor');
    commentElement.classList.add('comment-poor');
  } else {
    scoreElement.classList.add('score-disaster');
    commentElement.classList.add('comment-disaster');
  }
  
  // Afficher le commentaire
  commentElement.textContent = getRandomComment(category);
}

/**
 * Calcul du score global
 */
export function calculateScore(results) {
  let totalPoints = 0, maxPoints = 0;
  const weights = {
    https: 20, ssl: 10, cookies: 15, headers: 15,
    mixedContent: 10, thirdParty: 5, storage: 5,
    injectionXss: 8, injectionForms: 6, injectionSql: 3, injectionDomXss: 3
  };

  // Tests de base
  ['https', 'ssl', 'cookies', 'headers', 'mixedContent', 'thirdParty', 'storage'].forEach(key => {
    maxPoints += weights[key];
    const status = results[key]?.status;
    if (status === 'pass' || status === 'info') totalPoints += weights[key];
    else if (status === 'warning') totalPoints += weights[key] * 0.5;
  });

  // Tests injection
  if (results.injection) {
    const map = { xss: 'injectionXss', forms: 'injectionForms', sql: 'injectionSql', domXss: 'injectionDomXss' };
    Object.entries(map).forEach(([key, wKey]) => {
      maxPoints += weights[wKey];
      const status = results.injection[key]?.status;
      if (status === 'pass' || status === 'info') totalPoints += weights[wKey];
      else if (status === 'warning') totalPoints += weights[wKey] * 0.5;
    });
  }

  return Math.round((totalPoints / maxPoints) * 100);
}
