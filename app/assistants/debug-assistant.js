var DebugAssistant = Class.create(BaseAssistant, {
  setup: function($super) {
    $super()
    this.messages = {items: Log.items}
    this.controller.setupWidget("messages", {listTemplate: "debug/messages", itemTemplate: "debug/message"}, this.messages)
  }
})