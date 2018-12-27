const expect = require('chai').expect;
const ApiResponse = require('claudia-api-builder').ApiResponse;
const Interceptor = require('../interceptor');

describe('Interceptor - Interceptor()', function() {
  describe('Bad Arguments', function () {

    it('should error when no arguments passed', () => {
      let interceptor;

      try {
        interceptor = new Interceptor();
      } catch (e) {
        interceptor = e;
      }
      
      expect(interceptor).to.be.an('error');
    });

    it('should error if non-function passed in args', () => {
      let interceptor;

      try {
        interceptor = new Interceptor((a) => a, 1, (b) => b);
      } catch (e) {
        interceptor = e;
      }
      
      expect(interceptor).to.be.an('error');
    });

    it('should error if non-function passed in array', () => {
      let interceptor;

      try {
        interceptor = new Interceptor([(a) => a, '1', (b) => b]);
      } catch (e) {
        interceptor = e;
      }

      expect(interceptor).to.be.an('error');
    });
  });

  describe('Good Arguments', () => {
    it('should accept a single function as an argument',async () => {
      const interceptor = new Interceptor((a) => a);

      expect(await interceptor(1)).to.equal(1);
    });

    it('should accept multiple functions as an argument',async () => {
      const interceptor = new Interceptor((a) => a,(a) => a);

      expect(await interceptor(1)).to.equal(1);
    });

    it('should accept an array with functions as an argument',async () => {
      const interceptor = new Interceptor([(a) => a,(a) => a]);

      expect(await interceptor(1)).to.equal(1);
    });
  });

  describe('Should transform passed object correctly', () => {
    it('when passed one function',async () => {
      const data = {
        queryString: {
          test: 'Testing',
        },
        pathParams: {
          userToken: 'path/test'
        }
      };
      const targetObject = {
        queryString: {
          test: 'Testing',
          user: 'this has been added',
          number: 10
        },
        pathParams: {
          userToken: 'path/test'
        }
      };
      const testFn = (r) => ({
        ...r,
        queryString: {
          ...r.queryString,
          user: 'this has been added',
          number: 10
        }
      });
      const interceptor = new Interceptor(testFn);
      
      expect(await interceptor(data)).to.deep.equal(targetObject);
    });

    it('When passed multiple functions',async () => {
      const data = {
        queryString: {
          test: 'Testing',
        },
        pathParams: {
          userToken: 'path/test'
        }
      };
      const targetObject = {
        queryString: {
          test: 'Testing',
          user: 'this has been added',
          number: 10
        },
        pathParams: {
          userToken: 'path/test'
        }
      };
      const testFnOne = (r) => ({
        ...r,
        queryString: {
          ...r.queryString,
          user: 'this has been added',
          number: 1
        }
      });
      const testFnTwo = (r) => ({
        ...r,
        queryString: {
          ...r.queryString,
          number: (r.queryString.number * 10)
        }
      });
      const interceptor = new Interceptor(testFnOne, testFnTwo);
      
      expect(await interceptor(data)).to.deep.equal(targetObject);

    });

    it('When passed an array of functions',async () => {
      const data = {
        queryString: {
          test: 'Testing',
        },
        pathParams: {
          userToken: 'path/test'
        }
      };
      const targetObject = {
        queryString: {
          test: 'Testing',
          user: 'this has been added',
          number: 10
        },
        pathParams: {
          userToken: 'path/test'
        }
      };
      const testFnOne = (r) => ({
        ...r,
        queryString: {
          ...r.queryString,
          user: 'this has been added',
          number: 1
        }
      });
      const testFnTwo = (r) => ({
        ...r,
        queryString: {
          ...r.queryString,
          number: (r.queryString.number * 10)
        }
      });
      const interceptor = new Interceptor([testFnOne, testFnTwo]);
      const result = await interceptor(data);
      expect(result).to.deep.equal(targetObject);
    });

  });

  describe('should process functions from left to right', () => {
    
    it('for an array of functions',async () => {
      const start = 10;
      const divideByFive = (n) => n / 5;
      const timesTen = (n) => n * 10;
      const plusOne = (n) => n + 1;
      const end = 21;
  
      const interceptor = new Interceptor([divideByFive, timesTen, plusOne]);
      const result = await interceptor(start);
      expect(result).to.equal(end);
    });

    it('for multiple functions',async () => {
      const start = 10;
      const plusOne = (n) => n + 1;
      const timesTen = (n) => n * 10;
      const divideByFive = (n) => n / 5;
      const end = 22;
  
      const interceptor = new Interceptor(plusOne, timesTen, divideByFive);
      const result = await interceptor(start);
      expect(result).to.equal(end);
    });
  });

  describe('should handle async functions', () => {
    it('for multiple functions',async () => {
      const start = 10;
      const plusOne = async (n) => n + 1;
      const timesTen = async (n) => n * 10;
      const divideByFive = async (n) => n / 5;
      const end = 22;
  
      const interceptor = new Interceptor(plusOne, timesTen, divideByFive);
      const result = await interceptor(start);
      expect(result).to.equal(end);
    });

    it('for an array of functions',async () => {
      const start = 10;
      const plusOne = async (n) => n + 1;
      const timesTen = async (n) => n * 10;
      const divideByFive = async (n) => n / 5;
      const end = 22;
  
      const interceptor = new Interceptor([plusOne, timesTen, divideByFive]);
      const result = await interceptor(start);
      expect(result).to.equal(end);
    });
  });

  describe('should error return error if mid-queue functions causes error', () => {
    it('should return first error', async () => {
      const start = {};
      const addFirstName = async (r) => ({ firstName: 'firstname' });
      const errorFn = async (r) => {
        throw new Error('this is an error');
      };
      const errorFnTwo = async (r) => {
        throw new Error('this is the second error');
      };
      const addLastName = async (r) => ({...r, lastName: 'lastname'});
      const interceptor = new Interceptor(addFirstName, errorFn, errorFnTwo, addLastName);
      let error;

      try {
        await interceptor(start);
      } catch (e) {
        error = e;
      }
      expect(error).to.be.an('error');
      expect(error.message).to.equal('this is an error');
    });
  });

  describe('Handles ApiResponse', () => {
    it('should return ApiResponse if encountered', async () => {
      const apiResponse = new ApiResponse({testing: 'apiresponse'}, {}, 200);
      const start = {};
      const addFirstName = async (r) => ({ firstName: 'firstname' });
      const returnApiResponse = async (r) => {
        return apiResponse;
      };
      const errorFnTwo = async (r) => {
        throw new Error('this is the second error');
      };
      const addLastName = async (r) => ({...r, lastName: 'lastname'});
      const interceptor = new Interceptor(addFirstName, returnApiResponse, errorFnTwo, addLastName);
      let response = await interceptor(start);

      expect(response).to.deep.equal(apiResponse);
    });
  });

  describe('Handles falsy values', () => {
    it('should return falsy value if encountered', async () => {
      const start = {};
      const addFirstName = async (r) => ({ firstName: 'firstname' });
      const returnFalsy = async (r) => '';
      const errorFnTwo = async (r) => {
        throw new Error('this is the second error');
      };
      const addLastName = async (r) => ({...r, lastName: 'lastname'});
      const interceptor = new Interceptor(addFirstName, returnFalsy, errorFnTwo, addLastName);
      let response = await interceptor(start);
  
      expect(response).to.be.not.ok;
      expect(response).to.equal('');
    });
  });
});