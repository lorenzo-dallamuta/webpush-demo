import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = /*html*/`
  <header>
    <p>follows https://web.dev/explore/notifications</p>
  </header>
  <main>
    <h1>Web Push Demo</h1>
  </main>
`;

(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .catch(function (err) {
        console.error('Unable to register service worker.', err);
      });
  }
})()

