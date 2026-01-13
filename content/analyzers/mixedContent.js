/**
 * Analyse du contenu mixte (HTTP sur HTTPS)
 */
export function analyzeMixedContent() {
  const isHttps = window.location.protocol === 'https:';
  
  if (!isHttps) {
    return {
      status: 'info',
      message: 'Le site n\'utilise pas HTTPS, analyse du contenu mixte non applicable'
    };
  }

  const mixedElements = [];

  // Check images
  document.querySelectorAll('img[src^="http:"]').forEach(el => {
    mixedElements.push({ type: 'image', src: el.src });
  });

  // Check scripts
  document.querySelectorAll('script[src^="http:"]').forEach(el => {
    mixedElements.push({ type: 'script', src: el.src });
  });

  // Check stylesheets
  document.querySelectorAll('link[rel="stylesheet"][href^="http:"]').forEach(el => {
    mixedElements.push({ type: 'stylesheet', src: el.href });
  });

  // Check iframes
  document.querySelectorAll('iframe[src^="http:"]').forEach(el => {
    mixedElements.push({ type: 'iframe', src: el.src });
  });

  // Check videos
  document.querySelectorAll('video source[src^="http:"], video[src^="http:"]').forEach(el => {
    mixedElements.push({ type: 'video', src: el.src });
  });

  // Check audio
  document.querySelectorAll('audio source[src^="http:"], audio[src^="http:"]').forEach(el => {
    mixedElements.push({ type: 'audio', src: el.src });
  });

  if (mixedElements.length === 0) {
    return {
      status: 'pass',
      message: 'Aucun contenu mixte détecté'
    };
  }

  return {
    status: 'fail',
    message: `${mixedElements.length} ressource(s) chargée(s) en HTTP sur une page HTTPS`,
    details: mixedElements
  };
}
