jazil.AddTestSet(mainPage, 'Multiplier tests', {
  'Multiplier should know 2 * 3': function(jazil) {
    let multiplier = new Multiplier

    multiplier.Add(2)
    multiplier.Add(3)
    jazil.ShouldBe(multiplier.result, 6)
  },
  'Multiplier should finalize': function(jazil) {
    let multiplier = new Multiplier

    multiplier.Add(2)
    jazil.ShouldBe(multiplier.result, 2, 'sole number added not returned')
    jazil.Assert(!multiplier.canAdd, 'multiplier is not finalized')

    multiplier.Add(10)
    jazil.ShouldBe(multiplier.result, 2, 'multiplier keeps adding after finalization')
  }
})