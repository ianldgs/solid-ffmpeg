import { Show } from "solid-js";
import html from "solid-js/html";

export default function FullScreenOverlay({ title, paragraph, onClick }) {
  return html`<div
    role="button"
    onClick=${(e) => onClick(e)}
    class="ion-activatable ripple-parent"
    style="cursor: pointer; position: absolute; width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column"
  >
    <ion-text color="primary">
      <h1>${title}</h1>
    </ion-text>

    <ion-text>
      <p>${paragraph}</p>
    </ion-text>

    <ion-ripple-effect></ion-ripple-effect>
  </div>`;
}
