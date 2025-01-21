"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromiseLock = void 0;
const disposable_1 = require("./disposable");
class PromiseLock extends disposable_1.Disposable {
    constructor() {
        super(...arguments);
        this.pending = Promise.resolve();
    }
    /**
     * Enqueues a new function (sync or async) to be called only after
     * all previously enqueued functions have finished (resolved or rejected).
     */
    next(fn) {
        const task = this.pending
            .then(async () => {
            if (!this.isDisposed) {
                await fn();
            }
        });
        this.pending = task.catch(() => { });
        return task;
    }
    dispose() {
        this.pending = Promise.resolve();
        super.dispose();
    }
}
exports.PromiseLock = PromiseLock;
