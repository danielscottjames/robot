import { createReadStream, ReadStream } from "fs";
import { Disposable } from "../disposable.js";
import { JoystickStream } from "./joystick-stream.js";
import { JoystickEvent, parseEvent } from "./parseEvent.js";

export class Joystick<T extends JoystickEvent> extends Disposable {
    private fileStream: ReadStream;

    /**
     * @param devicePath e.g. "/dev/input/js0"
     * @param mappingFn function to re-map event data (e.g. add button names of your specific device)
     * @param includeInit include events that report initial joystick state
     */
    constructor(devicePath: string, private mappingFn: (ev: JoystickEvent) => T, private includeInit = false) {
        super();

        this.fileStream = createReadStream(devicePath)
            .on('error', (e: any) => {
                if (e.code === 'ENODEV') {
                    this.emit("disconnect");
                } else {
                    this.emit('error', e);
                }
            });

        this.fileStream
            .pipe(new JoystickStream())
            .on('data', (b) => this.onData(b));
    }

    public dispose() {
        super.dispose();
        this.fileStream.unpipe();
        this.fileStream.destroy();
    }

    onData(buff: Buffer) {

        const ev = parseEvent(buff);

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
