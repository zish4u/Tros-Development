function paginatedTasks(model) {
  return async (req, res, next) => {
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)

    const startIndex = (page - 1) * limit
    const endIndex = page * limit

    const results = {}

    if (endIndex < await model.countDocuments().exec()) {
      results.next = {
        page: page + 1,
        limit: limit
      }
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit
      }
    }
    try {
      results.results = await model.find({ submit: true }, '-_id').limit(limit).skip(startIndex).exec()
      res.paginatedTasks = results
      next()
    } catch (err) {
      res.status(500).json({ status: "failure", error: err.message })
    }
  }
}
module.exports = paginatedTasks;