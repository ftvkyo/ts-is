import { createAssertType } from "../../index";


describe("createIs on unions of primitives", () => {
    it("returns true for valid values", () => {
        const assertUnion = createAssertType<number | string>();

        expect(assertUnion(42)).toBe(42);
        expect(assertUnion("42")).toBe("42");
    });

    it("returns false for invalid values", () => {
        const assertUnion = createAssertType<number | string>();

        expect(() => assertUnion(undefined)).toThrow();
        expect(() => assertUnion(true)).toThrow();
        expect(() => assertUnion(false)).toThrow();
        expect(() => assertUnion(BigInt(42))).toThrow();
        expect(() => assertUnion(Symbol("42"))).toThrow();
    });
});
