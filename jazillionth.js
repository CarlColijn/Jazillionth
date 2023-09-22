class Jazillionth {
  /*
    Initialization
  */


  constructor(options) {
    this.#Initialize(options)

    this.#RegisterReadyHandler()
  }


  AddPageToTest(name, url, accessObjectNames) {
    let isExternalPage = url !== undefined;
    let testPage = {
      'nr': this.#testPages.length,
      'name': name,
      'url': isExternalPage ? url : 'this page',
      'accessObjectNames': accessObjectNames,
      'testSets': [],
      'isExternalPage': isExternalPage
    }
    this.#testPages.push(testPage)

    return testPage
  }


  AddTestSet(testPage, name, tests) {
    let testSet = {
      'nr': testPage.testSets.length,
      'name': name,
      'tests': tests
    }
    testPage.testSets.push(testSet)

    return testSet
  }


  /*
    Delayed test (re)starting/continuation and test context details
  */


  StartTests() {
    this.#ResetTestState()

    this.#ClearPreviousResults()

    this.ContinueTests()
  }


  ContinueTests(delayed) {
    if (delayed)
      setTimeout(() => {
        this.#RunTestLoop()
      }, 0)
    else
      this.#RunTestLoop()
  }


  get testWindow() {
    return this.#testWindow
  }


  get testDocument() {
    return this.#testDocument
  }


  /*
    Test result handling

    A message is optional in all cases.
  */


  Fail(message) {
    this.#HandleFeedback(message)
  }


  Assert(condition, message) {
    if (!condition)
      this.Fail(message)
  }


  ShouldBe(value, expected, message) {
    if (value === expected)
      return
    else
      this.#HandleFeedback(message, `expected ${expected}, got ${value}`)
  }


  ShouldNotBe(value, expected, message) {
    if (value !== expected)
      return
    else
      this.#HandleFeedback(message, `value is ${expected}`)
  }


  ShouldBeLoose(value, expected, message) {
    if (value == expected)
      return
    else
      this.#HandleFeedback(message, `expected ${expected}, got ${value}`)
  }


  ShouldNotBeLoose(value, expected, message) {
    if (value != expected)
      return
    else
      this.#HandleFeedback(message, `value is ${expected}`)
  }


  ShouldBeBetween(value, expectedLower, expectedHigher, message) {
    if (value >= expectedLower && value <= expectedHigher)
      return
    else
      this.#HandleFeedback(message, `expected between ${expectedLower} and ${expectedHigher}, got ${value}`)
  }


  ShouldNotBeBetween(value, expectedLower, expectedHigher, message) {
    if (value < expectedLower || value > expectedHigher)
      return
    else
      this.#HandleFeedback(message, `expected outside ${expectedLower} and ${expectedHigher}, got ${value}`)
  }


  ShouldThrow(CodeToRun, message) {
    let threw = false

    try {
      CodeToRun()
    }
    catch (exception) {
      threw = true
    }

    if (!threw)
      this.#HandleFeedback(message, 'nothing thrown')
  }


  ShouldNotThrow(CodeToRun, message) {
    try {
      CodeToRun()
    }
    catch (exception) {
      this.#HandleFeedback(message, `threw ${exception}`)
    }
  }




  /*
    Private

    Not for public tampering.
  */
  #State = {
    toStart: {},
    beforePageLoad: {},
    beforePageTests: {},
    setTests: {},
    afterPageTests: {},
    done: {}
  }


  #options = {}

  #resultElement = undefined
  #showingPassedTests = false
  #resultStateElement = undefined
  #toggleDisplayModeElement = undefined
  #resultTableElement = undefined
  #iframeElement = undefined

  #testWindow = undefined
  #testDocument = undefined

  #accessedObjectNames = undefined

  #state = this.#State.toStart
  #numPasses = 0
  #numFails = 0
  #testsRunning = false
  #testPages = []
  #currentPageNr = 0
  #currentPageElement = undefined
  #currentPagePassed = true
  #currentSetNr = 0


  #SetConfig(options, name, defValue) {
    if (options !== undefined && options.hasOwnProperty(name))
      this.#options[name] = options[name]
    else
      this.#options[name] = defValue
  }


  #Initialize(options) {
    this.#options = {}

    this.#SetConfig(options, 'startAutomatically', true)

    this.#SetConfig(options, 'resultElementSpec', 'body')
    this.#SetConfig(options, 'iframeElementSpec', undefined)

    this.#SetConfig(options, 'passColor', '#006000')
    this.#SetConfig(options, 'failColor', '#600000')
    this.#SetConfig(options, 'textColor', '#ffffff')

    this.#SetConfig(options, 'showPassedTests', false)

    this.#SetConfig(options, 'OnBeforePageTests', undefined)
    this.#SetConfig(options, 'OnAfterPageTests', undefined)
    this.#SetConfig(options, 'OnBeforeSetTests', undefined)
    this.#SetConfig(options, 'OnAfterSetTests', undefined)

    this.#SetConfig(options, 'ignoreCallStackLinesWith', [])
    this.#options.ignoreCallStackLinesWith.push('jquery.com')
    this.#options.ignoreCallStackLinesWith.push('jazillionth.js')

    this.#testPages = []

    this.#resultElement = undefined
    this.#resultStateElement = undefined
    this.#toggleDisplayModeElement = undefined
    this.#resultTableElement = undefined
    this.#iframeElement = undefined

    this.#testWindow = undefined
    this.#testDocument = undefined

    this.#ResetTestState()
  }


  #RegisterReadyHandler() {
    $(document).ready(() => {
      this.#SetupStyles()

      this.#AddResultListing()

      if (this.#options.startAutomatically)
        this.StartTests()
    })
  }


  #ClearAccessedObjects(ourWindow) {
    if (this.#accessedObjectNames !== undefined) {
      for (let objectNameNr in this.#accessedObjectNames) {
        let objectName = this.#accessedObjectNames[objectNameNr]
        delete ourWindow[objectName]
      }
    }
  }


  #AccessObjects(ourWindow, testPage) {
    if (!testPage.isExternalPage) {
      this.#testWindow = window
      this.#testDocument = window.document
    }
    else {
      this.#testWindow = this.#iframeElement[0].contentWindow
      this.#testDocument = this.#testWindow.document || this.#iframeElement[0].contentDocument

      this.#ClearAccessedObjects(ourWindow)

      this.#accessedObjectNames = testPage.accessObjectNames

      if (testPage.accessObjectNames !== undefined) {
        for (let objectNameNr in testPage.accessObjectNames) {
          let objectName = testPage.accessObjectNames[objectNameNr]
          ourWindow[objectName] = this.#testWindow.eval(objectName)
        }
      }
    }
  }


  #GetCurrentPage() {
    return (
      this.#currentPageNr < this.#testPages.length ?
      this.#testPages[this.#currentPageNr] :
      undefined
    )
  }


  #GetCurrentSet(testPage) {
    return (
      testPage !== undefined && this.#currentSetNr < testPage.testSets.length ?
      testPage.testSets[this.#currentSetNr] :
      undefined
    )
  }


  #OnPageReady() {
    let testPage = this.#GetCurrentPage()

    this.#AccessObjects(window, testPage)

    this.#state = this.#State.beforePageTests

    if (testPage.isExternalPage && this.#testsRunning)
      // We're running async from the iframe now; we need
      // to explicitly continue.
      this.ContinueTests()
  }


  #ResetTestState() {
    this.#accessedObjectNames = undefined

    this.#numPasses = 0
    this.#numFails = 0

    this.#currentPagePassed = true
    this.#currentPageElement = undefined

    this.#currentPageNr = 0
    this.#currentSetNr = 0
    this.#state = this.#State.toStart
    this.#testsRunning = false
  }


  #HandleFeedback(message, result) {
    if (message === undefined) {
      if (result === undefined)
        throw new Error()
      else
        throw new Error(result)
    }
    else {
      if (result === undefined)
        throw new Error(message)
      else
        throw new Error(`${message}; ${result}`)
    }
  }


  #RunTestLoop() {
    this.#testsRunning = true
    let keepRunning = true
    do {
      switch (this.#state) {
        case this.#State.toStart:
          this.#state = this.#State.beforePageLoad
          break
        case this.#State.beforePageLoad:
          keepRunning = this.#OnBeforePageLoad()
          break
        case this.#State.beforePageTests:
          keepRunning = this.#OnBeforePageTests()
          break
        case this.#State.setTests:
          keepRunning = this.#OnSetTests()
          break
        case this.#State.afterPageTests:
          keepRunning = this.#OnAfterPageTests()
          break
        case this.#State.done:
          keepRunning = this.#OnDone()
          break
      }
      this.#ShowTestState()
    } while (this.#testsRunning && keepRunning)
  }


  #OnBeforePageLoad() {
    let testPage = this.#GetCurrentPage()
    if (testPage.isExternalPage) {
      this.#EnsureIFrameAdded()

      this.#iframeElement.attr("src", testPage.url)

      return false // we'll continue from the iframe's load event
    }
    else {
      this.#OnPageReady()

      return true // we're ready to continue
    }
  }


  #OnBeforePageTests() {
    let testPage = this.#GetCurrentPage()

    this.#currentPageElement = this.#AddTestPageHeader(testPage)
    this.#currentPagePassed = true

    this.#state = this.#State.setTests

    if (this.#options.OnBeforePageTests !== undefined)
      this.#testsRunning = true !== this.#options.OnBeforePageTests(this, testPage)

    return true
  }


  #RunSetTests(testPage, testSet) {
    let setPassed = true

    for (let testName in testSet.tests) {
      try {
        testSet.tests[testName](this, testName, testSet, testPage)

        ++this.#numPasses
        this.#AddTestResult(testName, undefined)
      }
      catch (exception) {
        ++this.#numFails
        setPassed = false
        this.#currentPagePassed = false
        this.#AddTestResult(testName, exception)
      }
    }

    return setPassed
  }


  #OnSetTests() {
    let testPage = this.#GetCurrentPage()
    let testSet = this.#GetCurrentSet(testPage)

    if (this.#options.OnBeforeSetTests !== undefined)
      this.#testsRunning = true !== this.#options.OnBeforeSetTests(this, testPage, testSet)
    if (this.#testsRunning) {
      let currentSetElement = this.#AddTestSetHeader(testSet)

      let setPassed = this.#RunSetTests(testPage, testSet)

      this.#SetResultStyle(currentSetElement, setPassed, true)

      if (this.#options.OnAfterSetTests !== undefined)
        this.#options.OnAfterSetTests(this, testPage, testSet, setPassed)

      ++this.#currentSetNr
      this.#state =
        this.#currentSetNr < testPage.testSets.length ?
        this.#State.setTests :
        this.#State.afterPageTests
    }

    return true
  }


  #OnAfterPageTests() {
    this.#SetResultStyle(this.#currentPageElement, this.#currentPagePassed, true)

    if (this.#options.OnAfterPageTests !== undefined) {
      let testPage = this.#GetCurrentPage()
      this.#options.OnAfterPageTests(this, testPage, this.#currentPagePassed)
    }

    ++this.#currentPageNr
    this.#currentSetNr = 0

    this.#state =
      this.#currentPageNr < this.#testPages.length ?
      this.#State.beforePageLoad :
      this.#State.done

    return true
  }


  #OnDone() {
    this.#testsRunning = false
    return false
  }




  /*
    DOM manipulation
  */


  #EnsureIFrameAdded() {
    if (this.#iframeElement === undefined) {
      // We start listening to the iframe's load first, and only
      // then load in the test page.  Done any other way we're
      // more than likely we miss the iframe's load event, which
      // is the correct time to start the tests.

      if (this.#options.iframeElementSpec !== undefined)
        this.#iframeElement = $(this.#options.iframeElementSpec)
      else {
        this.#iframeElement =
          $('<iframe id="jazilTestFrame"></iframe>').
          appendTo($('body'))
      }

      // We're using a combination of onload and setTimeout;
      // - onload to wait for the iframe to be available, and
      // - setTimeout to run async so our tests hopefully run after
      //   any other scheduled javascript has ran in the iframe.
      this.#iframeElement.on('load', () => {
        setTimeout(() => {
          this.#OnPageReady()
        }, 0)
      })
    }
  }


  #UpdatePassedStyle(showPassed) {
    let passedDisplayMode = showPassed? 'inherit': 'none'

    $('#jazilPassedStyles').
      html(`
        .jazilShowPassed {
          display: ${passedDisplayMode};
        }
      `)
  }


  #SetupStyles() {
    $('<style type="text/css"></style>').
      html(`
        #jazilTestFrame {
          width: 100%;
          height: 800px;
          border: 1px solid ${this.#options.textColor};
        }

        #jazilResult {
          border: 1px solid ${this.#options.textColor};
          padding: 0.3em;
          color: ${this.#options.textColor};
        }

        #jazilResultHeader {
        }

        #jazilResultState {
          font-size: 1.4em;
        }

        #jazilToggleStateDisplay {
          margin-left: 1em;
        }

        #jazilResultTable {
          border-collapse: collapse;
          margin-top: 1em;
          margin-left: 1em;
        }

        #jazilResultTable tr {
          border: 1px solid ${this.#options.textColor};
          width: 100%;
        }

        #jazilResultTable tr {
          color: ${this.#options.textColor};
        }

        .jazilPageResult td {
          padding: 2px 4px 2px 0px;
        }

        .jazilPageResult td {
          font-size: 1.3em;
          padding-left: 0.2em;
        }

        .jazilSetResult td {
          font-size: 1.2em;
          padding-left: 1em;
        }

        .jazilTestResult td {
          padding-left: 2em;
        }

        .jazilUnknown {
          background-color: inherit;
        }

        .jazilPassed {
          background-color: ${this.#options.passColor};
        }

        .jazilFailed {
          background-color: ${this.#options.failColor};
        }
      `).
      appendTo('head')

    $('<style id="jazilPassedStyles" type="text/css"></style>').
      appendTo('head')

    this.#UpdatePassedStyle(this.#options.showPassedTests)
  }


  #AddResultListing() {
    let parentElement = $(this.#options.resultElementSpec)

    this.#resultElement =
      $('<div id="jazilResult"></div>').
      appendTo(parentElement)

    let resultHeaderElement =
      $('<div id="jazilResultHeader"></div>').
      appendTo(this.#resultElement)

    this.#resultStateElement =
      $('<span id="jazilResultState"></span>').
      appendTo(resultHeaderElement)

    let setDisplayModeElementText = (showAll) => {
      this.#toggleDisplayModeElement.text(
        this.#showingPassedTests?
        'Hide passed tests':
        'Show all tests'
      )
    }
    this.#toggleDisplayModeElement =
    $('<button id="jazilToggleStateDisplay"></button>').
      on('click', () => {
        this.#showingPassedTests = !this.#showingPassedTests
        this.#UpdatePassedStyle(this.#showingPassedTests)
        setDisplayModeElementText(this.#showingPassedTests)
      }).
      appendTo(resultHeaderElement)
    this.#showingPassedTests = this.#options.showPassedTests
    setDisplayModeElementText(this.#showingPassedTests)

    this.#resultTableElement =
      $('<table id="jazilResultTable"></table>').
      appendTo(this.#resultElement)

    this.#ShowTestState()
  }


  #AddTestPageHeader(testPage) {
    let rowElement = $('<tr class="jazilPageResult"></tr>')

    let rowElementContent = $('<td></td>')
    rowElementContent.text(`${testPage.name} (${testPage.url})`)

    rowElement.append(rowElementContent)
    this.#resultTableElement.append(rowElement)

    return rowElement
  }


  #AddTestSetHeader(testSet) {
    let rowElement = $('<tr class="jazilSetResult"></tr>')

    let rowElementContent = $('<td></td>')
    rowElementContent.text(testSet.name)

    rowElement.append(rowElementContent)
    this.#resultTableElement.append(rowElement)

    return rowElement
  }


  #AddTestResult(name, error) {
    let passed = error === undefined

    let rowElement = $('<tr class="jazilTestResult"></tr>')
    this.#SetResultStyle(rowElement, passed, true)

    let rowElementContent = $('<td></td>')

    if (passed)
      rowElementContent.text(`${name}: passed`)
    else {
      rowElementContent.text(`${name}: failed`)

      $('<div></div>').
      text(error).
      appendTo(rowElementContent)

      $('<pre></pre>').
      text(this.#GetCallStack(error)).
      appendTo(rowElementContent)
    }

    rowElement.append(rowElementContent)
    this.#resultTableElement.append(rowElement)
  }


  #SetResultStyle(element, passed, addDisplayClass) {
    element.addClass(passed? 'jazilPassed': 'jazilFailed')
    if (addDisplayClass)
      element.addClass(passed? 'jazilShowPassed': 'jazilShowFailed')
  }


  #ClearPreviousResults() {
    this.#resultTableElement.find('tr').remove()
  }


  #ShowTestState() {
    if (this.#state === this.#State.toStart) {
      this.#resultElement.addClass('jazilUnknown')
      this.#resultStateElement.text('Tests not started')
    }
    else {
      this.#SetResultStyle(this.#resultElement, this.#numFails == 0, false)
      let testingState = this.#state === this.#State.done ? 'done' : 'in progress';
      let TestCount = (count) => `${count} test${count === 1 ? '' : 's'}`
      this.#resultStateElement.text(`Tests ${testingState}; ${TestCount(this.#numPasses)} passed, ${TestCount(this.#numFails)} failed.`)
    }
  }


  #GetCallStack(error) {
    if (error.stack === undefined)
      return ''
    else {
      let allLines = error.stack.split('\n')

      let relevantLines = allLines.filter((line) => {
        // We're using indexOf instead of includes to keep IE11 on board.
        for (let textNr in this.#options.ignoreCallStackLinesWith)
          if (line.indexOf(this.#options.ignoreCallStackLinesWith[textNr]) !== -1)
            return false
        return true
      })

      return relevantLines.join('\n')
    }
  }
}
