import Joi from 'joi';
import { HookConfig } from '~/config';

export default abstract class Hook {

    protected config: HookConfig

    constructor(config: HookConfig) {
        // @ts-ignore
        const validator = this.constructor.VALIDATOR;
        const result = Joi.validate(config, Joi.object().unknown().keys(validator));

        if (result.error) {
            throw result.error;
        }
        this.config = result.value;
    }

    abstract notifyError(error: string): Promise<void>

}
