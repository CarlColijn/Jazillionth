let jazil = new Jazillionth()
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer','g_untrackedTotalSummed'], ['g_trackedTotalSummed'])


jazil.AddTestSet(mainPage, 'Summer tests', {
  'Summer should know 1 + 1': function(jazil) {
    let summer = new Summer

    summer.Add(1)
    summer.Add(1)
    jazil.ShouldBe(summer.result, 2)
  },
  'Tracked total sum should update correctly': function(jazil) {
    let summer = new Summer

    let oldTotalSummed = g_trackedTotalSummed()
    summer.Add(3)
    summer.Add(5)
    jazil.ShouldBe(g_trackedTotalSummed(), oldTotalSummed + 3 + 5, 'tracked total sum is not updated correctly')
  },
  'Untracked total sum should not update correctly': function(jazil) {
    let summer = new Summer

    let oldTotalSummed = g_untrackedTotalSummed
    summer.Add(4)
    summer.Add(2)
    jazil.ShouldNotBe(g_untrackedTotalSummed, oldTotalSummed + 4 + 2, 'untracked total sum is updated correctly')
  }
})


jazil.AddTestSet(mainPage, 'Main page tests', {
  'The main page should list the correct answer': function(jazil) {
    let shownResult = parseInt(jazil.testDocument.getElementById('result').textContent)

    jazil.ShouldBe(shownResult, 5)
  }
})