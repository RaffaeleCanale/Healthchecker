// eslint-disable-next-line
require('module-alias/register');

import isObject from 'lodash/isObject';
import initAll from '~/init';

function prettyPrint(v: any): any {
    if (isObject(v)) {
        return JSON.stringify(v, null, 4);
    }
    return v;
}


exports.handler = async (event: any) => {
    let output = '';
    console.log = (...args: any[]) => {
        output += args
            .map(prettyPrint)
            .join(' ');
        output += '\n';
    }

    const healthchecker = initAll();
    await healthchecker.executeAndWarn();
    return output;
};
