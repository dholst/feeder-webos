var BaseAssistant = Class.create({
  initialize: function() {
    this.smallSpinner = {spinning: false}
  },

  setup: function() {
    this.controller.setupWidget("spinner", {spinnerSize: Mojo.Widget.spinnerLarge}, {})
    this.controller.setupWidget("small-spinner", {spinnerSize: "small"}, this.smallSpinner)
  },

  ready: function() {
  },

  readytoactivat: function() {
  },

  activate: function() {
  },

  deactivate: function() {

  },

  cleanup: function() {
  },

  smallSpinnerOn: function() {
    this.hideRefreshButton()
    this.smallSpinner.spinning = true
    this.controller.modelChanged(this.smallSpinner)    
  },
  
  smallSpinnerOff: function() {
    this.smallSpinner.spinning = false
    this.controller.modelChanged(this.smallSpinner)
    this.showRefreshButton()
  },
  
  hideRefreshButton: function() {
    var button = this.controller.get("refresh")
    if(button) button.hide()
  },
  
  showRefreshButton: function() {
    var button = this.controller.get("refresh")
    if(button) button.show()
  },
  
  spinnerOn: function(message) {
    var spinner = this.controller.sceneElement.querySelector(".spinner")
    spinner.mojo.start()
    this.controller.get("spinner-scrim").show()

    var spinnerMessage = this.controller.get("spinner-message")

    if(!spinnerMessage) {
      spinner.insert({after: '<div id="spinner-message" class="spinner-message palm-info-text"></div>'})
      spinnerMessage = this.controller.get("spinner-message")
    }

    spinnerMessage.update(message || "")
  },

  spinnerOff: function() {
    var message = this.controller.get("spinner-message")

    if(message) {
      message.remove()
      this.controller.sceneElement.querySelector(".spinner").mojo.stop()
      this.controller.get("spinner-scrim").hide()
    }
  },
  
  bail: function(message) {
    Log.debug("Crap, bailing..." + message)
  },
  
  sourceRendered: function(listWidget, itemModel, itemNode) {
    if(itemModel.unreadCount) {
      $(itemNode).addClassName("unread")
    }
  },
  
  refreshList: function(list, items) {
    list.mojo.noticeUpdatedItems(0, items)
    list.mojo.setLength(items.length)    
  }
})