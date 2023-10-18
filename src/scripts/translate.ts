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
        headers: {
          authorization: `Bearer ${await this.getAccessToken()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ is_visible: false }),
      }
    );
    if (!response.ok) throw new Error("failed to delete conversation");

    return response;
  }

  async requestTranslation(
    targetText: string,
    destLanguage: string,
    options?: string[]
  ) {
    const requestBody = {
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
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) throw new Error("failed to request gpt call.");

    const reader = response.body?.getReader() as ReadableStreamDefaultReader;
    const readerGenerator = this.getReaderGenerator(reader);
    const decoder = new TextDecoder();

    let conversationId = "";
    for await (const value of readerGenerator) {
      const responseStr = decoder.decode(value);

      try {
        const parsedJsonArr = this.parseGptResponse(responseStr);
        if (parsedJsonArr.length === 0) break;

        conversationId = parsedJsonArr[0]["conversation_id"];
        console.log(parsedJsonArr);
      } catch (e) {
        console.error("Error occured while parsing GPT response. Error : " + e);
      }
    }

    console.log(conversationId);
    this.deleteConversation(conversationId);
  }

  /**
   * Helper function for processing ReadableStream.
   *
   * @param reader reader of ReadableStream.
   * @returns async Generater function that returns `value` of readed data.
   */
  private async *getReaderGenerator(reader: ReadableStreamDefaultReader) {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  }

  /**
   * Helper function for parsing Gpt answer.
   *
   * @param responseString string of gpt response
   * @returns Array of parsed JSON
   * @throws JSON parsing error
   */
  private parseGptResponse(responseString: string) {
    const result = responseString
      .split("\n")
      .filter((value) => {
        if (value.length === 0) return false;
        if (value === "data: [DONE]") return false;
        return true;
      })
      .map((value) => {
        const trim = value.replace("data: ", "");
        return JSON.parse(trim);
      });

    return result;
  }
}

const translator = new Translator();
export { translator };
