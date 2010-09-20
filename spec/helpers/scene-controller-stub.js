function SceneControllerStub(){
  this.stageController = new StageControllerStub()
}

SceneControllerStub.prototype = {
  get: function(){},
  modelChanged: function(){},
  setupWidget: function(){},
  showAlertDialog: function(){},
  pushScene: function(){},
  listen: function(){},
  stopListening: function(){},
  serviceRequest: function(){},
  update: function(){},
  instantiateChildWidgets: function(){}
}
