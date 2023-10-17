import { v4 } from "uuid";

class Translator {
  private accessTocken: string | undefined;
  private fetchingAuth: Promise<void> | undefined;

  /**
   * Caching accessTocken with local variable first, and chrome session storage second.
   * If fetching is not available, throws Error.
   */
  async getAccessTocken() {
    if (this.accessTocken) return this.accessTocken;

    const storageKey = "openai_access_tocken";
    const result = await chrome.storage.session.get(storageKey);
    if (result[storageKey]) return result[storageKey];

    if (this.fetchingAuth) {
      await this.fetchingAuth;
      return this.accessTocken;
    }

    this.fetchingAuth = (async () => {
      const auth = await fetch("https://chat.openai.com/api/auth/session")
        .then((res) => res.json())
        .catch((e) =>
          console.error("error occured with fetching openai auth key." + e)
        );

      if (!auth.accessToken) throw new Error("UNAUTHORIZED");

      const accessTocken = auth.accessToken;
      this.accessTocken = accessTocken;

      chrome.storage.session.set({ storageKey: this.accessTocken });
    })();
    await this.fetchingAuth;
    this.fetchingAuth = undefined;

    return this.accessTocken;
  }
}

const translator = new Translator();
export { translator };
