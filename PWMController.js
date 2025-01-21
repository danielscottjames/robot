"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PWMController = void 0;
const fs_1 = __importDefault(require("fs"));
const util_1 = require("util");
const disposable_1 = require("./disposable");
const util_2 = require("./util");
const SOFT_PWM_SYSFS = '/sys/class/soft_pwm';
class PWMController extends disposable_1.Disposable {
    constructor(pin, config = {}) {
        super();
        this.pin = pin;
        this.period = 20000;
        this.center = 1500;
        this.range = 1000;
        this.polarity = 1;
        this.update = (() => {
            let _prev = -1;
            return async () => {
                if (_prev != this.pulse) {
                    _prev = this.pulse;
                    await (0, util_1.promisify)(fs_1.default.appendFile)(this.file, `${Math.round(this.pulse)}`);
                }
                if (!this.isDisposed) {
                    this.timer = setTimeout(() => this.update(), this.period / 1000);
                }
            };
        })();
        Object.assign(this, config);
        this.pulse = this.center;
        try {
            fs_1.default.appendFileSync(`${SOFT_PWM_SYSFS}/export`, `${this.pin}`);
            fs_1.default.appendFileSync(`${SOFT_PWM_SYSFS}/pwm${this.pin}/period`, `${this.period}`);
            this.file = fs_1.default.openSync(`${SOFT_PWM_SYSFS}/pwm${this.pin}/pulse`, 'w');
        }
        catch (e) {
            // Try to turn it off if something unexpected happened
            try {
                fs_1.default.appendFileSync(`${SOFT_PWM_SYSFS}/unexport`, `${this.pin}`);
            }
            catch (e) {
                // swallow this error
            }
            console.error(`Failed to initialize motor ${this.pin}.`);
            throw e;
        }
    }
    start(pulse = this.pulse) {
        this.pulse = pulse;
        this.stop();
        this.update();
    }
    /**
     * `value` is [-1, 1].
     * Sets this.pulse to an interpolated value based on `polarity`, `center`, `range`, etc...
     * Can also just write to `this.pulse` directly
     */
    set(value) {
        value = (0, util_2.clamp)(value, -1, 1);
        this.pulse = this.center + (value * this.polarity * this.range);
    }
    stop() {
        clearTimeout(this.timer);
    }
    dispose() {
        super.dispose();
        this.stop();
        fs_1.default.closeSync(this.file);
        fs_1.default.appendFileSync(`${SOFT_PWM_SYSFS}/unexport`, `${this.pin}`);
    }
}
exports.PWMController = PWMController;
