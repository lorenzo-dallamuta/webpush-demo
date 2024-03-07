function urlBase64ToUint8Array(base64String: string) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function subscribeUserToPush() {
  return fetch("http://localhost:3000/push/key")
    .then(function (res) {
      return res.json()
    })
    .then(function (data: { public: string }) {
      return navigator.serviceWorker.ready
        .then(function (registration) {
          const subscribeOptions = {
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(data.public),
          };
          return registration?.pushManager.subscribe(subscribeOptions);
        })
    })
    .catch(function (err) { console.error("Unable to subscribe user to push", err); })
}
