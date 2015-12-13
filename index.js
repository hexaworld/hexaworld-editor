var hexaworld = require('hexaworld/game.js')
var base = require('./base.js')
var editor = require('./ui/editor.js')
var maps = require('./ui/maps.js')
var config = require('./ui/config.js')

var editorContainer = document.getElementById('editor-container')
var selectorContainer = document.getElementById('selector')
var width = editorContainer.clientWidth
var height = editorContainer.clientHeight
var offset = selectorContainer.clientWidth

var selected = 0
var init = [base(), base()]
var maps = maps('maps', init)

var init = {name: 'welcome', lives: 3, stages: 2, steps: 6}
var config = config('config', init)

var edit = editor('editor', maps.get(selected), {width: width, height: height, offset: offset})

maps.events.on('selected', function(id) {
  selected = id
  edit.reload(maps.get(selected))
})

var game = hexaworld('game-container', maps.get(selected))
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
  game.reload(maps.get(selected))
  game.resume()
  edit.pause()
  setTimeout(function() {
    editorContainer.style.background = 'rgb(55,55,55)'
    document.getElementById('editor').style.display = 'none'
    document.getElementById('game-container').style.display = 'block' 
  }, 50)
}

document.getElementById('button-reset').onclick = function (event) {
  document.getElementById('editor').style.display = 'initial'
  document.getElementById('game-container').style.display = 'none'
  game.pause()
  maps.reset(selected)
  edit.reload(maps.get(selected))
  edit.resume()
}

document.getElementById('button-save').onclick = function (event) {
  var blob = {config: config.get(), maps: maps.getall()}
  console.log(blob.config)
  var payload = encodeURIComponent(JSON.stringify(blob))
  var el = document.getElementById('button-save-download')
  el.setAttribute('download', blob.config.name + '.json')
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
    selected = 0
    config.load(schema.config)
    maps.load(schema.maps)
    edit.reload(maps.get(selected))
  }
  reader.readAsText(this.files[0])
}