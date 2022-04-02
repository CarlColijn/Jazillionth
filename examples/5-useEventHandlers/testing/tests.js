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
    'storedResult': parseInt(jazil.testWindow.localStorage.getItem('result')),
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