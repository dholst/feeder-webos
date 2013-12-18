var CredentialsAssistant = Class.create(BaseAssistant, {
  initialize: function($super, credentials, showMessage) {
    $super()
    this.hidePreferences = true
    this.credentials = credentials
    this.showMessage = showMessage
    this.button = {buttonLabel: $L("Login")}
    this.hideLogout = true
    this.showFields = true
    
    if (credentials.service == "feedly")
    {
    	this.showFields = false
    }
    
    this.serviceChoices = [
      {label: $L("The Old Reader"), value: "tor"},
      {label: $L("InoReader"), value: "ino"},
      {label: $L("Feedly"), value: "feedly"}
    ]
  },

  setup: function($super) {
    $super()
    this.setupWidgets()
    this.setupListeners()

    this.controller.update("email-label", $L("Username"))
    this.controller.update("password-label", $L("Password"))
    this.controller.update("service-label", $L("Service"))
    this.controller.update("error-message", $L("Login failed. Try again."))
  },

  activate: function($super, changes) {
    $super(changes)
    this.controller.get("password").mojo.setConsumesEnterKey(false)
    this.controller.get("login-failure")[this.showMessage ? "show" : "hide"]()
    this.controller.get("email-group")[this.showFields ? "show" : "hide"]()
    this.controller.get("password-group")[this.showFields ? "show" : "hide"]()
  },

  cleanup: function($super) {
    $super()
    this.cleanupListeners()
  },

  setupWidgets: function() {
    this.controller.setupWidget("service", {modelProperty: "service", choices: this.serviceChoices}, this.credentials)
    this.controller.setupWidget("email", {modelProperty: "email", changeOnKeyPress: true, autoFocus: true, textCase: Mojo.Widget.steModeLowerCase}, this.credentials)
    this.controller.setupWidget("password", {modelProperty: "password", changeOnKeyPress: true}, this.credentials)
    this.controller.setupWidget("login", {type: Mojo.Widget.activityButton}, this.button)
  },

  setupListeners: function() {
    this.propertyChanged = this.propertyChanged.bind(this)
    this.login = this.login.bind(this)

	this.controller.listen("password", Mojo.Event.propertyChange, this.propertyChanged)
	this.controller.listen("service", Mojo.Event.propertyChange, this.setService = this.setService.bind(this))
    this.controller.listen("login", Mojo.Event.tap, this.login)
  },

  cleanupListeners: function() {
	this.controller.stopListening("password", Mojo.Event.propertyChange, this.propertyChanged)
    this.controller.stopListening("login", Mojo.Event.tap, this.login)
    this.controller.stopListening("service", Mojo.Event.propertyChange, this.setService)
  },

  propertyChanged: function(event) {
    if(Mojo.Char.enter === event.originalEvent.keyCode) {
      this.login()
    }
  },

  login: function() {
    this.controller.stageController.swapScene("login", this.credentials)
  },
  
  setService: function(propertyChangeEvent) {
  	if (propertyChangeEvent.value == "feedly")
  	{
  		this.controller.get("email-group")["hide"]()
  		this.controller.get("password-group")["hide"]()
  	}
  	else
  	{
  		this.controller.get("email-group")["show"]()
  		this.controller.get("password-group")["show"]()
  	}
  },
})
