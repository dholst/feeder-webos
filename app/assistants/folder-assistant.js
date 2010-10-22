var FolderAssistant = Class.create(BaseAssistant, {
  initialize: function($super, folder) {
    $super()
    this.folder = folder
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("folders", {itemTemplate: "folder/folder", onItemRendered: this.folderRendered, itemsProperty: "subscriptions"}, this.folder)
    this.controller.listen("folders", Mojo.Event.listTap, this.folderTaped = this.folderTapped.bind(this))
  },

  cleanup: function($super) {
    $super()
    this.controller.stopListening("folders", Mojo.Event.listTap, this.folderTaped)
  },

  ready: function($super) {
    this.controller.get("header").update(this.folder.title)
  },

  activate: function($super) {
    $super()
    this.filterReadItems(this.folder, "subscriptions")
    this.refreshList(this.controller.get("folders"), this.folder.subscriptions)

    if(!this.folder.subscriptions.length) {
      this.controller.stageController.popScene()
    }
  },

  folderTapped: function(event) {
    this.controller.stageController.pushScene("articles", event.item)
  },

  folderRendered: function(listWidget, itemModel, itemNode) {
    if(itemModel.constructor == Folder) {
      itemNode.down(".folder-title").update("All")
    }

    if(itemModel.unreadCount) {
      $(itemNode).addClassName("unread")
    }
  }
})