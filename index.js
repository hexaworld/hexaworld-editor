var hexaworld = require('hexaworld/game.js')
var editor = require('./editor.js')

var editorContainer = document.getElementById('editor-container')
var width = editorContainer.clientWidth
var height = editorContainer.clientHeight

var edit = editor('editor', {width: width, height: height})

var game = hexaworld('game', edit.schema, {width: width * 0.75, height: height * 0.75})
game.pause()

document.getElementById('button-edit').addEventListener('click', function (event) {
  document.getElementById('editor').style.display = 'initial'
  document.getElementById('game').style.display = 'none'
  game.pause()
  edit.resume()
})

document.getElementById('button-play').addEventListener('click', function (event) {
  document.getElementById('editor').style.display = 'none'
  document.getElementById('game').style.display = 'initial' 
  game.reload(edit.schema())
  game.resume()
  edit.pause()
})

document.getElementById('button-reset').addEventListener('click', function (event) {
  document.getElementById('editor').style.display = 'initial'
  document.getElementById('game').style.display = 'none'
  game.pause()
  edit.reset()
  edit.resume()
})

document.getElementById('button-save').addEventListener('click', function (event) {
  var payload = encodeURIComponent(JSON.stringify(edit.schema()))
  var el = document.getElementById('button-save-download')
  el.setAttribute('download', 'world.json')
  el.setAttribute('href', 'data:application/text,' + payload)
  el.click()
})

document.getElementById('button-load').addEventListener('change', function (event) {
  var reader = new FileReader()
  reader.onload = function (event) {
    edit.reload(JSON.parse(event.target.result))
  }
  reader.readAsText(this.files[0])
})
