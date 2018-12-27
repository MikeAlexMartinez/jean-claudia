# jean-claudia
Creates middleware like pipeline of functions which runs before the main api endpoint function in claudiajs's apibuilder. 

The interceptor needs to be instantiated using one or more functions as a list of arguments or can be instantiated using one or more functions inside an array.

for example:
```javascript
const add = (a, b) => a + b;
const subtract = (a, b) => a - b;
const interceptorWithFunctions = new Interceptor(add, substract);
// Or
const interceptorWithArray = new Interceptor([add, subtract]);
```

Both methods of will process the passed functions from left to right,
i.e. in the examples the add function will run before subtract. with the return value of subtract being passed as the input of subtract.

The interceptor is able to accept synchronous or asynchronous functions as input.

For more information review the tests present and you will hopefully get the gist.

[For more information on the capabilities of Clauda-Api-Builders interceptor function see here](https://github.com/claudiajs/claudia-api-builder/blob/master/docs/intercepting.md)

An example of using with Claudias Api Builder is as follows:

```javascript
const ApiBuilder = require('claudia-api-builder');
const api = new ApiBuilder();

// wrapper function to run all defined middleware
const Interceptor = require('jean-claudia');

// interceptors that are processed by interceptor
const addFirstName = (request) => ({
  ...request,
  body: {
    ...reqest.body,
    firstname: 'jean-claude'
  }
});
const addLastName = (request) => ({
  ...request,
  body: {
    ...reqest.body,
    lastname: 'van damme'
  }
});
const isItATear = (request) => ({
    ...request,
  body: {
    ...reqest.body,
    response: 'Wrong again friend, it\'s my beer'
  }
});
api.intercept(new Interceptor([addFirstName, addLastName, isItATear]));
```

## Exiting The Pipeline Early (ApiResponse, Error or Falsy values)

If an ApiResponse, Falsy value, or Error is returned from one of the interceptors present within the queue of functions to run, any later functions won't be executed and the final output / response from the interceptor will be the ApiResponse, Error or falsy value that is encountered.