let options = {
  'ignoreCallStackLinesWith': ['testLibrary.js']
}
let jazil = new Jazillionth(options)
let mainPage = jazil.AddPageToTest('main', '../main.html', ['Summer'])


class CustomException extends Error {
  constructor(message) {
    super(message)
  }
}


function ThisOneThrows(message) {
  throw Error(message)
}


jazil.AddTestSet(mainPage, 'Library files not in call stack', {
  'Failing a test to force a call stack': function(jazil) {
    TestSummer(
      1, 2, (summerResult, correctResult) => {
        jazil.ShouldBe(summerResult, correctResult, 'testLibrary.js should not show in the call stack')
      }
    )
  },

  'Throwing a standard exception ourselves with a call stack': function(jazil) {
    throw Error('Throwing \'Error\' shows a call stack trace')
  },

  'Throwing a custom exception ourselves with a call stack': function(jazil) {
    throw CustomException('Throwing \'CustomException\' shows a call stack trace')
  },

  'Throwing an exception ourselves without a call stack': function(jazil) {
    throw 'Throwing a string doesn\'t show a call stack trace'
  },

  'Called code can also throw exceptions': function(jazil) {
    ThisOneThrows('Called code is also present on the call stack trace')
  }
})
