document.addEventListener('DOMContentLoaded', () => {
  let summer = new Summer
  summer.Add(1)
  summer.Add(2)
  summer.Add(4)
  document.getElementById('sumResult').textContent = summer.result

  let multiplier = new Multiplier
  multiplier.Add(2)
  multiplier.Add(3)
  multiplier.Add(5)
  document.getElementById('multiplyResult').textContent = multiplier.result
})