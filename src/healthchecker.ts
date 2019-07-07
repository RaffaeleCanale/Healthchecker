import pickBy from 'lodash/pickBy';
import entries from 'lodash/entries';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import isEqual from 'lodash/isEqual';
import axios from 'axios';
import https from 'https';

import { injectable, injectAll, getDependency } from '~/utils/DependencyInjectionUtils';
import { Target, Condition } from '~/config';
import Hook from '~/Hook';

interface CheckOutput {
    error?: object;
}

@injectable
export default class Healthchecker {

    @injectAll('targets')
    private targets!: Target[]
    private hooks: Hook[];
    private queries: { [query: string]: string };

    constructor(hooks: Hook[]) {
        this.hooks = hooks;
        this.queries = {};
    }

    start(): void {
        const interval = getDependency('config', 'interval');
        if (interval <= 0) {
            this.executeAndWarn();
        } else {
            setInterval(() => this.executeAndWarn(), interval);
        }
    }

    async executeAndWarn(): Promise<void> {
        try {
            const outputs = await this.executeAllChecks();

            const errors = pickBy(outputs, output => !!output.error);
            if (!isEmpty(errors)) {
                console.log(errors);
                await this.notifyHooks(JSON.stringify(errors, null, 4));
            }

        } catch (e) {
            console.log('An error occurred', e.message);            
        }
    }

    private async notifyHooks(message: string): Promise<void> {
        const promises = this.hooks.map(hook => hook.notifyError(message));
        try {
            await Promise.all(promises);
        } catch (error) {
            console.error(error);
            // TODO Emergency notify
        }
    }

    private async executeAllChecks(): Promise<{ [name: string]: CheckOutput }> {
        const result: { [name: string]: CheckOutput } = {};
        for (const [name, target] of entries(this.targets)) {
            result[name] = await this.executeCheck(target);
        }
        return result;
    }

    // eslint-disable-next-line class-methods-use-this
    private async executeCheck(target: Target): Promise<CheckOutput> {
        if (target.condition) {
            const matches = await this.checkCondition(target.condition);
            if (!matches) {
                console.log('Check aborted, condition is not met', target.condition);
                return {};                
            }
        }

        const start = Date.now();
        try {
            console.log('Checking', target.endpoint);
            const data = await this.request(target.endpoint, target.headers);
            const duration = (Date.now() - start) / 1000;
            if (data.healthy) {
                console.log(`Healthy (${duration}s)`);
                return {};
            }
            console.log(`Unhealthy (${duration}s)`, data);
            return { error: data };
        } catch (error) {
            const duration = (Date.now() - start) / 1000;
            console.log(`Unhealthy (${duration}s)`, error.message);
            return { error: { message: error.message } };
        }
    }

    private async checkCondition(condition: Condition): Promise<boolean> {
        const result = await this.getQueryResult(condition.query, condition.headers);
        return isEqual(result, condition.result);
    }

    private async getQueryResult(query: string, headers?: { [name: string]: string }): Promise<string> {
        if (!this.queries[query]) {
            this.queries[query] = await this.request(query, headers);
        }

        return this.queries[query];
    }

    private async request(endpoint: string, headers?: { [name: string]: string }): Promise<any> {
        const { data } = await axios.get(
            endpoint,
            {
                headers,
                timeout: 60000,
                httpsAgent: new https.Agent({  
                    rejectUnauthorized: false
                }),
            }
        );
        return data;
    }

}