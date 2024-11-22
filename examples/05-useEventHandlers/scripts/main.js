function Calculate() {
  let value1 = parseInt(document.getElementById('value1').value)
  let value2 = parseInt(document.getElementById('value2').value)

  let summer = new Summer
  summer.Add(value1)
  summer.Add(value2)
  let result = summer.result

  document.getElementById('result').value = result
  localStorage.setItem('result', result)
}


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calculate').addEventListener('click', Calculate)
})