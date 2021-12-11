/*
  Initialization
*/


function Jazillionth(options) {
  this.Initialize(options)

  this.RegisterReadyHandler()
}


Jazillionth.prototype.AddPageToTest = function(name, url, accessObjectNames) {
  let testPage = {
    'nr': this.testPages.length,
    'name': name,
    'url': url,
    'accessObjectNames': accessObjectNames,
    'testSets': []
  }
  this.testPages.push(testPage)

  return testPage
}


Jazillionth.prototype.AddTestSet = function(testPage, name, tests) {
  let testSet = {
    'nr': testPage.testSets.length,
    'name': name,
    'tests': tests
  }
  testPage.testSets.push(testSet)

  return testSet
}


/*
  Delayed test (re)starting and continuation
*/


Jazillionth.prototype.StartTests = function() {
  this.ResetTestState()

  this.ClearPreviousResults()

  this.ContinueTests()
}


Jazillionth.prototype.ContinueTests = function(delayed) {
  if (delayed)
    setTimeout(() => {
      this.RunTestLoop()
    }, 0)
  else
    this.RunTestLoop()
}


/*
  Test result handling

  A message is optional in all cases.
*/


Jazillionth.prototype.Fail = function(message) {
  if (message === undefined)
    throw new Error
  else
    throw new Error(message)
}


Jazillionth.prototype.Assert = function(condition, message) {
  if (!condition)
    this.Fail(message)
}


Jazillionth.prototype.ShouldBe = function(value, expected, message) {
  // Check for equality instead of inequality as we're being ask
  // for, since these have subtle differences in certain situations.
  if (value == expected)
    return
  else {
    if (message === undefined)
      throw new Error('expected ' + expected + ', got ' + value)
    else
      throw new Error(message + '; expected ' + expected + ', got ' + value)
  }
}


Jazillionth.prototype.ShouldNotBe = function(value, expected, message) {
  // Check for inequality instead of equality as we're being ask
  // for, since these have subtle differences in certain situations.
  if (value != expected)
    return
  else {
    if (message === undefined)
      throw new Error('value is ' + expected)
    else
      throw new Error(message + '; value is ' + expected)
  }
}


Jazillionth.prototype.ShouldBeStrict = function(value, expected, message) {
  if (value === expected)
    return
  else {
    if (message === undefined)
      throw new Error('expected ' + expected + ', got ' + value)
    else
      throw new Error(message + '; expected ' + expected + ', got ' + value)
  }
}


Jazillionth.prototype.ShouldNotBeStrict = function(value, expected, message) {
  if (value !== expected)
    return
  else {
    if (message === undefined)
      throw new Error('value is ' + expected)
    else
      throw new Error(message + '; value is ' + expected)
  }
}


Jazillionth.prototype.ShouldBeBetween = function(value, expectedLower, expectedHigher, message) {
  if (value < expectedLower || value > expectedHigher) {
    if (message === undefined)
      throw new Error('expected between ' + expectedLower + ' and ' + expectedHigher + ', got ' + value)
    else
      throw new Error(message + '; expected between ' + expectedLower + ' and ' + expectedHigher + ', got ' + value)
  }
}


Jazillionth.prototype.ShouldNotBeBetween = function(value, expectedLower, expectedHigher, message) {
  if (value >= expectedLower && value <= expectedHigher) {
    if (message === undefined)
      throw new Error('expected outside ' + expectedLower + ' and ' + expectedHigher + ', got ' + value)
    else
      throw new Error(message + '; expected outside ' + expectedLower + ' and ' + expectedHigher + ', got ' + value)
  }
}




/*
  Private

  Not for public tampering.
*/


Jazillionth.prototype.SetConfig = function(options, name, defValue) {
  if (options !== undefined && options.hasOwnProperty(name))
    this.options[name] = options[name]
  else
    this.options[name] = defValue
}


Jazillionth.prototype.Initialize = function(options) {
  this.State = {
    toStart: {},
    beforePageLoad: {},
    beforePageTests: {},
    setTests: {},
    afterPageTests: {},
    done: {}
  }

  this.options = {}

  this.SetConfig(options, 'startAutomatically', true)

  this.SetConfig(options, 'resultElementSpec', 'body')
  this.SetConfig(options, 'iframeElementSpec', undefined)

  this.SetConfig(options, 'passColor', '#008000')
  this.SetConfig(options, 'failColor', '#800000')
  this.SetConfig(options, 'textColor', '#ffffff')

  this.SetConfig(options, 'showPassedTests', true)

  this.SetConfig(options, 'OnBeforePageTests', undefined)
  this.SetConfig(options, 'OnAfterPageTests', undefined)
  this.SetConfig(options, 'OnBeforeSetTests', undefined)
  this.SetConfig(options, 'OnAfterSetTests', undefined)

  this.SetConfig(options, 'IgnoreCallStackLinesWith', ['jquery.com'])
  this.options.IgnoreCallStackLinesWith.push('jazillionth.js')

  this.testPages = []

  this.resultElement = undefined
  this.resultHeaderElement = undefined
  this.resultTableElement = undefined
  this.iframeElement = undefined

  this.testWindow = undefined
  this.testDocument = undefined

  this.ResetTestState()
}


Jazillionth.prototype.RegisterReadyHandler = function() {
  $(document).ready(() => {
    this.AddResultListing()

    this.AddIFrame()

    if (this.options.startAutomatically)
      this.StartTests()
  })
}


Jazillionth.prototype.ClearAccessedObjects = function(ourWindow) {
  if (this.accessedObjectNames !== undefined) {
    for (let objectNameNr in this.accessedObjectNames) {
      let objectName = this.accessedObjectNames[objectNameNr]
      delete ourWindow[objectName]
    }
  }
}


Jazillionth.prototype.AccessObjects = function(ourWindow, testPage) {
  this.testWindow = this.iframeElement[0].contentWindow
  this.testDocument = this.testWindow.document || this.iframeElement[0].contentDocument

  this.ClearAccessedObjects(ourWindow)

  this.accessedObjectNames = testPage.accessObjectNames

  if (testPage.accessObjectNames !== undefined) {
    for (let objectNameNr in testPage.accessObjectNames) {
      let objectName = testPage.accessObjectNames[objectNameNr]
      ourWindow[objectName] = this.testWindow[objectName]
    }
  }
}


Jazillionth.prototype.GetCurrentPage = function() {
  return (
    this.currentPageNr < this.testPages.length ?
    this.testPages[this.currentPageNr] :
    undefined
  )
}


Jazillionth.prototype.GetCurrentSet = function(testPage) {
  return (
    testPage !== undefined && this.currentSetNr < testPage.testSets.length ?
    testPage.testSets[this.currentSetNr] :
    undefined
  )
}


Jazillionth.prototype.OnIFrameLoaded = function() {
  this.AccessObjects(window, this.GetCurrentPage())

  this.state = this.State.beforePageTests

  if (this.testsRunning)
    this.ContinueTests()
}


Jazillionth.prototype.ResetTestState = function() {
  this.accessedObjectNames = undefined

  this.numPasses = 0
  this.numFails = 0

  this.currentPagePassed = true
  this.currentPageElement = undefined

  this.currentPageNr = 0
  this.currentSetNr = 0
  this.state = this.State.toStart
  this.testsRunning = false
}


Jazillionth.prototype.RunTestLoop = function() {
  this.testsRunning = true
  let keepRunning = true
  do {
    switch (this.state) {
      case this.State.toStart:
        this.state = this.State.beforePageLoad
        break
      case this.State.beforePageLoad:
        keepRunning = this.OnBeforePageLoad()
        break
      case this.State.beforePageTests:
        keepRunning = this.OnBeforePageTests()
        break
      case this.State.setTests:
        keepRunning = this.OnSetTests()
        break
      case this.State.afterPageTests:
        keepRunning = this.OnAfterPageTests()
        break
      case this.State.done:
        keepRunning = this.OnDone()
        break
    }
    this.ShowTestState()
  } while (this.testsRunning && keepRunning)
}


Jazillionth.prototype.OnBeforePageLoad = function() {
  let testPage = this.GetCurrentPage()
  this.iframeElement.attr("src", testPage.url)

  return false // we'll continue from the iframe's load event
}


Jazillionth.prototype.OnBeforePageTests = function() {
  let testPage = this.GetCurrentPage()

  this.currentPageElement = this.AddTestPageHeader(testPage)
  this.currentPagePassed = true

  this.state = this.State.setTests

  if (this.options.OnBeforePageTests !== undefined)
    this.testsRunning = true !== this.options.OnBeforePageTests(this, testPage)

  return true
}


Jazillionth.prototype.RunSetTests = function(testPage, testSet) {
  let setPassed = true

  for (let testName in testSet.tests) {
    try {
      testSet.tests[testName](this, testName, testSet, testPage)

      ++this.numPasses
      if (this.options.showPassedTests)
        this.AddTestResult(testName, undefined)
    }
    catch (exception) {
      ++this.numFails
      setPassed = false
      this.currentPagePassed = false
      this.AddTestResult(testName, exception)
    }
  }

  return setPassed
}


Jazillionth.prototype.OnSetTests = function() {
  let testPage = this.GetCurrentPage()
  let testSet = this.GetCurrentSet(testPage)

  if (this.options.OnBeforeSetTests !== undefined)
    this.testsRunning = true !== this.options.OnBeforeSetTests(this, testPage, testSet)
  if (this.testsRunning) {
    let currentSetElement = this.AddTestSetHeader(testSet)

    let setPassed = this.RunSetTests(testPage, testSet)

    this.SetResultColor(currentSetElement, setPassed)

    if (this.options.OnAfterSetTests !== undefined)
      this.options.OnAfterSetTests(this, testPage, testSet, setPassed)

    ++this.currentSetNr
    this.state =
      this.currentSetNr < testPage.testSets.length ?
      this.State.setTests :
      this.State.afterPageTests
  }

  return true
}


Jazillionth.prototype.OnAfterPageTests = function() {
  this.SetResultColor(this.currentPageElement, this.currentPagePassed)

  if (this.options.OnAfterPageTests !== undefined) {
    let testPage = this.GetCurrentPage()
    this.options.OnAfterPageTests(this, testPage, this.currentPagePassed)
  }

  ++this.currentPageNr
  this.currentSetNr = 0

  this.state =
    this.currentPageNr < this.testPages.length ?
    this.State.beforePageLoad :
    this.State.done

  return true
}


Jazillionth.prototype.OnDone = function() {
  this.testsRunning = false
  return false
}




/*
  DOM manipulation
*/


Jazillionth.prototype.AddIFrame = function() {
  // We start listening to the iframe's load first, and only
  // then load in the test page.  Done any other way we're
  // more than likely we miss the iframe's load event, which
  // is the correct time to start the tests.

  if (this.options.iframeElementSpec !== undefined)
    this.iframeElement = $(this.options.iframeElementSpec)
  else {
    this.iframeElement =
      $('<iframe></iframe>').
      css({
        'width': '100%',
        'height': '800px',
        'border': '1px solid ' + this.options.textColor,
      }).
      appendTo($('body'))
  }

  // We're using a combination of onload and setTimeout;
  // - onload to wait for the iframe to be available, and
  // - setTimeout to run our tests only after any scheduled
  //   javascript has ran in the iframe, hopefully.
  this.iframeElement.on('load', () => {
    setTimeout(() => {
      this.OnIFrameLoaded()
    }, 0)
  })
}


Jazillionth.prototype.AddResultListing = function() {
  let parentElement = $(this.options.resultElementSpec)

  this.resultElement =
    $('<div></div>').
    css({
      'border': '1px solid ' + this.options.textColor,
      'padding': '0.3em',
      'color': this.options.textColor,
      'margin-bottom': '1em'
    }).
    appendTo(parentElement)

  this.resultHeaderElement =
    $('<div></div>').
    css({
      'margin-bottom': '1em',
      'font-size': '1.4em'
    }).
    appendTo(this.resultElement)

  this.resultTableElement =
    $('<table></table>').
    css({
      'border-collapse': 'collapse',
      'border': '1px solid ' + this.options.textColor
    }).
    appendTo(this.resultElement)

  this.ShowTestState()
}


Jazillionth.prototype.AddTestPageHeader = function(testPage) {
  let rowElement = $('<tr></tr>')
  rowElement.css({
    'border': '1px solid ' + this.options.textColor
  })

  let rowElementContent = $('<td></td>')
  rowElementContent.css({
    'font-size': '1.3em',
    'padding': '2px 4px'
  })
  rowElementContent.text(testPage.name + ' (' + testPage.url + ')')

  rowElement.append(rowElementContent)
  this.resultTableElement.append(rowElement)

  return rowElement
}


Jazillionth.prototype.AddTestSetHeader = function(testSet) {
  let rowElement = $('<tr></tr>')
  rowElement.css({
    'border': '1px solid ' + this.options.textColor
  })

  let rowElementContent = $('<td></td>')
  rowElementContent.css({
    'font-size': '1.2em',
    'padding': '2px 4px 2px 1em'
  })
  rowElementContent.text(testSet.name)

  rowElement.append(rowElementContent)
  this.resultTableElement.append(rowElement)

  return rowElement
}


Jazillionth.prototype.AddTestResult = function(name, error) {
  let passed = error === undefined

  let rowElement = $('<tr></tr>')
  this.SetResultColor(rowElement, passed)
  rowElement.css({
    'border': '1px solid ' + this.options.textColor
  })

  let rowElementContent = $('<td></td>')
  rowElementContent.css({
    'padding': '2px 4px 2px 2em'
  })

  if (passed)
    rowElementContent.text(name + ': passed')
  else {
    rowElementContent.text(name + ': failed')

    $('<div></div>').
    text(error).
    appendTo(rowElementContent)

    $('<pre></pre>').
    text(this.GetCallStack(error)).
    appendTo(rowElementContent)
  }

  rowElement.append(rowElementContent)
  this.resultTableElement.append(rowElement)
}


Jazillionth.prototype.SetResultColor = function(element, passed) {
  element.css({
    'background-color': passed ? this.options.passColor : this.options.failColor
  })
}


Jazillionth.prototype.ClearPreviousResults = function() {
  this.resultTableElement.find('tr').remove()
}


Jazillionth.prototype.ShowTestState = function() {
  if (this.state === this.State.toStart) {
    this.resultElement.css({
      'background-color': 'inherit'
    })
    this.resultHeaderElement.text('Tests not started')
  }
  else {
    this.SetResultColor(this.resultElement, this.numFails == 0)
    let testingState = this.state === this.State.done ? 'done' : 'in progress';
    this.resultHeaderElement.text('Tests ' + testingState + '; ' + this.numPasses + ' tests passed, ' + this.numFails + ' tests failed.')
  }
}


Jazillionth.prototype.GetCallStack = function(error) {
  if (error.stack === undefined)
    return ''
  else {
    let allLines = error.stack.split('\n')

    let relevantLines = allLines.filter((line) => {
      // We're using indexOf instead of includes to keep IE11 on board.
      for (let textNr in this.options.IgnoreCallStackLinesWith)
        if (line.indexOf(this.options.IgnoreCallStackLinesWith[textNr]) !== -1)
          return false
      return true
    })

    return relevantLines.join('\n')
  }
}
