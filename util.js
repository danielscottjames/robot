"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = delay;
exports.clamp = clamp;
exports.defer = defer;
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
function defer() {
    let resolve;
    let reject;
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
