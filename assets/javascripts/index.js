import $ from "./jquery"
import oranger from './oranger'

function init() {
  $("#slider1").oranger({ initLeft: 140 })

  oranger("#slider2", {
    initRight: 140,
    onChange: function(left, right) {
      console.log('left', left)
      console.log('right', right)
    }
  })
}

window.addEventListener("DOMContentLoaded", init)
