import $ from "./jquery"

const INITIAL_LEFT = 80
const INITIAL_RIGHT = 100
let MINIMUM_WIDTH = 30

let $container = null
let $slider = null

function init() {
  $container = $("body")
  $slider = $(".slider")

  updatePosition($slider, "left", INITIAL_LEFT)
  updatePosition($slider, "right", INITIAL_RIGHT)

  MINIMUM_WIDTH = $(".sliderHandle1").addClass("dragable").data("move", "left").width() +
                  $(".sliderHandle2").addClass("dragable").data("move", "right").width()

  $(".sliderRange").addClass("dragable").data("move", "left-right")
  $("body")
    .on("touchstart", dragStart)
    .on("touchend", dragEnd)
    .on("touchmove", drag)
    .on("mousedown", dragStart)
    .on("mouseup", dragEnd)
    .on("mousemove", drag)
}

function dragStart(e) {
  const $target = $(e.target)
  const clientX = (e.type === "touchstart") ? e.touches[0].clientX : e.clientX

  if (!$target.hasClass('dragable')) { return }

  $target.addClass("active")
  $slider.data("leftOffSet", clientX - $slider.data("leftLastPosition"))
  $slider.data("rightOffSet", ($container.width() - clientX) - $slider.data("rightLastPosition"))
}

function dragEnd(e) {
  $(".dragable.active").removeClass("active")
}

function drag(e) {
  const $activeElement = $(".dragable.active")
  const clientX = (e.type === "touchmove") ? e.touches[0].clientX : e.clientX

  e.preventDefault();

  if (!$activeElement.length) { return }

  if ($activeElement.data("move").includes("left")) {
    moveSlider("left", clientX - $slider.data("leftOffSet"))
  }

  if ($activeElement.data("move").includes("right")) {
    moveSlider("right", ($container.width() - clientX) - $slider.data("rightOffSet"))
  }
}

function moveSlider(side, newPosition) {
  const lastPosition = $slider.data(`${side}LastPosition`)

  if (newPosition >= lastPosition && $slider.width() <= MINIMUM_WIDTH) {
    return
  }

  updatePosition($slider, side, newPosition)

  rectifyRangeWidth(side)
}

function updatePosition($target, side, _newPosition) {
  const newPosition = _newPosition < 0 ? 0 : _newPosition

  $target.data(`${side}LastPosition`, newPosition)
  $target.css({ [side]: newPosition })
}

function rectifyRangeWidth(side) {
  if ($slider.width() >= MINIMUM_WIDTH) { return }

  const oppositeSide = side === "left" ? "right" : "left"
  const oppositePosition = $slider.data(`${oppositeSide}LastPosition`)
  const rectifiedPosition = $container.width() - MINIMUM_WIDTH - oppositePosition

  updatePosition($slider, side, rectifiedPosition)
}

export default init