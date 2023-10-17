import { v4 } from "uuid";

class Translator {
  private accessToken: string | undefined;
  private fetchingAuth: Promise<void> | undefined;

  /**
   * Caching accessTocken with local variable first, and chrome session storage second.
   * If fetching is not available, throws Error.
   */
  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

    const storageKey = "openai_access_tocken";
    /*await chrome.storage.session.setAccessLevel({
      accessLevel: chrome.storage.AccessLevel.TRUSTED_CONTEXTS,
    });
    const result = await chrome.storage.session.get(storageKey);
    if (result[storageKey]) return result[storageKey];*/

    if (this.fetchingAuth) {
      await this.fetchingAuth;
      return this.accessToken;
    }

    this.fetchingAuth = (async () => {
      const auth = await fetch("https://chat.openai.com/api/auth/session", {
        mode: "no-cors",
      })
        .then((res) => res.json())
        .catch((e) =>
          console.error("error occured with fetching openai auth key : " + e)
        );
      if (!auth.accessToken) throw new Error("UNAUTHORIZED");

      this.accessToken = auth.accessToken;

      //chrome.storage.session.set({ storageKey: this.accessTocken });
    })();
    await this.fetchingAuth;
    this.fetchingAuth = undefined;

    return this.accessToken;
  }

  async deleteConversation(conversationId: string) {
    const response = await fetch(
      `https://chat.openai.com/backend-api/conversation/${conversationId}`,
      {
        method: "PATCH",
        mode: "no-cors",
        headers: {
          authorization: `Bearer ${await this.getAccessToken()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ is_visible: false }),
      }
    );
    return response;
  }

  async requestTranslation(
    targetText: string,
    destLanguage: string,
    options?: string[]
  ) {
    const body = {
      action: "next",
      messages: [
        {
          id: v4(),
          role: "user",
          content: {
            content_type: "text",
            parts: ["what is the capital of Korea?"],
          },
        },
      ],
      model: "text-davinci-002-render",
      parent_message_id: v4(),
    };

    const response = await fetch(
      "https://chat.openai.com/backend-api/conversation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await this.getAccessToken()}`,
        },
        body: JSON.stringify(body),
      }
    );
    const result = await response.json();
    console.log(result);
  }
}

const translator = new Translator();
export { translator };
