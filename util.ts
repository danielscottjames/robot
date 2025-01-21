export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export type DeferredPromise = ReturnType<typeof defer>;
export function defer(): PromiseLike<unknown> & { resolve: Function, reject: Function } {
    let resolve!: Function;
    let reject!: Function;

    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    return {
        resolve,
        reject,
        then: promise.then.bind(promise),
    };
}