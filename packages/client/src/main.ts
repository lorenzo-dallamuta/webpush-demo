import './style.css'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = /*html*/`
  <header>
    <p>follows https://web.dev/explore/notifications</p>
  </header>
  <main>
    <h1>Web Push Demo</h1>
  </main>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
