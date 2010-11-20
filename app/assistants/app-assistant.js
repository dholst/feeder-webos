var AppAssistant = Class.create({
	initialize: function() {
		this.mainStageName = "MainStage"
	},

	setup: function() {
		this.setInterval()
	},

	handleLaunch: function(parameters) {
		Log.debug("App Launched with " + Object.toJSON(parameters))
		var appController = Mojo.Controller.getAppController()
		var cardStageController = this.controller.getStageController(this.mainStageName)

		if (parameters) {
      if(parameters.action == "update") {
        this.checkForUpdates()
      }

			this.setInterval()
		}
		else {
			if (cardStageController) {
				cardStageController.activate()
			}
			else {
				this.controller.createStageWithCallback({
					name: this.mainStageName,
					lightweight: true
				},
				function(stageController) {
					stageController.pushScene("login")
				},
				"card")
			}
		}
	},

  checkForUpdates: function() {
    var self = this
    var api = new Api()

    api.login(new Credentials(), function() {
      api.getUnreadCounts(function(counts) {
        $A(counts).each(function(count) {
          if(count.count && Preferences.wantsNotificationFor(count.id)) {
            self.sendNotification()
            throw $break
          }
        })
      })
    })
  },

  sendNotification: function() {
    console.log("NOTIFY!!!!!!!!!")
  },

	setInterval: function(interval) {
		if (Preferences.notificationInterval() == "00:00:00") {
			new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: "clear",

				parameters: {
					"key": Mojo.appInfo.id + ".timer",
				}
			})
		}
		else {
			this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: "set",

				parameters: {
					"key": Mojo.appInfo.id + ".timer",
					"in": Preferences.notificationInterval(),
					"wakeup": true,
					"uri": "palm://com.palm.applicationManager/open",
					"params": {
						"id": Mojo.appInfo.id,
						"params": {
							"action": "update"
						}
					}
				}
			})
		}
	}
})

