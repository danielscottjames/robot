import { Env } from './env';

export function init(program: (env: Env) => Promise<unknown>) {
    let env: Env | undefined;
    let timer: NodeJS.Timeout;

    function main() {
        env = new Env();
        return program(env);
    }

    const retry = async () => {
        try {
            await main();
        } catch (e) {
            console.error(e);
        } finally {
            if (!env?.isDisposed) {
                env?.dispose__unsafe();
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
            if (!env?.isDisposed) {
                env?.dispose__unsafe();
            }
        } finally {
            // Because Node.js is a joke sometimes:
            // https://github.com/nodejs/node-v0.x-archive/issues/7101
            process.kill(process.pid, 'SIGTERM');
        }
    });
}