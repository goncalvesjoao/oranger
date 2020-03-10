import $ from "./jquery"

const defaultSettings = {
  left: 80,
  right: 100,
  minWidth: 30,
  onChange: function() {},
  template: `
<div class="slider">
  <div class="sliderHandle1 dragable" data-move="left"></div>
  <div class="sliderRange dragable" data-move="left-right"></div>
  <div class="sliderHandle2 dragable" data-move="right"></div>
</div>
<div class="sliderShadow"></div>
`
}

function oranger(selector, options) {
  const settings = { ...defaultSettings, ...options }
  const $body = $("body")
  const container = typeof selector === 'string' ? document.querySelector(selector) : selector
  container.classList.add("oranger")
  container.insertAdjacentHTML('beforeend', settings.template)

  const $slider = $(container).find(".slider")

  const finalSettings = {
    minWidth: container.getElementsByClassName("sliderHandle1").offsetWidth + container.getElementsByClassName("sliderHandle2").offsetWidth,
    ...settings,
    $slider,
    bodyWidth: function () { return window.innerWidth },
    leftOffSet: null,
    rightOffSet: null,
    leftLastPosition: null,
    rightLastPosition: null,
    containerWidth: function () { return container.offsetWidth },
    activeElement: function () {
      return container.getElementsByClassName("dragable active")[0]
    },
    handleChange: function () {
      const newLeft = $slider.position().left
      const newRight = $slider.position().left + $slider.width()

      settings.onChange(newLeft, newRight)
    }
  }

  updateSliderPosition(finalSettings, "left", finalSettings.left)
  updateSliderPosition(finalSettings, "right", finalSettings.right)

  $body
    .on("touchstart", dragStart.bind(finalSettings))
    .on("touchend", dragEnd.bind(finalSettings))
    .on("touchmove", drag.bind(finalSettings))
    .on("mousedown", dragStart.bind(finalSettings))
    .on("mouseup", dragEnd.bind(finalSettings))
    .on("mousemove", drag.bind(finalSettings))

  window.addEventListener("resize", () => {
    if ($slider.position().left > (finalSettings.containerWidth() - finalSettings.minWidth)) {
      updateSliderPosition(finalSettings, 'left', finalSettings.containerWidth() - finalSettings.minWidth)
    }
  })
}

function dragStart(e) {
  const settings = this
  const { bodyWidth, leftLastPosition, rightLastPosition } = settings
  const clientX = (e.type === "touchstart") ? e.touches[0].clientX : e.clientX

  if (!e.target.classList.contains('dragable')) { return }

  e.target.classList.add("active")
  this.leftOffSet = clientX - leftLastPosition
  this.rightOffSet = bodyWidth() - clientX - rightLastPosition
}

function dragEnd() {
  const activeElement = this.activeElement()

  if (activeElement) { activeElement.classList.remove("active") }
}

function drag(e) {
  const settings = this
  const { bodyWidth, leftOffSet, rightOffSet } = settings
  const activeElement = settings.activeElement()
  const clientX = (e.type === "touchmove") ? e.touches[0].clientX : e.clientX

  e.preventDefault();

  if (!activeElement) { return }

  if (activeElement.getAttribute("data-move").includes("left")) {
    moveSlider(settings, "left", clientX - leftOffSet)
  }

  if (activeElement.getAttribute("data-move").includes("right")) {
    moveSlider(settings, "right", bodyWidth() - clientX - rightOffSet)
  }
}

function moveSlider(settings, side, newPosition) {
  const { $slider, minWidth } = settings
  const lastPosition = settings[`${side}LastPosition`]

  if (newPosition >= lastPosition && $slider.width() <= minWidth) {
    return
  }

  updateSliderPosition(settings, side, newPosition)

  rectifySliderWidth(settings, side)
}

function rectifySliderWidth(settings, side) {
  const { $slider, minWidth, containerWidth } = settings

  if ($slider.width() >= minWidth) { return }

  const oppositeSide = side === "left" ? "right" : "left"
  const oppositePosition = settings[`${oppositeSide}LastPosition`]
  const rectifiedPosition = containerWidth() - minWidth - oppositePosition

  updateSliderPosition(settings, side, rectifiedPosition)
}

function updateSliderPosition(settings, side, _newPosition) {
  const { $slider, handleChange } = settings
  const newPosition = _newPosition < 0 ? 0 : _newPosition

  settings[`${side}LastPosition`] = newPosition
  $slider.css({ [side]: newPosition })

  handleChange()
}

$.fn.oranger = function(options) {
  return this.each(function() {
    oranger(this, options)
  })
}

export default oranger
