let g_summerUsed = false

class Summer {
  #finalized = false
  #sum = 0

  Add(value) {
    if (this.#finalized)
      throw 'Sorry, we\'re closed for today.'
    else
      this.#sum += value
  }

  get result() {
    this.#finalized = true
    g_summerUsed = true
    return this.#sum
  }

  get canAdd() {
    return !this.#finalized
  }
}