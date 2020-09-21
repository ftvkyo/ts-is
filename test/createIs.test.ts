import { createIs } from "../index";


describe("createIs", () => {
    it("returns true for valid objects", () => {
        const meaning: number = 42;
        const isNumber = createIs<number>();

        expect(isNumber(meaning)).toBe(true);
    });
});
