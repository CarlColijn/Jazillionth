document.addEventListener('DOMContentLoaded', async () => {
  // Wait 6 seconds in total.
  let summer = new Summer
  await summer.AddAsync(1, 1500)
  await summer.AddAsync(2, 1500)
  await summer.AddAsync(3, 1500)
  await summer.AddAsync(4, 1500)
  document.getElementById('result').textContent = summer.result
})