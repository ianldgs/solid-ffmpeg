import { basename, extname } from "path";
import { For, Show, createSignal } from "solid-js";
import html from "solid-js/html";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

import directoryHandle from "../lib/directoryHandle.js";
import FullScreenOverlay from "../components/FullScreenOverlay.js";

export default function Home() {
  const { dirHandle, files, hasCache, hasPermission, requestPermission } =
    directoryHandle.resource();

  const [selectedFiles, setSelectedFiles] = createSignal([]);

  const [outFiles, setOutFiles] = createSignal([]);

  const overlay = html`<${FullScreenOverlay}
    onClick=${(e) => requestPermission()}
    title=${() => "FFMPEG tools"}
    paragraph=${() =>
      html`<${Show} when=${() => hasCache()} fallback="Click anywhere to begin"
        >Click anywhere to resume previous session<//
      >`}
  ><//>`;

  return html`<div>
    <span>${files.error && "Error :/"}</span>
    <span>${files.loading && files.pending && "Loading..."}</span>

    <${Show} when=${() => hasPermission()} fallback=${overlay}>
      <ion-grid>
        <ion-row>
          <ion-col size="4">
            <ion-list>
              <ion-list-header>
                <ion-label>Files:</ion-label>
                <ion-button onClick=${() => setSelectedFiles([])}>
                  Unselect All
                </ion-button>
                <ion-button
                  onClick=${() => setSelectedFiles(files().map((f) => f.name))}
                >
                  Select All
                </ion-button>
              </ion-list-header>

              <${For} each=${() => files()}>
                ${(file) => {
                  const checked = () =>
                    selectedFiles().find((f) => f === file.name);

                  return html`
                    <ion-item>
                      <ion-checkbox
                        slot="start"
                        on:ionChange=${(e) => {
                          if (e.detail.checked && checked()) return;

                          if (e.detail.checked) {
                            setSelectedFiles((sf) => sf.concat([file.name]));
                          } else {
                            setSelectedFiles((sf) =>
                              sf.filter((f) => f !== file.name)
                            );
                          }
                        }}
                        checked=${() => checked()}
                      ></ion-checkbox>
                      <ion-label>${file.name}</ion-label>
                    </ion-item>
                  `;
                }}
              <//>
            </ion-list>
          </ion-col>
          <ion-col size="6">
            <ion-card>
              <pre>
              <code>
                ${"\n"}
                <${For} each=${() => selectedFiles()}>
                ${(file) => buildCommand(file).formatted + "\n"}
                <//>
                ${"\n"}
              </code>
            </pre>
            </ion-card>
          </ion-col>
          <ion-col size="2">
            <ion-card>
              <ion-button
                onClick=${async () => {
                  const ffmpeg = createFFmpeg({ log: true });
                  await ffmpeg.load({
                    //corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
                    //corePath: "https://esm.sh/@ffmpeg/core@0.11.5/dist/ffmpeg-core.js",
                    log: true,
                  });

                  const [fileName] = selectedFiles();
                  const fileHandle = files().find((f) => f.name === fileName);
                  const inFile = await fileHandle.getFile();

                  const { inFileName, outFileName, args } =
                    buildCommand(fileName);

                  ffmpeg.FS(
                    "writeFile",
                    inFileName,
                    await toUint8Array(inFile)
                  );

                  await ffmpeg.run(...args);

                  const outFileUint8Array = ffmpeg.FS("readFile", inFileName);
                  const outFile = new File(outFileUint8Array, outFileName);

                  setOutFiles([outFile]);
                }}
              >
                Transform ${() => selectedFiles().length} to GIF
              </ion-button>

              <ion-button
                onClick=${async () => {
                  const [outFile] = outFiles();

                  console.log(outFile);

                  const outFileHandle = await dirHandle().getFileHandle(
                    outFile.name,
                    { create: true }
                  );
                  const writable = await outFileHandle.createWritable();
                  await writable.write(outFile);
                  await writable.close();

                  setOutFiles([]);
                }}
              >
                Save ${() => outFiles().length}
              </ion-button>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    <//>
  </div>`;
}

function buildCommand(fileName) {
  const inFileName = fileName;
  const outFileName = `${basename(fileName, extname(fileName))}.gif`;

  const args = [
    "-i",
    inFileName,
    "-pix_fmt",
    "rgb8",
    "-r",
    "5",
    outFileName,
    "-y",
  ];

  return {
    inFileName,
    outFileName,
    args,
    formatted:
      "ffmpeg " +
      args
        .map((arg) =>
          [inFileName, outFileName].includes(arg) ? `"${arg}"` : arg
        )
        .join(" "),
  };
}

function toUint8Array(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(new Uint8Array(fr.result));
    };
    fr.onerror = (e) => {
      reject(e);
    };
    fr.readAsArrayBuffer(file);
  });
}
