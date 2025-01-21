"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Program = void 0;
const disposable_1 = require("./disposable");
class Program extends disposable_1.Disposable {
    constructor() {
        super();
        this.interval = undefined;
        this.callbacks = [];
    }
    repeat(callback) {
        this.callbacks.push(callback);
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.callbacks.forEach(async (callback) => {
                    // await will ensure all callbacks fire even if one throws.
                    await callback();
                }, 20);
            });
        }
    }
    dispose() {
        clearInterval(this.interval);
        this.callbacks.length = 0;
        super.dispose();
    }
}
exports.Program = Program;
