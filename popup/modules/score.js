/**
 * Gestion de l'affichage du score
 */

import { SCORE_COMMENTS } from './scoreComments.js';

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
