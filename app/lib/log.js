var Log = {
  items: [],

  debug: function(message) {
    Mojo.Log.info(message)
    this.items.push({message: message})
  }
}