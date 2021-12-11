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