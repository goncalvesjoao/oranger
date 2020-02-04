import $ from "./jquery"

const INITIAL_LEFT = 80
const INITIAL_RIGHT = 100
let MINIMUM_WIDTH = 30

let $container = null
let $rangeHandle = null

function init(containerSelector) {
  $container = $(containerSelector)
  $rangeHandle = $("#rangeHandle")

  updatePosition($rangeHandle, "left", INITIAL_LEFT)
  updatePosition($rangeHandle, "right", INITIAL_RIGHT)

  MINIMUM_WIDTH = $("#startAtHandle").width() + $("#endAtHandle").width()

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
  $rangeHandle.data("leftOffSet", clientX - $rangeHandle.data("leftLastPosition"))
  $rangeHandle.data("rightOffSet", ($container.width() - clientX) - $rangeHandle.data("rightLastPosition"))
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
    moveRangeHandle("left", clientX - $rangeHandle.data("leftOffSet"))
  }

  if ($activeElement.data("move").includes("right")) {
    moveRangeHandle("right", ($container.width() - clientX) - $rangeHandle.data("rightOffSet"))
  }
}

function moveRangeHandle(side, newPosition) {
  const lastPosition = $rangeHandle.data(`${side}LastPosition`)

  if (newPosition >= lastPosition && $rangeHandle.width() <= MINIMUM_WIDTH) {
    return
  }

  updatePosition($rangeHandle, side, newPosition)

  rectifyRangeWidth(side)
}

function updatePosition($target, side, _newPosition) {
  const newPosition = _newPosition < 0 ? 0 : _newPosition

  $target.data(`${side}LastPosition`, newPosition)
  $target.css({ [side]: newPosition })
}

function rectifyRangeWidth(side) {
  if ($rangeHandle.width() >= MINIMUM_WIDTH) { return }

  const oppositeSide = side === "left" ? "right" : "left"
  const oppositePosition = $rangeHandle.data(`${oppositeSide}LastPosition`)
  const rectifiedPosition = $container.width() - MINIMUM_WIDTH - oppositePosition

  updatePosition($rangeHandle, side, rectifiedPosition)
}

export default init
