import { v4 } from "uuid";

class Translator {
  private accessToken: string | undefined;
  private fetchingAuth: Promise<void> | undefined;

  /**
   * Caching accessTocken with local variable.
   * If fetching is not available, throws Error.
   *
   * You can check auth state with this method. (whether Error occured or not.)
   *
   * @throws UNAUTHORIZED Error occured when failed to get auth key.
   */
  async getAccessToken() {
    if (this.accessToken) return this.accessToken;

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
    })();
    await this.fetchingAuth;
    this.fetchingAuth = undefined;

    return this.accessToken;
  }

  private async deleteConversation(conversationId: string) {
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

  private async requestConversation(
    prompt: string,
    callback: (response: string) => void
  ) {
    const requestBody = {
      action: "next",
      messages: [
        {
          id: v4(),
          role: "user",
          content: {
            content_type: "text",
            parts: [prompt],
          },
        },
      ],
      model: "gpt-3.5-turbo",
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

        const assistMessage = parsedJsonArr[parsedJsonArr.length - 1];
        console.log(assistMessage);

        if (assistMessage.error) {
          callback(assistMessage.errer);
          continue;
        }

        conversationId = assistMessage["conversation_id"];
        const result = assistMessage.message?.content?.parts?.[0];
        if (!result) continue;

        callback(result);
      } catch (e) {
        console.error("Error occured while parsing GPT response. Error : " + e);
      }
    }

    console.log(conversationId);
    if (conversationId) this.deleteConversation(conversationId);
  }

  async requestTranslation(
    targetText: string,
    targetLanguage: string,
    callback: (translatedText: string) => void,
    options?: string[]
  ) {
    const prompt = `
    Translate "${targetText}" to ${targetLanguage}.

    Please ensure to follow these instructions or guidelines:
    - The provided text is recognized text from an image.
    - It may contain typos, missing words, or unusual words.
    - If deemed necessary, feel free to paraphrase it and provide additional explanations.
    - Only Awnser with the results and additional explanation if needed.
    ${options && options.length > 0 ? "- " : ""}${options?.join("\n- ") ?? ""}].
    `;
    console.log(prompt);

    this.requestConversation(prompt, callback);
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
