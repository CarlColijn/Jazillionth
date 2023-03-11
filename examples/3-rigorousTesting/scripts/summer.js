var g_summerUsed = false

function Summer() {
  this.finalized = false
  this.sum = 0
}

Summer.prototype.Add = function(value) {
  if (this.finalized)
    throw 'Sorry, we\'re closed for today.'
  else
    this.sum += value
}

Summer.prototype.Result = function() {
  this.finalized = true
  g_summerUsed = true
  return this.sum
}

Summer.prototype.CanAdd = function() {
  return !this.finalized
}