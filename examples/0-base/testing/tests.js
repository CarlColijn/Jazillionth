let options = {
  'accessObjectNames': ['Summer']
}
let jazil = new Jazillionth('../main.html', options)


jazil.AddTestSet('Summer tests', {
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


jazil.AddTestSet('Main page tests', {
  'The main page should list the correct answer': function(jazil) {
    let shownResult = parseInt($(jazil.testDocument).find('#result').text())

    jazil.ShouldBe(shownResult, 5)
  }
})