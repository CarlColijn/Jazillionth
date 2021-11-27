function Multiplier() {
  this.finalized = false
  this.result = 1
}

Multiplier.prototype.Add = function(value) {
  if (!this.finalized)
    this.result *= value
}

Multiplier.prototype.Result = function() {
  this.finalized = true
  return this.result
}

Multiplier.prototype.CanAdd = function() {
  return !this.finalized
}