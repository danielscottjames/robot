"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const joystick_1 = require("./joystick/joystick");
const xbox_one_1 = require("./joystick/xbox-one");
const promiselock_1 = require("./promiselock");
const PWMController_1 = require("./PWMController");
const runtime_1 = require("./runtime");
const util_1 = require("./util");
const MAX_AXIS_VALUE = 32767;
const MAX_TRIGGER_VALUE = 65535;
(0, runtime_1.init)(async (env) => {
    const stick = new joystick_1.Joystick("/dev/input/js0", xbox_one_1.xboxOneMapper);
    stick.on("error", (e) => env.terminate(new Error(`Joystick Error: ${e}`)));
    const mPitch = new PWMController_1.PWMController(528, { polarity: -1, center: 1400, range: 350 }); // 16
    const mRoll = new PWMController_1.PWMController(532); // 20
    const mYaw = new PWMController_1.PWMController(533, { polarity: -1, range: 400 }); // 21
    env.registerDisposable(stick);
    env.registerDisposable(mPitch);
    env.registerDisposable(mRoll);
    env.registerDisposable(mYaw);
    mPitch.start();
    mRoll.start();
    mYaw.start();
    // If the user clicks the A button quickly, this will queue up one dart per click.
    const triggerLock = new promiselock_1.PromiseLock();
    env.registerDisposable(triggerLock);
    let pitchPos = 0;
    let pitchDx = 0;
    env.repeat(() => {
        pitchPos = (0, util_1.clamp)(pitchPos + pitchDx / 300, -1, 1);
        mPitch.set(pitchPos);
        // console.log(`pitchPos: ${pitchPos}, pitchDx: ${pitchDx}`);
    });
    stick.on("update", (ev) => {
        // console.log(JSON.stringify(ev));
        if (ev.name == "A" && ev.value == 1) {
            triggerLock.next(async () => {
                // You can tune this to get ~1 shot per press.
                // But with no way of measuring how far the motor has moved,
                // this will sometimes result in a double shoot or a dud.
                // You could alternatively just turn on the motor while the button is pressed.
                mRoll.set(1);
                await (0, util_1.delay)(180);
                mRoll.set(0);
                // Small delay to let the motor stop before turning it back on.
                // This makes each shot more consistent.
                // It's also pretty satisfying.
                await (0, util_1.delay)(100);
            });
        }
        if (ev.name == 'LEFT_STICK_X') {
            mYaw.set(ev.value / MAX_AXIS_VALUE);
        }
        if (ev.name == 'RIGHT_TRIGGER') {
            pitchDx = (ev.value / -MAX_TRIGGER_VALUE);
        }
        if (ev.name == 'LEFT_TRIGGER') {
            pitchDx = (ev.value / MAX_TRIGGER_VALUE);
        }
    });
    stick.on("disconnect", () => {
        // If the controller disconnects, terminate the current program.
        // The runtime will attempt to restart continuously until the controller is reconnected.
        env.terminate(new Error("Controller Disconnected"));
    });
    return await env.untilTerminated;
});
