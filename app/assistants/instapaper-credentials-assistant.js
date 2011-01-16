var InstapaperCredentialsAssistant = Class.create(BaseAssistant, {
  initialize: function($super, callback) {
    $super()
    this.button = {buttonLabel: $L("Save")}
    this.credentials = {}
    this.callback = callback
  },

  setup: function($super) {
    $super()
    this.setupWidgets()
    this.setupListeners()

    this.controller.update("username-label", $L("Username"))
    this.controller.update("password-label", $L("Password"))
  },

  activate: function($super, changes) {
    $super(changes)
    this.controller.get("password").mojo.setConsumesEnterKey(false)
  },

  cleanup: function($super) {
    $super()
    this.cleanupListeners()
  },

  setupWidgets: function() {
    this.controller.setupWidget("username", {modelProperty: "username", changeOnKeyPress: true, autoFocus: true, textCase: Mojo.Widget.steModeLowerCase}, this.credentials)
    this.controller.setupWidget("password", {modelProperty: "password", changeOnKeyPress: true}, this.credentials)
    this.controller.setupWidget("save", {type: Mojo.Widget.activityButton}, this.button)
  },

  setupListeners: function() {
    this.propertyChanged = this.propertyChanged.bind(this)
    this.save = this.save.bind(this)

    this.controller.listen("password", Mojo.Event.propertyChange, this.propertyChanged)
    this.controller.listen("save", Mojo.Event.tap, this.save)
  },

  cleanupListeners: function() {
    this.controller.stopListening("password", Mojo.Event.propertyChange, this.propertyChanged)
    this.controller.stopListening("save", Mojo.Event.tap, this.save)
  },

  propertyChanged: function(event) {
    if(Mojo.Char.enter === event.originalEvent.keyCode) {
      this.save()
    }
  },

  save: function() {
    Preferences.setInstapaperUsername(this.credentials.username)
    Preferences.setInstapaperPassword(this.credentials.password)
    this.callback()
    this.controller.stageController.popScene()
  }
})
