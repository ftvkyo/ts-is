import { createIs } from "../index";


describe("createIs on primitives", () => {
    it("returns true for valid values", () => {
        const isNumber = createIs<number>();

        expect(isNumber(42)).toBe(true);
    });

    it("returns false for invalid values", () => {
        const isString = createIs<string>();

        expect(isString(undefined)).toBe(false);
        expect(isString(true)).toBe(false);
        expect(isString(false)).toBe(false);
        expect(isString(42)).toBe(false);
        expect(isString(BigInt(42))).toBe(false);
        expect(isString(Symbol("42"))).toBe(false);
    });
});
