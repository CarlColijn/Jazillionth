$(document).ready(function() {
  let summer = new Summer
  summer.Add(1)
  summer.Add(4)
  $('#result').text(summer.Result())
})