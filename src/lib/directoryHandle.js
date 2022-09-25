import { createSignal, createResource, onMount } from "solid-js";
import * as idb from "idb-keyval";

export default {
  async _fromCache(id) {
    return idb.get(`directory.${id}`).catch(() => null);
  },
  async _requestAccess(id) {
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

    const [hasPermission, setHasPermission] = createSignal(false);
    const [canRequest, setCanRequest] = createSignal(false);
    const [files, { refetch }] = createResource(async () => {
      dirHandle ??= await this._fromCache(id);

      if (!dirHandle && !canRequest()) {
        setCanRequest(true);
        return;
      }

      const names = [];

      dirHandle ??= await this._requestAccess(id);

      setHasPermission(true);

      for await (const entry of dirHandle.values()) {
        names.push(entry.name);
      }

      return names;
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
      files,
      hasPermission,
      request: refetch,
    };
  },
};
