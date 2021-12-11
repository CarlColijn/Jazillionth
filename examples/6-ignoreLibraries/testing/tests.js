let options = {
  'IgnoreCallStackLinesWith': ['testLibrary.js']
}
let jazil = new Jazillionth(options)
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer'])


jazil.AddTestSet(mainPage, 'Summer tests', {
  'Summer should know 1 + 1': function(jazil) {
    TestSummer(
      1, 1, (summerResult, correctResult) => {
        jazil.ShouldBe(summerResult, correctResult)
      }
    )
  }
})
