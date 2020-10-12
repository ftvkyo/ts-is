import { createIs } from "../../index";


describe("createIs on unions of primitives", () => {
    it("returns true for valid values", () => {
        const isUnion = createIs<number | string>();

        expect(isUnion(42)).toBe(true);
        expect(isUnion("42")).toBe(true);
    });

    it("returns false for invalid values", () => {
        const isUnion = createIs<number | string>();

        expect(isUnion(undefined)).toBe(false);
        expect(isUnion(true)).toBe(false);
        expect(isUnion(false)).toBe(false);
        expect(isUnion(BigInt(42))).toBe(false);
        expect(isUnion(Symbol("42"))).toBe(false);
    });
});
