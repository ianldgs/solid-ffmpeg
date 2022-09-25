import { render } from "solid-js/web";

import html from "solid-js/html";

import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

import FileList from "./components/FileList.js";

render(App, document.getElementById("root"));

const ffmpeg = createFFmpeg({ log: true });

function App() {
  return html`<${FileList}><//>`;
}

await ffmpeg.load({
  //corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  //corePath: "https://esm.sh/@ffmpeg/core@0.11.5/dist/ffmpeg-core.js",
  log: true,
});
