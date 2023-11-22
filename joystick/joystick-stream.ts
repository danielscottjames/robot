import { Transform, TransformCallback } from "stream";

/**
 * Slices the incoming stream into 8 byte chunks
 */
export class JoystickStream extends Transform {

    byteLength = 8;
    cache = Buffer.alloc(0);

    constructor() { super(); }

    override _transform(chunk: any, encoding: BufferEncoding, callback: TransformCallback) {

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

        for (;i < buff.length; i += this.byteLength) {
            this.push(buff.slice(i, i + this.byteLength));
        }

        if (i < buff.length) {
            this.cache = buff.slice(i);
        }

        callback(null);
    }
}
