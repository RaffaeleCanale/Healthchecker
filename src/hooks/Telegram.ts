import Joi from 'joi';
import axios from 'axios';

import Hook from '~/Hook';

export default class TelegramHook extends Hook {

    static VALIDATOR = {
        token: Joi.string().required(),
        chatId: Joi.string().required(),
    };

    config!: any;

    async notifyError(error: string): Promise<any> {
        const url = `https://api.telegram.org/bot${this.config.token}/sendMessage`;
        const params = {
            chat_id: this.config.chatId,
            text: error,
        };

        await axios.get(url, { params });
    }

}
