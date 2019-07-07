// eslint-disable-next-line
require('module-alias/register');
import initAll from '~/init';

const healthchecker = initAll();
healthchecker.start();
