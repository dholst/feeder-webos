var SearchAssistant = Class.create(BaseAssistant, {
  initialize: function($super, api, query) {
    $super()
    this.api = api
    this.query = query
  },

  setup: function($super) {
    $super()
  }
})
