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
  game.reload(edit.schema)
  game.resume()
  edit.pause()
})

