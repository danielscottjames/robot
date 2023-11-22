"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Joystick = void 0;
const fs_1 = require("fs");
const disposable_js_1 = require("../disposable.js");
const joystick_stream_js_1 = require("./joystick-stream.js");
const parseEvent_js_1 = require("./parseEvent.js");
class Joystick extends disposable_js_1.Disposable {
    /**
     * @param devicePath e.g. "/dev/input/js0"
     * @param mappingFn function to re-map event data (e.g. add button names of your specific device)
     * @param includeInit include events that report initial joystick state
     */
    constructor(devicePath, mappingFn, includeInit = false) {
        super();
        this.mappingFn = mappingFn;
        this.includeInit = includeInit;
        this.fileStream = (0, fs_1.createReadStream)(devicePath)
            .on('error', (e) => {
            if (e.code === 'ENODEV') {
                this.emit("disconnect");
            }
            else {
                this.emit('error', e);
            }
        });
        this.fileStream
            .pipe(new joystick_stream_js_1.JoystickStream())
            .on('data', (b) => this.onData(b));
    }
    dispose() {
        super.dispose();
        this.fileStream.unpipe();
        this.fileStream.destroy();
    }
    onData(buff) {
        const ev = (0, parseEvent_js_1.parseEvent)(buff);
        if (ev.type === "unknown") {
            console.log("ev type unknown");
            return;
        }
        if (ev.isInitial === true && this.includeInit !== true) {
            return;
        }
        this.emit("update", this.mappingFn(ev));
    }
}
exports.Joystick = Joystick;
