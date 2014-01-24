var CredentialsAssistant = Class.create(BaseAssistant, {
  initialize: function($super, credentials, showMessage) {
    $super()
    this.hidePreferences = true
    this.credentials = credentials
    this.showMessage = showMessage
    this.button = {buttonLabel: $L("Login")}
    this.hideLogout = true
    
    this.serviceChoices = [
      {label: $L("AOL Reader"), value: "aol"},
      {label: $L("BazQux"), value: "bq"},
      {label: $L("Feedly"), value: "feedly"},
      {label: $L("InoReader"), value: "ino"},
      {label: $L("The Old Reader"), value: "tor"},
      {label: $L("Tiny Tiny RSS"), value: "ttrss"}
    ]
  },

  setup: function($super) {
    $super()
    this.setupWidgets()
    this.setupListeners()

    this.controller.update("email-label", $L("Username"))
    this.controller.update("password-label", $L("Password"))
    this.controller.update("service-label", $L("Service"))
    this.controller.update("server-label", $L("Server URL"))
    this.controller.update("error-message", $L("Login failed. Try again."))
  },

  activate: function($super, changes) {
    $super(changes)    
    this.controller.get("password").mojo.setConsumesEnterKey(false)
    this.controller.get("server").mojo.setConsumesEnterKey(false)
    this.controller.get("login-failure")[this.showMessage ? "show" : "hide"]()
    var initializeFields = {value: this.credentials.service}
    this.setService(initializeFields)
  },

  cleanup: function($super) {
    $super()
    this.cleanupListeners()
  },

  setupWidgets: function() {
    this.controller.setupWidget("service", {modelProperty: "service", choices: this.serviceChoices}, this.credentials)
    this.controller.setupWidget("email", {modelProperty: "email", changeOnKeyPress: true, autoFocus: true, textCase: Mojo.Widget.steModeLowerCase}, this.credentials)
    this.controller.setupWidget("password", {modelProperty: "password", changeOnKeyPress: true}, this.credentials)
    this.controller.setupWidget("server", {modelProperty: "server", changeOnKeyPress: true, textCase: Mojo.Widget.steModeLowerCase}, this.credentials)
    this.controller.setupWidget("login", {type: Mojo.Widget.activityButton}, this.button)
  },

  setupListeners: function() {
    this.propertyChanged = this.propertyChanged.bind(this)
    this.login = this.login.bind(this)

	this.controller.listen("password", Mojo.Event.propertyChange, this.propertyChanged)
	this.controller.listen("server", Mojo.Event.propertyChange, this.propertyChanged)
	this.controller.listen("service", Mojo.Event.propertyChange, this.setService = this.setService.bind(this))
    this.controller.listen("login", Mojo.Event.tap, this.login)
  },

  cleanupListeners: function() {
	this.controller.stopListening("password", Mojo.Event.propertyChange, this.propertyChanged)
	this.controller.stopListening("server", Mojo.Event.propertyChange, this.propertyChanged)
    this.controller.stopListening("login", Mojo.Event.tap, this.login)
    this.controller.stopListening("service", Mojo.Event.propertyChange, this.setService)
  },

  propertyChanged: function(event) {
    if(Mojo.Char.enter === event.originalEvent.keyCode) {
    	if ((event.property === "password" && this.controller.get("server-group").style.display === "none") || event.property === "server")
    	{	
      		this.login()
    	} 
    	else if ((event.property === "password" && this.controller.get("server-group").style.display !== "none")) {
    		this.controller.get("server").mojo.focus()	
    	}
    }
  },

  login: function() {
    this.controller.stageController.swapScene("login", this.credentials)
  },
  
  setService: function(propertyChangeEvent) {
  	if (propertyChangeEvent.value == "feedly" || propertyChangeEvent.value == "aol")
  	{
  		this.controller.get("email-group")["hide"]()
  		this.controller.get("password-group")["hide"]()
 		this.controller.get("server-group")["hide"]()
  	}
  	else if (propertyChangeEvent.value == "ttrss")
  	{
  		this.controller.get("email-group")["show"]()
  		this.controller.get("password-group")["show"]()
 		this.controller.get("server-group")["show"]()
  	}
  	else
  	{
  		this.controller.get("email-group")["show"]()
  		this.controller.get("password-group")["show"]()
 		this.controller.get("server-group")["hide"]()
  	}
  },
})
