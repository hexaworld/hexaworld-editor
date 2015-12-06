var hexaworld = require('hexaworld/game.js')
var editor = require('./editor.js')

var editorContainer = document.getElementById('editor-container')
var width = editorContainer.clientWidth
var height = editorContainer.clientHeight

var edit = editor('editor', {width: width, height: height})

var game = hexaworld('game-container', edit.schema())
game.pause()
document.getElementById('game-container').style.display = 'none'

document.getElementById('button-edit').onclick = function (event) {
  document.getElementById('editor').style.display = 'initial'
  document.getElementById('game-container').style.display = 'none'
  editorContainer.style.background = 'rgb(100,100,100)'
  game.pause()
  edit.resume()
}

document.getElementById('button-play').onclick = function (event) {
  document.getElementById('editor').style.display = 'none'
  document.getElementById('game-container').style.display = 'block' 
  editorContainer.style.background = 'rgb(55,55,55)'
  game.reload(edit.schema())
  game.resume()
  edit.pause()
}

document.getElementById('button-reset').onclick = function (event) {
  document.getElementById('editor').style.display = 'initial'
  document.getElementById('game-container').style.display = 'none'
  game.pause()
  edit.reset()
  edit.resume()
}

document.getElementById('button-save').onclick = function (event) {
  var payload = encodeURIComponent(JSON.stringify(edit.schema()))
  var el = document.getElementById('button-save-download')
  el.setAttribute('download', 'world.json')
  el.setAttribute('href', 'data:application/text,' + payload)
  el.click()
}

document.getElementById('button-load-label').onclick = function (event) {
  document.getElementById('button-load').value = null
}

document.getElementById('button-load').onchange = function (event) {
  var reader = new FileReader()
  reader.onload = function (event) {
    var schema = JSON.parse(event.target.result)
    edit.reload(schema)
  }
  reader.readAsText(this.files[0])
}
