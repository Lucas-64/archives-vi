import { describe, expect, it } from "vitest";

import { extrairIdYoutube } from "./youtube";

describe("extrairIdYoutube (servidor)", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/embed/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["  https://m.youtube.com/watch?v=dQw4w9WgXcQ  ", "dQw4w9WgXcQ"],
  ])("aceita %s", (url, id) => expect(extrairIdYoutube(url)).toBe(id));

  it.each([
    "https://exemplo.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com.mal.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=curto",
    "https://www.youtube.com/",
    "javascript:alert(1)",
    "ftp://youtu.be/dQw4w9WgXcQ",
    "não é link",
    "",
  ])("recusa %s", (url) => expect(extrairIdYoutube(url)).toBeUndefined());
});
