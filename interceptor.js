'use strict';

const _ = require('lodash');

module.exports = Interceptor;

function Interceptor() {
  // check argument length
  if (arguments.length === 0) {
    throw new Error(`No Argument passed - please provide interceptor functions (One or more) or a single array of interceptor functions`);
  }

  // capture function parameters
  if (arguments[0] instanceof Array && arguments.length === 1) {
    this.interceptors = [...arguments[0]];
  } else if (arguments[0] instanceof Function) {
    this.interceptors = [...arguments];
  }

  // verify all interceptors are functions
  const check = this.interceptors.every(fn => {
    return _.isFunction(fn);
  });
  if (!check) {
    throw new Error('Only functions or a single array of functions can be passed as a parameter to this function');
  }

  return async (request) => this.interceptors.reduce(
    async (prev, curr) => Promise.resolve(curr(await prev)), Promise.resolve(request)
  );
}