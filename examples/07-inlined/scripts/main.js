document.addEventListener('DOMContentLoaded', () => {
  let summer = new Summer
  summer.Add(1)
  summer.Add(4)
  document.getElementById('result').textContent = summer.result
})