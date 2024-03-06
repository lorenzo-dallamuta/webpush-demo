import { attachInvite, createDialog } from './invite.ts'
import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = /*html*/`
  <header>
    <p>follows https://web.dev/explore/notifications</p>
  </header>
  <main id="main">
    <h1>Web Push Demo</h1>
  </main>
`;

(function () {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(function () {
        if ('PushManager' in window) {
          navigator.serviceWorker.getRegistration()
            .then(function (registration) {
              return registration?.pushManager.getSubscription()
            })
            .then(function (subscription) {
              if (!subscription) {
                const main = document.querySelector<HTMLButtonElement>('#main')!
                createDialog(main)
                  .then((dialog) => attachInvite(dialog))
                  .catch((err) => console.error(err))
              }
            })
            .catch((err) => { console.error("Unable to access subscription", err); })
        }
      })
      .catch(function (err) {
        console.error('Unable to register service worker.', err);
      });
  }
})()

