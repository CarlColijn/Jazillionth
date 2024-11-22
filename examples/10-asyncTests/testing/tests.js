let options = {
  'showPassedTests': true // to see the tests coming in one by one
}
let jazil = new Jazillionth(options)
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer'])


// This test set will take 2 seconds.
jazil.AddTestSet(mainPage, 'Summer tests', {
  // This test will take 1 second.
  'Summer test asynchronous #1, done at t=1 second': async function(jazil) {
    let summer = new Summer

    await summer.AddAsync(1, 500)
    await summer.AddAsync(1, 500)
    jazil.ShouldBe(summer.result, 2)
  },

  // This test will be instant.
  'Summer test synchronous, done at t=1 second': function(jazil) {
    let summer = new Summer

    summer.Add(2)
    summer.Add(2)
    jazil.ShouldBe(summer.result, 4)
  },

  // This test will take 1 second.
  'Summer test asynchronous #2, done at t=2 seconds': async function(jazil) {
    let summer = new Summer

    await summer.AddAsync(2, 500)
    await summer.AddAsync(2, 500)
    jazil.ShouldBe(summer.result, 4)
  },
})


jazil.AddTestSet(mainPage, 'Main page tests', {
  'The main page should list the correct answer, done at t=6 seconds': async function(jazil) {
    // This test runs after 2 seconds, while the main page's answer
    // will be ready after 6 seconds.  The answer is thus not yet
    // known right now, so this should be a fair polling test.

    let resultElement = jazil.testDocument.getElementById('result')

    let waitingForResult
    let resultText
    let result
    let milliSecsWaited = 0
    do {
      resultText = resultElement.textContent
      waitingForResult =
        resultText == '?' &&    // result not known yet
        milliSecsWaited < 10000 // give up after 10 seconds
      if (waitingForResult) {
        await new Promise(resolve => setTimeout(resolve, 100))
        milliSecsWaited += 100
      }
    } while (waitingForResult)
    result = parseInt(resultText)

    jazil.ShouldBe(result, 10)
  }
})
