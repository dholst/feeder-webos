describe("First Assistant", function() {
  var assistant

  beforeEach(function() {
    assistant = new FirstAssistant()
    assistant.controller = new SceneControllerStub()
  })

  it("should do something", function() {
    expect(true).toEqual(true)
  })
})
