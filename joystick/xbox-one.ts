import { JoystickEvent } from "./parseEvent";

function getButtonName(ev: JoystickEvent) {
    if (ev.type === "AXIS") {
        switch (ev.number) {
            case 0:
                return "LEFT_STICK_X";
            case 1:
                return "LEFT_STICK_Y";
            case 2:
                return "RIGHT_STICK_X";
            case 3:
                return "RIGHT_STICK_Y";
            case 4:
                return "RIGHT_TRIGGER";
            case 5:
                return "LEFT_TRIGGER";
            case 6:
                return "DPAD_X";
            case 7:
                return "DPAD_Y";
        }
    }

    if (ev.type === "BUTTON") {
        switch (ev.number) {
            case 0:
                return "A";
            case 1:
                return "B";
            case 2:
                return "X";
            case 3:
                return "Y";
            case 4:
                return "LEFT_BUMPER";
            case 5:
                return "RIGHT_BUMPER";
            case 6:
                return "SHARE";
            case 7:
                return "MENU";
            case 8:
                return "LEFT_STICK";
            case 9:
                return "RIGHT_STICK";
        }
    }
};

export type XboxJoystickEvent = JoystickEvent & {name: ReturnType<typeof getButtonName>};

export function xboxOneMapper(ev: JoystickEvent) {
    const transformed = ev as XboxJoystickEvent;
    transformed.name = getButtonName(ev);

    if (
        transformed.name === "RIGHT_TRIGGER"
        || transformed.name === "LEFT_TRIGGER"
    ) {
        transformed.value += 32767;
    }

    return transformed;
}
