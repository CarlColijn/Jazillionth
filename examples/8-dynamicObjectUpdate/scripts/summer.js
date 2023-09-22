let g_trackedTotalSummed = 0
let g_untrackedTotalSummed = 0


class Summer {
  #finalized = false
  #sum = 0

  Add(value) {
    if (!this.#finalized) {
      this.#sum += value
      g_trackedTotalSummed += value
      g_untrackedTotalSummed += value
    }
  }

  get result() {
    this.#finalized = true
    return this.#sum
  }

  get canAdd() {
    return !this.#finalized
  }
}