function TestSummer(value1, value2, OnErrorHandler) {
  let correctResult = value1 + value2

  let summer = new Summer
  summer.Add(value1)
  summer.Add(value2)
  let summerResult = summer.Result()

  if (summerResult !== correctResult)
    OnErrorHandler(summerResult, correctResult)
}