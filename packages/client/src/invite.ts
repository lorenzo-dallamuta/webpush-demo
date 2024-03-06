import { subscribeUserToPush } from "./push";

export function createDialog(element: HTMLButtonElement) {
  return new Promise<HTMLDialogElement>((resolve, reject) => {
    try {
      const dialog = document.createElement("dialog");
      dialog.innerHTML = /*html*/`
        <form method="dialog">
          <button id="agree">OK</button>
        </form>
      `;
      dialog.style.cssText = `
        position: absolute;
        top: 50%;
        translate: 0 -50%;
      `;
      element.appendChild(dialog);
      resolve(dialog)
    } catch (err) {
      reject(err)
    }
  })
}

export function attachInvite(dialog: HTMLDialogElement) {
  dialog.addEventListener("click", () => {
    subscribeUserToPush()
      .then((subscription) => {
        fetch("http://localhost:3000/push", {
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json"
          },
          method: "POST",
        })
      })
      .catch((err) => console.log(err))
  })
  dialog.open = true;
}
