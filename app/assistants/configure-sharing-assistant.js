var ConfigureSharingAssistant = Class.create(BaseAssistant, {
  initialize: function($super, sharingOptions) {
    $super()

    sharingOptions.each(function(item) {
      item.enabled = Preferences.isSharingOptionEnabled(item.id, item.defaultEnabled)
    })

    this.list = {items: sharingOptions}
  },

  setup: function($super) {
    $super()
    this.controller.setupWidget("item", {modelProperty: "enabled"})
    this.controller.setupWidget("list", {itemTemplate: "configure-sharing/item", reorderable: true, onItemRendered: this.itemRendered.bind(this)}, this.list)
    this.controller.get("header").update($L("Configure Sharing"))
    this.controller.listen("list", Mojo.Event.listReorder, this.reordered = this.reordered.bind(this))
  },

  cleanup: function($super) {
    this.controller.stopListening("list", Mojo.Event.listReorder, this.reordered)
  },

  itemRendered: function(listWidget, itemModel, itemNode) {
    var label = itemNode.down(".item-label")

    if(itemModel.command) {
      label.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + label.innerHTML
    }
    else {
      label.addClassName("unread")
    }
  },

  reordered: function(event) {
    var self = this

    if(!self.newSortOrder) {
      self.newSortOrder = []

      self.list.items.each(function(item) {
        self.newSortOrder.push(item.id)
      })
    }

    var from = event.fromIndex
    var to = event.toIndex

    if(from > to) {
      self.newSortOrder.splice(to, 0, self.newSortOrder[from])
      self.newSortOrder.splice(from + 1, 1)
    }
    else {
      self.newSortOrder.splice(to + 1, 0, self.newSortOrder[from])
      self.newSortOrder.splice(from, 1)
    }
  },

  handleCommand: function($super, event) {
    if(!$super(event)) {
      if (Mojo.Event.back == event.type) {
        event.stop();

        this.list.items.each(function(item) {
          Preferences.setSharingOptionEnabled(item.id, item.enabled)
        })

        if(this.newSortOrder) {
          Preferences.setSharingOptionsSortOrder(this.newSortOrder)
        }

        this.controller.stageController.popScene()
      }
    }
  }
})

