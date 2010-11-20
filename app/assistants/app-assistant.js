var AppAssistant = Class.create({
	initialize: function() {
		this.mainStageName = "MainStage"
<<<<<<< HEAD
	},

	setup: function() {
		this.setInterval("00:00:10")
=======
    this.dashboardStageName = "DashboardStage"
	},

	setup: function() {
		this.setInterval()
>>>>>>> master
	},

	handleLaunch: function(parameters) {
		Log.debug("App Launched with " + Object.toJSON(parameters))
		var appController = Mojo.Controller.getAppController()
		var cardStageController = this.controller.getStageController(this.mainStageName)

		if (parameters) {
<<<<<<< HEAD
      this.setInterval("00:00:10")
=======
      if(parameters.action == "update") {
        this.checkForUpdates()
      }

			this.setInterval(parameters.action == "notificationIntervalChange")
>>>>>>> master
		}
		else {
			if (cardStageController) {
				cardStageController.activate()
			}
			else {
<<<<<<< HEAD
				this.controller.createStageWithCallback({
					name: this.mainStageName,
					lightweight: true
				},
				function(stageController) {
					stageController.pushScene("login")
				},
				"card")
=======
				this.controller.createStageWithCallback(
          {name: this.mainStageName, lightweight: true},
				  function(stageController) {stageController.pushScene("login")},
				  "card"
        )
>>>>>>> master
			}
		}
	},

<<<<<<< HEAD
	setInterval: function(interval) {
		if (interval !== "00:00:00") {
			this.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: "set",

				parameters: {
					"key": Mojo.appInfo.id + ".update",
					"in": interval,
=======
  checkForUpdates: function() {
    var self = this
    var api = new Api()

    api.login(new Credentials(), function() {
      api.getUnreadCounts(function(counts) {
        var unreadCount = 0

        $A(counts).each(function(count) {
          if(count.count && Preferences.wantsNotificationFor(count.id)) {
            unreadCount += count.count
          }
        })

        if(unreadCount) {
          self.sendNotification(unreadCount)
        }
      })
    })
  },

  sendNotification: function(unreadCount) {
    var appController = Mojo.Controller.getAppController()
    var dashboardStage = appController.getStageProxy(this.dashboardStageName)

    if(dashboardStage) {
      dashboardStage.delegateToSceneAssistant("updateDashboard", unreadCount)
    }
    else {
      appController.createStageWithCallback(
        {name: this.dashboardStageName, lightweight: true},
        function(stageController){stageController.pushScene("dashboard", unreadCount)},
        "dashboard"
      )
    }
  },

	setInterval: function(changed) {
    var self = this

		if (Preferences.notificationInterval() == "00:00:00" || changed) {
			new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: "clear",

				parameters: {
					"key": Mojo.appInfo.id + ".timer",
				}
			})
		}

		if (Preferences.notificationInterval() != "00:00:00") {
      if(!self.wakeupRequest) {
        self.checkForUpdates()
      }
        
			self.wakeupRequest = new Mojo.Service.Request("palm://com.palm.power/timeout", {
				method: "set",

				parameters: {
					"key": Mojo.appInfo.id + ".timer",
					"in": Preferences.notificationInterval(),
>>>>>>> master
					"wakeup": true,
					"uri": "palm://com.palm.applicationManager/open",
					"params": {
						"id": Mojo.appInfo.id,
						"params": {
							"action": "update"
						}
					}
<<<<<<< HEAD
				},
				
        onSuccess: function(response) {
					Log.debug("Alarm Set Success " + response.returnValue)
					Feeder.wakeupTaskId = Object.toJSON(response.taskId)
				},
			
        onFailure: function(response) {
					Mojo.Log.info("Alarm Set Failure " + response.returnValue + " " + response.errorText)
=======
>>>>>>> master
				}
			})
		}
	}
})

