$(document).ready(function() {
  let summer = new Summer
  summer.Add(1)
  summer.Add(2)
  summer.Add(4)
  $('#sumResult').text(summer.Result())

  let multiplier = new Multiplier
  multiplier.Add(2)
  multiplier.Add(3)
  multiplier.Add(5)
  $('#multiplyResult').text(multiplier.Result())
})