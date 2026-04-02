import { describe, expect, it } from "vitest";
import { sortedUrlSearchParamsString } from "@/lib/helpers/sorted-url-search-params-string";

describe("sortedUrlSearchParamsString", () => {
  it("sorts keys then values for a stable string", () => {
    const params = new URLSearchParams();
    params.set("z", "2");
    params.set("a", "1");
    params.append("m", "b");
    params.append("m", "a");
    expect(sortedUrlSearchParamsString(params)).toBe("a=1&m=a&m=b&z=2");
  });
});
