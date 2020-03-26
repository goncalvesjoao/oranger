const defaultSettings = {
  initLeft: 80,
  initRight: 100,
  minWidth: null,
  onChange: () => {},
  windowSize: () => { return window.innerWidth },
  template: `
<div class="slider">
  <div class="sliderHandle1 dragable" data-move="left"></div>
  <div class="sliderRange dragable" data-move="left-right"></div>
  <div class="sliderHandle2 dragable" data-move="right"></div>
</div>
<div class="sliderShadow"></div>
`
}

function init(selector, settings) {
  const container = typeof selector === 'string' ? document.querySelector(selector) : selector

  if (container.oranger) { return }

  const oranger = {
    ...defaultSettings,
    ...settings,
    container,
    drag: (e) => drag(oranger, e),
    dragEnd: (e) => dragEnd(oranger, e),
    dragStart: (e) => dragStart(oranger, e),
    leftOffSet: null,
    rightOffSet: null,
    leftLastPosition: null,
    rightLastPosition: null,
    handleWindowResize: () => handleWindowResize(oranger)
  }

  container.oranger = oranger
  container.classList.add("oranger")
  container.insertAdjacentHTML('beforeend', oranger.template)
  oranger.slider = container.getElementsByClassName("slider")[0]
  oranger.handle1Width = container.getElementsByClassName("sliderHandle1")[0].offsetWidth
  oranger.handle2Width = container.getElementsByClassName("sliderHandle2")[0].offsetWidth
  oranger.minWidth = oranger.minWidth || (oranger.handle1Width + oranger.handle2Width)

  updateSliderPosition(oranger, "left", oranger.initLeft)
  updateSliderPosition(oranger, "right", oranger.initRight)

  document.body.addEventListener("touchstart", oranger.dragStart)
  document.body.addEventListener("touchend", oranger.dragEnd)
  document.body.addEventListener("touchmove", oranger.drag)
  document.body.addEventListener("mousedown", oranger.dragStart)
  document.body.addEventListener("mouseup", oranger.dragEnd)
  document.body.addEventListener("mousemove", oranger.drag)
  window.addEventListener("resize", oranger.handleWindowResize)
}

function dragStart(oranger, e) {
  const { windowSize, leftLastPosition, rightLastPosition } = oranger
  const clientX = (e.type === "touchstart") ? e.touches[0].clientX : e.clientX

  if (!e.target.classList.contains('dragable')) { return }

  e.target.classList.add("active")
  oranger.leftOffSet = clientX - leftLastPosition
  oranger.rightOffSet = windowSize() - clientX - rightLastPosition
}

function dragEnd(oranger) {
  const { container } = oranger
  const activeElement = container.getElementsByClassName("dragable active")[0]

  if (activeElement) {
    activeElement.classList.remove("active")
  }
}

function drag(oranger, e) {
  const { windowSize, leftOffSet, rightOffSet, container } = oranger
  const activeElement = container.getElementsByClassName("dragable active")[0]
  const clientX = (e.type === "touchmove") ? e.touches[0].clientX : e.clientX

  e.preventDefault();

  if (!activeElement) { return }

  if (activeElement.getAttribute("data-move").includes("left")) {
    moveSlider(oranger, "left", clientX - leftOffSet)
  }

  if (activeElement.getAttribute("data-move").includes("right")) {
    moveSlider(oranger, "right", windowSize() - clientX - rightOffSet)
  }
}

function moveSlider(oranger, side, newPosition, updatePercentage = true) {
  const { slider, minWidth } = oranger
  const lastPosition = oranger[`${side}LastPosition`]

  if (newPosition >= lastPosition && slider.offsetWidth <= minWidth) { return }

  updateSliderPosition(oranger, side, newPosition, updatePercentage)

  rectifySliderWidth(oranger, side, updatePercentage)
}

function rectifySliderWidth(oranger, side, updatePercentage = true) {
  const { slider, container, minWidth } = oranger

  if (slider.offsetWidth >= minWidth) { return }

  const oppositeSide = side === "left" ? "right" : "left"
  const oppositePosition = oranger[`${oppositeSide}LastPosition`]
  const rectifiedPosition = container.offsetWidth - minWidth - oppositePosition

  updateSliderPosition(oranger, side, rectifiedPosition, updatePercentage)
}

function updateSliderPosition(oranger, side, newPosition, updatePercentage = true) {
  const { slider, container, handle2Width } = oranger
  const hundrenPercentWidth = container.offsetWidth - handle2Width

  oranger[`${side}LastPosition`] = newPosition < 0 ? 0 : newPosition
  slider.style[side] = oranger[`${side}LastPosition`]
  if (updatePercentage) {
    oranger.leftPercentage = (slider.offsetLeft * 100) / hundrenPercentWidth
    oranger.rightPercentage = ((slider.offsetLeft + slider.offsetWidth - handle2Width) * 100) / hundrenPercentWidth
  }

  handleChange(oranger)
}

function handleChange(oranger) {
  const { leftPercentage, rightPercentage } = oranger

  oranger.onChange(leftPercentage, rightPercentage)
}

function handleWindowResize(oranger) {
  const { container, handle2Width, leftPercentage, rightPercentage } = oranger
  const hundrenPercentWidth = container.offsetWidth - handle2Width
  const newLeft = Math.round((leftPercentage * hundrenPercentWidth) / 100)
  const newRight = Math.round((rightPercentage * hundrenPercentWidth) / 100)

  moveSlider(oranger, 'left', newLeft, false)
  moveSlider(oranger, 'right', hundrenPercentWidth - newRight, false)
}

export function destroy(selector) {
  const container = typeof selector === 'string' ? document.querySelector(selector) : selector
  const { oranger } = container

  document.body.removeEventListener("touchstart", oranger.dragStart)
  document.body.removeEventListener("touchend", oranger.dragEnd)
  document.body.removeEventListener("touchmove", oranger.drag)
  document.body.removeEventListener("mousedown", oranger.dragStart)
  document.body.removeEventListener("mouseup", oranger.dragEnd)
  document.body.removeEventListener("mousemove", oranger.drag)
  window.removeEventListener("resize", oranger.handleWindowResize)

  container.classList.remove("oranger")
  container.innerHTML = ""
}

export function addTojQuery(jQuery) {
  jQuery.fn.oranger = function(methodName) {
    const method = {
      destroy,
    }[methodName] || init
    const args = (method === init) ? arguments : Array.prototype.slice.call(arguments, 1)

    return this.each(function() { method(this, ...args) })
  }
}

if ($ && $.name === "jQuery") { addTojQuery($) }

export default init
