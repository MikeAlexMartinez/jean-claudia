const expect = require('chai').expect;
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
  })
});