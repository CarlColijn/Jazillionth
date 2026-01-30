class JazillionthSkippedTest {
}


class Jazillionth {
  /*
    Initialization
  */


  constructor(options) {
    this.#Initialize(options)

    this.#RegisterReadyHandler()
  }


  AddPageToTest(name, url, accessObjectNames, trackObjectNames) {
    let isExternalPage = url !== undefined;
    let testPage = {
      'nr': this.#testPages.length,
      'name': name,
      'url': isExternalPage ? url : 'this page',
      'accessObjectNames': accessObjectNames,
      'trackObjectNames': trackObjectNames,
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


  async StartTests() {
    this.#ResetTestState()

    this.#ClearPreviousResults()

    this.ContinueTests()
  }


  async ContinueTests(delayed = false) {
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


  SkipTest() {
    throw new JazillionthSkippedTest()
  }


  Fail(message) {
    this.#HandleFeedback(message)
  }


  Assert(condition, message) {
    if (!condition)
      this.Fail(message)
  }


  ShouldBe(value, expected, message) {
    // Also test with Object.is to catch NaN !== NaN by definition.
    if (value === expected || Object.is(value, expected))
      return
    else
      this.#HandleFeedback(message, `expected ${expected}, got ${value}`)
  }


  ShouldNotBe(value, expected, message) {
    // Also test with Object.is to catch NaN !== NaN by definition.
    if (value !== expected && !Object.is(value, expected))
      return
    else
      this.#HandleFeedback(message, `value is ${expected}`)
  }


  ShouldBeLoose(value, expected, message) {
    // Also test with Object.is to catch NaN != NaN by definition.
    if (value == expected || Object.is(value, expected))
      return
    else
      this.#HandleFeedback(message, `expected ${expected}, got ${value}`)
  }


  ShouldNotBeLoose(value, expected, message) {
    // Also test with Object.is to catch NaN != NaN by definition.
    if (value != expected && !Object.is(value, expected))
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

  #mappedObjectNames = []

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
    this.#SetConfig(options, 'showResultWhenDone', true)

    this.#SetConfig(options, 'OnBeforePageTests', undefined)
    this.#SetConfig(options, 'OnAfterPageTests', undefined)
    this.#SetConfig(options, 'OnBeforeSetTests', undefined)
    this.#SetConfig(options, 'OnAfterSetTests', undefined)

    this.#SetConfig(options, 'ignoreCallStackLinesWith', [])
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
    window.addEventListener('load', () => {
      this.#SetupStyles()

      this.#AddResultListing()

      if (this.#options.startAutomatically)
        setTimeout(() => {
          this.StartTests()
        }, 0)
    })
  }


  #UnmapObjects() {
    for (let objectName of this.#mappedObjectNames)
      delete window[objectName]

    this.#mappedObjectNames = []
  }


  #ObjectType = {
    tracked: {},
    untracked: {}
  }
  #MapObjectsOfType(objectNames, objectType, objectDescription) {
    if (objectNames !== undefined) {
      for (let objectName of objectNames) {
        try {
          this.#mappedObjectNames.push(objectName)
          if (objectType === this.#ObjectType.tracked)
            window[objectName] = this.#testWindow.eval(`Function("return ${objectName}")`)
          else
            window[objectName] = this.#testWindow.eval(objectName)
        }
        catch (exception) {
          throw Error(`Jazillionth: ${objectDescription} "${objectName}" is not defined in your code.`)
        }
      }
    }
  }


  #MapObjects(testPage) {
    this.#UnmapObjects()

    if (testPage.isExternalPage) {
      this.#testWindow = this.#iframeElement.contentWindow
      this.#testDocument = this.#testWindow.document || this.#iframeElement.contentDocument

      this.#MapObjectsOfType(testPage.accessObjectNames, this.#ObjectType.untracked, 'accessObjectName')
      this.#MapObjectsOfType(testPage.trackObjectNames, this.#ObjectType.tracked, 'trackObjectName')
    }
    else {
      this.#testWindow = window
      this.#testDocument = window.document
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

    this.#MapObjects(testPage)

    this.#state = this.#State.beforePageTests

    if (testPage.isExternalPage && this.#testsRunning)
      // We're running async from the iframe now; we need
      // to explicitly continue.
      this.ContinueTests()
  }


  #ResetTestState() {
    this.#mappedObjectNames = []

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


  async #RunTestLoop() {
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
          keepRunning = await this.#OnSetTests()
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

      this.#iframeElement.setAttribute('src', testPage.url)

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


  async #RunSetTests(testPage, testSet) {
    let setPassed = true

    for (let testName of Object.keys(testSet.tests)) {
      try {
        // Wrap the function to test in an async lambda so
        // that we can await on it even if it's synchronous;
        // this keeps the ui responsive.
        let TestFunction = async () => { await testSet.tests[testName](this, testName, testSet, testPage) }
        await TestFunction()

        ++this.#numPasses
        this.#AddTestResult(testName, undefined)
      }
      catch (exception) {
        if (!(exception instanceof JazillionthSkippedTest)) {
          ++this.#numFails
          setPassed = false
          this.#currentPagePassed = false
          this.#AddTestResult(testName, exception)
        }
      }

      this.#ShowTestState()
    }

    return setPassed
  }


  async #OnSetTests() {
    let testPage = this.#GetCurrentPage()
    let testSet = this.#GetCurrentSet(testPage)

    if (this.#options.OnBeforeSetTests !== undefined)
      this.#testsRunning = true !== this.#options.OnBeforeSetTests(this, testPage, testSet)
    if (this.#testsRunning) {
      let currentSetElement = this.#AddTestSetHeader(testSet)

      let setPassed = await this.#RunSetTests(testPage, testSet)

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
    if (this.#options.showResultWhenDone && this.#resultElement !== undefined)
      this.#resultElement.scrollIntoView()
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

      if (this.#options.iframeElementSpec !== undefined) {
        this.#iframeElement = document.querySelector(this.#options.iframeElementSpec)
        if (this.#iframeElement === null)
          throw new Error(`Jazillionth: iframe element "${this.#options.iframeElementSpec}" not found.`)
      }
      else {
        let bodyElement = document.querySelector('body')
        if (bodyElement === null)
          throw new Error('Jazillionth: body element not found.')
        this.#iframeElement = document.createElement('iframe')
        this.#iframeElement.setAttribute('id', 'jazilTestFrame')
        bodyElement.appendChild(this.#iframeElement)
      }

      // We're using a combination of onload and setTimeout;
      // - onload to wait for the iframe to be available, and
      // - setTimeout to run async so our tests hopefully run after
      //   any other scheduled javascript has ran in the iframe.
      this.#iframeElement.addEventListener('load', () => {
        setTimeout(() => {
          this.#OnPageReady()
        }, 0)
      })
    }
  }


  #UpdatePassedStyle(showPassed) {
    let passedDisplayMode = showPassed ? 'inherit' : 'none'

    let styleElement = document.getElementById('jazilPassedStyles')
    styleElement.textContent = `
      .jazilShowPassed {
        display: ${passedDisplayMode};
      }
    `
  }


  #SetupStyles() {
    let headElement = document.querySelector('head')
    if (headElement === null)
      throw new Error('Jazillionth: head element not found.')

    let mainStylesElement = document.createElement('style')
    mainStylesElement.setAttribute('type', 'text/css')
    mainStylesElement.textContent = `
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
    `
    headElement.appendChild(mainStylesElement)

    let passedStylesElement = document.createElement('style')
    passedStylesElement.setAttribute('type', 'text/css')
    passedStylesElement.setAttribute('id', 'jazilPassedStyles')
    headElement.appendChild(passedStylesElement)

    this.#UpdatePassedStyle(this.#options.showPassedTests)
  }


  #AddResultListing() {
    let parentElement = document.querySelector(this.#options.resultElementSpec)
    if (parentElement === null)
      throw new Error(`Jazillionth: result element "${this.#options.resultElementSpec}" not found.`)

    this.#resultElement = document.createElement('div')
    this.#resultElement.setAttribute('id', 'jazilResult')
    parentElement.appendChild(this.#resultElement)

    let resultHeaderElement = document.createElement('div')
    resultHeaderElement.setAttribute('id', 'jazilResultHeader')
    this.#resultElement.appendChild(resultHeaderElement)

    this.#resultStateElement = document.createElement('span')
    this.#resultStateElement.setAttribute('id', 'jazilResultState')
    resultHeaderElement.appendChild(this.#resultStateElement)

    let setDisplayModeElementText = () => {
      this.#toggleDisplayModeElement.textContent =
        this.#showingPassedTests ?
        'Hide passed tests' :
        'Show all tests'
    }
    this.#toggleDisplayModeElement = document.createElement('button')
    this.#toggleDisplayModeElement.setAttribute('id', 'jazilToggleStateDisplay')
    resultHeaderElement.appendChild(this.#toggleDisplayModeElement)
    this.#toggleDisplayModeElement.addEventListener('click', () => {
      this.#showingPassedTests = !this.#showingPassedTests
      this.#UpdatePassedStyle(this.#showingPassedTests)
      setDisplayModeElementText(this.#showingPassedTests)
    })
    this.#showingPassedTests = this.#options.showPassedTests
    setDisplayModeElementText(this.#showingPassedTests)

    this.#resultTableElement = document.createElement('table')
    this.#resultTableElement.setAttribute('id', 'jazilResultTable')
    this.#resultElement.appendChild(this.#resultTableElement)

    this.#ShowTestState()
  }


  #AddTestPageHeader(testPage) {
    let rowElement = document.createElement('tr')
    rowElement.classList.add('jazilPageResult')

    let rowContentElement = document.createElement('td')
    rowContentElement.textContent = `${testPage.name} (${testPage.url})`

    rowElement.appendChild(rowContentElement)
    this.#resultTableElement.appendChild(rowElement)

    return rowElement
  }


  #AddTestSetHeader(testSet) {
    let rowElement = document.createElement('tr')
    rowElement.classList.add('jazilSetResult')

    let rowContentElement = document.createElement('td')
    rowContentElement.textContent = testSet.name

    rowElement.appendChild(rowContentElement)
    this.#resultTableElement.appendChild(rowElement)

    return rowElement
  }


  #AddTestResult(name, error) {
    let passed = error === undefined

    let rowElement = document.createElement('tr')
    rowElement.classList.add('jazilTestResult')
    this.#SetResultStyle(rowElement, passed, true)

    let rowContentElement = document.createElement('td')

    if (passed)
      rowContentElement.textContent = `${name}: passed`
    else {
      rowContentElement.textContent = `${name}: failed`

      let divElement = document.createElement('div')
      divElement.textContent = error
      rowContentElement.appendChild(divElement)

      let preElement = document.createElement('pre')
      preElement.textContent = this.#GetCallStack(error)
      rowContentElement.appendChild(preElement)
    }

    rowElement.appendChild(rowContentElement)
    this.#resultTableElement.appendChild(rowElement)
  }


  #SetResultStyle(element, passed, addDisplayClass) {
    element.classList.add(passed ? 'jazilPassed' : 'jazilFailed')
    if (addDisplayClass)
      element.classList.add(passed ? 'jazilShowPassed' : 'jazilShowFailed')
  }


  #ClearPreviousResults() {
    this.#resultTableElement.querySelectorAll('tr').forEach((rowElement) => {
      rowElement.remove()
    })
  }


  #ShowTestState() {
    if (this.#state === this.#State.toStart) {
      this.#resultElement.classList.add('jazilUnknown')
      this.#resultStateElement.textContent = 'Tests not started'
    }
    else {
      this.#SetResultStyle(this.#resultElement, this.#numFails == 0, false)
      let testingState = this.#state === this.#State.done ? 'done' : 'in progress';
      let TestCount = (count) => `${count} test${count === 1 ? '' : 's'}`
      this.#resultStateElement.textContent = `Tests ${testingState}; ${TestCount(this.#numPasses)} passed, ${TestCount(this.#numFails)} failed.`
    }
  }


  #GetCallStack(error) {
    if (error.stack === undefined)
      return ''
    else {
      let allLines = error.stack.split('\n')

      let relevantLines = allLines.filter((line) => {
        for (let ignoreText of this.#options.ignoreCallStackLinesWith)
          if (line.includes(ignoreText))
            return false
        return true
      })

      return relevantLines.join('\n')
    }
  }
}
