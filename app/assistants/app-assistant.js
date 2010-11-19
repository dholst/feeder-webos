var AppAssistant = Class.create({
  initialize: function() {
    this.mainStageName = "MainStage"
  },

  handleLaunch: function(parameters) {
    Log.debug("App Launched with " + Object.toJSON(parameters))
    var appController = Mojo.Controller.getAppController()
    var cardStageController = this.controller.getStageController(this.mainStageName)

    if(parameters) {
     
    }
    else {
      if(cardStageController) {
        cardStageController.activate()
      }
      else {
        this.controller.createStageWithCallback(
          {name: this.mainStageName, lightweight: true}, 
          function(stageController){stageController.pushScene("login")}, 
          "card"
        )
      }
    }
  } 
})
