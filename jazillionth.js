/*
  Initialization
*/


function Jazillionth(testURI, options) {
  this.Initialize(testURI, options)
  this.RegisterReadyHandler()
}


Jazillionth.prototype.AddTestSet = function(name, tests) {
  let testSet = {
    'name': name,
    'tests': tests
  }
  this.testSets.push(testSet)
}


/*
  Delayed test starting
*/


Jazillionth.prototype.StartTests = function() {
  this.ClearPreviousResults()
  this.DoTests()
  this.UpdatePageToResult()
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
    this[name] = options[name]
  else
    this[name] = defValue
}


Jazillionth.prototype.Initialize = function(testURI, options) {
  this.testURI = testURI

  this.SetConfig(options, 'startAutomatically', true)

  this.SetConfig(options, 'resultElementSpec', undefined)
  this.SetConfig(options, 'iframeElementSpec', undefined)

  this.SetConfig(options, 'passColor', '#008000')
  this.SetConfig(options, 'failColor', '#800000')
  this.SetConfig(options, 'textColor', '#ffffff')

  this.SetConfig(options, 'showPassedTests', true)

  this.SetConfig(options, 'accessObjectNames', [])
  this.SetConfig(options, 'BeforeStart', undefined)

  this.SetConfig(options, 'IgnoreCallStackLinesWith', ['jquery.com'])
  this.IgnoreCallStackLinesWith.push('jazillionth.js')

  this.testSets = []

  this.resultElement = undefined
  this.resultHeaderElement = undefined
  this.resultTableElement = undefined
  this.iframeElement = undefined

  this.testWindow = undefined
  this.testDocument = undefined
}


Jazillionth.prototype.RegisterReadyHandler = function() {
  $(document).ready(() => {
    this.SetupPage()
  })
}


Jazillionth.prototype.AddResultListing = function() {
  let parentElement =
    this.resultElementSpec === undefined?
    $('body'):
    $(this.resultElementSpec)

  this.resultElement =
    $('<div></div>').
    css({
      'border': '1px solid ' + this.textColor,
      'padding': '0.3em',
      'color': this.textColor,
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
      'border': '1px solid ' + this.textColor
    }).
    appendTo(this.resultElement)
}


Jazillionth.prototype.AccessObjects = function(ourWindow) {
  for (let objectNameNr in this.accessObjectNames) {
    let objectName = this.accessObjectNames[objectNameNr]
    ourWindow[objectName] = this.testWindow[objectName]
  }
}


Jazillionth.prototype.AddIFrame = function() {
  // We start listening to the iframe's load first, and only
  // then load in the test page.  Done any other way we're
  // more than likely we miss the iframe's load event, which
  // is the correct time to start the tests.

  if (this.iframeElementSpec === undefined) {
    this.iframeElement =
      $('<iframe></iframe>').
      css({
        'width': '100%',
        'height': '800px',
        'border': '1px solid ' + this.textColor,
      }).
      appendTo($('body'))
  }
  else
    this.iframeElement = $(this.iframeElementSpec)

  // We're using a combination of onload and setTimeout;
  // - onload to wait for the iframe to be available, and
  // - setTimeout to run our tests only after any scheduled
  //   javascript has ran in the iframe.
  this.iframeElement.on('load', () => {
    setTimeout(() => {
      this.OnIFrameLoaded()
    }, 0)
  })

  this.iframeElement.attr("src", this.testURI)
}


Jazillionth.prototype.OnIFrameLoaded = function() {
  this.testWindow = this.iframeElement[0].contentWindow
  this.testDocument = this.testWindow.document || this.iframeElement[0].contentDocument

  this.AccessObjects(window)

  if (this.BeforeStart !== undefined)
    this.BeforeStart(this)

  if (this.startAutomatically)
    this.StartTests()
}


Jazillionth.prototype.SetupPage = function() {
  this.AddResultListing()

  this.AddIFrame()
}


Jazillionth.prototype.AddTestSetHeader = function(name) {
  let rowElement = $('<tr></tr>')
  rowElement.css({
    'border': '1px solid ' + this.textColor
  })

  let rowElementContent = $('<td></td>')
  rowElementContent.css({
    'font-size': '1.3em',
    'padding': '2px 4px'
  })
  rowElementContent.text(name)

  rowElement.append(rowElementContent)
  this.resultTableElement.append(rowElement)

  return rowElement
}


Jazillionth.prototype.GetCallStack = function(error) {
  if (error.stack === undefined)
    return ''
  else {
    let allLines = error.stack.split('\n')

    let relevantLines = allLines.filter((line) => {
      // We're using indexOf instead of includes to keep IE11 on board.
      for (let textNr in this.IgnoreCallStackLinesWith)
        if (line.indexOf(this.IgnoreCallStackLinesWith[textNr]) !== -1)
          return false
      return true
    })

    return relevantLines.join('\n')
  }
}


Jazillionth.prototype.AddTestResult = function(name, error) {
  let passed = error === undefined

  let rowElement = $('<tr></tr>')
  rowElement.css({
    'background-color': passed ? this.passColor : this.failColor,
    'border': '1px solid ' + this.textColor
  })

  let rowElementContent = $('<td></td>')
  rowElementContent.css({
    'padding': '2px 4px 2px 20px'
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


Jazillionth.prototype.DoTests = function() {
  for (let setNr in this.testSets) {
    let testSet = this.testSets[setNr]
    let testSetElement = this.AddTestSetHeader(testSet.name)

    let allPassed = true
    for (let testName in testSet.tests) {
      try {
        testSet.tests[testName](this)

        ++this.numPasses
        if (this.showPassedTests)
          this.AddTestResult(testName, undefined)
      }
      catch (exception) {
        ++this.numFails
        allPassed = false
        this.AddTestResult(testName, exception)
      }
    }

    testSetElement.css({
      'background-color': allPassed ? this.passColor : this.failColor
    })
  }
}


Jazillionth.prototype.ClearPreviousResults = function() {
  this.numPasses = 0
  this.numFails = 0

  this.resultTableElement.find('tr').remove()
}


Jazillionth.prototype.UpdatePageToResult = function() {
  this.resultElement.css({
    'background-color': this.numFails == 0 ? this.passColor : this.failColor
  })

  this.resultHeaderElement.text(this.numPasses + ' tests passed, ' + this.numFails + ' tests failed.')
}
