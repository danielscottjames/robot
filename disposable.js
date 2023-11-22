"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Disposable = void 0;
const events_1 = __importDefault(require("events"));
class Disposable extends events_1.default {
    constructor() {
        super(...arguments);
        this.disposables = [];
        this._isDisposed = false;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    registerDisposable(disposable) {
        this.disposables.push(disposable);
    }
    dispose() {
        for (const disposable of this.disposables.reverse()) {
            disposable.dispose();
        }
        this.disposables.length = 0;
        this.removeAllListeners();
        this._isDisposed = true;
    }
    /**
     * Attempts to dispose all dependencies while swallowing errors.
     * __unsafe due to being in a potentially unknown state at the time
     * `this.dispose()` is called.
     */
    dispose__unsafe() {
        for (const disposable of this.disposables.reverse()) {
            try {
                disposable.dispose__unsafe();
            }
            catch (e) {
                console.error(e);
            }
        }
        this.disposables.length = 0;
        this.dispose();
    }
}
exports.Disposable = Disposable;
