import EventEmitter from "events";

export class Disposable extends EventEmitter {

    private disposables: Disposable[] = [];

    private _isDisposed = false;
    public get isDisposed() {
        return this._isDisposed;
    }

    public registerDisposable(disposable: Disposable) {
        this.disposables.push(disposable);
    }

    public dispose() {
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
    public dispose__unsafe() {
        for (const disposable of this.disposables.reverse()) {
            try {
                disposable.dispose__unsafe();
            } catch (e) {
                console.error(e);
            }
        }

        this.disposables.length = 0;
        this.dispose();
    }
}