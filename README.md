# Jazillionth

**JavaScript's Zillionth Testing Harness**


<img src="logo.png">



## Core idea

Jazillionth is a light-weight, non-intrusive, easy-to-use testing harness for automatically testing your JavaScript;

* **Light-weight**: Jazillionth comes bundled in a single JavaScript file.  It only depends on jQuery being accessible but has no other dependencies.
* **Non-intrusive**: you do not need to add anything to the pages and scripts you want to test.  Jazillionth wraps your pages and scripts, and all of your testing code lives in a test suite wrapper around your pages.
* **Easy-to-use**: you only need to create a simple test suite page which links to jQuery and Jazillionth, set up a Jazillionth object on it, and register your pages and tests with this object.  Next, just open the test suite page in your browser, and all tests should run automatically.  Done!

As expected, Jazillionth doesn't promise the world and beyond, but that makes it very light weight in use and probably Good Enough for most scenarios.

All use cases are explained in the chapters below, and examples are shown in the chapter <a href="#examples">Examples</a>.



## Obligatory disclaimer

Compared to other simple testing harnesses, the only 'complicated' thing Jazillionth does is load the pages to test in an iframe.  Other testing harnesses require you to add the testing code onto the actual pages themselves.  This means you need to have mechanisms in place to strip this testing code out of your pages again once they are ready to be put into production.  By loading the pages into an iframe, your pages can remain totally oblivious to the test suite you wrap around it.  This also makes it much more likely your pages are truly tested stand-alone and do not unknowingly rely on the testing code itself to be present (even in production).

This does however have drawbacks.

Due to browser security measures (Same Origin policy), both the test suite page and the page under test must be served from the same domain.  One can get around this by using `postMessage`, but that is out of scope for Jazillionth.

Local files (opening files with the `file://` protocol) are not testable either.  However, see the chapter <a href="#setupSimpleServer">Testing without a dedicated web server</a> for instructions on how to overcome this one.

And last (but certainly not least), both the test suite page as well as the pages under test running in the iframe have their own scripts.  But the test suite page's script should not run before the page under test's script has run.  Jazillionth seems to get this right, but I have so far not been able to get absolute guarantees that the way Jazillionth manages this is a sure-fire way to ascertain this behavior.  If Jazillionth's tests run before your page under test's scripts have run, please let me know!



## Terms and names used in this document

This document refers to two pages: the test suite page and the page under test.  The former is the page you use to drive all tests, while the latter is the page being tested.

In this document all Jazillionth object instances are named `jazil` for consistency, but you're free to name it whatever you want.  This name reappears as the name of the central Jazillionth object as well as the name of the argument passed into all callback functions.



## Creating the test suite page

Jazillionth doesn't require much from the test suite page.  The bare minimum needed on that page is as follows, in the given order:

1. link to a recent-ish version of jQuery,
2. link to Jazillionth,
3. link to or inline your own testing code,
4. create (and optionally configure) a Jazillionth object, and
5. tell your Jazillionth object what tests to perform on which pages.

By default, Jazillionth doesn't need anything else regarding the test suite page's content.  In the simplest use case it will:

* wait for the test suite page to be ready,
* attach an iframe to the test suite page,
* for all pages under test:
  * load the next page under test in that iframe,
  * wait for that page to fully load,
  * run all tests for that page.
* show the test results at the top of the test suite page, and
* depending on the overall test outcome, set the entire test suite page body background color to either the 'pass' or 'fail' color.

If you want to add extra content to the test suite page you are free to do so.  You can add an iframe to load the page under test into and tell Jazillionth to use that.  You can also tell Jazillionth where to place the test result, directing it to an existing HTML element instead.  And the used colors are tweakable too.  And you can add pre and post test handlers to really tweak the test flow, pausing the tests where needed.  See the chapter <a href="#tweaking">Tweaking and advanced functionality</a> for more details.



## Starting up Jazillionth

Before you can register your tests, you have to start up Jazillionth.  You do this by creating a single Jazillionth variable.  You can make this a global variable so that the rest of your scripts can access it automatically, though every time Jazillionth calls back on you it will pass the actual Jazillionth object in as an argument too.

When creating the Jazillionth object, you can also pass in an 'options' argument to further tweak Jazillionth.  See the chapter <a href="#tweaking">Tweaking and advanced functionality</a> for more details on this.

So basically, you must only add:

`let jazil = new Jazillionth()`

and Jazillionth is up-and-running, waiting for pages and tests to be registered.



## Registering and defining tests

Jazillionth allows you to test multiple pages in one go, each with its own sets of tests.  First you add a page to test, then you add test set(s) to that page to test; these test sets hold the individual test functions themselves.  The object hierarchy thus becomes:

* 0 or more test pages (TestPage objects)
  * 0 or more test sets (TestSet objects)
    * 0 or more test functions (dictionary of test functions)

To add a page to test, call `AddPageToTest(name, url[, accessObjectNames])`;

* `name`: string<br>
  A reference name for use in the test result listing.
* `url`: string<br>
  The page's URL.
* `accessObjectNames`: array of string (optional)<br>
  A list of the names of the JavaScript objects to make available to your test scripts.

`AddPageToTest` returns the created TestPage object to you.  You must use this to later register test sets for it.  You can also access it's properties wherever you encounter it in your callback functions and test functions.  These are:

* `name`: string<br>
  The specified name.
* `url`: string<br>
  The specified URL.
* `accessObjectNames`: array of string, or `undefined`<br>
  The specified names to access.  If you passed no names, this property will be set to `undefined`.
* `testSets`: array of TestSet objects<br>
  All test sets you registered for this page under test (see below).

Example:

```js
let mainPage = jazil.AddPageToTest('Main page', '/path/to/main-page-to-test.html')
```

With this TestPage variable `mainPage` in hand, you are ready to add one or more named test sets to it.  When listing the test results, these test sets form logical sections in the result listing.  This allows you to, for example, define a different test set per tested module in that page to make the test result listing line up nicely with your internal code structure for an easier overview.

Test sets themselves are a combination of a name and a simple dictionary holding the test functions.  In this dictionary, each key is the name of the individual test function, and each value is the function performing that test.  You register test sets with Jazillionth by calling `AddTestSet(testPage, name, testFunctions)`;

* `testPage`: TestPage object<br>
  The TestPage object you got from calling `AddPageToTest`, representing the page to test to add the test set to.
* `name`: string<br>
  The name of the test set.
* `testFunctions`: dictionary of test functions<br>
  All test functions you run in this test set, indexed by their name.

The resulting TestSet object will get the following properties:

* `name`: string<br>
  The name you specified.
* `tests`: dictionary of test functions<br>
  The test function dictionary you specified.

The test functions themselves should have the following signature;

```js
function(jazil, testName, testSet, testPage) {
}
```

The function arguments are:
* `jazil`: Jazillionth object<br>
  The actual Jazillionth object performing the tests.
* `testName`: string<br>
  The name under which this test function was registered in the test function dictionary.
* `testSet`: TestSet object<br>
  The test set object the test function belongs to.
* `testPage`: TestPage object<br>
  The test page object the test set belongs to.

You do not need to return anything from a test function.  Also note that if you have no use for the latter arguments, you do not need to add them to your test function signature.

Example:

```js
let tests = {
  'Test X': function(jazil) {
    // test X comes here
  },
  'Test Y': function(jazil, testName, testSet, testPage) {
    // test Y comes here
    // testName should be 'Test Y'
    // testSet should be the TestSet object we're part of
    // testPage should be the TestPage object we got from AddPageToTest (stored in mainPage)
  }
}
jazil.AddTestSet(mainPage, 'Main tests', tests)
```

Note that the passed in Jazillionth object and the one you created yourself are really the same thing.

Inside your test functions you perform the actual test(s) using the appropriate assertion functions on the given `jazil` object.  The results of your tests are implicitly determined by the result of these assertion functions.  You therefore do not need to return anything from your function; if all tests pass (so no assertion function got triggered), the test function itself is marked as passed too.  Do note that as soon as an assertion function fails, the rest of the code in your test function after the call to that assertion function will not execute anymore.

The following assertion functions can be used:

* `jazil.Fail(message)`<br>
  Fails with the given message.
* `jazil.Assert(condition, message)`<br>
  Asserts the given condition holds, failing with the given message if not.
* `jazil.ShouldBe(value, expected, message)`<br>
  Checks if the given value equals the expected value, failing with the given message if not.  Equality is checked using the normal `==` operator.  The message is augmented to show what value was given and what was expected.
* `jazil.ShouldNotBe(value, expected, message)`<br>
  The opposite of `jazil.ShouldBe`.
* `jazil.ShouldBeStrict(value, expected, message)`<br>
  Identical to `jazil.ShouldBe` but uses a `===` strict equality comparison instead.
* `jazil.ShouldNotBeStrict(value, expected, message)`<br>
  The opposite of `jazil.ShouldBeStrict`.
* `jazil.ShouldBeBetween(value, expectedLower, expectedHigher, message)`<br>
  Checks if the given value falls within the expected value range, failing with the given message if not.  Bounds checking is done using the `>=` and '<=' operators.  The message is augmented to show what value was given and what was expected.
* `jazil.ShouldNotBeBetween(value, expectedLower, expectedHigher, message)`<br>
  The opposite of `jazil.ShouldBeBetween`.

Note that with all these assertion functions the message is optional.  Jazillionth will always show where the fail happened (file and line number), so if a test only has one single check the message is probably redundant (the test name and the details added by, for example, `ShouldBe` should say enough).  But if a test function calls more than one assertion function, the message can be used to easily pinpoint which assertion failed.

Note also that there is no opposite to `jazil.Fail`; if a test goes well, you do not have to report anything.



## Accessing the page under test

Since the page under test is loaded in a separate iframe, your testing scripts cannot easily access it's HTML content nor it's JavaScript functions and global variables, etc.  But Jazillionth will help out with this.

When adding a page to test you can tell Jazillionth to automatically make certain JavaScript objects available for direct use in your scripts.  Do this by specifying the `accessObjectNames` argument to `AddPageToTest`.  You should pass an array holding the names of all the JavaScript objects you want to access on that page.  Once that page has loaded, Jazillionth will try to access each one of these objects and make an alias to them under the test suite page's window.  After that these objects are accessible just as if they were declared in your own script.

A caveat here is that Jazillionth can only access JavaScript objects that are registered on the page under test's window object.  Functions are automatically added there, as well as global variables declared with `var`.  But global variables declared with `let` are not accessible.  If you want to access `let` declared variables in your testing scripts, either change them to `var` variables, or add an accessor function for them.

Jazillionth also makes two other objects accessible: the current page under test's `window` and `document` objects.  You can find these under `jazil.testDocument` and `jazil.testWindow` respectively.  You can use these to access, for example, the page under test's body content, the rest of the page under test's global JavaScript variables and functions, as well as the page's `location`, `history` and `localstorage` objects.



## Running the tests

After you created the test suite page, just open it in your browser.  Once the test suite page is fully loaded, Jazillionth will load all pages under test one by one.  For each page under test, once it is fully loaded, all tests in all registered test sets for that page will be executed automatically.  When all pages have been tested, Jazillionth will show the outcome of each test.  It will also adjust the test suite page's background color to the overall test outcome, whereby if only one test fails, the overall test outcome is a failure too.

And just press Refresh whenever you want to run the tests again!



<a name="advancedTestFlow"></a>
## Intervening in the test flow

Simple pages with simple content can be tested statically without problem.  The same goes for individual test sets which only perform tests on statically scoped test conditions.  For these tests it is OK to just run all tests on all pages back-to-back without interruption; this is what Jazillionth does by default.

However, when your test sets depend on user interaction, you can alter the test flow by using custom event handlers and/or starting/pausing/continuing the tests on your own terms.  These can all be controlled via initialization options.  The following mechanisms are in place for this:

* option `startAutomatically`<br>
  When you set this option to `false`, Jazillionth will not start automatically when the test suite page has loaded.  If you want the tests to start at another time (for example after pressing a button on the test suite page or after waiting for some AJAX request to finish first), you can set this to `false` and explicitly call `StartTests()` on the Jazillionth object when you are ready to start the tests.
* option `OnBeforePageTests`<br>
  A user-defined event handler to run before the test sets for each page under test have started.  By that time the page is fully loaded and ready, and Jazillionth has already accessed the page under test's details.  If you want to access additional content and functionality from the current page under test and perform some extra set-up before running your tests, you can do so in this event handler.<br>
  It's signature should be `OnBeforePageTests(jazil, testPage)`.  `jazil` is the fully set-up Jazillionth object doing the tests, and `testPage` is the TestPage object returned by the original call to `AddPageToTest`.  You can return `true` to stop all tests in their tracks at this point; returning in any other way will make the tests continue.
* option `OnAfterPageTests`<br>
  A user-defined event handler to run after each page under test is tested.  It's signature should be `OnAfterPageTests(jazil, testPage, testedOK)`.  `jazil` is the fully set-up Jazillionth object doing the tests, `testPage` is the TestPage object returned by the original call to `AddPageToTest`, and `testedOK` is a boolean indicating if all tests ran OK for this page.
* option `OnBeforeSetTests`<br>
  A user-defined event handler to run before the tests for each test set on a page under test have started.  If you want to access additional content and functionality from the current page under test and perform some extra set-up before running your tests, you can do so in this event handler.<br>
  It's signature should be `OnBeforeSetTests(jazil, testPage, testSet)`.  `jazil` is the fully set-up Jazillionth object doing the tests, `testPage` is the TestPage object returned by the original call to `AddPageToTest`, and `testSet` is the TestSet object returned by the original call to `AddTestSet`.  You can return `true` to stop all tests in their tracks at this point; returning in any other way will make the tests continue.
* option `OnAfterPageTests`<br>
  A user-defined function to run after each test set on a page under test is tested.  It's signature should be `OnAfterSetTests(jazil, testPage, testSet, testedOK)`.  `jazil` is the fully set-up Jazillionth object doing the tests, `testPage` is the TestPage object returned by the original call to `AddPageToTest`, `testSet` is the TestSet object returned by the original call to `AddTestSet`, and `testedOK` is a boolean indicating if all tests ran OK for this test set.

If you let Jazillionth pause it's testing, then you can continue the tests at a later time by calling `ContinueTests` on the Jazillionth object.  For a more finely controlled code execution flow you can pass an optional boolean argument to indicate you want a delayed continuation.  With delayed continuation the tests will only resume running after your current script is done.  (This is arranged via a setTimeout with a delay of zero.)



<a name="tweaking"></a>
## Tweaking and advanced functionality

The presentation of the test results and the exact working of Jazillionth can be changed.  To do so, pass in an extra 2nd 'options' key/value dictionary object when creating the Jazillionth object.  You do not have to specify all individual options; if one is missing, it's default value is used instead.

The complete list of all Jazillionth options is:

* `resultElementSpec`: jQuery element selector (default: `undefined`)<br>
  By default, Jazillionth will append a <div> element at the end of the test suite page's content and place the test results in there.  If you want the test results to appear somewhere else, specify the jQuery element selector for that location.  The receiving element will also get it's background color set to the resulting test outcome color.
* `iframeElementSpec`: jQuery element selector (default: `undefined`)<br>
  By default, Jazillionth will append an <iframe> element at the end of the test suite page's content and load the page under test in there.  If you want to use your own iframe for this, specify the jQuery element selector for that iframe.
* `passColor`: css color code (default: `'#008000'`)<br>
  The background color for passed tests.
* `failColor`: css color code (default: `'#800000'`)<br>
  The background color for failed tests.
* `textColor`: css color code (default: `'#ffffff'`)<br>
  The color for text and borders.
* `showPassedTests`: bool (default: `true`)<br>
  Whether to also show the tests that passed in the result.
* `IgnoreCallStackLinesWith`: array of string (default: `jquery.com`)<br>
  If a call stack line from a failed test result contains a string from this list, that call stack line is not displayed.  You can use this to pass in extra library identifying strings to suppress library call stack entries (which would not add clarity to the test result).  No matter what you pass, `jazillionth.js` is always added for you to this list.  Do note that case sensitive string comparison is used!
* `startAutomatically`: bool (default: `true`)<br>
  Whether to start all tests automatically when the test suite page is fully loaded.  See the chapter <a href="advancedTestFlow">Intervening in the test flow</a> for more details.
* `OnBeforePageTests`: custom event handler (default: undefined)<br>
  Event handler running before the tests of a page have run.  See the chapter <a href="advancedTestFlow">Intervening in the test flow</a> for more details.
* `OnAfterPageTests`: custom event handler (default: undefined)<br>
  Event handler running after the tests of a page have run.  See the chapter <a href="advancedTestFlow">Intervening in the test flow</a> for more details.
* `OnBeforeSetTests`: custom event handler (default: undefined)<br>
  Event handler running before the tests of a test set have run.  See the chapter <a href="advancedTestFlow">Intervening in the test flow</a> for more details.
* `OnAfterPageTests`: custom event handler (default: undefined)<br>
  Event handler running after the tests of a test set have run.  See the chapter <a href="advancedTestFlow">Intervening in the test flow</a> for more details.



<a name="setupSimpleServer"></a>
## Testing without a dedicated web server

If you do not have a simple web server to run your tests with, all is not lost!  There are multiple solutions out there which make running a local web server very easy.  For instance, if you have Python installed, then you already have everything you need.  Just open a terminal / command line, go to the folder holding your files to test (your desired 'web root'), and enter:

* Python 2:<br>
  `python -m SimpleHTTPServer`
* Python 3:<br>
  `python -m http.server`

If your test suite page is in a subfolder named 'testing' and named 'testSuite.html', you can then open your browser and go to:

`http://localhost:8000/testing/testSuite.html`

If you have Python 3 installed, then you can also use `testExamples.py` from the root of this repository.  This is a python script which automatically starts a web server serving the examples, and which opens all examples in your default browser.



<a name="examples"></a>
## Examples

All examples below can also be found in the `examples` folder in this repository.  Since it's far easier if all examples just use the main `jazillionth.js` file, the file hierarchy is a bit upside down; all test suite pages reach high up to the root of the repository to include the `jazillionth.js` file.  Therefore, when running these examples as-is, ensure your web root is pointing to the repository root.


### Example #0 - base example

We want to test a simple HTML page which uses a `Summer` class to sum two numbers on-the-spot.  The `Summer` class is located in its own file `summer.js`, and the main page code is located in the file `main.js`.

File `main.html`:

```html
<html>
  <head>
    <meta charset="utf-8">
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="scripts/summer.js"></script>
    <script src="scripts/main.js"></script>
  </head>
  <body>
    1 + 4 = <span id="result">?</span>
  </body>
</html>
```

File `scripts/summer.js`:

```js
function Summer() {
  this.finalized = false
  this.sum = 0
}

Summer.prototype.Add = function(value) {
  if (!this.finalized)
    this.sum += value
}

Summer.prototype.Result = function() {
  this.finalized = true
  return this.sum
}

Summer.prototype.CanAdd = function() {
  return !this.finalized
}
```

File `scripts/main.js`:

```js
$(document).ready(function() {
  let summer = new Summer
  summer.Add(1)
  summer.Add(4)
  $('#result').text(summer.Result())
})
```

File `testing/tests.html`:

```html
<html>
  <head>
    <meta charset="utf-8">
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="../../../jazillionth.js"></script>
    <script src="tests.js"></script>
  </head>
  <body></body>
</html>
```

File `testing/tests.js`:

```js
let jazil = new Jazillionth()
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer'])


jazil.AddTestSet(mainPage, 'Summer tests', {
  'Summer should know 1 + 1': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 2)
  },
  'Summer should finalize': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 1, 'sole number added not returned')
    jazil.Assert(!summer.CanAdd(), 'summer is not finalized')

    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 1, 'summer keeps adding after finalization')
  }
})


jazil.AddTestSet(mainPage, 'Main page tests', {
  'The main page should list the correct answer': function(jazil) {
    let shownResult = parseInt($(jazil.testDocument).find('#result').text())

    jazil.ShouldBe(shownResult, 5)
  }
})
```



### Example #1 - custom test suite page content

We want to specify the test suite page's layout and color scheme ourselves.  For that we make the following alterations to the base example:

File `testing/tests.html`: replace `<body></body>` with:

```html
  <body>
    <h1>Page under test</h1>
    <iframe id="testFrame"></iframe>

    <div id="testResult">
      <h1>Test results</h1>
    </div>

    <h1>Thanks for testing!</h1>
  </body>
```

File `testing/tests.js`: replace the jazil initialization with:

```js
let options = {
  'resultElementSpec': '#testResult',
  'iframeElementSpec': '#testFrame',
  'passColor': '#000080' // blue is a better green
}
let jazil = new Jazillionth(options)
```



### Example #2 - test sets split over multiple scripts

The main page is now going to use a new sum, as well as show a complex multiplication!

we have an extra class `Multiplier` to test, so together with the 'Summer' tests and the main page tests this is all getting over our head fast.  We'd better divide up our testing code into a configuration part and three testing set parts (one for each class plus one for the main page).  Each of these four parts gets its own JavaScript file.  We again adjust the base example, like so:

File `scripts/multiplier.js`: a new file; give it the following content:

```js
function Multiplier() {
  this.finalized = false
  this.result = 1
}

Multiplier.prototype.Add = function(value) {
  if (!this.finalized)
    this.result *= value
}

Multiplier.prototype.Result = function() {
  this.finalized = true
  return this.result
}

Multiplier.prototype.CanAdd = function() {
  return !this.finalized
}
```

File `main.html`: add the following script include:

```html
    <script src="scripts/multiplier.js"></script>
```

File `main.html`: replace `<body></body>` with:

```html
  <body>
    1 + 2 + 4 = <span id="sumResult">?</span><br>
    2 * 3 * 5 = <span id="multiplyResult">?</span>
  </body>
```

File `scripts/main.js`: replace its content with:

```js
$(document).ready(function() {
  let summer = new Summer
  summer.Add(1)
  summer.Add(2)
  summer.Add(4)
  $('#sumResult').text(summer.Result())

  let multiplier = new Multiplier
  multiplier.Add(2)
  multiplier.Add(3)
  multiplier.Add(5)
  $('#multiplyResult').text(multiplier.Result())
})
```

File `testing/tests.js`: we're going to divide this up over several files, so it can be deleted.

File `testing/configure.js`: this one only gets the configuration part:

```js
let jazil = new Jazillionth()
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer', 'Multiplier'])
```

File `testing/summer.js`: this gets the test set for `Summer`:

```js
jazil.AddTestSet(mainPage, 'Summer tests', {
  'Summer should know 1 + 1': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 2)
  },
  'Summer should finalize': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 1, 'sole number added not returned')
    jazil.Assert(!summer.CanAdd(), 'summer is not finalized')

    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 1, 'summer keeps adding after finalization')
  }
})
```

File `testing/multiplier.js`: this gets the test set for `Multiplier`:

```js
jazil.AddTestSet(mainPage, 'Multiplier tests', {
  'Multiplier should know 2 * 3': function(jazil) {
    let multiplier = new Multiplier

    multiplier.Add(2)
    multiplier.Add(3)
    jazil.ShouldBe(multiplier.Result(), 6)
  },
  'Multiplier should finalize': function(jazil) {
    let multiplier = new Multiplier

    multiplier.Add(2)
    jazil.ShouldBe(multiplier.Result(), 2, 'sole number added not returned')
    jazil.Assert(!multiplier.CanAdd(), 'multiplier is not finalized')

    multiplier.Add(10)
    jazil.ShouldBe(multiplier.Result(), 2, 'multiplier keeps adding after finalization')
  }
})
```

File `testing/main.js`: this gets the test set for the main page:

```js
jazil.AddTestSet(mainPage, 'Main page tests', {
  'The main page should list the correct sum': function(jazil) {
    let shownResult = parseInt($(jazil.testDocument).find('#sumResult').text())

    jazil.ShouldBe(shownResult, 7)
  },
  'The main page should list the correct multiplication': function(jazil) {
    let shownResult = parseInt($(jazil.testDocument).find('#multiplyResult').text())

    jazil.ShouldBe(shownResult, 30)
  }
})
```

File `testing/tests.html`: this should now link to the following scripts.  Note that we need to list `configure.js` first, since that one creates the `jazil` object that our other scripts need.

```html
    <script src="configure.js"></script>
    <script src="summer.js"></script>
    <script src="multiplier.js"></script>
    <script src="main.js"></script>
```



### Example #3 - more rigorous testing

Summer gets a little boost -- it now tracks whether it has been used!  So, let's check for that.  And we didn't really properly test `Summer` before, so let's make up for that too.  And what do you know: we made a mistake in our test, so one of 'em fails now.  We alter the base example in the following way:

File `scripts/summer.js`: replace it with the following code:

```js
var g_summerUsed = false

function Summer() {
  this.finalized = false
  this.sum = 0
}

Summer.prototype.Add = function(value) {
  if (!this.finalized)
    this.sum += value
}

Summer.prototype.Result = function() {
  this.finalized = true
  g_summerUsed = true
  return this.sum
}

Summer.prototype.CanAdd = function() {
  return !this.finalized
}
```

File `testing/tests.js`: replace it with the following code:

```js
let jazil = new Jazillionth()
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer', 'g_summerUsed'])


jazil.AddTestSet(mainPage, 'module Summer', {
  'Summer should have been used by the test page by now': function(jazil) {
    jazil.Assert(g_summerUsed, 'g_summerUsed is not set yet')
  },

  'Positive numbers': function(jazil) {
    let summer = new Summer
    summer.Add(1)
    summer.Add(2)
    jazil.ShouldBe(summer.Result(), 3, 'basic sum')

    summer = new Summer
    summer.Add(12)
    summer.Add(9)
    jazil.ShouldBe(summer.Result(), 21, 'sum with carry')

    summer = new Summer
    summer.Add(1234567)
    summer.Add(3456789)
    jazil.ShouldBe(summer.Result(), 4691356, 'big numbers')
  },

  'Negative numbers': function(jazil) {
    let summer = new Summer
    summer.Add(-1)
    summer.Add(2)
    jazil.ShouldBe(summer.Result(), 1, 'neg + bigger pos = pos')

    summer = new Summer
    summer.Add(3)
    summer.Add(-7)
    jazil.ShouldBe(summer.Result(), -4, 'pos + bigger neg = neg')

    summer = new Summer
    summer.Add(-11)
    summer.Add(-31)
    jazil.ShouldBe(summer.Result(), -42, 'neg + neg = neg')
  },

  '0 is a no-op': function(jazil) {
    let summer = new Summer
    summer.Add(231)
    summer.Add(0)
    jazil.ShouldBe(summer.Result(), 231, 'number + 0')

    summer = new Summer
    summer.Add(0)
    summer.Add(-82376)
    jazil.ShouldBe(summer.Result(), -82376, '0 + number')

    summer = new Summer
    summer.Add(0)
    summer.Add(0)
    // use strict since we're dealing with 0 here and
    // don't want undefined etc. to match too
    jazil.ShouldBeStrict(summer.Result(), 0, '0 + 0')
  },

  'Order is irrelevant': function(jazil) {
    let summer1 = new Summer
    summer1.Add(2)
    summer1.Add(1)
    let summer2 = new Summer
    summer2.Add(1)
    summer2.Add(2)
    jazil.ShouldBe(summer1.Result(), summer2.Result(), 'simple numbers')

    summer1 = new Summer
    summer1.Add(-8)
    summer1.Add(25)
    summer2 = new Summer
    summer2.Add(25)
    summer2.Add(-8)
    jazil.ShouldBe(summer1.Result(), summer2.Result(), 'add in a negative')
  },

  'Result should close the summer': function(jazil) {
    let summer = new Summer
    jazil.Assert(summer.CanAdd(), 'new Summer not addable')
    summer.Add(3)
    jazil.Assert(summer.CanAdd(), 'used Summer not addable')
    summer.Add(4)
    jazil.ShouldBe(summer.Result(), 7, 'sum not correct')
    if (summer.CanAdd())
      jazil.Fail('closed Summer still addable')
  },

  'Estimating hard to predict sums': function(jazil) {
    let summer = new Summer
    summer.Add(3)
    summer.Add(5)
    jazil.ShouldBeBetween(summer.Result(), 2, 10, 'small sum not correct')

    summer = new Summer
    summer.Add(30)
    summer.Add(50)
    jazil.ShouldBeBetween(summer.Result(), 2, 10, 'big sum not correct')
  },

  'All basic sums': function(jazil) {
    // just to be sure
    for (let number1 = -10; number1 <= 10; ++number1) {
      for (let number2 = -10; number2 <= 10; ++number2) {
        let summer = new Summer
        summer.Add(number1)
        summer.Add(number2)
        jazil.ShouldBe(summer.Result(), number1 + number2, 'sum not correct')
      }
    }
  }
})


jazil.AddTestSet(mainPage, 'Main page tests', {
  'The main page should list the correct answer': function(jazil) {
    let shownResult = parseInt($(jazil.testDocument).find('#result').text())

    jazil.ShouldBe(shownResult, 5)
  }
})
```



### Example #4 - test a page which manipulates localStorage

The numbers to sum on the main page are now not static anymore but are maintained via `localStorage`.  We need to test if that goes well as well.  The basic example can be changed this way:

File `main.html`: change `<body></body>` into:

```html
  <body>
    <p>Press Refresh to calculate the next sum.</p>
    <p>1 + <span id="value2">?</span> = <span id="result">?</span></p>
  </body>
```

File `scripts/main.js`: update it to:

```js
$(document).ready(function() {
  let value1 = 1
  let value2 = parseInt(localStorage.getItem('value2'))
  if (isNaN(value2))
    value2 = 0
  else
    ++value2

  let summer = new Summer
  summer.Add(value1)
  summer.Add(value2)
  let result = summer.Result()

  $('#value2').text(value2)
  localStorage.setItem('value2', value2)
  $('#result').text(result)
  localStorage.setItem('result', result)
})
```

File `testing\tests.js`: update the main page test set to:

```js
jazil.AddTestSet(mainPage, 'Main page tests', {
  'The main page should calculate the correct answer': function(jazil) {
    let storedValue2 = parseInt(jazil.testWindow.localStorage.getItem('value2'))
    let storedResult = parseInt(jazil.testWindow.localStorage.getItem('result'))
    let shownResult = parseInt($(jazil.testDocument).find('#result').text())

    jazil.Assert(!isNaN(storedResult), 'stored result is not numeric')
    jazil.Assert(!isNaN(storedValue2), 'stored value2 is not numeric')
    jazil.Assert(!isNaN(shownResult), 'shown result is not numeric')
    jazil.ShouldBe(shownResult, 1 + storedValue2, 'shown result is not correct')
    jazil.ShouldBe(shownResult, storedResult, 'shown result is off from stored result')
  },
})
```



### Example #5 - use event handlers to test an interactive page

The main page now lets the user enter the sum himself.  So automatically running the tests when the page under test is ready is not an option anymore, because at that point the user hasn't had a chance to interact with the page yet.  We therefore start the tests ourselves with a button press.  Plus, the main page now stores the result in `localStorage` too; we need to test if that goes well as well.  The basic example can be changed this way:

File `main.html`: change `<body></body>` into:

```html
  <body>
    <form>
      Enter the values:<br>
      <input id="value1" type="number" value="1"> + <input id="value2" type="number" value="2"> = <input id="result" type="number"><br>
      <input id="calculate" type="button" value="Calculate">
    </form>
  </body>
```

File `scripts/main.js`: update it to:

```js
function Calculate() {
  let value1 = parseInt($('#value1').val())
  let value2 = parseInt($('#value2').val())

  let summer = new Summer
  summer.Add(value1)
  summer.Add(value2)
  let result = summer.Result()

  $('#result').val(result)
  localStorage.setItem('result', result)
}


$(document).ready(function() {
  $('#calculate').on('click', Calculate)
})
```

File `testing/tests.html`: update the body content to:

```html
  <body>
    <form><input id="startTests" type="button" value="Start tests"></form>
  </body>
```

File `testing\tests.js`: update it to:

```js
let pauseMainTests = true


function OnBeforePageTests(jazil, testPage) {
  alert('Running test page "' + testPage.name + '"')

  // Hijack the 'Calculate' button in the main page to eventually
  // resume testing.
  $(jazil.testDocument).find('#calculate').on('click', () => {
    pauseMainTests = false
    // Continue delayed, so that we're sure the page's own code
    // ran for the calculate button.
    jazil.ContinueTests(true)
  })
}


function OnAfterPageTests(jazil, testPage, testedOK) {
  alert('Done running test page "' + testPage.name + '"; ' + (testedOK ? 'tests passed' : 'tests failed'))
}


function OnBeforeSetTests(jazil, testPage, testSet) {
  let testSetDescription = 'test set "' + testPage.name + '/' + testSet.name + '"'

  let pauseJazillionth = testSet === mainSet && pauseMainTests
  if (pauseJazillionth)
    alert('Pausing ' + testSetDescription + '\n\nPress Calculate on the main page to resume tests.')
  else
    alert('Running ' + testSetDescription)

  return pauseJazillionth
}


function OnAfterSetTests(jazil, testPage, testSet, testedOK) {
  alert('Done running test set "' + testPage.name + '/' + testSet.name + '"; ' + (testedOK ? 'tests passed' : 'tests failed'))
}


let options = {
  'startAutomatically': false,
  'OnBeforePageTests': OnBeforePageTests,
  'OnAfterPageTests': OnAfterPageTests,
  'OnBeforeSetTests': OnBeforeSetTests,
  'OnAfterSetTests': OnAfterSetTests
}
let jazil = new Jazillionth(options)
$(document).ready(function() {
  $('#startTests').on('click', function() {
    pauseMainTests = true
    jazil.StartTests()
  })
})


let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer'])


let summerSet = jazil.AddTestSet(mainPage, 'Summer tests', {
  'Summer should know 1 + 1': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 2)
  },
  'Summer should finalize': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 1, 'sole number added not returned')
    jazil.Assert(!summer.CanAdd(), 'summer is not finalized')

    summer.Add(1)
    jazil.ShouldBe(summer.Result(), 1, 'summer keeps adding after finalization')
  }
})


function GetMainPageState(jazil) {
  let value1 = parseInt($(jazil.testDocument).find('#value1').val())
  let value2 = parseInt($(jazil.testDocument).find('#value2').val())
  return {
    'value1': value1,
    'value2': value2,
    'shownResult': parseInt($(jazil.testDocument).find('#result').val()),
    'storedResult': jazil.testWindow.localStorage.getItem('result'),
    'correctResult': value1 + value2
  }
}


let mainSet = jazil.AddTestSet(mainPage, 'Main page tests', {
  'The main page should show the correct answer': function(jazil) {
    let state = GetMainPageState(jazil)

    jazil.ShouldBe(state.shownResult, state.correctResult, 'shown sum is not correct')
  },
  'The main page should store the correct answer': function(jazil) {
    let state = GetMainPageState(jazil)

    jazil.ShouldBe(state.storedResult, state.correctResult, 'stored sum is not correct')
  }
})
```
