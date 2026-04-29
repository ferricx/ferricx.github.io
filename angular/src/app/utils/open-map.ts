export const MAPS_FALLBACK_URL =
  'https://www.google.com/maps/search/?api=1&query=123+Any+St%2C+No+Name%2C+CO+81419';

function tryScheme(uri: string): void {
  const a = document.createElement('a');
  a.href = uri;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function openMap(event: Event): void {
  event.preventDefault();
  const ua = navigator.userAgent;
  if (/Android|CrOS/.test(ua)) {
    tryScheme('geo:0,0?q=123+Any+St%2C+No+Name%2C+CO+81419');
  } else if (/iPad|iPhone|iPod|Macintosh/.test(ua)) {
    tryScheme('maps://?q=123+Any+St%2C+No+Name%2C+CO+81419');
  } else {
    window.open(MAPS_FALLBACK_URL, '_blank', 'noopener');
  }
}
