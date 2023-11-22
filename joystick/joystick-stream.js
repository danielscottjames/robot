"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoystickStream = void 0;
const stream_1 = require("stream");
/**
 * Slices the incoming stream into 8 byte chunks
 */
class JoystickStream extends stream_1.Transform {
    constructor() {
        super();
        this.byteLength = 8;
        this.cache = Buffer.alloc(0);
    }
    _transform(chunk, encoding, callback) {
        // fast-track if possible
        if (this.cache.length === 0 && chunk.length === this.byteLength) {
            this.push(chunk);
            return callback(null);
        }
        const buff = this.cache.length === 0 ? chunk : Buffer.concat([this.cache, chunk]);
        if (buff.length < this.byteLength) {
            this.cache = buff;
            return callback(null);
        }
        let i = 0;
        for (; i < buff.length; i += this.byteLength) {
            this.push(buff.slice(i, i + this.byteLength));
        }
        if (i < buff.length) {
            this.cache = buff.slice(i);
        }
        callback(null);
    }
}
exports.JoystickStream = JoystickStream;
