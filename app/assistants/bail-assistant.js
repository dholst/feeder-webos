BailAssistant = Class.create(BaseAssistant, {
  ready: function($super) {
    $("message").update($L("Error"))
  }
})
