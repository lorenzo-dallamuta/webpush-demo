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
    console.log("request subscription")
  })
  dialog.open = true;
}
