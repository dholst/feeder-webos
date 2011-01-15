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
  },

  itemRendered: function(listWidget, itemModel, itemNode) {
    var label = itemNode.down(".item-label")

    if(itemModel.command) {
      label.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;" + label.innerHTML
    }
    else {
      label.addClassName("unread")
    }
  }
})

