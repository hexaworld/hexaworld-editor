var _ = require('lodash')
var interact = require('interact.js')
var transform = require('hexaworld/transform.js')
var tile = require('hexaworld/geo/tile.js')
var circle = require('hexaworld/geo/circle.js')
var Mask = require('hexaworld/mask.js')
var World = require('hexaworld/world.js')
var Camera = require('hexaworld/camera.js')
var Player = require('hexaworld/player.js')
var Game = require('crtrdg-gameloop')
var Keyboard = require('crtrdg-keyboard')

var editorContainer = document.getElementById('editor-container')
var editor = document.createElement('canvas')
editor.setAttribute('width', editorContainer.clientWidth + 'px')
editor.setAttribute('height', editorContainer.clientHeight + 'px')
editorContainer.appendChild(editor)

var paths = [
  [], 
  [3], 
  [0,1,2,3,4,5],
  [3,4], [3,5], [3,0],
  [1,3,5], [3,4,5], [3,4,0], [3,4,1],
  [0,1,2,3], [0,1,2,4], [0,1,3,4], [0,1,2,3,4]
]

var colors = [
  '#FF5050', 
  '#FF8900', 
  '#00C3EE', 
  '#64FF00'
]

var groups = [2, 5, 9]
var size = 100

var icons = {

  tiles: paths.map( function (p) {
    return tile({
      position: [0, 0],
      scale: size / 2,
      paths: p,
      thickness: 1
    })
  }),

  landmarks: colors.map( function (c) {
    return circle({
      fill: c,
      stroke: 'white', 
      thickness: 3, 
      scale: 15
    })
  })

}

var mask = new Mask({
  size: 0.95 * size/2,
  position: [size/2, size/2],
  fill: 'rgb(90,90,90)',
  orientation: 'flat'
})

function makeIcon(i, label) {
  var canvas = document.createElement('canvas')
  canvas.setAttribute('width', size + 'px')
  canvas.setAttribute('height', size + 'px')
  canvas.id = label + '-' + i
  canvas.className = label + '-icon icon'
  document.getElementById(label).appendChild(canvas)
}

function drawIcon(i, label) {
  var context = document.getElementById(label + '-' + i).getContext('2d')
  var camera = {transform: transform(), game: {width: size, height: size}}
  mask.set(context)
  icons[label][i].draw(context, camera)
  mask.unset(context)
}

_.forEach(_.range(icons.tiles.length), function(i) {
  makeIcon(i, 'tiles')
  drawIcon(i, 'tiles')
  if (groups.indexOf(i) > -1) {
    document.getElementById('tiles').appendChild(document.createElement('hr'))
  }
})

_.forEach(_.range(icons.landmarks.length), function(i) {
  makeIcon(i, 'landmarks')
  drawIcon(i, 'landmarks')
})

function getPosition(event) {
  var x = event.pageX - editor.width/2
  var y = event.pageY - editor.height/2
  if (_.all([x > -editor.width/2, x < editor.width/2, y > -editor.height/2, y < editor.height/2])) {
    return camera.transform.apply([[x, y]])[0]
  }
}

_.forEach(document.getElementsByClassName('tiles-icon'), function(icon) {
  icon.addEventListener('click', function (item) {
    var d
    if (item.offsetY > 0 && item.offsetY < size) {
      if (item.offsetX >= size/2 && item.offsetX < size) d = 1
      if (item.offsetX > 0 && item.offsetX < size/2) d = -1
    } 
    if (d) {
      var id = parseInt(icon.id.split('-')[1])
      paths[id] = _.map(paths[id], function(i) {return ((i + d) % 6) < 0 ? 5 : ((i + d) % 6) })
      icons.tiles[id] = tile({
        position: [0, 0], 
        scale: size/2, 
        paths: paths[id],
        thickness: 1
      })
      drawIcon(id, 'tiles')
    }
  })
})

interact('.icon').draggable({

  onmove: function (event) {
    var target = event.target
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy
    var translation = 'translate(' + x + 'px, ' + y + 'px)'
    target.style.webkitTransform = target.style.transform = translation
    target.setAttribute('data-x', x)
    target.setAttribute('data-y', y)
    world.tiles.forEach( function(tile) {
      tile.props.stroke = null
    })
    var position = getPosition(event)
    if (position) {
      var location = world.locate(position)
      console.log(location)
      if (location > -1) {
        world.tiles[location].props.stroke = 'rgb(100, 200, 112)'
        world.tiles[location].props.thickness = 10
      }
      world.tiles = _.sortBy(world.tiles, function (tile, i) {
        return location == i
      })
    }
    drawEditor()
  },

  onend: function (event) {
    var target = event.target
    var position = getPosition(event)
    if (position) {
      var location = world.locate(position)
      if (location > -1) world.tiles.splice(location, 1)
      var q = Math.round(position[0] * 2/3 / 50)
      var r = Math.round((-position[0] / 3 + Math.sqrt(3)/3 * position[1]) / 50)

      if (target.className.split(' ')[0] == 'tiles-icon') {        
        var t = tile({
          position: [q, r],
          scale: 50,
          paths: paths[parseInt(target.id.split('-')[1])],
          thickness: 0.75
        })
        world.tiles.push(t)
      }

      if (target.className.split(' ')[0] == 'landmarks-icon') {
        if (location > -1) {
          var t = tile({
            position: [q, r],
            scale: 50,
            paths: [],
            thickness: 0.75,
            children: circle({
              fill: colors[parseInt(target.id.split('-')[1])],
              stroke: 'white', 
              thickness: 1, 
              scale: 0.15
            })
          })
          world.tiles.push(t)
        }
      }
    
    }
    target.style.webkitTransform = target.style.transform = 'translate(0px, 0px)'
    target.setAttribute('data-x', 0)
    target.setAttribute('data-y', 0)
    drawEditor()
  }
})

var keyboard = new Keyboard()
var camera = new Camera({
  scale: 0.7,
  speed: {position: .5, angle: .1, scale: .002},
  friction: 1,
})
camera.game = {width: editor.width, height: editor.height}

var world = new World()
var init = [
  [0, -2], [0, -1], [0, 0], [0, 1], [0, 2],
  [1, 0], [1, -1], [1, -2], [1, 1],
  [-1, 1], [-1, 0], [-1, -1], [-1, 2],
  [-2, 1], [-2, 0], [-2, -1], [-2, 2], [-2, 3],
  [2, 0], [2, -1], [2, -2], [2, -3], [2, 1]
]

world.tiles = init.map(function (p) {
  return tile({
    position: p, 
    scale: 50,
    thickness: 0.75
  })
})

keyboard.on('keydown', function(key) {
  if (key === '<up>') {
    camera.transform.position[1] -= 50
  }
  if (key === '<down>') {
    camera.transform.position[1] += 50
  }
  if (key === '<left>') {
    camera.transform.position[0] -= 50
  }
  if (key === '<right>') {
    camera.transform.position[0] += 50
  }
  if (key === ',') {
    camera.transform.scale += 0.1
  }
  if (key === '.') {
    camera.transform.scale -= 0.1
  }
  drawEditor()
})

function drawEditor() {
  var context = editor.getContext('2d')
  context.clearRect(0, 0, editor.width, editor.height)
  world.draw(context, camera)
}

drawEditor()