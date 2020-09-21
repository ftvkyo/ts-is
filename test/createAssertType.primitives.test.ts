import { createAssertType, TypeAssertionError } from "../index";


describe("createAssertType on primitives", () => {
    it("returns the object for valid values", () => {
        const assertNumber = createAssertType<number>();

        expect(assertNumber(42)).toBe(42);
    });

    it("returns the object for valid values, with custom error factory", () => {
        const assertNumber = createAssertType<number>();

        expect(assertNumber(42, Error)).toBe(42);
    });

    it("throws TypeAssertionError for invalid values", () => {
        const assertString = createAssertType<string>();

        expect(() => assertString(undefined)).toThrow(TypeAssertionError);
        expect(() => assertString(true)).toThrow(TypeAssertionError);
        expect(() => assertString(false)).toThrow(TypeAssertionError);
        expect(() => assertString(42)).toThrow(TypeAssertionError);
        expect(() => assertString(BigInt(42))).toThrow(TypeAssertionError);
        expect(() => assertString(Symbol("42"))).toThrow(TypeAssertionError);
    });

    it("throws custom Error for invalid values", () => {
        const assertString = createAssertType<string>();

        expect(() => assertString(undefined, Error)).toThrow(Error);
        expect(() => assertString(true, Error)).toThrow(Error);
        expect(() => assertString(false, Error)).toThrow(Error);
        expect(() => assertString(42, Error)).toThrow(Error);
        expect(() => assertString(BigInt(42), Error)).toThrow(Error);
        expect(() => assertString(Symbol("42"), Error)).toThrow(Error);
    });
});
