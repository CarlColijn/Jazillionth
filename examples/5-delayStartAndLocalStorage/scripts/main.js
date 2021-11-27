function Calculate() {
  let value1 = parseInt($('#value1').val())
  let value2 = parseInt($('#value2').val())

  let summer = new Summer
  summer.Add(value1)
  summer.Add(value2)
  let result = summer.Result()

  $('#sumResult').val(result)
  localStorage.setItem('sumResult', result)
}


$(document).ready(function() {
  $('#calculate').on('click', Calculate)
})