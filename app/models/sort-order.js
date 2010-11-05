var SortOrder = Class.create({
  initialize: function(string) {
    this.sortIds = string.toArray().inGroupsOf(8).map(function(key){return key.join("")})
  },

  getSortNumberFor: function(id) {
    var sortNumber = 0

    this.sortIds.each(function(sortId, index) {
      if(sortId == id) {
        sortNumber = index
        throw $break
      }
    })

    return sortNumber
  }
})