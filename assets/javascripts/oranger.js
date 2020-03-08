import $ from "./jquery"

const INITIAL_LEFT = 80
const INITIAL_RIGHT = 100
let MINIMUM_WIDTH = 30

let $body = null

function init(selector) {
  const oranger = {
    $slider: null,
    $container: null,

    dragStart(e) {
      const $target = $(e.target)
      const clientX = (e.type === "touchstart") ? e.touches[0].clientX : e.clientX

      if (!$target.hasClass('dragable')) { return }

      $target.addClass("active")
      $slider.data("leftOffSet", clientX - $slider.data("leftLastPosition"))
      $slider.data("rightOffSet", ($body.width() - clientX) - $slider.data("rightLastPosition"))
    },

    dragEnd(e) {
      oranger.$container.find(".dragable.active").removeClass("active")
    },

    drag(e) {
      const $activeElement = oranger.$container.find(".dragable.active")
      const clientX = (e.type === "touchmove") ? e.touches[0].clientX : e.clientX

      e.preventDefault();

      if (!$activeElement.length) { return }

      if ($activeElement.data("move").includes("left")) {
        oranger.moveSlider("left", clientX - $slider.data("leftOffSet"))
      }

      if ($activeElement.data("move").includes("right")) {
        oranger.moveSlider("right", ($body.width() - clientX) - $slider.data("rightOffSet"))
      }
    },

    moveSlider(side, newPosition) {
      _moveSlider(oranger.$slider, oranger.$container, side, newPosition)
    },
  }

  $body = $("body")
  const $container = $(selector)
  const $slider = $container.find(".slider")
  const $sliderHandle1 = $container.find(".sliderHandle1")
  const $sliderHandle2 = $container.find(".sliderHandle2")

  oranger.$container = $container
  oranger.$slider = $slider

  _updatePosition($slider, "left", INITIAL_LEFT)
  _updatePosition($slider, "right", INITIAL_RIGHT)

  MINIMUM_WIDTH = $sliderHandle1.width() + $sliderHandle2.width()

  $sliderHandle1
    .addClass("dragable")
    .data("move", "left")

  $sliderHandle2
    .addClass("dragable")
    .data("move", "right")

  $(".sliderRange")
    .addClass("dragable")
    .data("move", "left-right")

  $body
    .on("touchstart", oranger.dragStart)
    .on("touchend", oranger.dragEnd)
    .on("touchmove", oranger.drag)
    .on("mousedown", oranger.dragStart)
    .on("mouseup", oranger.dragEnd)
    .on("mousemove", oranger.drag)

  window.addEventListener("resize", () => {
    if ($slider.position().left > ($container.width() - MINIMUM_WIDTH)) {
      _updatePosition($slider, 'left', $container.width() - MINIMUM_WIDTH)
    }
  })
}

function _moveSlider($slider, $container, side, newPosition) {
  const lastPosition = $slider.data(`${side}LastPosition`)

  if (newPosition >= lastPosition && $slider.width() <= MINIMUM_WIDTH) {
    return
  }

  _updatePosition($slider, side, newPosition)

  _rectifyRangeWidth($slider, $container, side)
}

function _updatePosition($target, side, _newPosition) {
  const newPosition = _newPosition < 0 ? 0 : _newPosition

  $target.data(`${side}LastPosition`, newPosition)
  $target.css({ [side]: newPosition })
}

function _rectifyRangeWidth($slider, $container, side) {
  if ($slider.width() >= MINIMUM_WIDTH) { return }

  const oppositeSide = side === "left" ? "right" : "left"
  const oppositePosition = $slider.data(`${oppositeSide}LastPosition`)
  const rectifiedPosition = $container.width() - MINIMUM_WIDTH - oppositePosition

  _updatePosition($slider, side, rectifiedPosition)
}

export default init
