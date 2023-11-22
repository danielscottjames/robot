import { Disposable } from './disposable';
import { Joystick } from './joystick/joystick';
import { XboxJoystickEvent, xboxOneMapper } from './joystick/xbox-one';
import { PWMController } from './PWMController';

const MAX_AXIS_VALUE = 32767;

let program: Disposable = new Disposable();
let timer: NodeJS.Timer;

function main() {
    program = new Disposable();

    let resolve: Function;
    let reject: Function;
    
    const r = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });


    const stick = new Joystick("/dev/input/js0", xboxOneMapper);
    const motor = new PWMController(20, { range: 410 });
    program.registerDisposable(stick);
    program.registerDisposable(motor);

    motor.start();

    stick.on("error", (e) => reject(e));
    stick.on("update", (ev: XboxJoystickEvent) => {
        if (ev.name == 'LEFT_STICK_X') {
            motor.set(ev.value / MAX_AXIS_VALUE);
        }
    });

    stick.on("disconnect", () => {
        program.dispose();
        resolve();
    });
    
    return r;
}

const retry = async () => {
    try {
        await main();
    } catch(e) {
        console.error(e);
    } finally {
        if (!program.isDisposed) {
            program.dispose__unsafe();
        }
        timer = setTimeout(retry, 1000);
    }
};

console.log('Starting...');
retry();



process.on('uncaughtException', function (e) {
    console.error(`[uncaughtException]`, e);
});

process.on('SIGINT', function cleanupAndTerminate() {
    console.log('Stopping...');

    try {
        clearTimeout(timer);
        if (!program.isDisposed) {
            program.dispose__unsafe();
        }
    } finally {
        // Because Node.js is a joke sometimes:
        // https://github.com/nodejs/node-v0.x-archive/issues/7101
        process.kill(process.pid, 'SIGTERM');
    }
});