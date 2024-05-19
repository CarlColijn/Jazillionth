let jazil = new Jazillionth()
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer'])


jazil.AddTestSet(mainPage, 'Summer tests', {
  'Summer should know 1 + 1': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    summer.Add(1)
    jazil.ShouldBe(summer.result, 2)
  },
  'Summer should finalize': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    jazil.ShouldBe(summer.result, 1, 'sole number added not returned')
    jazil.Assert(!summer.canAdd, 'summer is not finalized')

    summer.Add(1)
    jazil.ShouldBe(summer.result, 1, 'summer keeps adding after finalization')
  }
})


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