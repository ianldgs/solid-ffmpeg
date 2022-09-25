import { For, Show } from "solid-js";

import html from "solid-js/html";
import directoryHandle from "../lib/directoryHandle.js";

export default function FileList() {
  const { files, hasPermission, request } = directoryHandle.resource();

  return html`<div>
    <span>${files.error && "Error :/"}</span>
    <span>${files.loading && files.pending && "Loading..."}</span>

    <${Show} when=${() => !hasPermission()}>
      <button onClick=${() => request()}>Do it</button>
    <//>

    <${Show} when=${() => hasPermission()}>
      <h1>Files:</h1>
    <//>

    <ul>
      <${For} each=${() => files()}> ${(file) => html` <li>${file}</li> `} <//>
    </ul>
  </div>`;
}
