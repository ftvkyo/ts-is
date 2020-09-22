import * as util from "../src/typecheck/util";


function onlyUnique<T>(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
}


describe("util.makeUniqueId", () => {
    it("generates uniquie ids", () => {
        const ids = [];
        for (let i = 0; i < 5000; i++) {
            ids.push(util.makeUniqueId());
        }
        const unique = ids.filter(onlyUnique);

        expect(ids.length).toBe(unique.length);
    });
});
