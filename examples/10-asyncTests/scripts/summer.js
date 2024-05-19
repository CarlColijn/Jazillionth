class Summer {
  #finalized = false
  #sum = 0

  Add(value) {
    if (!this.#finalized)
      this.#sum += value
  }

  async AddAsync(value, millisecToDelay) {
    await new Promise(function(resolve) {
      setTimeout(resolve, millisecToDelay)
    })

    if (!this.#finalized)
      this.#sum += value
  }

  get result() {
    this.#finalized = true
    return this.#sum
  }

  get canAdd() {
    return !this.#finalized
  }
}