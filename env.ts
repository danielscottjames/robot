import { Disposable } from "./disposable";
import { defer, DeferredPromise } from "./util";

export class Env extends Disposable {
    private interval?: NodeJS.Timeout = undefined;
    private callbacks: (() => void | Promise<void>)[] = [];

    public readonly untilTerminated: DeferredPromise;

    constructor() {
        super();

        this.untilTerminated = defer();
    }

    public terminate(e: unknown) {
        if (e) {
            this.untilTerminated.reject(e);
        }
        this.dispose();
    }

    public repeat(callback: () => void | Promise<void>) {
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

    public override dispose() {
        clearInterval(this.interval);
        this.callbacks.length = 0;
        this.untilTerminated.resolve();
        super.dispose();
    }
}