Getting Started


Let's get started by writing a test for a hypothetical function that adds two numbers. First, create a sum.js file:

function sum(a, b) {
  return a + b;
}
module.exports = sum;

Then, create a file named sum.test.js. This will contain our actual test:

const sum = require('./sum');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

Add the following section to your package.json:

{
  "scripts": {
    "test": "jest"
  }
}

Finally, run yarn test or npm test and Jest will print this message:

PASS  ./sum.test.js
✓ adds 1 + 2 to equal 3 (5ms)

You just successfully wrote your first test using Jest!

This test used expect and toBe to test that two values were exactly identical. To learn about the other things that Jest can test, see Using Matchers.

Running from command line

You can run Jest directly from the CLI (if it's globally available in your PATH, e.g. by yarn global add jest or npm install jest --global) with a variety of useful options.

Here's how to run Jest on files matching my-test, using config.json as a configuration file and display a native OS notification after the run:

jest my-test --notify --config=config.json

If you'd like to learn more about running jest through the command line, take a look at the Jest CLI Options page.

Additional Configuration

Generate a basic configuration file

Based on your project, Jest will ask you a few questions and will create a basic configuration file with a short description for each option:


Using Babel

Configure Babel to target your current version of Node by creating a babel.config.js file in the root of your project:

babel.config.js
module.exports = {
  presets: [['@babel/preset-env', {targets: {node: 'current'}}]],
};

The ideal configuration for Babel will depend on your project. See Babel's docs for more details.

Making your Babel config jest-aware

We are using babel to transpile the code for jest, because we are using nextjs and typescript.
Using TypeScript

Via babel

Jest supports TypeScript, via Babel.

we already have babel installed in the project, so we don't need to install anything.
but we need to confgire it.
Then add @babel/preset-typescript to the list of presets in your babel.config.js.

babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    '@babel/preset-typescript',
  ],
};

However, there are some caveats to using TypeScript with Babel. Because TypeScript support in Babel is purely transpilation, Jest will not type-check your tests as they are run. If you want that, you can use ts-jest instead, or just run the TypeScript compiler tsc separately (or as part of your build process).

Via ts-jest

ts-jest is a TypeScript preprocessor with source map support for Jest that lets you use Jest to test projects written in TypeScript.

npm
Yarn
pnpm
npm install --save-dev ts-jest

In order for Jest to transpile TypeScript with ts-jest, you may also need to create a configuration file.

Type definitions

There are two ways to have Jest global APIs typed for test files written in TypeScript.

You can use type definitions which ships with Jest and will update each time you update Jest. Install the @jest/globals package:


And import the APIs from it:

sum.test.ts
import {describe, expect, test} from '@jest/globals';
import {sum} from './sum';

describe('sum module', () => {
  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });
});

TIP
See the additional usage documentation of describe.each/test.each and mock functions.
Or you may choose to install the @types/jest package. It provides types for Jest globals without a need to import them.



INFO
@types/jest is a third party library maintained at DefinitelyTyped, hence the latest Jest features or versions may not be covered yet. Try to match versions of Jest and @types/jest as closely as possible. For example, if you are using Jest 27.4.0 then installing 27.4.x of @types/jest is ideal.
Using ESLint

Jest can be used with ESLint without any further configuration as long as you import the Jest global helpers (describe, it, etc.) from @jest/globals before using them in your test file. This is necessary to avoid no-undef errors from ESLint, which doesn't know about the Jest globals.

If you'd like to avoid these imports, you can configure your ESLint environment to support these globals by adding the jest environment:

{
  "overrides": [
    {
      "files": ["tests/**/*"],
      "env": {
        "jest": true
      }
    }
  ]
}

Or use eslint-plugin-jest, which has a similar effect:

{
  "overrides": [
    {
      "files": ["tests/**/*"],
      "plugins": ["jest"],
      "env": {
        "jest/globals": true
      }
    }
  ]
}


Using Matchers

Jest uses "matchers" to let you test values in different ways. This document will introduce some commonly used matchers. For the full list, see the expect API doc.

Common Matchers

The simplest way to test a value is with exact equality.

test('two plus two is four', () => {
  expect(2 + 2).toBe(4);
});

In this code, expect(2 + 2) returns an "expectation" object. You typically won't do much with these expectation objects except call matchers on them. In this code, .toBe(4) is the matcher. When Jest runs, it tracks all the failing matchers so that it can print out nice error messages for you.

toBe uses Object.is to test exact equality. If you want to check the value of an object, use toEqual:

test('object assignment', () => {
  const data = {one: 1};
  data['two'] = 2;
  expect(data).toEqual({one: 1, two: 2});
});

toEqual recursively checks every field of an object or array.

TIP
toEqual ignores object keys with undefined properties, undefined array items, array sparseness, or object type mismatch. To take these into account use toStrictEqual instead.
You can also test for the opposite of a matcher using not:

test('adding positive numbers is not zero', () => {
  for (let a = 1; a < 10; a++) {
    for (let b = 1; b < 10; b++) {
      expect(a + b).not.toBe(0);
    }
  }
});

Truthiness

In tests, you sometimes need to distinguish between undefined, null, and false, but you sometimes do not want to treat these differently. Jest contains helpers that let you be explicit about what you want.

toBeNull matches only null
toBeUndefined matches only undefined
toBeDefined is the opposite of toBeUndefined
toBeTruthy matches anything that an if statement treats as true
toBeFalsy matches anything that an if statement treats as false
For example:

test('null', () => {
  const n = null;
  expect(n).toBeNull();
  expect(n).toBeDefined();
  expect(n).not.toBeUndefined();
  expect(n).not.toBeTruthy();
  expect(n).toBeFalsy();
});

test('zero', () => {
  const z = 0;
  expect(z).not.toBeNull();
  expect(z).toBeDefined();
  expect(z).not.toBeUndefined();
  expect(z).not.toBeTruthy();
  expect(z).toBeFalsy();
});

You should use the matcher that most precisely corresponds to what you want your code to be doing.

Numbers

Most ways of comparing numbers have matcher equivalents.

test('two plus two', () => {
  const value = 2 + 2;
  expect(value).toBeGreaterThan(3);
  expect(value).toBeGreaterThanOrEqual(3.5);
  expect(value).toBeLessThan(5);
  expect(value).toBeLessThanOrEqual(4.5);

  // toBe and toEqual are equivalent for numbers
  expect(value).toBe(4);
  expect(value).toEqual(4);
});

For floating point equality, use toBeCloseTo instead of toEqual, because you don't want a test to depend on a tiny rounding error.

test('adding floating point numbers', () => {
  const value = 0.1 + 0.2;
  //expect(value).toBe(0.3);           This won't work because of rounding error
  expect(value).toBeCloseTo(0.3); // This works.
});


Strings

You can check strings against regular expressions with toMatch:

test('there is no I in team', () => {
  expect('team').not.toMatch(/I/);
});

test('but there is a "stop" in Christoph', () => {
  expect('Christoph').toMatch(/stop/);
});

Arrays and iterables

You can check if an array or iterable contains a particular item using toContain:

const shoppingList = [
  'diapers',
  'kleenex',
  'trash bags',
  'paper towels',
  'milk',
];

test('the shopping list has milk on it', () => {
  expect(shoppingList).toContain('milk');
  expect(new Set(shoppingList)).toContain('milk');
});

Exceptions

If you want to test whether a particular function throws an error when it's called, use toThrow.

function compileAndroidCode() {
  throw new Error('you are using the wrong JDK!');
}

test('compiling android goes as expected', () => {
  expect(() => compileAndroidCode()).toThrow();
  expect(() => compileAndroidCode()).toThrow(Error);

  // You can also use a string that must be contained in the error message or a regexp
  expect(() => compileAndroidCode()).toThrow('you are using the wrong JDK');
  expect(() => compileAndroidCode()).toThrow(/JDK/);

  // Or you can match an exact error message using a regexp like below
  expect(() => compileAndroidCode()).toThrow(/^you are using the wrong JDK$/); // Test fails
  expect(() => compileAndroidCode()).toThrow(/^you are using the wrong JDK!$/); // Test pass
});


TIP
The function that throws an exception needs to be invoked within a wrapping function otherwise the toThrow assertion will fail.
And More

This is just a taste. For a complete list of matchers, check out the reference docs.

Once you've learned about the matchers that are available, a good next step is to check out how Jest lets you test asynchronous code.


Testing Asynchronous Code

It's common in JavaScript for code to run asynchronously. When you have code that runs asynchronously, Jest needs to know when the code it is testing has completed, before it can move on to another test. Jest has several ways to handle this.

Promises

Return a promise from your test, and Jest will wait for that promise to resolve. If the promise is rejected, the test will fail.

For example, let's say that fetchData returns a promise that is supposed to resolve to the string 'peanut butter'. We could test it with:

test('the data is peanut butter', () => {
  return fetchData().then(data => {
    expect(data).toBe('peanut butter');
  });
});

Async/Await

Alternatively, you can use async and await in your tests. To write an async test, use the async keyword in front of the function passed to test. For example, the same fetchData scenario can be tested with:

test('the data is peanut butter', async () => {
  const data = await fetchData();
  expect(data).toBe('peanut butter');
});

test('the fetch fails with an error', async () => {
  expect.assertions(1);
  try {
    await fetchData();
  } catch (error) {
    expect(error).toMatch('error');
  }
});

You can combine async and await with .resolves or .rejects.

test('the data is peanut butter', async () => {
  await expect(fetchData()).resolves.toBe('peanut butter');
});

test('the fetch fails with an error', async () => {
  await expect(fetchData()).rejects.toMatch('error');
});

In these cases, async and await are effectively syntactic sugar for the same logic as the promises example uses.

CAUTION
Be sure to return (or await) the promise - if you omit the return/await statement, your test will complete before the promise returned from fetchData resolves or rejects.
If you expect a promise to be rejected, use the .catch method. Make sure to add expect.assertions to verify that a certain number of assertions are called. Otherwise, a fulfilled promise would not fail the test.

test('the fetch fails with an error', () => {
  expect.assertions(1);
  return fetchData().catch(error => expect(error).toMatch('error'));
});

Callbacks

If you don't use promises, you can use callbacks. For example, let's say that fetchData, instead of returning a promise, expects a callback, i.e. fetches some data and calls callback(null, data) when it is complete. You want to test that this returned data is the string 'peanut butter'.

By default, Jest tests complete once they reach the end of their execution. That means this test will not work as intended:

// Don't do this!
test('the data is peanut butter', () => {
  function callback(error, data) {
    if (error) {
      throw error;
    }
    expect(data).toBe('peanut butter');
  }

  fetchData(callback);
});

The problem is that the test will complete as soon as fetchData completes, before ever calling the callback.

There is an alternate form of test that fixes this. Instead of putting the test in a function with an empty argument, use a single argument called done. Jest will wait until the done callback is called before finishing the test.

test('the data is peanut butter', done => {
  function callback(error, data) {
    if (error) {
      done(error);
      return;
    }
    try {
      expect(data).toBe('peanut butter');
      done();
    } catch (error) {
      done(error);
    }
  }

  fetchData(callback);
});

If done() is never called, the test will fail (with timeout error), which is what you want to happen.

If the expect statement fails, it throws an error and done() is not called. If we want to see in the test log why it failed, we have to wrap expect in a try block and pass the error in the catch block to done. Otherwise, we end up with an opaque timeout error that doesn't show what value was received by expect(data).

CAUTION
Jest will throw an error, if the same test function is passed a done() callback and returns a promise. This is done as a precaution to avoid memory leaks in your tests.
.resolves / .rejects

You can also use the .resolves matcher in your expect statement, and Jest will wait for that promise to resolve. If the promise is rejected, the test will automatically fail.

test('the data is peanut butter', () => {
  return expect(fetchData()).resolves.toBe('peanut butter');
});

Be sure to return the assertion—if you omit this return statement, your test will complete before the promise returned from fetchData is resolved and then() has a chance to execute the callback.

If you expect a promise to be rejected, use the .rejects matcher. It works analogically to the .resolves matcher. If the promise is fulfilled, the test will automatically fail.

test('the fetch fails with an error', () => {
  return expect(fetchData()).rejects.toMatch('error');
});

None of these forms is particularly superior to the others, and you can mix and match them across a codebase or even in a single file. It just depends on which style you feel makes your tests simpler.

Setup and Teardown

Often while writing tests you have some setup work that needs to happen before tests run, and you have some finishing work that needs to happen after tests run. Jest provides helper functions to handle this.

Repeating Setup

If you have some work you need to do repeatedly for many tests, you can use beforeEach and afterEach hooks.

For example, let's say that several tests interact with a database of cities. You have a method initializeCityDatabase() that must be called before each of these tests, and a method clearCityDatabase() that must be called after each of these tests. You can do this with:

beforeEach(() => {
  initializeCityDatabase();
});

afterEach(() => {
  clearCityDatabase();
});

test('city database has Vienna', () => {
  expect(isCity('Vienna')).toBeTruthy();
});

test('city database has San Juan', () => {
  expect(isCity('San Juan')).toBeTruthy();
});

beforeEach and afterEach can handle asynchronous code in the same ways that tests can handle asynchronous code - they can either take a done parameter or return a promise. For example, if initializeCityDatabase() returned a promise that resolved when the database was initialized, we would want to return that promise:

beforeEach(() => {
  return initializeCityDatabase();
});

One-Time Setup

In some cases, you only need to do setup once, at the beginning of a file. This can be especially bothersome when the setup is asynchronous, so you can't do it inline. Jest provides beforeAll and afterAll hooks to handle this situation.

For example, if both initializeCityDatabase() and clearCityDatabase() returned promises, and the city database could be reused between tests, we could change our test code to:

beforeAll(() => {
  return initializeCityDatabase();
});

afterAll(() => {
  return clearCityDatabase();
});

test('city database has Vienna', () => {
  expect(isCity('Vienna')).toBeTruthy();
});

test('city database has San Juan', () => {
  expect(isCity('San Juan')).toBeTruthy();
});

Scoping

The top level before* and after* hooks apply to every test in a file. The hooks declared inside a describe block apply only to the tests within that describe block.

For example, let's say we had not just a city database, but also a food database. We could do different setup for different tests:

// Applies to all tests in this file
beforeEach(() => {
  return initializeCityDatabase();
});

test('city database has Vienna', () => {
  expect(isCity('Vienna')).toBeTruthy();
});

test('city database has San Juan', () => {
  expect(isCity('San Juan')).toBeTruthy();
});

describe('matching cities to foods', () => {
  // Applies only to tests in this describe block
  beforeEach(() => {
    return initializeFoodDatabase();
  });

  test('Vienna <3 veal', () => {
    expect(isValidCityFoodPair('Vienna', 'Wiener Schnitzel')).toBe(true);
  });

  test('San Juan <3 plantains', () => {
    expect(isValidCityFoodPair('San Juan', 'Mofongo')).toBe(true);
  });
});

Note that the top-level beforeEach is executed before the beforeEach inside the describe block. It may help to illustrate the order of execution of all hooks.

beforeAll(() => console.log('1 - beforeAll'));
afterAll(() => console.log('1 - afterAll'));
beforeEach(() => console.log('1 - beforeEach'));
afterEach(() => console.log('1 - afterEach'));

test('', () => console.log('1 - test'));

describe('Scoped / Nested block', () => {
  beforeAll(() => console.log('2 - beforeAll'));
  afterAll(() => console.log('2 - afterAll'));
  beforeEach(() => console.log('2 - beforeEach'));
  afterEach(() => console.log('2 - afterEach'));

  test('', () => console.log('2 - test'));
});

// 1 - beforeAll
// 1 - beforeEach
// 1 - test
// 1 - afterEach
// 2 - beforeAll
// 1 - beforeEach
// 2 - beforeEach
// 2 - test
// 2 - afterEach
// 1 - afterEach
// 2 - afterAll
// 1 - afterAll

Order of Execution

Jest executes all describe handlers in a test file before it executes any of the actual tests. This is another reason to do setup and teardown inside before* and after* handlers rather than inside the describe blocks. Once the describe blocks are complete, by default Jest runs all the tests serially in the order they were encountered in the collection phase, waiting for each to finish and be tidied up before moving on.

Consider the following illustrative test file and output:

describe('describe outer', () => {
  console.log('describe outer-a');

  describe('describe inner 1', () => {
    console.log('describe inner 1');

    test('test 1', () => console.log('test 1'));
  });

  console.log('describe outer-b');

  test('test 2', () => console.log('test 2'));

  describe('describe inner 2', () => {
    console.log('describe inner 2');

    test('test 3', () => console.log('test 3'));
  });

  console.log('describe outer-c');
});

// describe outer-a
// describe inner 1
// describe outer-b
// describe inner 2
// describe outer-c
// test 1
// test 2
// test 3

Just like the describe and test blocks Jest calls the before* and after* hooks in the order of declaration. Note that the after* hooks of the enclosing scope are called first. For example, here is how you can set up and tear down resources which depend on each other:

beforeEach(() => console.log('connection setup'));
beforeEach(() => console.log('database setup'));

afterEach(() => console.log('database teardown'));
afterEach(() => console.log('connection teardown'));

test('test 1', () => console.log('test 1'));

describe('extra', () => {
  beforeEach(() => console.log('extra database setup'));
  afterEach(() => console.log('extra database teardown'));

  test('test 2', () => console.log('test 2'));
});

// connection setup
// database setup
// test 1
// database teardown
// connection teardown

// connection setup
// database setup
// extra database setup
// test 2
// extra database teardown
// database teardown
// connection teardown

NOTE
If you are using jasmine2 test runner, take into account that it calls the after* hooks in the reverse order of declaration. To have identical output, the above example should be altered like this:

  beforeEach(() => console.log('connection setup'));
+ afterEach(() => console.log('connection teardown'));

  beforeEach(() => console.log('database setup'));
+ afterEach(() => console.log('database teardown'));

- afterEach(() => console.log('database teardown'));
- afterEach(() => console.log('connection teardown'));

  // ...

General Advice

If a test is failing, one of the first things to check should be whether the test is failing when it's the only test that runs. To run only one test with Jest, temporarily change that test command to a test.only:

test.only('this will be the only test that runs', () => {
  expect(true).toBe(false);
});

test('this test will not run', () => {
  expect('A').toBe('A');
});

If you have a test that often fails when it's run as part of a larger suite, but doesn't fail when you run it alone, it's a good bet that something from a different test is interfering with this one. You can often fix this by clearing some shared state with beforeEach. If you're not sure whether some shared state is being modified, you can also try a beforeEach that logs data.



Setup and Teardown

Often while writing tests you have some setup work that needs to happen before tests run, and you have some finishing work that needs to happen after tests run. Jest provides helper functions to handle this.

Repeating Setup

If you have some work you need to do repeatedly for many tests, you can use beforeEach and afterEach hooks.

For example, let's say that several tests interact with a database of cities. You have a method initializeCityDatabase() that must be called before each of these tests, and a method clearCityDatabase() that must be called after each of these tests. You can do this with:

beforeEach(() => {
  initializeCityDatabase();
});

afterEach(() => {
  clearCityDatabase();
});

test('city database has Vienna', () => {
  expect(isCity('Vienna')).toBeTruthy();
});

test('city database has San Juan', () => {
  expect(isCity('San Juan')).toBeTruthy();
});

beforeEach and afterEach can handle asynchronous code in the same ways that tests can handle asynchronous code - they can either take a done parameter or return a promise. For example, if initializeCityDatabase() returned a promise that resolved when the database was initialized, we would want to return that promise:

beforeEach(() => {
  return initializeCityDatabase();
});

One-Time Setup

In some cases, you only need to do setup once, at the beginning of a file. This can be especially bothersome when the setup is asynchronous, so you can't do it inline. Jest provides beforeAll and afterAll hooks to handle this situation.

For example, if both initializeCityDatabase() and clearCityDatabase() returned promises, and the city database could be reused between tests, we could change our test code to:

beforeAll(() => {
  return initializeCityDatabase();
});

afterAll(() => {
  return clearCityDatabase();
});

test('city database has Vienna', () => {
  expect(isCity('Vienna')).toBeTruthy();
});

test('city database has San Juan', () => {
  expect(isCity('San Juan')).toBeTruthy();
});

Scoping

The top level before* and after* hooks apply to every test in a file. The hooks declared inside a describe block apply only to the tests within that describe block.

For example, let's say we had not just a city database, but also a food database. We could do different setup for different tests:

// Applies to all tests in this file
beforeEach(() => {
  return initializeCityDatabase();
});

test('city database has Vienna', () => {
  expect(isCity('Vienna')).toBeTruthy();
});

test('city database has San Juan', () => {
  expect(isCity('San Juan')).toBeTruthy();
});

describe('matching cities to foods', () => {
  // Applies only to tests in this describe block
  beforeEach(() => {
    return initializeFoodDatabase();
  });

  test('Vienna <3 veal', () => {
    expect(isValidCityFoodPair('Vienna', 'Wiener Schnitzel')).toBe(true);
  });

  test('San Juan <3 plantains', () => {
    expect(isValidCityFoodPair('San Juan', 'Mofongo')).toBe(true);
  });
});

Note that the top-level beforeEach is executed before the beforeEach inside the describe block. It may help to illustrate the order of execution of all hooks.

beforeAll(() => console.log('1 - beforeAll'));
afterAll(() => console.log('1 - afterAll'));
beforeEach(() => console.log('1 - beforeEach'));
afterEach(() => console.log('1 - afterEach'));

test('', () => console.log('1 - test'));

describe('Scoped / Nested block', () => {
  beforeAll(() => console.log('2 - beforeAll'));
  afterAll(() => console.log('2 - afterAll'));
  beforeEach(() => console.log('2 - beforeEach'));
  afterEach(() => console.log('2 - afterEach'));

  test('', () => console.log('2 - test'));
});

// 1 - beforeAll
// 1 - beforeEach
// 1 - test
// 1 - afterEach
// 2 - beforeAll
// 1 - beforeEach
// 2 - beforeEach
// 2 - test
// 2 - afterEach
// 1 - afterEach
// 2 - afterAll
// 1 - afterAll

Order of Execution

Jest executes all describe handlers in a test file before it executes any of the actual tests. This is another reason to do setup and teardown inside before* and after* handlers rather than inside the describe blocks. Once the describe blocks are complete, by default Jest runs all the tests serially in the order they were encountered in the collection phase, waiting for each to finish and be tidied up before moving on.

Consider the following illustrative test file and output:

describe('describe outer', () => {
  console.log('describe outer-a');

  describe('describe inner 1', () => {
    console.log('describe inner 1');

    test('test 1', () => console.log('test 1'));
  });

  console.log('describe outer-b');

  test('test 2', () => console.log('test 2'));

  describe('describe inner 2', () => {
    console.log('describe inner 2');

    test('test 3', () => console.log('test 3'));
  });

  console.log('describe outer-c');
});

// describe outer-a
// describe inner 1
// describe outer-b
// describe inner 2
// describe outer-c
// test 1
// test 2
// test 3

Just like the describe and test blocks Jest calls the before* and after* hooks in the order of declaration. Note that the after* hooks of the enclosing scope are called first. For example, here is how you can set up and tear down resources which depend on each other:

beforeEach(() => console.log('connection setup'));
beforeEach(() => console.log('database setup'));

afterEach(() => console.log('database teardown'));
afterEach(() => console.log('connection teardown'));

test('test 1', () => console.log('test 1'));

describe('extra', () => {
  beforeEach(() => console.log('extra database setup'));
  afterEach(() => console.log('extra database teardown'));

  test('test 2', () => console.log('test 2'));
});

// connection setup
// database setup
// test 1
// database teardown
// connection teardown

// connection setup
// database setup
// extra database setup
// test 2
// extra database teardown
// database teardown
// connection teardown

NOTE
If you are using jasmine2 test runner, take into account that it calls the after* hooks in the reverse order of declaration. To have identical output, the above example should be altered like this:

  beforeEach(() => console.log('connection setup'));
+ afterEach(() => console.log('connection teardown'));

  beforeEach(() => console.log('database setup'));
+ afterEach(() => console.log('database teardown'));

- afterEach(() => console.log('database teardown'));
- afterEach(() => console.log('connection teardown'));

  // ...

General Advice

If a test is failing, one of the first things to check should be whether the test is failing when it's the only test that runs. To run only one test with Jest, temporarily change that test command to a test.only:

test.only('this will be the only test that runs', () => {
  expect(true).toBe(false);
});

test('this test will not run', () => {
  expect('A').toBe('A');
});

If you have a test that often fails when it's run as part of a larger suite, but doesn't fail when you run it alone, it's a good bet that something from a different test is interfering with this one. You can often fix this by clearing some shared state with beforeEach. If you're not sure whether some shared state is being modified, you can also try a beforeEach that logs data.

Jest Platform

You can cherry pick specific features of Jest and use them as standalone packages. Here's a list of the available packages:

jest-changed-files

Tool for identifying modified files in a git/hg repository. Exports two functions:

getChangedFilesForRoots returns a promise that resolves to an object with the changed files and repos.
findRepos returns a promise that resolves to a set of repositories contained in the specified path.
Example

const {getChangedFilesForRoots} = require('jest-changed-files');

// print the set of modified files since last commit in the current repo
getChangedFilesForRoots(['./'], {
  lastCommit: true,
}).then(result => console.log(result.changedFiles));

You can read more about jest-changed-files in the readme file.

jest-diff

Tool for visualizing changes in data. Exports a function that compares two values of any type and returns a "pretty-printed" string illustrating the difference between the two arguments.

Example

const {diff} = require('jest-diff');

const a = {a: {b: {c: 5}}};
const b = {a: {b: {c: 6}}};

const result = diff(a, b);

// print diff
console.log(result);

jest-docblock

Tool for extracting and parsing the comments at the top of a JavaScript file. Exports various functions to manipulate the data inside the comment block.

Example

const {parseWithComments} = require('jest-docblock');

const code = `
/**
 * This is a sample
 *
 * @flow
 */

 console.log('Hello World!');
`;

const parsed = parseWithComments(code);

// prints an object with two attributes: comments and pragmas.
console.log(parsed);

You can read more about jest-docblock in the readme file.

jest-get-type

Module that identifies the primitive type of any JavaScript value. Exports a function that returns a string with the type of the value passed as argument.

Example

const {getType} = require('jest-get-type');

const array = [1, 2, 3];
const nullValue = null;
const undefinedValue = undefined;

// prints 'array'
console.log(getType(array));
// prints 'null'
console.log(getType(nullValue));
// prints 'undefined'
console.log(getType(undefinedValue));

jest-validate

Tool for validating configurations submitted by users. Exports a function that takes two arguments: the user's configuration and an object containing an example configuration and other options. The return value is an object with two attributes:

hasDeprecationWarnings, a boolean indicating whether the submitted configuration has deprecation warnings,
isValid, a boolean indicating whether the configuration is correct or not.
Example

const {validate} = require('jest-validate');

const configByUser = {
  transform: '<rootDir>/node_modules/my-custom-transform',
};

const result = validate(configByUser, {
  comment: '  Documentation: http://custom-docs.com',
  exampleConfig: {transform: '<rootDir>/node_modules/babel-jest'},
});

console.log(result);

You can read more about jest-validate in the readme file.

jest-worker

Module used for parallelization of tasks. Exports a class JestWorker that takes the path of Node.js module and lets you call the module's exported methods as if they were class methods, returning a promise that resolves when the specified method finishes its execution in a forked process.

Example

heavy-task.js
module.exports = {
  myHeavyTask: args => {
    // long running CPU intensive task.
  },
};

main.js
async function main() {
  const worker = new Worker(require.resolve('./heavy-task.js'));

  // run 2 tasks in parallel with different arguments
  const results = await Promise.all([
    worker.myHeavyTask({foo: 'bar'}),
    worker.myHeavyTask({bar: 'foo'}),
  ]);

  console.log(results);
}

main();

You can read more about jest-worker in the readme file.

pretty-format

Exports a function that converts any JavaScript value into a human-readable string. Supports all built-in JavaScript types out of the box and allows extension for application-specific types via user-defined plugins.

Example

const {format: prettyFormat} = require('pretty-format');

const val = {object: {}};
val.circularReference = val;
val[Symbol('foo')] = 'foo';
val.map = new Map([['prop', 'value']]);
val.array = [-0, Infinity, NaN];

console.log(prettyFormat(val));

You can read more about pretty-format in the readme file.

Configuring Jest

The Jest philosophy is to work great by default, but sometimes you just need more configuration power.

It is recommended to define the configuration in a dedicated JavaScript, TypeScript or JSON file. The file will be discovered automatically, if it is named jest.config.js|ts|mjs|cjs|json. You can use --config flag to pass an explicit path to the file.

NOTE
Keep in mind that the resulting configuration object must always be JSON-serializable.
The configuration file should simply export an object:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  verbose: true,
};

module.exports = config;

Or a function returning an object:

JavaScript
TypeScript
/** @returns {Promise<import('jest').Config>} */
module.exports = async () => {
  return {
    verbose: true,
  };
};

TIP
To read TypeScript configuration files Jest requires ts-node. Make sure it is installed in your project.
The configuration also can be stored in a JSON file as a plain object:

jest.config.json
{
  "bail": 1,
  "verbose": true
}

Alternatively Jest's configuration can be defined through the "jest" key in the package.json of your project:

package.json
{
  "name": "my-project",
  "jest": {
    "verbose": true
  }
}

Options

INFO
You can retrieve Jest's defaults from jest-config to extend them if needed:

JavaScript
TypeScript
const {defaults} = require('jest-config');

/** @type {import('jest').Config} */
const config = {
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mts', 'cts'],
};

module.exports = config;


automock [boolean]
bail [number | boolean]
cacheDirectory [string]
clearMocks [boolean]
collectCoverage [boolean]
collectCoverageFrom [array]
coverageDirectory [string]
coveragePathIgnorePatterns [array<string>]
coverageProvider [string]
coverageReporters [array<string | [string, options]>]
coverageThreshold [object]
dependencyExtractor [string]
displayName [string, object]
errorOnDeprecated [boolean]
extensionsToTreatAsEsm [array<string>]
fakeTimers [object]
forceCoverageMatch [array<string>]
globals [object]
globalSetup [string]
globalTeardown [string]
haste [object]
injectGlobals [boolean]
maxConcurrency [number]
maxWorkers [number | string]
moduleDirectories [array<string>]
moduleFileExtensions [array<string>]
moduleNameMapper [object<string, string | array<string>>]
modulePathIgnorePatterns [array<string>]
modulePaths [array<string>]
notify [boolean]
notifyMode [string]
openHandlesTimeout [number]
preset [string]
prettierPath [string]
projects [array<string | ProjectConfig>]
randomize [boolean]
reporters [array<moduleName | [moduleName, options]>]
resetMocks [boolean]
resetModules [boolean]
resolver [string]
restoreMocks [boolean]
rootDir [string]
roots [array<string>]
runner [string]
sandboxInjectedGlobals [array<string>]
setupFiles [array]
setupFilesAfterEnv [array]
showSeed [boolean]
slowTestThreshold [number]
snapshotFormat [object]
snapshotResolver [string]
snapshotSerializers [array<string>]
testEnvironment [string]
testEnvironmentOptions [Object]
testFailureExitCode [number]
testMatch [array<string>]
testPathIgnorePatterns [array<string>]
testRegex [string | array<string>]
testResultsProcessor [string]
testRunner [string]
testSequencer [string]
testTimeout [number]
transform [object<string, pathToTransformer | [pathToTransformer, object]>]
transformIgnorePatterns [array<string>]
unmockedModulePathPatterns [array<string>]
verbose [boolean]
watchPathIgnorePatterns [array<string>]
watchPlugins [array<string | [string, Object]>]
watchman [boolean]
workerIdleMemoryLimit [number|string]
// [string]
workerThreads
Reference

automock [boolean]

Default: false

This option tells Jest that all imported modules in your tests should be mocked automatically. All modules used in your tests will have a replacement implementation, keeping the API surface.

Example:

utils.js
export default {
  authorize: () => 'token',
  isAuthorized: secret => secret === 'wizard',
};

__tests__/automock.test.js
import utils from '../utils';

test('if utils mocked automatically', () => {
  // Public methods of `utils` are now mock functions
  expect(utils.authorize.mock).toBeTruthy();
  expect(utils.isAuthorized.mock).toBeTruthy();

  // You can provide them with your own implementation
  // or pass the expected return value
  utils.authorize.mockReturnValue('mocked_token');
  utils.isAuthorized.mockReturnValue(true);

  expect(utils.authorize()).toBe('mocked_token');
  expect(utils.isAuthorized('not_wizard')).toBeTruthy();
});

NOTE
Node modules are automatically mocked when you have a manual mock in place (e.g.: __mocks__/lodash.js). More info here.

Node.js core modules, like fs, are not mocked by default. They can be mocked explicitly, like jest.mock('fs').
bail [number | boolean]

Default: 0

By default, Jest runs all tests and produces all errors into the console upon completion. The bail config option can be used here to have Jest stop running tests after n failures. Setting bail to true is the same as setting bail to 1.

cacheDirectory [string]

Default: "/tmp/<path>"

The directory where Jest should store its cached dependency information.

Jest attempts to scan your dependency tree once (up-front) and cache it in order to ease some of the filesystem churn that needs to happen while running tests. This config option lets you customize where Jest stores that cache data on disk.

clearMocks [boolean]

Default: false

Automatically clear mock calls, instances, contexts and results before every test. Equivalent to calling jest.clearAllMocks() before each test. This does not remove any mock implementation that may have been provided.

collectCoverage [boolean]

Default: false

Indicates whether the coverage information should be collected while executing the test. Because this retrofits all executed files with coverage collection statements, it may significantly slow down your tests.

Jest ships with two coverage providers: babel (default) and v8. See the coverageProvider option for more details.

INFO
The babel and v8 coverage providers use /* istanbul ignore next */ and /* c8 ignore next */ comments to exclude lines from coverage reports, respectively. For more information, you can view the istanbuljs documentation and the c8 documentation.
collectCoverageFrom [array]

Default: undefined

An array of glob patterns indicating a set of files for which coverage information should be collected. If a file matches the specified glob pattern, coverage information will be collected for it even if no tests exist for this file and it's never required in the test suite.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
};

module.exports = config;

This will collect coverage information for all the files inside the project's rootDir, except the ones that match **/node_modules/** or **/vendor/**.

TIP
Each glob pattern is applied in the order they are specified in the config. For example ["!**/__tests__/**", "**/*.js"] will not exclude __tests__ because the negation is overwritten with the second pattern. In order to make the negated glob work in this example it has to come after **/*.js.
NOTE
This option requires collectCoverage to be set to true or Jest to be invoked with --coverage.
Help:
coverageDirectory [string]

Default: undefined

The directory where Jest should output its coverage files.

coveragePathIgnorePatterns [array<string>]

Default: ["/node_modules/"]

An array of regexp pattern strings that are matched against all file paths before executing the test. If the file path matches any of the patterns, coverage information will be skipped.

These pattern strings match against the full path. Use the <rootDir> string token to include the path to your project's root directory to prevent it from accidentally ignoring all of your files in different environments that may have different root directories. Example: ["<rootDir>/build/", "<rootDir>/node_modules/"].

coverageProvider [string]

Indicates which provider should be used to instrument code for coverage. Allowed values are babel (default) or v8.

coverageReporters [array<string | [string, options]>]

Default: ["clover", "json", "lcov", "text"]

A list of reporter names that Jest uses when writing coverage reports. Any istanbul reporter can be used.

TIP
Setting this option overwrites the default values. Add "text" or "text-summary" to see a coverage summary in the console output.
Additional options can be passed using the tuple form. For example, you may hide coverage report lines for all fully-covered files:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  coverageReporters: ['clover', 'json', 'lcov', ['text', {skipFull: true}]],
};

module.exports = config;

For more information about the options object shape refer to CoverageReporterWithOptions type in the type definitions.

coverageThreshold [object]

Default: undefined

This will be used to configure minimum threshold enforcement for coverage results. Thresholds can be specified as global, as a glob, and as a directory or file path. If thresholds aren't met, jest will fail. Thresholds specified as a positive number are taken to be the minimum percentage required. Thresholds specified as a negative number represent the maximum number of uncovered entities allowed.

For example, with the following configuration jest will fail if there is less than 80% branch, line, and function coverage, or if there are more than 10 uncovered statements:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10,
    },
  },
};

module.exports = config;

If globs or paths are specified alongside global, coverage data for matching paths will be subtracted from overall coverage and thresholds will be applied independently. Thresholds for globs are applied to all files matching the glob. If the file specified by path is not found, an error is returned.

For example, with the following configuration:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './src/components/': {
      branches: 40,
      statements: 40,
    },
    './src/reducers/**/*.js': {
      statements: 90,
    },
    './src/api/very-important-module.js': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};

module.exports = config;

Jest will fail if:

The ./src/components directory has less than 40% branch or statement coverage.
One of the files matching the ./src/reducers/**/*.js glob has less than 90% statement coverage.
The ./src/api/very-important-module.js file has less than 100% coverage.
Every remaining file combined has less than 50% coverage (global).
dependencyExtractor [string]

Default: undefined

This option allows the use of a custom dependency extractor. It must be a node module that exports an object with an extract function. E.g.:

const crypto = require('crypto');
const fs = require('fs');

module.exports = {
  extract(code, filePath, defaultExtract) {
    const deps = defaultExtract(code, filePath);
    // Scan the file and add dependencies in `deps` (which is a `Set`)
    return deps;
  },
  getCacheKey() {
    return crypto
      .createHash('md5')
      .update(fs.readFileSync(__filename))
      .digest('hex');
  },
};

The extract function should return an iterable (Array, Set, etc.) with the dependencies found in the code.

That module can also contain a getCacheKey function to generate a cache key to determine if the logic has changed and any cached artifacts relying on it should be discarded.

displayName [string, object]

default: undefined

Allows for a label to be printed alongside a test while it is running. This becomes more useful in multi-project repositories where there can be many jest configuration files. This visually tells which project a test belongs to.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  displayName: 'CLIENT',
};

module.exports = config;

Alternatively, an object with the properties name and color can be passed. This allows for a custom configuration of the background color of the displayName. displayName defaults to white when its value is a string. Jest uses chalk to provide the color. As such, all of the valid options for colors supported by chalk are also supported by Jest.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  displayName: {
    name: 'CLIENT',
    color: 'blue',
  },
};

module.exports = config;

errorOnDeprecated [boolean]

Default: false

Make calling deprecated APIs throw helpful error messages. Useful for easing the upgrade process.

extensionsToTreatAsEsm [array<string>]

Default: []

Jest will run .mjs and .js files with nearest package.json's type field set to module as ECMAScript Modules. If you have any other files that should run with native ESM, you need to specify their file extension here.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  extensionsToTreatAsEsm: ['.ts'],
};

module.exports = config;

CAUTION
Jest's ESM support is still experimental, see its docs for more details.
fakeTimers [object]

Default: {}

The fake timers may be useful when a piece of code sets a long timeout that we don't want to wait for in a test. For additional details see Fake Timers guide and API documentation.

This option provides the default configuration of fake timers for all tests. Calling jest.useFakeTimers() in a test file will use these options or will override them if a configuration object is passed. For example, you can tell Jest to keep the original implementation of process.nextTick() and adjust the limit of recursive timers that will be run:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  fakeTimers: {
    doNotFake: ['nextTick'],
    timerLimit: 1000,
  },
};

module.exports = config;

fakeTime.test.js
// install fake timers for this file using the options from Jest configuration
jest.useFakeTimers();

test('increase the limit of recursive timers for this and following tests', () => {
  jest.useFakeTimers({timerLimit: 5000});
  // ...
});


TIP
Instead of including jest.useFakeTimers() in each test file, you can enable fake timers globally for all tests in your Jest configuration:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  fakeTimers: {
    enableGlobally: true,
  },
};

module.exports = config;

Configuration options:

type FakeableAPI =
  | 'Date'
  | 'hrtime'
  | 'nextTick'
  | 'performance'
  | 'queueMicrotask'
  | 'requestAnimationFrame'
  | 'cancelAnimationFrame'
  | 'requestIdleCallback'
  | 'cancelIdleCallback'
  | 'setImmediate'
  | 'clearImmediate'
  | 'setInterval'
  | 'clearInterval'
  | 'setTimeout'
  | 'clearTimeout';

type ModernFakeTimersConfig = {
  /**
   * If set to `true` all timers will be advanced automatically by 20 milliseconds
   * every 20 milliseconds. A custom time delta may be provided by passing a number.
   * The default is `false`.
   */
  advanceTimers?: boolean | number;
  /**
   * List of names of APIs that should not be faked. The default is `[]`, meaning
   * all APIs are faked.
   */
  doNotFake?: Array<FakeableAPI>;
  /** Whether fake timers should be enabled for all test files. The default is `false`. */
  enableGlobally?: boolean;
  /**
   * Use the old fake timers implementation instead of one backed by `@sinonjs/fake-timers`.
   * The default is `false`.
   */
  legacyFakeTimers?: boolean;
  /** Sets current system time to be used by fake timers, in milliseconds. The default is `Date.now()`. */
  now?: number;
  /** Maximum number of recursive timers that will be run. The default is `100_000` timers. */
  timerLimit?: number;
};


LEGACY FAKE TIMERS
For some reason you might have to use legacy implementation of fake timers. Here is how to enable it globally (additional options are not supported):

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  fakeTimers: {
    enableGlobally: true,
    legacyFakeTimers: true,
  },
};

module.exports = config;

forceCoverageMatch [array<string>]

Default: ['']

Test files are normally ignored from collecting code coverage. With this option, you can overwrite this behavior and include otherwise ignored files in code coverage.

For example, if you have tests in source files named with .t.js extension as following:

sum.t.js
export function sum(a, b) {
  return a + b;
}

if (process.env.NODE_ENV === 'test') {
  test('sum', () => {
    expect(sum(1, 2)).toBe(3);
  });
}

You can collect coverage from those files with setting forceCoverageMatch.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  forceCoverageMatch: ['**/*.t.js'],
};

module.exports = config;

globals [object]

Default: {}

A set of global variables that need to be available in all test environments.

For example, the following would create a global __DEV__ variable set to true in all test environments:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  globals: {
    __DEV__: true,
  },
};

module.exports = config;

NOTE
If you specify a global reference value (like an object or array) here, and some code mutates that value in the midst of running a test, that mutation will not be persisted across test runs for other test files. In addition, the globals object must be json-serializable, so it can't be used to specify global functions. For that, you should use setupFiles.
globalSetup [string]

Default: undefined

This option allows the use of a custom global setup module, which must export a function (it can be sync or async). The function will be triggered once before all test suites and it will receive two arguments: Jest's globalConfig and projectConfig.

INFO
A global setup module configured in a project (using multi-project runner) will be triggered only when you run at least one test from this project.

Any global variables that are defined through globalSetup can only be read in globalTeardown. You cannot retrieve globals defined here in your test suites.

While code transformation is applied to the linked setup-file, Jest will not transform any code in node_modules. This is due to the need to load the actual transformers (e.g. babel or typescript) to perform transformation.
setup.js
module.exports = async function (globalConfig, projectConfig) {
  console.log(globalConfig.testPathPattern);
  console.log(projectConfig.cache);

  // Set reference to mongod in order to close the server during teardown.
  globalThis.__MONGOD__ = mongod;
};

teardown.js
module.exports = async function (globalConfig, projectConfig) {
  console.log(globalConfig.testPathPattern);
  console.log(projectConfig.cache);

  await globalThis.__MONGOD__.stop();
};

globalTeardown [string]

Default: undefined

This option allows the use of a custom global teardown module which must export a function (it can be sync or async). The function will be triggered once after all test suites and it will receive two arguments: Jest's globalConfig and projectConfig.

INFO
A global teardown module configured in a project (using multi-project runner) will be triggered only when you run at least one test from this project.

The same caveat concerning transformation of node_modules as for globalSetup applies to globalTeardown.
haste [object]

Default: undefined

This will be used to configure the behavior of jest-haste-map, Jest's internal file crawler/cache system. The following options are supported:

type HasteConfig = {
  /** Whether to hash files using SHA-1. */
  computeSha1?: boolean;
  /** The platform to use as the default, e.g. 'ios'. */
  defaultPlatform?: string | null;
  /** Force use of Node's `fs` APIs rather than shelling out to `find` */
  forceNodeFilesystemAPI?: boolean;
  /**
   * Whether to follow symlinks when crawling for files.
   *   This options cannot be used in projects which use watchman.
   *   Projects with `watchman` set to true will error if this option is set to true.
   */
  enableSymlinks?: boolean;
  /** Path to a custom implementation of Haste. */
  hasteImplModulePath?: string;
  /** All platforms to target, e.g ['ios', 'android']. */
  platforms?: Array<string>;
  /** Whether to throw an error on module collision. */
  throwOnModuleCollision?: boolean;
  /** Custom HasteMap module */
  hasteMapModulePath?: string;
  /** Whether to retain all files, allowing e.g. search for tests in `node_modules`. */
  retainAllFiles?: boolean;
};


injectGlobals [boolean]

Default: true

Insert Jest's globals (expect, test, describe, beforeEach etc.) into the global environment. If you set this to false, you should import from @jest/globals, e.g.

import {expect, jest, test} from '@jest/globals';

jest.useFakeTimers();

test('some test', () => {
  expect(Date.now()).toBe(0);
});

NOTE
This option is only supported using the default jest-circus test runner.
maxConcurrency [number]

Default: 5

A number limiting the number of tests that are allowed to run at the same time when using test.concurrent. Any test above this limit will be queued and executed once a slot is released.

maxWorkers [number | string]

Specifies the maximum number of workers the worker-pool will spawn for running tests. In single run mode, this defaults to the number of the cores available on your machine minus one for the main thread. In watch mode, this defaults to half of the available cores on your machine to ensure Jest is unobtrusive and does not grind your machine to a halt. It may be useful to adjust this in resource limited environments like CIs but the defaults should be adequate for most use-cases.

For environments with variable CPUs available, you can use percentage based configuration:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  maxWorkers: '50%',
};

module.exports = config;

moduleDirectories [array<string>]

Default: ["node_modules"]

An array of directory names to be searched recursively up from the requiring module's location. Setting this option will override the default, if you wish to still search node_modules for packages include it along with any other options:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  moduleDirectories: ['node_modules', 'bower_components'],
};

module.exports = config;

CAUTION
It is discouraged to use '.' as one of the moduleDirectories, because this prevents scoped packages such as @emotion/react from accessing packages with the same subdirectory name (react). See this issue for more details. In most cases, it is preferable to use the moduleNameMapper configuration instead.
moduleFileExtensions [array<string>]

Default: ["js", "mjs", "cjs", "jsx", "ts", "tsx", "json", "node"]

An array of file extensions your modules use. If you require modules without specifying a file extension, these are the extensions Jest will look for, in left-to-right order.

We recommend placing the extensions most commonly used in your project on the left, so if you are using TypeScript, you may want to consider moving "ts" and/or "tsx" to the beginning of the array.

moduleNameMapper [object<string, string | array<string>>]

Default: null

A map from regular expressions to module names or to arrays of module names that allow to stub out resources, like images or styles with a single module.

Modules that are mapped to an alias are unmocked by default, regardless of whether automocking is enabled or not.

Use <rootDir> string token to refer to rootDir value if you want to use file paths.

Additionally, you can substitute captured regex groups using numbered backreferences.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  moduleNameMapper: {
    '^image![a-zA-Z0-9$_-]+$': 'GlobalImageStub',
    '^[./a-zA-Z0-9$_-]+\\.png$': '<rootDir>/RelativeImageStub.js',
    'module_name_(.*)': '<rootDir>/substituted_module_$1.js',
    'assets/(.*)': [
      '<rootDir>/images/$1',
      '<rootDir>/photos/$1',
      '<rootDir>/recipes/$1',
    ],
  },
};

module.exports = config;

The order in which the mappings are defined matters. Patterns are checked one by one until one fits. The most specific rule should be listed first. This is true for arrays of module names as well.

INFO
If you provide module names without boundaries ^$ it may cause hard to spot errors. E.g. relay will replace all modules which contain relay as a substring in its name: relay, react-relay and graphql-relay will all be pointed to your stub.
modulePathIgnorePatterns [array<string>]

Default: []

An array of regexp pattern strings that are matched against all module paths before those paths are to be considered 'visible' to the module loader. If a given module's path matches any of the patterns, it will not be require()-able in the test environment.

These pattern strings match against the full path. Use the <rootDir> string token to include the path to your project's root directory to prevent it from accidentally ignoring all of your files in different environments that may have different root directories.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  modulePathIgnorePatterns: ['<rootDir>/build/'],
};

module.exports = config;

modulePaths [array<string>]

Default: []

An alternative API to setting the NODE_PATH env variable, modulePaths is an array of absolute paths to additional locations to search when resolving modules. Use the <rootDir> string token to include the path to your project's root directory.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  modulePaths: ['<rootDir>/app/'],
};

module.exports = config;

notify [boolean]

Default: false

Activates native OS notifications for test results. To display the notifications Jest needs node-notifier package, which must be installed additionally:

npm
Yarn
pnpm
npm install --save-dev node-notifier

TIP
On macOS, remember to allow notifications from terminal-notifier under System Preferences > Notifications & Focus.

On Windows, node-notifier creates a new start menu entry on the first use and not display the notification. Notifications will be properly displayed on subsequent runs.
notifyMode [string]

Default: failure-change

Specifies notification mode. Requires notify: true.

Modes

always: always send a notification.
failure: send a notification when tests fail.
success: send a notification when tests pass.
change: send a notification when the status changed.
success-change: send a notification when tests pass or once when it fails.
failure-change: send a notification when tests fail or once when it passes.
openHandlesTimeout [number]

Default: 1000

Print a warning indicating that there are probable open handles if Jest does not exit cleanly this number of milliseconds after it completes. Use 0 to disable the warning.

preset [string]

Default: undefined

A preset that is used as a base for Jest's configuration. A preset should point to an npm module that has a jest-preset.json, jest-preset.js, jest-preset.cjs or jest-preset.mjs file at the root.

For example, this preset foo-bar/jest-preset.js will be configured as follows:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  preset: 'foo-bar',
};

module.exports = config;

Presets may also be relative to filesystem paths:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  preset: './node_modules/foo-bar/jest-preset.js',
};

module.exports = config;

INFO
If you also have specified rootDir, the resolution of this file will be relative to that root directory.
prettierPath [string]

Default: 'prettier'

Sets the path to the prettier node module used to update inline snapshots.

Prettier version 3 is not supported!
projects [array<string | ProjectConfig>]

Default: undefined

When the projects configuration is provided with an array of paths or glob patterns, Jest will run tests in all of the specified projects at the same time. This is great for monorepos or when working on multiple projects at the same time.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  projects: ['<rootDir>', '<rootDir>/examples/*'],
};

module.exports = config;

This example configuration will run Jest in the root directory as well as in every folder in the examples directory. You can have an unlimited amount of projects running in the same Jest instance.

The projects feature can also be used to run multiple configurations or multiple runners. For this purpose, you can pass an array of configuration objects. For example, to run both tests and ESLint (via jest-runner-eslint) in the same invocation of Jest:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: 'test',
    },
    {
      displayName: 'lint',
      runner: 'jest-runner-eslint',
      testMatch: ['<rootDir>/**/*.js'],
    },
  ],
};

module.exports = config;

TIP
When using multi-project runner, it's recommended to add a displayName for each project. This will show the displayName of a project next to its tests.
NOTE
With the projects option enabled, Jest will copy the root-level configuration options to each individual child configuration during the test run, resolving its values in the child's context. This means that string tokens like <rootDir> will point to the child's root directory even if they are defined in the root-level configuration.
randomize [boolean]

Default: false

The equivalent of the --randomize flag to randomize the order of the tests in a file.

reporters [array<moduleName | [moduleName, options]>]

Default: undefined

Use this configuration option to add reporters to Jest. It must be a list of reporter names, additional options can be passed to a reporter using the tuple form:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  reporters: [
    'default',
    ['<rootDir>/custom-reporter.js', {banana: 'yes', pineapple: 'no'}],
  ],
};

module.exports = config;

Default Reporter

If custom reporters are specified, the default Jest reporter will be overridden. If you wish to keep it, 'default' must be passed as a reporters name:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  reporters: [
    'default',
    ['jest-junit', {outputDirectory: 'reports', outputName: 'report.xml'}],
  ],
};

module.exports = config;

GitHub Actions Reporter

If included in the list, the built-in GitHub Actions Reporter will annotate changed files with test failure messages and (if used with 'silent: false') print logs with github group features for easy navigation. Note that 'default' should not be used in this case as 'github-actions' will handle that already, so remember to also include 'summary'. If you wish to use it only for annotations simply leave only the reporter without options as the default value of 'silent' is 'true':

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  reporters: [['github-actions', {silent: false}], 'summary'],
};

module.exports = config;

Summary Reporter

Summary reporter prints out summary of all tests. It is a part of default reporter, hence it will be enabled if 'default' is included in the list. For instance, you might want to use it as stand-alone reporter instead of the default one, or together with Silent Reporter:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  reporters: ['jest-silent-reporter', 'summary'],
};

module.exports = config;

The summary reporter accepts options. Since it is included in the default reporter you may also pass the options there.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  reporters: [['default', {summaryThreshold: 10}]],
};

module.exports = config;

The summaryThreshold option behaves in the following way, if the total number of test suites surpasses this threshold, a detailed summary of all failed tests will be printed after executing all the tests. It defaults to 20.

Custom Reporters

TIP
Hungry for reporters? Take a look at long list of awesome reporters from Awesome Jest.
Custom reporter module must export a class that takes globalConfig, reporterOptions and reporterContext as constructor arguments:

custom-reporter.js
class CustomReporter {
  constructor(globalConfig, reporterOptions, reporterContext) {
    this._globalConfig = globalConfig;
    this._options = reporterOptions;
    this._context = reporterContext;
  }

  onRunComplete(testContexts, results) {
    console.log('Custom reporter output:');
    console.log('global config:', this._globalConfig);
    console.log('options for this reporter from Jest config:', this._options);
    console.log('reporter context passed from test scheduler:', this._context);
  }

  // Optionally, reporters can force Jest to exit with non zero code by returning
  // an `Error` from `getLastError()` method.
  getLastError() {
    if (this._shouldFail) {
      return new Error('Custom error reported!');
    }
  }
}

module.exports = CustomReporter;


NOTE
For the full list of hooks and argument types see the Reporter interface in packages/jest-reporters/src/types.ts.
resetMocks [boolean]

Default: false

Automatically reset mock state before every test. Equivalent to calling jest.resetAllMocks() before each test. This will lead to any mocks having their fake implementations removed but does not restore their initial implementation.

resetModules [boolean]

Default: false

By default, each test file gets its own independent module registry. Enabling resetModules goes a step further and resets the module registry before running each individual test. This is useful to isolate modules for every test so that the local module state doesn't conflict between tests. This can be done programmatically using jest.resetModules().

resolver [string]

Default: undefined

This option allows the use of a custom resolver. This resolver must be a module that exports either:

a function expecting a string as the first argument for the path to resolve and an options object as the second argument. The function should either return a path to the module that should be resolved or throw an error if the module can't be found. or
an object containing async and/or sync properties. The sync property should be a function with the shape explained above, and the async property should also be a function that accepts the same arguments, but returns a promise which resolves with the path to the module or rejects with an error.
The options object provided to resolvers has the shape:

type ResolverOptions = {
  /** Directory to begin resolving from. */
  basedir: string;
  /** List of export conditions. */
  conditions?: Array<string>;
  /** Instance of default resolver. */
  defaultResolver: (path: string, options: ResolverOptions) => string;
  /** List of file extensions to search in order. */
  extensions?: Array<string>;
  /** List of directory names to be looked up for modules recursively. */
  moduleDirectory?: Array<string>;
  /** List of `require.paths` to use if nothing is found in `node_modules`. */
  paths?: Array<string>;
  /** Allows transforming parsed `package.json` contents. */
  packageFilter?: (pkg: PackageJSON, file: string, dir: string) => PackageJSON;
  /** Allows transforms a path within a package. */
  pathFilter?: (pkg: PackageJSON, path: string, relativePath: string) => string;
  /** Current root directory. */
  rootDir?: string;
};


TIP
The defaultResolver passed as an option is the Jest default resolver which might be useful when you write your custom one. It takes the same arguments as your custom synchronous one, e.g. (path, options) and returns a string or throws.
For example, if you want to respect Browserify's "browser" field, you can use the following resolver:

resolver.js
const browserResolve = require('browser-resolve');

module.exports = browserResolve.sync;

And add it to Jest configuration:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  resolver: '<rootDir>/resolver.js',
};

module.exports = config;

By combining defaultResolver and packageFilter we can implement a package.json "pre-processor" that allows us to change how the default resolver will resolve modules. For example, imagine we want to use the field "module" if it is present, otherwise fallback to "main":

module.exports = (path, options) => {
  // Call the defaultResolver, so we leverage its cache, error handling, etc.
  return options.defaultResolver(path, {
    ...options,
    // Use packageFilter to process parsed `package.json` before the resolution (see https://www.npmjs.com/package/resolve#resolveid-opts-cb)
    packageFilter: pkg => {
      return {
        ...pkg,
        // Alter the value of `main` before resolving the package
        main: pkg.module || pkg.main,
      };
    },
  });
};


restoreMocks [boolean]

Default: false

Automatically restore mock state and implementation before every test. Equivalent to calling jest.restoreAllMocks() before each test. This will lead to any mocks having their fake implementations removed and restores their initial implementation.

rootDir [string]

Default: The root of the directory containing your Jest config file or the package.json or the pwd if no package.json is found

The root directory that Jest should scan for tests and modules within. If you put your Jest config inside your package.json and want the root directory to be the root of your repo, the value for this config param will default to the directory of the package.json.

Oftentimes, you'll want to set this to 'src' or 'lib', corresponding to where in your repository the code is stored.

TIP
Using '<rootDir>' as a string token in any other path-based configuration settings will refer back to this value. For example, if you want a setupFiles entry to point at the some-setup.js file at the root of the project, set its value to: '<rootDir>/some-setup.js'.
roots [array<string>]

Default: ["<rootDir>"]

A list of paths to directories that Jest should use to search for files in.

There are times where you only want Jest to search in a single sub-directory (such as cases where you have a src/ directory in your repo), but prevent it from accessing the rest of the repo.

INFO
While rootDir is mostly used as a token to be re-used in other configuration options, roots is used by the internals of Jest to locate test files and source files. This applies also when searching for manual mocks for modules from node_modules (__mocks__ will need to live in one of the roots).

By default, roots has a single entry <rootDir> but there are cases where you may want to have multiple roots within one project, for example roots: ["<rootDir>/src/", "<rootDir>/tests/"].
runner [string]

Default: "jest-runner"

This option allows you to use a custom runner instead of Jest's default test runner. Examples of runners include:

jest-runner-eslint
jest-runner-mocha
jest-runner-tsc
jest-runner-prettier
INFO
The runner property value can omit the jest-runner- prefix of the package name.
To write a test-runner, export a class with which accepts globalConfig in the constructor, and has a runTests method with the signature:

async function runTests(
  tests: Array<Test>,
  watcher: TestWatcher,
  onStart: OnTestStart,
  onResult: OnTestSuccess,
  onFailure: OnTestFailure,
  options: TestRunnerOptions,
): Promise<void>;

If you need to restrict your test-runner to only run in serial rather than being executed in parallel your class should have the property isSerial to be set as true.

sandboxInjectedGlobals [array<string>]

TIP
Renamed from extraGlobals in Jest 28.
Default: undefined

Test files run inside a vm, which slows calls to global context properties (e.g. Math). With this option you can specify extra properties to be defined inside the vm for faster lookups.

For example, if your tests call Math often, you can pass it by setting sandboxInjectedGlobals.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  sandboxInjectedGlobals: ['Math'],
};

module.exports = config;

NOTE
This option has no effect if you use native ESM.
setupFiles [array]

Default: []

A list of paths to modules that run some code to configure or set up the testing environment. Each setupFile will be run once per test file. Since every test runs in its own environment, these scripts will be executed in the testing environment before executing setupFilesAfterEnv and before the test code itself.

TIP
If your setup script is a CJS module, it may export an async function. Jest will call the function and await its result. This might be useful to fetch some data asynchronously. If the file is an ESM module, simply use top-level await to achieve the same result.
setupFilesAfterEnv [array]

Default: []

A list of paths to modules that run some code to configure or set up the testing framework before each test file in the suite is executed. Since setupFiles executes before the test framework is installed in the environment, this script file presents you the opportunity of running some code immediately after the test framework has been installed in the environment but before the test code itself.

In other words, setupFilesAfterEnv modules are meant for code which is repeating in each test file. Having the test framework installed makes Jest globals, jest object and expect accessible in the modules. For example, you can add extra matchers from jest-extended library or call setup and teardown hooks:

setup-jest.js
const matchers = require('jest-extended');
expect.extend(matchers);

afterEach(() => {
  jest.useRealTimers();
});

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
};

module.exports = config;

showSeed [boolean]

Default: false

The equivalent of the --showSeed flag to print the seed in the test report summary.

slowTestThreshold [number]

Default: 5

The number of seconds after which a test is considered as slow and reported as such in the results.

snapshotFormat [object]

Default: {escapeString: false, printBasicPrototype: false}

Allows overriding specific snapshot formatting options documented in the pretty-format readme, with the exceptions of compareKeys and plugins. For example, this config would have the snapshot formatter not print a prefix for "Object" and "Array":

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  snapshotFormat: {
    printBasicPrototype: false,
  },
};

module.exports = config;

some.test.js
test('does not show prototypes for object and array inline', () => {
  const object = {
    array: [{hello: 'Danger'}],
  };
  expect(object).toMatchInlineSnapshot(`
    {
      "array": [
        {
          "hello": "Danger",
        },
      ],
    }
  `);
});

snapshotResolver [string]

Default: undefined

The path to a module that can resolve test<->snapshot path. This config option lets you customize where Jest stores snapshot files on disk.

custom-resolver.js
module.exports = {
  // resolves from test to snapshot path
  resolveSnapshotPath: (testPath, snapshotExtension) =>
    testPath.replace('__tests__', '__snapshots__') + snapshotExtension,

  // resolves from snapshot to test path
  resolveTestPath: (snapshotFilePath, snapshotExtension) =>
    snapshotFilePath
      .replace('__snapshots__', '__tests__')
      .slice(0, -snapshotExtension.length),

  // Example test path, used for preflight consistency check of the implementation above
  testPathForConsistencyCheck: 'some/__tests__/example.test.js',
};


snapshotSerializers [array<string>]

Default: []

A list of paths to snapshot serializer modules Jest should use for snapshot testing.

Jest has default serializers for built-in JavaScript types, HTML elements (Jest 20.0.0+), ImmutableJS (Jest 20.0.0+) and for React elements. See snapshot test tutorial for more information.

custom-serializer.js
module.exports = {
  serialize(val, config, indentation, depth, refs, printer) {
    return `Pretty foo: ${printer(val.foo)}`;
  },

  test(val) {
    return val && Object.prototype.hasOwnProperty.call(val, 'foo');
  },
};

printer is a function that serializes a value using existing plugins.

Add custom-serializer to your Jest configuration:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  snapshotSerializers: ['path/to/custom-serializer.js'],
};

module.exports = config;

Finally tests would look as follows:

test(() => {
  const bar = {
    foo: {
      x: 1,
      y: 2,
    },
  };

  expect(bar).toMatchSnapshot();
});

Rendered snapshot:

Pretty foo: Object {
  "x": 1,
  "y": 2,
}

TIP
To make a dependency explicit instead of implicit, you can call expect.addSnapshotSerializer to add a module for an individual test file instead of adding its path to snapshotSerializers in Jest configuration.

More about serializers API can be found here.
testEnvironment [string]

Default: "node"

The test environment that will be used for testing. The default environment in Jest is a Node.js environment. If you are building a web app, you can use a browser-like environment through jsdom instead.

By adding a @jest-environment docblock at the top of the file, you can specify another environment to be used for all tests in that file:

/**
 * @jest-environment jsdom
 */

test('use jsdom in this test file', () => {
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

You can create your own module that will be used for setting up the test environment. The module must export a class with setup, teardown and getVmContext methods. You can also pass variables from this module to your test suites by assigning them to this.global object – this will make them available in your test suites as global variables. The constructor is passed globalConfig and projectConfig as its first argument, and testEnvironmentContext as its second.

The class may optionally expose an asynchronous handleTestEvent method to bind to events fired by jest-circus. Normally, jest-circus test runner would pause until a promise returned from handleTestEvent gets fulfilled, except for the next events: start_describe_definition, finish_describe_definition, add_hook, add_test or error (for the up-to-date list you can look at SyncEvent type in the types definitions). That is caused by backward compatibility reasons and process.on('unhandledRejection', callback) signature, but that usually should not be a problem for most of the use cases.

Any docblock pragmas in test files will be passed to the environment constructor and can be used for per-test configuration. If the pragma does not have a value, it will be present in the object with its value set to an empty string. If the pragma is not present, it will not be present in the object.

To use this class as your custom environment, refer to it by its full path within the project. For example, if your class is stored in my-custom-environment.js in some subfolder of your project, then the annotation might look like this:

/**
 * @jest-environment ./src/test/my-custom-environment
 */

INFO
TestEnvironment is sandboxed. Each test suite will trigger setup/teardown in their own TestEnvironment.
Example:

// my-custom-environment
const NodeEnvironment = require('jest-environment-node').TestEnvironment;

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    console.log(config.globalConfig);
    console.log(config.projectConfig);
    this.testPath = context.testPath;
    this.docblockPragmas = context.docblockPragmas;
  }

  async setup() {
    await super.setup();
    await someSetupTasks(this.testPath);
    this.global.someGlobalObject = createGlobalObject();

    // Will trigger if docblock contains @my-custom-pragma my-pragma-value
    if (this.docblockPragmas['my-custom-pragma'] === 'my-pragma-value') {
      // ...
    }
  }

  async teardown() {
    this.global.someGlobalObject = destroyGlobalObject();
    await someTeardownTasks();
    await super.teardown();
  }

  getVmContext() {
    return super.getVmContext();
  }

  async handleTestEvent(event, state) {
    if (event.name === 'test_start') {
      // ...
    }
  }
}

module.exports = CustomEnvironment;

// my-test-suite
/**
 * @jest-environment ./my-custom-environment
 */
let someGlobalObject;

beforeAll(() => {
  someGlobalObject = globalThis.someGlobalObject;
});

testEnvironmentOptions [Object]

Default: {}

Test environment options that will be passed to the testEnvironment. The relevant options depend on the environment.

For example, you can override options passed to jsdom:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    html: '<html lang="zh-cmn-Hant"></html>',
    url: 'https://jestjs.io/',
    userAgent: 'Agent/007',
  },
};

module.exports = config;

Both jest-environment-jsdom and jest-environment-node allow specifying customExportConditions, which allow you to control which versions of a library are loaded from exports in package.json. jest-environment-jsdom defaults to ['browser']. jest-environment-node defaults to ['node', 'node-addons'].

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['react-native'],
  },
};

module.exports = config;

These options can also be passed in a docblock, similar to testEnvironment. The string with options must be parseable by JSON.parse:

/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://jestjs.io/"}
 */

test('use jsdom and set the URL in this test file', () => {
  expect(window.location.href).toBe('https://jestjs.io/');
});

testFailureExitCode [number]

Default: 1

The exit code Jest returns on test failure.

INFO
This does not change the exit code in the case of Jest errors (e.g. invalid configuration).
testMatch [array<string>]

(default: [ "**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ])

The glob patterns Jest uses to detect test files. By default it looks for .js, .jsx, .ts and .tsx files inside of __tests__ folders, as well as any files with a suffix of .test or .spec (e.g. Component.test.js or Component.spec.js). It will also find files called test.js or spec.js.

See the micromatch package for details of the patterns you can specify.

See also testRegex [string | array<string>], but note that you cannot specify both options.

TIP
Each glob pattern is applied in the order they are specified in the config. For example ["!**/__fixtures__/**", "**/__tests__/**/*.js"] will not exclude __fixtures__ because the negation is overwritten with the second pattern. In order to make the negated glob work in this example it has to come after **/__tests__/**/*.js.
testPathIgnorePatterns [array<string>]

Default: ["/node_modules/"]

An array of regexp pattern strings that are matched against all test paths before executing the test. If the test path matches any of the patterns, it will be skipped.

These pattern strings match against the full path. Use the <rootDir> string token to include the path to your project's root directory to prevent it from accidentally ignoring all of your files in different environments that may have different root directories. Example: ["<rootDir>/build/", "<rootDir>/node_modules/"].

testRegex [string | array<string>]

Default: (/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$

The pattern or patterns Jest uses to detect test files. By default it looks for .js, .jsx, .ts and .tsx files inside of __tests__ folders, as well as any files with a suffix of .test or .spec (e.g. Component.test.js or Component.spec.js). It will also find files called test.js or spec.js. See also testMatch [array<string>], but note that you cannot specify both options.

The following is a visualization of the default regex:

├── __tests__
│   └── component.spec.js # test
│   └── anything # test
├── package.json # not test
├── foo.test.js # test
├── bar.spec.jsx # test
└── component.js # not test

INFO
testRegex will try to detect test files using the absolute file path, therefore, having a folder with a name that matches it will run all the files as tests.
testResultsProcessor [string]

Default: undefined

This option allows the use of a custom results processor. This processor must be a node module that exports a function expecting an object with the following structure as the first argument and return it:

{
  "success": boolean,
  "startTime": epoch,
  "numTotalTestSuites": number,
  "numPassedTestSuites": number,
  "numFailedTestSuites": number,
  "numRuntimeErrorTestSuites": number,
  "numTotalTests": number,
  "numPassedTests": number,
  "numFailedTests": number,
  "numPendingTests": number,
  "numTodoTests": number,
  "openHandles": Array<Error>,
  "testResults": [{
    "numFailingTests": number,
    "numPassingTests": number,
    "numPendingTests": number,
    "testResults": [{
      "title": string (message in it block),
      "status": "failed" | "pending" | "passed",
      "ancestorTitles": [string (message in describe blocks)],
      "failureMessages": [string],
      "numPassingAsserts": number,
      "location": {
        "column": number,
        "line": number
      },
      "duration": number | null
    },
    ...
    ],
    "perfStats": {
      "start": epoch,
      "end": epoch
    },
    "testFilePath": absolute path to test file,
    "coverage": {}
  },
  "testExecError:" (exists if there was a top-level failure) {
    "message": string
    "stack": string
  }
  ...
  ]
}

testResultsProcessor and reporters are very similar to each other. One difference is that a test result processor only gets called after all tests finished. Whereas a reporter has the ability to receive test results after individual tests and/or test suites are finished.

testRunner [string]

Default: jest-circus/runner

This option allows the use of a custom test runner. The default is jest-circus. A custom test runner can be provided by specifying a path to a test runner implementation.

The test runner module must export a function with the following signature:

function testRunner(
  globalConfig: GlobalConfig,
  config: ProjectConfig,
  environment: Environment,
  runtime: Runtime,
  testPath: string,
): Promise<TestResult>;

An example of such function can be found in our default jasmine2 test runner package.

testSequencer [string]

Default: @jest/test-sequencer

This option allows you to use a custom sequencer instead of Jest's default.

TIP
Both sort and shard may optionally return a Promise.
For example, you may sort test paths alphabetically:

custom-sequencer.js
const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  /**
   * Select tests for shard requested via --shard=shardIndex/shardCount
   * Sharding is applied before sorting
   */
  shard(tests, {shardIndex, shardCount}) {
    const shardSize = Math.ceil(tests.length / shardCount);
    const shardStart = shardSize * (shardIndex - 1);
    const shardEnd = shardSize * shardIndex;

    return [...tests]
      .sort((a, b) => (a.path > b.path ? 1 : -1))
      .slice(shardStart, shardEnd);
  }

  /**
   * Sort test to determine order of execution
   * Sorting is applied after sharding
   */
  sort(tests) {
    // Test structure information
    // https://github.com/jestjs/jest/blob/6b8b1404a1d9254e7d5d90a8934087a9c9899dab/packages/jest-runner/src/types.ts#L17-L21
    const copyTests = [...tests];
    return copyTests.sort((testA, testB) => (testA.path > testB.path ? 1 : -1));
  }
}

module.exports = CustomSequencer;


Add custom-sequencer to your Jest configuration:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  testSequencer: 'path/to/custom-sequencer.js',
};

module.exports = config;

testTimeout [number]

Default: 5000

Default timeout of a test in milliseconds.

transform [object<string, pathToTransformer | [pathToTransformer, object]>]

Default: {"\\.[jt]sx?$": "babel-jest"}

A map from regular expressions to paths to transformers. Optionally, a tuple with configuration options can be passed as second argument: {filePattern: ['path-to-transformer', {options}]}. For example, here is how you can configure babel-jest for non-default behavior: {'\\.js$': ['babel-jest', {rootMode: 'upward'}]}.

Jest runs the code of your project as JavaScript, hence a transformer is needed if you use some syntax not supported by Node out of the box (such as JSX, TypeScript, Vue templates). By default, Jest will use babel-jest transformer, which will load your project's Babel configuration and transform any file matching the /\.[jt]sx?$/ RegExp (in other words, any .js, .jsx, .ts or .tsx file). In addition, babel-jest will inject the Babel plugin necessary for mock hoisting talked about in ES Module mocking.

See the Code Transformation section for more details and instructions on building your own transformer.

TIP
Keep in mind that a transformer only runs once per file unless the file has changed.

Remember to include the default babel-jest transformer explicitly, if you wish to use it alongside with additional code preprocessors:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  transform: {
    '\\.[jt]sx?$': 'babel-jest',
    '\\.css$': 'some-css-transformer',
  },
};

module.exports = config;

transformIgnorePatterns [array<string>]

Default: ["/node_modules/", "\\.pnp\\.[^\\\/]+$"]

An array of regexp pattern strings that are matched against all source file paths before transformation. If the file path matches any of the patterns, it will not be transformed.

Providing regexp patterns that overlap with each other may result in files not being transformed that you expected to be transformed. For example:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  transformIgnorePatterns: ['/node_modules/(?!(foo|bar)/)', '/bar/'],
};

module.exports = config;

The first pattern will match (and therefore not transform) files inside /node_modules except for those in /node_modules/foo/ and /node_modules/bar/. The second pattern will match (and therefore not transform) files inside any path with /bar/ in it. With the two together, files in /node_modules/bar/ will not be transformed because it does match the second pattern, even though it was excluded by the first.

Sometimes it happens (especially in React Native or TypeScript projects) that 3rd party modules are published as untranspiled code. Since all files inside node_modules are not transformed by default, Jest will not understand the code in these modules, resulting in syntax errors. To overcome this, you may use transformIgnorePatterns to allow transpiling such modules. You'll find a good example of this use case in React Native Guide.

These pattern strings match against the full path. Use the <rootDir> string token to include the path to your project's root directory to prevent it from accidentally ignoring all of your files in different environments that may have different root directories.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  transformIgnorePatterns: [
    '<rootDir>/bower_components/',
    '<rootDir>/node_modules/',
  ],
};

module.exports = config;

TIP
If you use pnpm and need to convert some packages under node_modules, you need to note that the packages in this folder (e.g. node_modules/package-a/) have been symlinked to the path under .pnpm (e.g. node_modules/.pnpm/package-a@x.x.x/node_modules/package-a/), so using <rootDir>/node_modules/(?!(package-a|@scope/pkg-b)/) directly will not be recognized, while is to use:

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  transformIgnorePatterns: [
    '<rootDir>/node_modules/.pnpm/(?!(package-a|@scope\\+pkg-b)@)',
    /* if config file is under '~/packages/lib-a/' */
    `${path.join(
      __dirname,
      '../..',
    )}/node_modules/.pnpm/(?!(package-a|@scope\\+pkg-b)@)`,
    /* or using relative pattern to match the second 'node_modules/' in 'node_modules/.pnpm/@scope+pkg-b@x.x.x/node_modules/@scope/pkg-b/' */
    'node_modules/(?!.pnpm|package-a|@scope/pkg-b)',
  ],
};

module.exports = config;


It should be noted that the folder name of pnpm under .pnpm is the package name plus @ and version number, so writing / will not be recognized, but using @ can.
unmockedModulePathPatterns [array<string>]

Default: []

An array of regexp pattern strings that are matched against all modules before the module loader will automatically return a mock for them. If a module's path matches any of the patterns in this list, it will not be automatically mocked by the module loader.

This is useful for some commonly used 'utility' modules that are almost always used as implementation details almost all the time (like underscore, lodash, etc). It's generally a best practice to keep this list as small as possible and always use explicit jest.mock()/jest.unmock() calls in individual tests. Explicit per-test setup is far easier for other readers of the test to reason about the environment the test will run in.

It is possible to override this setting in individual tests by explicitly calling jest.mock() at the top of the test file.

verbose [boolean]

Default: false or true if there is only one test file to run

Indicates whether each individual test should be reported during the run. All errors will also still be shown on the bottom after execution.

watchPathIgnorePatterns [array<string>]

Default: []

An array of RegExp patterns that are matched against all source file paths before re-running tests in watch mode. If the file path matches any of the patterns, when it is updated, it will not trigger a re-run of tests.

These patterns match against the full path. Use the <rootDir> string token to include the path to your project's root directory to prevent it from accidentally ignoring all of your files in different environments that may have different root directories. Example: ["<rootDir>/node_modules/"].

Even if nothing is specified here, the watcher will ignore changes to the version control folders (.git, .hg, .sl). Other hidden files and directories, i.e. those that begin with a dot (.), are watched by default. Remember to escape the dot when you add them to watchPathIgnorePatterns as it is a special RegExp character.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  watchPathIgnorePatterns: ['<rootDir>/\\.tmp/', '<rootDir>/bar/'],
};

module.exports = config;

watchPlugins [array<string | [string, Object]>]

Default: []

This option allows you to use custom watch plugins. Read more about watch plugins here.

Examples of watch plugins include:

jest-watch-master
jest-watch-select-projects
jest-watch-suspend
jest-watch-typeahead
jest-watch-yarn-workspaces
INFO
The values in the watchPlugins property value can omit the jest-watch- prefix of the package name.
watchman [boolean]

Default: true

Whether to use watchman for file crawling.

workerIdleMemoryLimit [number|string]

Default: undefined

Specifies the memory limit for workers before they are recycled and is primarily a work-around for this issue;

After the worker has executed a test the memory usage of it is checked. If it exceeds the value specified the worker is killed and restarted. The limit can be specified in a number of different ways and whatever the result is Math.floor is used to turn it into an integer value:

<= 1 - The value is assumed to be a percentage of system memory. So 0.5 sets the memory limit of the worker to half of the total system memory
\> 1 - Assumed to be a fixed byte value. Because of the previous rule if you wanted a value of 1 byte (I don't know why) you could use 1.1.
With units
50% - As above, a percentage of total system memory
100KB, 65MB, etc - With units to denote a fixed memory limit.
K / KB - Kilobytes (x1000)
KiB - Kibibytes (x1024)
M / MB - Megabytes
MiB - Mebibytes
G / GB - Gigabytes
GiB - Gibibytes
CAUTION
Percentage based memory limit does not work on Linux CircleCI workers due to incorrect system memory being reported.
JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  workerIdleMemoryLimit: 0.2,
};

module.exports = config;

// [string]

This option allows comments in package.json. Include the comment text as the value of this key:

package.json
{
  "name": "my-project",
  "jest": {
    "//": "Comment goes here",
    "verbose": true
  }
}

workerThreads

Default: false

Whether to use worker threads for parallelization. Child processes are used by default.

Using worker threads may help to improve performance.

CAUTION
This is experimental feature. Keep in mind that the worker threads use structured clone instead of JSON.stringify() to serialize messages. This means that built-in JavaScript objects as BigInt, Map or Set will get serialized properly. However extra properties set on Error, Map or Set will not be passed on through the serialization step. For more details see the article on structured clone.


The Jest Object

The jest object is automatically in scope within every test file. The methods in the jest object help create mocks and let you control Jest's overall behavior. It can also be imported explicitly by via import {jest} from '@jest/globals'.

INFO
The TypeScript examples from this page will only work as documented if you explicitly import Jest APIs:

import {expect, jest, test} from '@jest/globals';

Consult the Getting Started guide for details on how to setup Jest with TypeScript.
Methods

Mock Modules
jest.disableAutomock()
jest.enableAutomock()
jest.createMockFromModule(moduleName)
jest.mock(moduleName, factory, options)
jest.Mocked<Source>
jest.mocked(source, options?)
jest.unmock(moduleName)
jest.deepUnmock(moduleName)
jest.doMock(moduleName, factory, options)
jest.dontMock(moduleName)
jest.setMock(moduleName, moduleExports)
jest.requireActual(moduleName)
jest.requireMock(moduleName)
jest.resetModules()
jest.isolateModules(fn)
jest.isolateModulesAsync(fn)
Mock Functions
jest.fn(implementation?)
jest.isMockFunction(fn)
jest.replaceProperty(object, propertyKey, value)
jest.spyOn(object, methodName)
jest.spyOn(object, methodName, accessType?)
jest.Replaced<Source>
jest.Spied<Source>
jest.clearAllMocks()
jest.resetAllMocks()
jest.restoreAllMocks()
Fake Timers
jest.useFakeTimers(fakeTimersConfig?)
jest.useRealTimers()
jest.runAllTicks()
jest.runAllTimers()
jest.runAllTimersAsync()
jest.runAllImmediates()
jest.advanceTimersByTime(msToRun)
jest.advanceTimersByTimeAsync(msToRun)
jest.runOnlyPendingTimers()
jest.runOnlyPendingTimersAsync()
jest.advanceTimersToNextTimer(steps)
jest.advanceTimersToNextTimerAsync(steps)
jest.clearAllTimers()
jest.getTimerCount()
jest.now()
jest.setSystemTime(now?: number | Date)
jest.getRealSystemTime()
Misc
jest.getSeed()
jest.isEnvironmentTornDown()
jest.retryTimes(numRetries, options?)
jest.setTimeout(timeout)
Mock Modules

jest.disableAutomock()

Disables automatic mocking in the module loader.

INFO
Automatic mocking should be enabled via automock configuration option for this method to have any effect. Also see documentation of the configuration option for more details.

JavaScript
TypeScript
/** @type {import('jest').Config} */
const config = {
  automock: true,
};

module.exports = config;

After disableAutomock() is called, all require()s will return the real versions of each module (rather than a mocked version).

utils.js
export default {
  authorize: () => {
    return 'token';
  },
};

__tests__/disableAutomocking.js
import utils from '../utils';

jest.disableAutomock();

test('original implementation', () => {
  // now we have the original implementation,
  // even if we set the automocking in a jest configuration
  expect(utils.authorize()).toBe('token');
});

This is usually useful when you have a scenario where the number of dependencies you want to mock is far less than the number of dependencies that you don't. For example, if you're writing a test for a module that uses a large number of dependencies that can be reasonably classified as "implementation details" of the module, then you likely do not want to mock them.

Examples of dependencies that might be considered "implementation details" are things ranging from language built-ins (e.g. Array.prototype methods) to highly common utility methods (e.g. underscore, lodash, array utilities, etc) and entire libraries like React.js.

Returns the jest object for chaining.

TIP
When using babel-jest, calls to disableAutomock() will automatically be hoisted to the top of the code block. Use autoMockOff() if you want to explicitly avoid this behavior.
jest.enableAutomock()

Enables automatic mocking in the module loader.

INFO
For more details on automatic mocking see documentation of automock configuration option.
Example:

utils.js
export default {
  authorize: () => {
    return 'token';
  },
  isAuthorized: secret => secret === 'wizard',
};

__tests__/enableAutomocking.js
jest.enableAutomock();

import utils from '../utils';

test('original implementation', () => {
  // now we have the mocked implementation,
  expect(utils.authorize._isMockFunction).toBeTruthy();
  expect(utils.isAuthorized._isMockFunction).toBeTruthy();
});

Returns the jest object for chaining.

TIP
When using babel-jest, calls to enableAutomock will automatically be hoisted to the top of the code block. Use autoMockOn if you want to explicitly avoid this behavior.
jest.createMockFromModule(moduleName)

Given the name of a module, use the automatic mocking system to generate a mocked version of the module for you.

This is useful when you want to create a manual mock that extends the automatic mock's behavior:

JavaScript
TypeScript
utils.js
module.exports = {
  authorize: () => {
    return 'token';
  },
  isAuthorized: secret => secret === 'wizard',
};

__tests__/createMockFromModule.test.js
const utils = jest.createMockFromModule('../utils');

utils.isAuthorized = jest.fn(secret => secret === 'not wizard');

test('implementation created by jest.createMockFromModule', () => {
  expect(jest.isMockFunction(utils.authorize)).toBe(true);
  expect(utils.isAuthorized('not wizard')).toBe(true);
});

This is how createMockFromModule will mock the following data types:

Function

Creates a new mock function. The new function has no formal parameters and when called will return undefined. This functionality also applies to async functions.

Class

Creates a new class. The interface of the original class is maintained, all of the class member functions and properties will be mocked.

Object

Creates a new deeply cloned object. The object keys are maintained and their values are mocked.

Array

Creates a new empty array, ignoring the original.

Primitives

Creates a new property with the same primitive value as the original property.

Example:

example.js
module.exports = {
  function: function square(a, b) {
    return a * b;
  },
  asyncFunction: async function asyncSquare(a, b) {
    const result = (await a) * b;
    return result;
  },
  class: new (class Bar {
    constructor() {
      this.array = [1, 2, 3];
    }
    foo() {}
  })(),
  object: {
    baz: 'foo',
    bar: {
      fiz: 1,
      buzz: [1, 2, 3],
    },
  },
  array: [1, 2, 3],
  number: 123,
  string: 'baz',
  boolean: true,
  symbol: Symbol.for('a.b.c'),
};

__tests__/example.test.js
const example = jest.createMockFromModule('../example');

test('should run example code', () => {
  // creates a new mocked function with no formal arguments.
  expect(example.function.name).toBe('square');
  expect(example.function).toHaveLength(0);

  // async functions get the same treatment as standard synchronous functions.
  expect(example.asyncFunction.name).toBe('asyncSquare');
  expect(example.asyncFunction).toHaveLength(0);

  // creates a new class with the same interface, member functions and properties are mocked.
  expect(example.class.constructor.name).toBe('Bar');
  expect(example.class.foo.name).toBe('foo');
  expect(example.class.array).toHaveLength(0);

  // creates a deeply cloned version of the original object.
  expect(example.object).toEqual({
    baz: 'foo',
    bar: {
      fiz: 1,
      buzz: [],
    },
  });

  // creates a new empty array, ignoring the original array.
  expect(example.array).toHaveLength(0);

  // creates a new property with the same primitive value as the original property.
  expect(example.number).toBe(123);
  expect(example.string).toBe('baz');
  expect(example.boolean).toBe(true);
  expect(example.symbol).toEqual(Symbol.for('a.b.c'));
});


jest.mock(moduleName, factory, options)

Mocks a module with an auto-mocked version when it is being required. factory and options are optional. For example:

banana.js
module.exports = () => 'banana';

__tests__/test.js
jest.mock('../banana');

const banana = require('../banana'); // banana will be explicitly mocked.

banana(); // will return 'undefined' because the function is auto-mocked.

The second argument can be used to specify an explicit module factory that is being run instead of using Jest's automocking feature:

JavaScript
TypeScript
jest.mock('../moduleName', () => {
  return jest.fn(() => 42);
});

// This runs the function specified as second argument to `jest.mock`.
const moduleName = require('../moduleName');
moduleName(); // Will return '42';

When using the factory parameter for an ES6 module with a default export, the __esModule: true property needs to be specified. This property is normally generated by Babel / TypeScript, but here it needs to be set manually. When importing a default export, it's an instruction to import the property named default from the export object:

import moduleName, {foo} from '../moduleName';

jest.mock('../moduleName', () => {
  return {
    __esModule: true,
    default: jest.fn(() => 42),
    foo: jest.fn(() => 43),
  };
});

moduleName(); // Will return 42
foo(); // Will return 43

The third argument can be used to create virtual mocks – mocks of modules that don't exist anywhere in the system:

jest.mock(
  '../moduleName',
  () => {
    /*
     * Custom implementation of a module that doesn't exist in JS,
     * like a generated module or a native module in react-native.
     */
  },
  {virtual: true},
);

CAUTION
Importing a module in a setup file (as specified by setupFilesAfterEnv) will prevent mocking for the module in question, as well as all the modules that it imports.
Modules that are mocked with jest.mock are mocked only for the file that calls jest.mock. Another file that imports the module will get the original implementation even if it runs after the test file that mocks the module.

Returns the jest object for chaining.

TIP
Writing tests in TypeScript? Use the jest.Mocked utility type or the jest.mocked() helper method to have your mocked modules typed.
jest.Mocked<Source>

See TypeScript Usage chapter of Mock Functions page for documentation.

jest.mocked(source, options?)

See TypeScript Usage chapter of Mock Functions page for documentation.

jest.unmock(moduleName)

Indicates that the module system should never return a mocked version of the specified module from require() (e.g. that it should always return the real module).

The most common use of this API is for specifying the module a given test intends to be testing (and thus doesn't want automatically mocked).

Returns the jest object for chaining.

jest.deepUnmock(moduleName)

Indicates that the module system should never return a mocked version of the specified module and its dependencies.

Returns the jest object for chaining.

jest.doMock(moduleName, factory, options)

When using babel-jest, calls to mock will automatically be hoisted to the top of the code block. Use this method if you want to explicitly avoid this behavior.

One example when this is useful is when you want to mock a module differently within the same file:

JavaScript
TypeScript
beforeEach(() => {
  jest.resetModules();
});

test('moduleName 1', () => {
  jest.doMock('../moduleName', () => {
    return jest.fn(() => 1);
  });
  const moduleName = require('../moduleName');
  expect(moduleName()).toBe(1);
});

test('moduleName 2', () => {
  jest.doMock('../moduleName', () => {
    return jest.fn(() => 2);
  });
  const moduleName = require('../moduleName');
  expect(moduleName()).toBe(2);
});

Using jest.doMock() with ES6 imports requires additional steps. Follow these if you don't want to use require in your tests:

We have to specify the __esModule: true property (see the jest.mock() API for more information).
Static ES6 module imports are hoisted to the top of the file, so instead we have to import them dynamically using import().
Finally, we need an environment which supports dynamic importing. Please see Using Babel for the initial setup. Then add the plugin babel-plugin-dynamic-import-node, or an equivalent, to your Babel config to enable dynamic importing in Node.
beforeEach(() => {
  jest.resetModules();
});

test('moduleName 1', () => {
  jest.doMock('../moduleName', () => {
    return {
      __esModule: true,
      default: 'default1',
      foo: 'foo1',
    };
  });
  return import('../moduleName').then(moduleName => {
    expect(moduleName.default).toBe('default1');
    expect(moduleName.foo).toBe('foo1');
  });
});

test('moduleName 2', () => {
  jest.doMock('../moduleName', () => {
    return {
      __esModule: true,
      default: 'default2',
      foo: 'foo2',
    };
  });
  return import('../moduleName').then(moduleName => {
    expect(moduleName.default).toBe('default2');
    expect(moduleName.foo).toBe('foo2');
  });
});

Returns the jest object for chaining.

jest.dontMock(moduleName)

When using babel-jest, calls to unmock will automatically be hoisted to the top of the code block. Use this method if you want to explicitly avoid this behavior.

Returns the jest object for chaining.

jest.setMock(moduleName, moduleExports)

Explicitly supplies the mock object that the module system should return for the specified module.

On occasion, there are times where the automatically generated mock the module system would normally provide you isn't adequate enough for your testing needs. Normally under those circumstances you should write a manual mock that is more adequate for the module in question. However, on extremely rare occasions, even a manual mock isn't suitable for your purposes and you need to build the mock yourself inside your test.

In these rare scenarios you can use this API to manually fill the slot in the module system's mock-module registry.

Returns the jest object for chaining.

INFO
It is recommended to use jest.mock() instead. The jest.mock API's second argument is a module factory instead of the expected exported module object.
jest.requireActual(moduleName)

Returns the actual module instead of a mock, bypassing all checks on whether the module should receive a mock implementation or not.

JavaScript
TypeScript
jest.mock('../myModule', () => {
  // Require the original module to not be mocked...
  const originalModule = jest.requireActual('../myModule');

  return {
    __esModule: true, // Use it when dealing with esModules
    ...originalModule,
    getRandom: jest.fn(() => 10),
  };
});

const getRandom = require('../myModule').getRandom;

getRandom(); // Always returns 10

jest.requireMock(moduleName)

Returns a mock module instead of the actual module, bypassing all checks on whether the module should be required normally or not.

jest.resetModules()

Resets the module registry - the cache of all required modules. This is useful to isolate modules where local state might conflict between tests.

Example:

const sum1 = require('../sum');
jest.resetModules();
const sum2 = require('../sum');
sum1 === sum2;
// > false (Both sum modules are separate "instances" of the sum module.)

Example in a test:

beforeEach(() => {
  jest.resetModules();
});

test('works', () => {
  const sum = require('../sum');
});

test('works too', () => {
  const sum = require('../sum');
  // sum is a different copy of the sum module from the previous test.
});

Returns the jest object for chaining.

jest.isolateModules(fn)

jest.isolateModules(fn) goes a step further than jest.resetModules() and creates a sandbox registry for the modules that are loaded inside the callback function. This is useful to isolate specific modules for every test so that local module state doesn't conflict between tests.

let myModule;
jest.isolateModules(() => {
  myModule = require('myModule');
});

const otherCopyOfMyModule = require('myModule');

jest.isolateModulesAsync(fn)

jest.isolateModulesAsync() is the equivalent of jest.isolateModules(), but for async callbacks. The caller is expected to await the completion of isolateModulesAsync.

let myModule;
await jest.isolateModulesAsync(async () => {
  myModule = await import('myModule');
  // do async stuff here
});

const otherCopyOfMyModule = await import('myModule');

Mock Functions

jest.fn(implementation?)

Returns a new, unused mock function. Optionally takes a mock implementation.

const mockFn = jest.fn();
mockFn();
expect(mockFn).toHaveBeenCalled();

// With a mock implementation:
const returnsTrue = jest.fn(() => true);
console.log(returnsTrue()); // true;

TIP
See the Mock Functions page for details on TypeScript usage.
jest.isMockFunction(fn)

Determines if the given function is a mocked function.

jest.replaceProperty(object, propertyKey, value)

Replace object[propertyKey] with a value. The property must already exist on the object. The same property might be replaced multiple times. Returns a Jest replaced property.

NOTE
To mock properties that are defined as getters or setters, use jest.spyOn(object, methodName, accessType) instead. To mock functions, use jest.spyOn(object, methodName) instead.
TIP
All properties replaced with jest.replaceProperty could be restored to the original value by calling jest.restoreAllMocks on afterEach method.
Example:

const utils = {
  isLocalhost() {
    return process.env.HOSTNAME === 'localhost';
  },
};

module.exports = utils;

Example test:

const utils = require('./utils');

afterEach(() => {
  // restore replaced property
  jest.restoreAllMocks();
});

test('isLocalhost returns true when HOSTNAME is localhost', () => {
  jest.replaceProperty(process, 'env', {HOSTNAME: 'localhost'});
  expect(utils.isLocalhost()).toBe(true);
});

test('isLocalhost returns false when HOSTNAME is not localhost', () => {
  jest.replaceProperty(process, 'env', {HOSTNAME: 'not-localhost'});
  expect(utils.isLocalhost()).toBe(false);
});

jest.spyOn(object, methodName)

Creates a mock function similar to jest.fn but also tracks calls to object[methodName]. Returns a Jest mock function.

NOTE
By default, jest.spyOn also calls the spied method. This is different behavior from most other test libraries. If you want to overwrite the original function, you can use jest.spyOn(object, methodName).mockImplementation(() => customImplementation) or object[methodName] = jest.fn(() => customImplementation).
TIP
Since jest.spyOn is a mock, you could restore the initial state by calling jest.restoreAllMocks in the body of the callback passed to the afterEach hook.
Example:

const video = {
  play() {
    return true;
  },
};

module.exports = video;

Example test:

const video = require('./video');

afterEach(() => {
  // restore the spy created with spyOn
  jest.restoreAllMocks();
});

test('plays video', () => {
  const spy = jest.spyOn(video, 'play');
  const isPlaying = video.play();

  expect(spy).toHaveBeenCalled();
  expect(isPlaying).toBe(true);
});

jest.spyOn(object, methodName, accessType?)

Since Jest 22.1.0+, the jest.spyOn method takes an optional third argument of accessType that can be either 'get' or 'set', which proves to be useful when you want to spy on a getter or a setter, respectively.

Example:

const video = {
  // it's a getter!
  get play() {
    return true;
  },
};

module.exports = video;

const audio = {
  _volume: false,
  // it's a setter!
  set volume(value) {
    this._volume = value;
  },
  get volume() {
    return this._volume;
  },
};

module.exports = audio;

Example test:

const audio = require('./audio');
const video = require('./video');

afterEach(() => {
  // restore the spy created with spyOn
  jest.restoreAllMocks();
});

test('plays video', () => {
  const spy = jest.spyOn(video, 'play', 'get'); // we pass 'get'
  const isPlaying = video.play;

  expect(spy).toHaveBeenCalled();
  expect(isPlaying).toBe(true);
});

test('plays audio', () => {
  const spy = jest.spyOn(audio, 'volume', 'set'); // we pass 'set'
  audio.volume = 100;

  expect(spy).toHaveBeenCalled();
  expect(audio.volume).toBe(100);
});

jest.Replaced<Source>

See TypeScript Usage chapter of Mock Functions page for documentation.

jest.Spied<Source>

See TypeScript Usage chapter of Mock Functions page for documentation.

jest.clearAllMocks()

Clears the mock.calls, mock.instances, mock.contexts and mock.results properties of all mocks. Equivalent to calling .mockClear() on every mocked function.

Returns the jest object for chaining.

jest.resetAllMocks()

Resets the state of all mocks. Equivalent to calling .mockReset() on every mocked function.

Returns the jest object for chaining.

jest.restoreAllMocks()

Restores all mocks and replaced properties back to their original value. Equivalent to calling .mockRestore() on every mocked function and .restore() on every replaced property. Beware that jest.restoreAllMocks() only works for mocks created with jest.spyOn() and properties replaced with jest.replaceProperty(); other mocks will require you to manually restore them.

Fake Timers

jest.useFakeTimers(fakeTimersConfig?)

Instructs Jest to use fake versions of the global date, performance, time and timer APIs. Fake timers implementation is backed by @sinonjs/fake-timers.

Fake timers will swap out Date, performance.now(), queueMicrotask(), setImmediate(), clearImmediate(), setInterval(), clearInterval(), setTimeout(), clearTimeout() with an implementation that gets its time from the fake clock.

In Node environment process.hrtime, process.nextTick() and in JSDOM environment requestAnimationFrame(), cancelAnimationFrame(), requestIdleCallback(), cancelIdleCallback() will be replaced as well.

Configuration options:

type FakeableAPI =
  | 'Date'
  | 'hrtime'
  | 'nextTick'
  | 'performance'
  | 'queueMicrotask'
  | 'requestAnimationFrame'
  | 'cancelAnimationFrame'
  | 'requestIdleCallback'
  | 'cancelIdleCallback'
  | 'setImmediate'
  | 'clearImmediate'
  | 'setInterval'
  | 'clearInterval'
  | 'setTimeout'
  | 'clearTimeout';

type FakeTimersConfig = {
  /**
   * If set to `true` all timers will be advanced automatically by 20 milliseconds
   * every 20 milliseconds. A custom time delta may be provided by passing a number.
   * The default is `false`.
   */
  advanceTimers?: boolean | number;
  /**
   * List of names of APIs that should not be faked. The default is `[]`, meaning
   * all APIs are faked.
   */
  doNotFake?: Array<FakeableAPI>;
  /**
   * Use the old fake timers implementation instead of one backed by `@sinonjs/fake-timers`.
   * The default is `false`.
   */
  legacyFakeTimers?: boolean;
  /** Sets current system time to be used by fake timers, in milliseconds. The default is `Date.now()`. */
  now?: number | Date;
  /**
   * The maximum number of recursive timers that will be run when calling `jest.runAllTimers()`.
   * The default is `100_000` timers.
   */
  timerLimit?: number;
};


Calling jest.useFakeTimers() will use fake timers for all tests within the file, until original timers are restored with jest.useRealTimers().

You can call jest.useFakeTimers() or jest.useRealTimers() from anywhere: top level, inside an test block, etc. Keep in mind that this is a global operation and will affect other tests within the same file. Calling jest.useFakeTimers() once again in the same test file would reset the internal state (e.g. timer count) and reinstall fake timers using the provided options:

test('advance the timers automatically', () => {
  jest.useFakeTimers({advanceTimers: true});
  // ...
});

test('do not advance the timers and do not fake `performance`', () => {
  jest.useFakeTimers({doNotFake: ['performance']});
  // ...
});

test('uninstall fake timers for the rest of tests in the file', () => {
  jest.useRealTimers();
  // ...
});

LEGACY FAKE TIMERS
For some reason you might have to use legacy implementation of fake timers. It can be enabled like this (additional options are not supported):

jest.useFakeTimers({
  legacyFakeTimers: true,
});

Legacy fake timers will swap out setImmediate(), clearImmediate(), setInterval(), clearInterval(), setTimeout(), clearTimeout() with Jest mock functions. In Node environment process.nextTick() and in JSDOM environment requestAnimationFrame(), cancelAnimationFrame() will be also replaced.
Returns the jest object for chaining.

jest.useRealTimers()

Instructs Jest to restore the original implementations of the global date, performance, time and timer APIs. For example, you may call jest.useRealTimers() inside afterEach hook to restore timers after each test:

afterEach(() => {
  jest.useRealTimers();
});

test('do something with fake timers', () => {
  jest.useFakeTimers();
  // ...
});

test('do something with real timers', () => {
  // ...
});

Returns the jest object for chaining.

jest.runAllTicks()

Exhausts the micro-task queue (usually interfaced in node via process.nextTick).

When this API is called, all pending micro-tasks that have been queued via process.nextTick will be executed. Additionally, if those micro-tasks themselves schedule new micro-tasks, those will be continually exhausted until there are no more micro-tasks remaining in the queue.

jest.runAllTimers()

Exhausts both the macro-task queue (i.e., all tasks queued by setTimeout(), setInterval(), and setImmediate()) and the micro-task queue (usually interfaced in node via process.nextTick).

When this API is called, all pending macro-tasks and micro-tasks will be executed. If those tasks themselves schedule new tasks, those will be continually exhausted until there are no more tasks remaining in the queue.

This is often useful for synchronously executing setTimeouts during a test in order to synchronously assert about some behavior that would only happen after the setTimeout() or setInterval() callbacks executed. See the Timer mocks doc for more information.

jest.runAllTimersAsync()

Asynchronous equivalent of jest.runAllTimers(). It allows any scheduled promise callbacks to execute before running the timers.

INFO
This function is not available when using legacy fake timers implementation.
jest.runAllImmediates()

Exhausts all tasks queued by setImmediate().

INFO
This function is only available when using legacy fake timers implementation.
jest.advanceTimersByTime(msToRun)

Executes only the macro task queue (i.e. all tasks queued by setTimeout() or setInterval() and setImmediate()).

When this API is called, all timers are advanced by msToRun milliseconds. All pending "macro-tasks" that have been queued via setTimeout() or setInterval(), and would be executed within this time frame will be executed. Additionally, if those macro-tasks schedule new macro-tasks that would be executed within the same time frame, those will be executed until there are no more macro-tasks remaining in the queue, that should be run within msToRun milliseconds.

jest.advanceTimersByTimeAsync(msToRun)

Asynchronous equivalent of jest.advanceTimersByTime(msToRun). It allows any scheduled promise callbacks to execute before running the timers.

INFO
This function is not available when using legacy fake timers implementation.
jest.runOnlyPendingTimers()

Executes only the macro-tasks that are currently pending (i.e., only the tasks that have been queued by setTimeout() or setInterval() up to this point). If any of the currently pending macro-tasks schedule new macro-tasks, those new tasks will not be executed by this call.

This is useful for scenarios such as one where the module being tested schedules a setTimeout() whose callback schedules another setTimeout() recursively (meaning the scheduling never stops). In these scenarios, it's useful to be able to run forward in time by a single step at a time.

jest.runOnlyPendingTimersAsync()

Asynchronous equivalent of jest.runOnlyPendingTimers(). It allows any scheduled promise callbacks to execute before running the timers.

INFO
This function is not available when using legacy fake timers implementation.
jest.advanceTimersToNextTimer(steps)

Advances all timers by the needed milliseconds so that only the next timeouts/intervals will run.

Optionally, you can provide steps, so it will run steps amount of next timeouts/intervals.

jest.advanceTimersToNextTimerAsync(steps)

Asynchronous equivalent of jest.advanceTimersToNextTimer(steps). It allows any scheduled promise callbacks to execute before running the timers.

INFO
This function is not available when using legacy fake timers implementation.
jest.clearAllTimers()

Removes any pending timers from the timer system.

This means, if any timers have been scheduled (but have not yet executed), they will be cleared and will never have the opportunity to execute in the future.

jest.getTimerCount()

Returns the number of fake timers still left to run.

jest.now()

Returns the time in ms of the current clock. This is equivalent to Date.now() if real timers are in use, or if Date is mocked. In other cases (such as legacy timers) it may be useful for implementing custom mocks of Date.now(), performance.now(), etc.

jest.setSystemTime(now?: number | Date)

Set the current system time used by fake timers. Simulates a user changing the system clock while your program is running. It affects the current time but it does not in itself cause e.g. timers to fire; they will fire exactly as they would have done without the call to jest.setSystemTime().

INFO
This function is not available when using legacy fake timers implementation.
jest.getRealSystemTime()

When mocking time, Date.now() will also be mocked. If you for some reason need access to the real current time, you can invoke this function.

INFO
This function is not available when using legacy fake timers implementation.
Misc

jest.getSeed()

Every time Jest runs a seed value is randomly generated which you could use in a pseudorandom number generator or anywhere else.

TIP
Use the --showSeed flag to print the seed in the test report summary. To manually set the value of the seed use --seed=<num> CLI argument.
jest.isEnvironmentTornDown()

Returns true if test environment has been torn down.

jest.retryTimes(numRetries, options?)

Runs failed tests n-times until they pass or until the max number of retries is exhausted.

jest.retryTimes(3);

test('will fail', () => {
  expect(true).toBe(false);
});

If logErrorsBeforeRetry option is enabled, error(s) that caused the test to fail will be logged to the console.

jest.retryTimes(3, {logErrorsBeforeRetry: true});

test('will fail', () => {
  expect(true).toBe(false);
});

Returns the jest object for chaining.

CAUTION
jest.retryTimes() must be declared at the top level of a test file or in a describe block.
INFO
This function is only available with the default jest-circus runner.
jest.setTimeout(timeout)

Set the default timeout interval (in milliseconds) for all tests and before/after hooks in the test file. This only affects the test file from which this function is called. The default timeout interval is 5 seconds if this method is not called.

Example:

jest.setTimeout(1000); // 1 second

TIP
To set timeout intervals on different tests in the same file, use the timeout option on each individual test.

If you want to set the timeout for all test files, use testTimeout configuration option.
