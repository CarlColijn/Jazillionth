function Summer() {
  this.finalized = false
  this.sum = 1
}

Summer.prototype.Add = function(value) {
  if (!this.finalized)
    this.sum += value
}

Summer.prototype.Result = function() {
  this.finalized = true
  return this.sum
}

Summer.prototype.CanAdd = function() {
  return !this.finalized
}