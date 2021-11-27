$(document).ready(function() {
  let summer = new Summer
  summer.Add(1)
  summer.Add(4)
  $('#sumResult').text(summer.Result())
})