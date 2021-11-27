jazil.AddTestSet('Main page tests', {
  'The main page should list the correct sum': function(jazil) {
    let shownResult = $(jazil.testDocument).find('#sumResult').text()

    jazil.ShouldBe(parseInt(shownResult), 7)
  },
  'The main page should list the correct multiplication': function(jazil) {
    let shownResult = $(jazil.testDocument).find('#multiplyResult').text()

    jazil.ShouldBe(parseInt(shownResult), 30)
  }
})