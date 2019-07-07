import path from 'path';
import fs from 'fs';
import _ from 'lodash';

type ModuleOptions = {
    requireAll?: boolean;
    includeFolder?: boolean;
}

export function getNamedModules(directory: string, options: ModuleOptions = {}): {[name: string]: any} {
    const normalizedPath = path.join(directory, '.');
    const modules: {[name: string]: any} = {};

    fs.readdirSync(normalizedPath).forEach((key): void => {
        if (key !== 'index.js') {
            if (!key.endsWith('.js') && !options.includeFolder) {
                return;
            }
            const file = path.join(directory, key);
            const moduleName = key.endsWith('.js')
                ? key.substring(0, key.length - 3) : key;

            // eslint-disable-next-line
            const module = options.requireAll ? require(file) : require(file).default;

            modules[moduleName] = module;
        }
    });

    return modules;
}

export function getModules(directory: string, options?: ModuleOptions): any[] {
    return _.values(getNamedModules(directory, options));
}
