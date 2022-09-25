import { render } from "solid-js/web";
import html from "solid-js/html";

import Home from "./pages/Home.js";

render(App, document.getElementById("root"));

function App() {
  return html`<${Home}><//>`;
}
