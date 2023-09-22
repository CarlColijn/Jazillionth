let options = {
  'ignoreCallStackLinesWith': ['testLibrary.js']
}
let jazil = new Jazillionth(options)
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer'])


jazil.AddTestSet(mainPage, 'Library files not in call stack', {
  'Failing a test to force a call stack': function(jazil) {
    TestSummer(
      1, 2, (summerResult, correctResult) => {
        jazil.ShouldBe(summerResult, correctResult, 'testLibrary.js should not show in the call stack')
      }
    )
  }
})
