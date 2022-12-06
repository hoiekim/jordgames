import { ApiResponse } from "back/lib";

export const xmlTojson = <T = any>(xml: Document) => {
  const recur = (xml: Document | Element) => {
    try {
      if (!xml.children.length && xml.textContent) {
        return xml.textContent;
      }

      const obj: any = {};

      if ((xml as Element).attributes) {
        Array.from((xml as Element).attributes).forEach(({ name, value }) => {
          obj[name] = value;
        });
      }

      for (let i = 0; i < xml.children.length; i++) {
        const item = xml.children.item(i) as Element;
        const { nodeName } = item;
        if (typeof obj[nodeName] == "undefined") {
          obj[nodeName] = recur(item);
        } else {
          if (!Array.isArray(obj[nodeName])) obj[nodeName] = [obj[nodeName]];
          obj[nodeName].push(recur(item));
        }
      }

      return obj;
    } catch (e: any) {
      console.warn(e.message);
      return null;
    }
  };
  return recur(xml) as T;
};

type CallOption = RequestInit & { onFinish?: (...args: any) => any; log?: boolean };

const call = async <T = any>(path: string, options?: CallOption) => {
  const method = options?.method || "GET";
  const body = options?.body;
  const log = options?.log === undefined ? true : options.log;

  const init: RequestInit | undefined = options;

  if (method === "POST") {
    (init as RequestInit).headers = { "Content-Type": "application/json" };
    (init as RequestInit).body = JSON.stringify(body);
  }

  const response: ApiResponse<T> = await fetch(path, init).then((r) => r.json());

  if (log) console.log(`<${method}> ${path}`, response);

  return response;
};

call.get = <T>(path: string) => call<T>(path);
call.post = <T>(path: string, body: any) => call<T>(path, { method: "POST", body });
call.delete = <T>(path: string) => call<T>(path, { method: "DELETE" });

const bgg_base_url = "https://boardgamegeek.com/xmlapi2";

const bgg = async <T = any>(path: string) =>
  fetch(bgg_base_url + path)
    .then((r) => r.text())
    .then((str) => {
      const xml = new window.DOMParser().parseFromString(str, "text/xml");
      const response = xmlTojson<T>(xml);
      console.log(`<BGG.GET> ${path}`, response);
      return response;
    });
bgg.get = <T>(path: string) => bgg<T>(path);

call.bgg = bgg;

export { call };

export const read = async <T = any>(
  path: string,
  callback: (response: ApiResponse<T>) => any,
  options?: CallOption
) => {
  const method = options?.method?.toUpperCase() || "GET";
  const log = options?.log === undefined ? true : options.log;

  const response = await fetch(path, options);
  const reader = response.body?.getReader();
  if (!reader) return;

  let streamBuilder = "";

  const start = async (controller: ReadableStreamController<any>) => {
    const push = async () => {
      try {
        const { done, value } = await reader.read();

        if (done) {
          controller.close();
          reader.releaseLock();
          if (options?.onFinish) options.onFinish();
          return;
        }

        const text = new TextDecoder().decode(value);
        streamBuilder += text;

        if (streamBuilder.includes("\n")) {
          const splittedStream = streamBuilder.split("\n").filter((e) => e);
          splittedStream.forEach((e, i) => {
            let isError = false;

            try {
              const response: ApiResponse<T> = JSON.parse(e);
              if (log) console.log(`<${method}> ${path}`, response);
              callback(response);
            } catch (error) {
              console.error(error);
              isError = true;
            }

            if (i === splittedStream.length - 1) {
              streamBuilder = isError ? e : "";
            }
          });
        }

        controller.enqueue(value);

        push();
      } catch (error) {
        console.error(error);
      }
    };

    push();
  };

  return new ReadableStream({ start });
};
