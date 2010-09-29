var Countable = Class.create({
  initialize: function($super) {
  },
  
  clearUnreadCount: function() {
    this.setUnreadCount(0)
  },
  
  setUnreadCount: function(count) {
    this.unreadCount = count
    this.unreadCountDisplay = count > 999 ? "1000+" : count
  },
  
  incrementUnreadCountBy: function(count) {
    this.setUnreadCount((this.getUnreadCount() || 0) + count)
  },
  
  getUnreadCount: function() {
    return this.unreadCount
  }
})