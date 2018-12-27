'use strict';

const _ = require('lodash');
const ApiResponse = require('claudia-api-builder').ApiResponse;

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

  return async (request) => {
    let errorEncoutered = false;
    let apiResponse = false;
    let falsy = false;

    return this.interceptors.reduce(
      async (prev, curr) => {
        if (errorEncoutered) {
          return Promise.reject(await prev);
        } else if (apiResponse || falsy) {
          return Promise.resolve(await prev);
        } else {
          // if ApiResponse return this
          const previous = await prev;
          if (previous instanceof ApiResponse) {
            apiResponse = true;
            return Promise.resolve(previous);
          }

          // If falsy don't error out but return
          // falsy value
          if (!previous) {
            falsy = true;
            return Promise.resolve(previous);
          }

          // If no error, not falsy and not ApiResponse
          // then process next function
          let res;
          try {
            res = curr(previous);
          } catch (e) {
            errorEncoutered = true;
            return Promise.reject(e);
          }
          return Promise.resolve(res)
        }
      }, Promise.resolve(request)
    );
  }
}