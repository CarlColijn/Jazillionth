$(document).ready(function() {
  let value1 = 1
  let value2 = parseInt(localStorage.getItem('value2'))
  if (isNaN(value2))
    value2 = 0
  else
    ++value2

  let summer = new Summer
  summer.Add(value1)
  summer.Add(value2)
  let result = summer.Result()

  $('#value2').text(value2)
  localStorage.setItem('value2', value2)
  $('#result').text(result)
  localStorage.setItem('result', result)
})