let jazil = new Jazillionth()
let mainPage = jazil.AddPageToTest('main')


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
  'The main page should list the correct answer': function(jazil) {
    let shownResult = parseInt($(jazil.testDocument).find('#result').text())

    jazil.ShouldBe(shownResult, 5)
  }
})