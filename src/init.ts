import initConfig from '~/config';
import { registerAll } from '~/utils/DependencyInjectionUtils';
import Healthchecker from '~/healthchecker';
import HookClasses from '~/hooks';

export default function initAll(): Healthchecker {
    const { targets, config } = initConfig();

    registerAll('targets', targets);
    registerAll('config', config);

    const hooks = config.hooks.map((config) => {
        const cls = HookClasses[config.type];
        if (!cls) {
            throw new Error(`No hooks found for ${config.type}`);
        }
        return new cls(config);
    });

    return new Healthchecker(hooks);
}