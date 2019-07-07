import Joi from 'joi';

// CONFIG
export interface HookConfig {
    type: string;
}

export interface ConfigType {
    hooks: HookConfig[];
    interval: number;
}
const configSchema = Joi.object().required().keys({
    hooks: Joi.array().required().items(Joi.object().unknown().keys({
        type: Joi.string().required(),
    })),
    interval: Joi.number().required(),
});



// TARGETS
export interface Condition {
    query: string;
    result: any;
    headers?: { [name: string]: string };
}
export interface Target {
    endpoint: string;
    headers?: { [name: string]: string };
    condition?: Condition;
}
const targetsSchema = Joi.object().required().pattern(/./, Joi.object().required().keys({
    endpoint: Joi.string().required(),
    headers: Joi.object().optional(),
    condition: Joi.object().optional().keys({
        query: Joi.string().required(),
        result: Joi.required(),
        headers: Joi.object().optional(),
    }),
}));

interface ConfigAndTargets {
    config: ConfigType;
    targets: { [name: string]: Target };
}

export default function init(): ConfigAndTargets {
    const isDev = process.env.NODE_ENV === 'dev';

    // eslint-disable-next-line
    const config = require(isDev ? '../config.dev.js' : '../config.js') as ConfigType;
    const newConfig = Joi.validate(config, configSchema);
    if (newConfig.error) {
        throw newConfig.error;
    }

    // eslint-disable-next-line
    const targets = require(isDev ? '../targets.dev.js' : '../targets.js') as { [name: string]: Target };
    const newTargets = Joi.validate(targets, targetsSchema);
    if (newTargets.error) {
        throw newTargets.error;
    }

    return {
        config: newConfig.value,
        targets: newTargets.value,
    };
}
