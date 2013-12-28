var Countable = Class.create({
  initialize: function() {
    this.unreadCount = 0
  },

  clearUnreadCount: function() {
    this.setUnreadCount(0)
  },

  setUnreadCount: function(count) {
    this.unreadCount = count

    if(this.unreadCount < 0) {
      this.unreadCount = 0
    }

    this.unreadCountDisplay = count > 9999 ? "10000+" : count
    this.unreadCountDisplay = count <= 0 ? "" : this.unreadCountDisplay
  },

  incrementUnreadCountBy: function(count) {
    this.setUnreadCount((this.getUnreadCount() || 0) + count)
  },

  decrementUnreadCountBy: function(count) {
    this.incrementUnreadCountBy(-count)
  },

  getUnreadCount: function() {
    return this.unreadCount
  }
})