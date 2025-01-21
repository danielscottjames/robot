"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Env = void 0;
const disposable_1 = require("./disposable");
const util_1 = require("./util");
class Env extends disposable_1.Disposable {
    constructor() {
        super();
        this.interval = undefined;
        this.callbacks = [];
        this.untilTerminated = (0, util_1.defer)();
    }
    terminate(e) {
        if (e) {
            this.untilTerminated.reject(e);
        }
        this.dispose();
    }
    repeat(callback) {
        this.callbacks.push(callback);
        if (!this.interval) {
            this.interval = setInterval(() => {
                this.callbacks.forEach(async (callback) => {
                    // await will ensure all callbacks fire even if one throws.
                    await callback();
                }, 200);
            });
        }
    }
    dispose() {
        clearInterval(this.interval);
        this.callbacks.length = 0;
        this.untilTerminated.resolve();
        super.dispose();
    }
}
exports.Env = Env;
