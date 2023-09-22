let jazil = new Jazillionth()
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer', 'g_summerUsed'])


jazil.AddTestSet(mainPage, 'module Summer', {
  'Summer should have been used by the test page by now': function(jazil) {
    jazil.Assert(g_summerUsed, 'g_summerUsed is not set yet')
  },

  'Positive numbers': function(jazil) {
    let summer = new Summer
    summer.Add(1)
    summer.Add(2)
    jazil.ShouldBe(summer.result, 3, 'basic sum')

    summer = new Summer
    summer.Add(12)
    summer.Add(9)
    jazil.ShouldBe(summer.result, 21, 'sum with carry')

    summer = new Summer
    summer.Add(1234567)
    summer.Add(3456789)
    jazil.ShouldBe(summer.result, 4691356, 'big numbers')
  },

  'Negative numbers': function(jazil) {
    let summer = new Summer
    summer.Add(-1)
    summer.Add(2)
    jazil.ShouldBe(summer.result, 1, 'neg + bigger pos = pos')

    summer = new Summer
    summer.Add(3)
    summer.Add(-7)
    jazil.ShouldBe(summer.result, -4, 'pos + bigger neg = neg')

    summer = new Summer
    summer.Add(-11)
    summer.Add(-31)
    jazil.ShouldBe(summer.result, -42, 'neg + neg = neg')
  },

  '0 is a no-op': function(jazil) {
    let summer = new Summer
    summer.Add(231)
    summer.Add(0)
    jazil.ShouldBe(summer.result, 231, 'number + 0')

    summer = new Summer
    summer.Add(0)
    summer.Add(-82376)
    jazil.ShouldBe(summer.result, -82376, '0 + number')

    summer = new Summer
    summer.Add(0)
    summer.Add(0)
    jazil.ShouldBe(summer.result, 0, '0 + 0')
  },

  'Summer is properly initialized out of the gate': function(jazil) {
    let summer = new Summer
    jazil.ShouldBe(summer.result, 0, 'not properly 0')

    summer = new Summer
    jazil.ShouldNotBe(summer.result, undefined, 'not properly initialized')
  },

  'Order is irrelevant': function(jazil) {
    let summer1 = new Summer
    summer1.Add(2)
    summer1.Add(1)
    let summer2 = new Summer
    summer2.Add(1)
    summer2.Add(2)
    jazil.ShouldBe(summer1.result, summer2.result, 'simple numbers')

    summer1 = new Summer
    summer1.Add(-8)
    summer1.Add(25)
    summer2 = new Summer
    summer2.Add(25)
    summer2.Add(-8)
    jazil.ShouldBe(summer1.result, summer2.result, 'add in a negative')
  },

  'Calling Result should close the summer': function(jazil) {
    let summer = new Summer
    jazil.Assert(summer.canAdd, 'new Summer not addable')
    summer.Add(3)
    jazil.Assert(summer.canAdd, 'used Summer not addable')
    summer.Add(4)
    jazil.ShouldBe(summer.result, 7, 'sum not correct')
    if (summer.canAdd)
      jazil.Fail('closed Summer still addable')
  },

  'Calling Result should inhibit further addition': function(jazil) {
    let summer = new Summer
    jazil.ShouldNotThrow(
      function() {
        summer.Add(3)
      },
      'adding to unclosed summer'
    )
    summer.result
    jazil.ShouldThrow(
      function() {
        summer.Add(4)
      },
      'adding to closed summer'
    )
  },

  'Estimating hard to predict sums': function(jazil) {
    let summer = new Summer
    summer.Add(3)
    summer.Add(5)
    jazil.ShouldBeBetween(summer.result, 2, 10, 'small sum not correct')

    summer = new Summer
    summer.Add(30)
    summer.Add(50)
    jazil.ShouldBeBetween(summer.result, 20, 80, 'big sum not correct')
  },

  'All basic sums': function(jazil) {
    // just to be sure
    for (let number1 = -10; number1 <= 10; ++number1) {
      for (let number2 = -10; number2 <= 10; ++number2) {
        let summer = new Summer
        summer.Add(number1)
        summer.Add(number2)
        jazil.ShouldBe(summer.result, number1 + number2, 'sum not correct')
      }
    }
  }
})


jazil.AddTestSet(mainPage, 'Main page tests', {
  'The main page should list the correct answer': function(jazil) {
    let shownResult = parseInt($(jazil.testDocument).find('#result').text())

    jazil.ShouldBe(shownResult, 5)
  }
})