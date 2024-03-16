class Summer {
  #finalized = false
  #sum = 0

  Add(value) {
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