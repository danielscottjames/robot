import fs from 'fs';
import { promisify } from 'util';

import { Disposable } from "./disposable";
import { clamp } from './util';

type FILE = number;
const SOFT_PWM_SYSFS = '/sys/class/soft_pwm';

export class PWMController extends Disposable {
    private readonly file: FILE;
    private timer?: NodeJS.Timeout;

    public period = 20000;
    public center = 1500;
    public range = 1000;
    public polarity: 1 | -1 = 1;

    public pulse: number;

    constructor(public readonly pin: number, config: {
        period?: number,
        center?: number,
        range?: number,
        polarity?: 1 | -1,
    } = {}) {
        super();

        Object.assign(this, config);
        this.pulse = this.center;

        try {
            fs.appendFileSync(`${SOFT_PWM_SYSFS}/export`, `${this.pin}`);
            fs.appendFileSync(`${SOFT_PWM_SYSFS}/pwm${this.pin}/period`, `${this.period}`);
            this.file = fs.openSync(`${SOFT_PWM_SYSFS}/pwm${this.pin}/pulse`, 'w');
        } catch (e) {
            // Try to turn it off if something unexpected happened
            try {
                fs.appendFileSync(`${SOFT_PWM_SYSFS}/unexport`, `${this.pin}`);
            } catch (e) {
                // swallow this error
            }

            console.error(`Failed to initialize motor ${this.pin}.`);
            throw e;
        }
    }

    public start(pulse = this.pulse) {
        this.pulse = pulse;
        this.stop();
        this.update();
    }

    /**
     * `value` is [-1, 1].
     * Sets this.pulse to an interpolated value based on `polarity`, `center`, `range`, etc...
     * Can also just write to `this.pulse` directly
     */
    public set(value: number) {
        value = clamp(value, -1, 1);

        this.pulse = this.center + (value * this.polarity * this.range);
    }

    public stop() {
        clearTimeout(this.timer);
    }

    private update = (() => {
        let _prev = -1;

        return async () => {
            if (_prev != this.pulse) {
                _prev = this.pulse;
                await promisify(fs.appendFile)(this.file, `${Math.round(this.pulse)}`);
            }
            if (!this.isDisposed) {
                this.timer = setTimeout(() => this.update(), this.period / 1000);
            }
        }
    })();

    public dispose() {
        super.dispose();

        this.stop();
        fs.closeSync(this.file);
        fs.appendFileSync(`${SOFT_PWM_SYSFS}/unexport`, `${this.pin}`);
    }
}
