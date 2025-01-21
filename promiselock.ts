import { Disposable } from "./disposable";

export class PromiseLock extends Disposable {
    private pending: Promise<unknown> = Promise.resolve();

    /**
     * Enqueues a new function (sync or async) to be called only after
     * all previously enqueued functions have finished (resolved or rejected).
     */
    public next(fn: () => Promise<void>): Promise<void> {
        const task = this.pending
            .then(async () => {
                if (!this.isDisposed) {
                    await fn();
                }
            });

        this.pending = task.catch(() => { /* swallow rejection to keep chain alive */ });

        return task;
    }

    public override dispose(): void {
        this.pending = Promise.resolve();
        super.dispose();
    }
}
