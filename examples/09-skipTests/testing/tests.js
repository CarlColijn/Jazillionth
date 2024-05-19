let options = {
  'showPassedTests': true // to show which tests ran
}
let jazil = new Jazillionth(options)
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer'])


function IsEven(x) {
  return (x % 2) === 0
}


function AddSpecificTestSet(x) {
  jazil.AddTestSet(mainPage, `Summer tests - sum for x=${x}`, {
    'Summer should know x+1': function(jazil) {
      let summer = new Summer

      summer.Add(x)
      summer.Add(1)
      jazil.ShouldBe(summer.result, x+1)
    },

    'Summer should know 1+x': function(jazil) {
      let summer = new Summer

      summer.Add(1)
      summer.Add(x)
      jazil.ShouldBe(summer.result, 1+x)
    },

    'Summer should know x-1 if x is even': function(jazil) {
      if (!IsEven(x))
        jazil.SkipTest()

      // This is now safe to do; the test has already been skipped
      // when x is odd.
      jazil.Assert(IsEven(x))

      let summer = new Summer

      summer.Add(x)
      summer.Add(-1)
      jazil.ShouldBe(summer.result, x-1)
    },

    'Summer should know 1-x if x is even': function(jazil) {
      if (!IsEven(x))
        jazil.SkipTest()

      // This is now safe to do; the test has already been skipped
      // when x is odd.
      jazil.Assert(IsEven(x))

      let summer = new Summer

      summer.Add(1)
      summer.Add(-x)
      jazil.ShouldBe(summer.result, 1-x)
    }
  })
}


AddSpecificTestSet(2)
AddSpecificTestSet(3)
AddSpecificTestSet(4)
AddSpecificTestSet(5)
