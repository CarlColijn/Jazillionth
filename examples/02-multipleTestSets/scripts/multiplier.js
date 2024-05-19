class Multiplier {
  #finalized = false
  #product = 1

  Add(value) {
    if (!this.#finalized)
      this.#product *= value
  }

  get result() {
    this.#finalized = true
    return this.#product
  }

  get canAdd() {
    return !this.#finalized
  }
}