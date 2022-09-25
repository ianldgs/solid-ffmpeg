import { createSignal, createResource, onMount } from "solid-js";
import * as idb from "idb-keyval";

export default {
  async _fromCache(id) {
    return idb
      .get(`directory.${id}`)
      .then(async (dirHandle) => {
        await dirHandle.requestPermission({ id });

        return dirHandle;
      })
      .catch(() => null);
  },
  async _new(id) {
    return window.showDirectoryPicker({ id }).then(async (dirHandle) => {
      try {
        await idb.set(`directory.${id}`, dirHandle);
      } finally {
        return dirHandle;
      }
    });
  },
  resource(id = "default", { live = true } = {}) {
    let dirHandle;

    const [hasCache, setHasCache] = createSignal();
    idb.get(`directory.${id}`).then((cache) => setHasCache(!!cache));

    const [hasPermission, setHasPermission] = createSignal(false);
    const [canRequest, setCanRequest] = createSignal(false);
    const [files, { refetch }] = createResource(async () => {
      if (!canRequest()) return;

      dirHandle ??= await this._fromCache(id);
      dirHandle ??= await this._new(id);

      setHasPermission(true);

      const files = [];

      for await (const entry of dirHandle.values()) {
        files.push(entry);
      }

      return files;
    });
    onMount(() => {
      setCanRequest(true);
    });

    if (live) {
      // TODO: cleanup
      setInterval(() => {
        if (dirHandle && files.latest) refetch();
      }, 5000);

      // TODO: cleanup
      window.addEventListener("focus", () => {
        if (dirHandle && files.latest) refetch();
      });
    }

    return {
      dirHandle: () => dirHandle,
      files,
      hasCache,
      hasPermission,
      requestPermission: refetch,
    };
  },
};
