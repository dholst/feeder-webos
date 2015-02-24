var Search = Class.create(ArticleContainer, {
  initialize: function($super, api, query, id) {
    $super(api)
    this.query = query
    this.id = id
    this.title = $L("Search for \"#{query}\"").interpolate(this)
    this.showOrigin = true
    this.canMarkAllRead = false
    this.disableSearch = true
  },

  makeApiCall: function(continuation, success, failure) {
    this.api.search(this.query, this.id, success, failure)
  },

  articleRead: function(subscriptionId) {
  },

  articleNotRead: function(subscriptionId) {
  },

  highlight: function(node) {
    this.findAndReplace(new RegExp("(" + this.escapeRegex(this.query) + ")", "i"), "<b class=\"highlight\">$1</b>", node)
  },

  escapeRegex: function(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  },

  findAndReplace: function(searchText, replacement, searchNode) {
    var childNodes = searchNode.childNodes

    for(var i = 0; i < childNodes.length; i++) {
      var currentNode = childNodes[i];

      if (currentNode.nodeType === 1 && !currentNode.nodeName.match(/(html|head|style|title|link|meta|script|object|iframe)/i)) {
        this.findAndReplace(searchText, replacement, currentNode)
      }

      if (currentNode.nodeType == 3 && searchText.test(currentNode.data) ) {
        var frag = (function() {
          var html = currentNode.data.replace(searchText, replacement)
          var wrap = document.createElement('div')
          var frag = document.createDocumentFragment()
          wrap.innerHTML = html

          while (wrap.firstChild) {
            frag.appendChild(wrap.firstChild)
          }

          return frag
        })()

        var parent = currentNode.parentNode
        parent.insertBefore(frag, currentNode)
        parent.removeChild(currentNode)
      }
    }
  }
})
