/**
 * Gestion de l'affichage du score
 */
export function displayScore(score) {
  const scoreElement = document.getElementById('global-score');
  const scoreValue = scoreElement.querySelector('.score-value');
  
  scoreValue.textContent = score;
  scoreElement.classList.remove('score-excellent', 'score-good', 'score-medium', 'score-poor');
  
  if (score >= 80) scoreElement.classList.add('score-excellent');
  else if (score >= 60) scoreElement.classList.add('score-good');
  else if (score >= 40) scoreElement.classList.add('score-medium');
  else scoreElement.classList.add('score-poor');
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
