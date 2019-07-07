import forEach from 'lodash/forEach';

interface Dependencies { [name: string]: any }

const dependenciesSingleton: { [namespace: string]: Dependencies } = {};

export function register(namespace: string, name: string, dependency: any): void {
    if (!dependenciesSingleton[namespace]) {
        dependenciesSingleton[namespace] = {};
    }

    dependenciesSingleton[namespace][name] = dependency;
}

export function registerAll(namespace: string, dependencies: Dependencies): void {
    dependenciesSingleton[namespace] = dependencies;
}

export function getAllDependencies(namespace: string): Dependencies {
    const dependencies = dependenciesSingleton[namespace];
    if (!dependencies) {
        throw new Error(`Namespace ${namespace} not found`);
    }
    return dependencies;
}

export function getDependency(namespace: string, name: string): any {
    const dependencies = getAllDependencies(namespace);
    const result = dependencies[name];
    if (!result) {
        throw new Error(`Dependency ${namespace}.${name} not found`);
    }
    return result;
}

export function inject(namespace: string, name?: string): any {
    function injectWrapper(target: any, key: string): void {
        if (!target._dependencies) {
            target._dependencies = {};
        }
        target._dependencies[key] = { namespace, name: name || key };
    }

    return injectWrapper;
}

export function injectAll(namespace: string): any {
    function injectWrapper(target: any, key: string): void {
        if (!target._dependencies) {
            target._dependencies = {};
        }
        target._dependencies[key] = { namespace };
    }

    return injectWrapper;
}

function apply(obj: any): void {
    forEach(obj._dependencies, ({ name, namespace }, property) => {
        if (!name) {
            obj[property] = getAllDependencies(namespace);
        } else {
            obj[property] = getDependency(namespace, name);
        }
    });
    delete obj._dependencies;
}

export function injectable(target: any): any {
    // save a reference to the original constructor
    const original = target;

    return class c extends original {
        constructor(...args: any[]) {
            super(...args);
            // @ts-ignore
            apply(this);
        }
    };
}
