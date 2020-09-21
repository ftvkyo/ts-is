import { createAssertType } from "../index";


describe("createAssertType", () => {
    it("returns the object for valid objects", () => {
        const meaning: number = 42;
        const assertNumber = createAssertType<number>();

        expect(assertNumber(meaning)).toBe(meaning);
    });

    it("returns the object for valid objects, with custom error factory", () => {
        const meaning: number = 42;
        const assertNumber = createAssertType<number>();

        expect(assertNumber(meaning, Error)).toBe(meaning);
    });
});
