let options = {
  'accessObjectNames': ['Summer', 'g_summerUsed']
}
let jazil = new Jazillionth('../main.html', options)


jazil.AddTestSet('module Summer', {
  'Summer should have been used by the test page by now': function(jazil) {
    jazil.Assert(g_summerUsed, 'g_summerUsed is not set yet')
  },

  'Positive numbers': function(jazil) {
    let summer = new Summer
    summer.Add(1)
    summer.Add(2)
    jazil.ShouldBe(summer.Result(), 3, 'basic sum')

    summer = new Summer
    summer.Add(12)
    summer.Add(9)
    jazil.ShouldBe(summer.Result(), 21, 'sum with carry')

    summer = new Summer
    summer.Add(1234567)
    summer.Add(3456789)
    jazil.ShouldBe(summer.Result(), 4691356, 'big numbers')
  },

  'Negative numbers': function(jazil) {
    let summer = new Summer
    summer.Add(-1)
    summer.Add(2)
    jazil.ShouldBe(summer.Result(), 1, 'neg + bigger pos = pos')

    summer = new Summer
    summer.Add(3)
    summer.Add(-7)
    jazil.ShouldBe(summer.Result(), -4, 'pos + bigger neg = neg')

    summer = new Summer
    summer.Add(-11)
    summer.Add(-31)
    jazil.ShouldBe(summer.Result(), -42, 'neg + neg = neg')
  },

  '0 is a no-op': function(jazil) {
    let summer = new Summer
    summer.Add(231)
    summer.Add(0)
    jazil.ShouldBe(summer.Result(), 231, 'number + 0')

    summer = new Summer
    summer.Add(0)
    summer.Add(-82376)
    jazil.ShouldBe(summer.Result(), -82376, '0 + number')

    summer = new Summer
    summer.Add(0)
    summer.Add(0)
    // use strict since we're dealing with 0 here and
    // don't want undefined etc. to match too
    jazil.ShouldBeStrict(summer.Result(), 0, '0 + 0')
  },

  'Order is irrelevant': function(jazil) {
    let summer1 = new Summer
    summer1.Add(2)
    summer1.Add(1)
    let summer2 = new Summer
    summer2.Add(1)
    summer2.Add(2)
    jazil.ShouldBe(summer1.Result(), summer2.Result(), 'simple numbers')

    summer1 = new Summer
    summer1.Add(-8)
    summer1.Add(25)
    summer2 = new Summer
    summer2.Add(25)
    summer2.Add(-8)
    jazil.ShouldBe(summer1.Result(), summer2.Result(), 'add in a negative')
  },

  'Result should close the summer': function(jazil) {
    let summer = new Summer
    jazil.Assert(summer.CanAdd(), 'new Summer not addable')
    summer.Add(3)
    jazil.Assert(summer.CanAdd(), 'used Summer not addable')
    summer.Add(4)
    jazil.ShouldBe(summer.Result(), 7, 'sum not correct')
    if (summer.CanAdd())
      jazil.Fail('closed Summer still addable')
  },

  'Estimating hard to predict sums': function(jazil) {
    let summer = new Summer
    summer.Add(3)
    summer.Add(5)
    jazil.ShouldBeBetween(summer.Result(), 2, 10, 'small sum not correct')

    summer = new Summer
    summer.Add(30)
    summer.Add(50)
    jazil.ShouldBeBetween(summer.Result(), 2, 10, 'big sum not correct')
  },

  'All basic sums': function(jazil) {
    // just to be sure
    for (let number1 = -10; number1 <= 10; ++number1) {
      for (let number2 = -10; number2 <= 10; ++number2) {
        let summer = new Summer
        summer.Add(number1)
        summer.Add(number2)
        jazil.ShouldBe(summer.Result(), number1 + number2, 'sum not correct')
      }
    }
  }
})


jazil.AddTestSet('Main page tests', {
  'The main page should list the correct answer': function(jazil) {
    let shownResult = parseInt($(jazil.testDocument).find('#result').text())

    jazil.ShouldBe(shownResult, 5)
  }
})