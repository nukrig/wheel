import "./chunk-WDMUDEB6.js";

// node_modules/spin-wheel-ts/dist/util.js
function getRandomFloat(min = 0, max = 0, round = 14) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(round));
}
function degRad(degrees = 0) {
  return degrees * Math.PI / 180;
}
function isAngleBetween(angle, arcStart, arcEnd) {
  if (arcStart < arcEnd)
    return arcStart <= angle && angle < arcEnd;
  return arcStart <= angle || angle < arcEnd;
}
function getFontSizeToFit(text, fontFamily, maxWidth, canvasContext) {
  canvasContext.save();
  canvasContext.font = `1px ${fontFamily}`;
  const w = canvasContext.measureText(text).width;
  canvasContext.restore();
  return maxWidth / w;
}
function isPointInCircle(point = { x: 0, y: 0 }, cx, cy, radius) {
  const distanceSquared = (point.x - cx) ** 2 + (point.y - cy) ** 2;
  return distanceSquared <= radius ** 2;
}
function translateXYToElement(point = { x: 0, y: 0 }, element, devicePixelRatio = 1) {
  const rect = element.getBoundingClientRect();
  return {
    x: (point.x - rect.left) * devicePixelRatio,
    y: (point.y - rect.top) * devicePixelRatio
  };
}
function getAngle(originX, originY, targetX, targetY) {
  const dx = originX - targetX;
  const dy = originY - targetY;
  let theta = Math.atan2(-dy, -dx);
  theta *= 180 / Math.PI;
  if (theta < 0)
    theta += 360;
  return theta;
}
function addAngle(a = 0, b = 0) {
  const sum = a + b;
  let result;
  if (sum > 0) {
    result = sum % 360;
  } else {
    result = 360 + sum % 360;
  }
  if (result === 360)
    result = 0;
  return result;
}
function diffAngle(a = 0, b = 0) {
  const offsetFrom180 = 180 - b;
  const aWithOffset = addAngle(a, offsetFrom180);
  return 180 - aWithOffset;
}
function calcWheelRotationForTargetAngle(currentRotation = 0, targetAngle = 0, direction = 1) {
  let angle = (currentRotation % 360 + targetAngle) % 360;
  angle = fixFloat(angle);
  angle = (direction === 1 ? 360 - angle : 360 + angle) % 360;
  angle *= direction;
  return currentRotation + angle;
}
function isObject(v) {
  return typeof v === "object" && !Array.isArray(v) && v !== null;
}
function isNumber(n) {
  return typeof n === "number" && !Number.isNaN(n);
}
function setProp({ val, isValid, errorMessage, defaultValue, action }) {
  if (isValid) {
    return action ? action() : val === void 0 ? defaultValue : val;
  } else if (val === void 0) {
    return defaultValue;
  }
  throw new Error(errorMessage);
}
function isImageLoaded(image) {
  return image && image.complete && image.naturalWidth !== 0 && image.naturalHeight !== 0;
}
function fixFloat(f = 0) {
  return Number(f.toFixed(9));
}
function easeSinOut(n) {
  return Math.sin(n * Math.PI / 2);
}

// node_modules/spin-wheel-ts/dist/constants.js
var arcAdjust = -90;
var baseCanvasSize = 500;
var dragCapturePeriod = 250;
var AlignText = Object.freeze({
  left: "left",
  right: "right",
  center: "center"
});
var Defaults = Object.freeze({
  wheel: {
    borderColor: "#000",
    borderWidth: 1,
    debug: false,
    image: null,
    isInteractive: true,
    itemBackgroundColors: ["#fff"],
    itemLabelAlign: AlignText.right,
    itemLabelBaselineOffset: 0,
    itemLabelColors: ["#000"],
    itemLabelFont: "sans-serif",
    itemLabelFontSizeMax: baseCanvasSize,
    itemLabelRadius: 0.85,
    itemLabelRadiusMax: 0.2,
    itemLabelRotation: 0,
    itemLabelStrokeColor: "#fff",
    itemLabelStrokeWidth: 0,
    items: [],
    lineColor: "#000",
    lineWidth: 1,
    pixelRatio: 0,
    radius: 0.95,
    rotation: 0,
    rotationResistance: -35,
    rotationSpeedMax: 300,
    offset: { w: 0, h: 0 },
    onCurrentIndexChange: null,
    onRest: null,
    onSpin: null,
    overlayImage: null,
    pointerAngle: 0
  },
  item: {
    backgroundColor: null,
    image: null,
    imageOpacity: 1,
    imageRadius: 0.5,
    imageRotation: 0,
    imageScale: 1,
    label: "",
    labelColor: null,
    value: null,
    weight: 1
  }
});
var Debugging = Object.freeze({
  pointerLineColor: "#ff00ff",
  labelOutlineColor: "#ff00ff",
  labelRadiusColor: "#00ff00",
  dragEventHue: 200
});

// node_modules/spin-wheel-ts/dist/events.js
function register(wheel) {
  registerPointerEvents(wheel);
  wheel._handler_onResize = () => wheel.resize();
  window.addEventListener("resize", wheel._handler_onResize);
  const listenForDevicePixelRatioChange = () => {
    wheel._mediaQueryList = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    wheel._mediaQueryList.addEventListener("change", wheel._handler_onDevicePixelRatioChange, { once: true });
  };
  wheel._handler_onDevicePixelRatioChange = () => {
    wheel.resize();
    listenForDevicePixelRatioChange();
  };
  listenForDevicePixelRatioChange();
}
function unregister(wheel) {
  const canvas = wheel.canvas;
  if (!!canvas) {
    if ("PointerEvent" in window) {
      canvas.removeEventListener("pointerdown", wheel._handler_onPointerDown);
      canvas.removeEventListener("pointermove", wheel._handler_onPointerMoveRefreshCursor);
    } else {
      canvas.removeEventListener("touchstart", wheel._handler_onTouchStart);
      canvas.removeEventListener("mousedown", wheel._handler_onMouseDown);
      canvas.removeEventListener("mousemove", wheel._handler_onMouseMoveRefreshCursor);
    }
  }
  window.removeEventListener("resize", wheel._handler_onResize);
  wheel._mediaQueryList?.removeEventListener("change", wheel._handler_onDevicePixelRatioChange);
}
function registerPointerEvents(wheel) {
  const canvas = wheel.canvas;
  if (!canvas)
    return;
  wheel._handler_onPointerMoveRefreshCursor = (e) => {
    const point = {
      x: e.clientX,
      y: e.clientY
    };
    wheel._isCursorOverWheel = wheel.wheelHitTest(point);
    wheel.refreshCursor();
  };
  wheel._handler_onMouseMoveRefreshCursor = (e) => {
    const point = {
      x: e.clientX,
      y: e.clientY
    };
    wheel._isCursorOverWheel = wheel.wheelHitTest(point);
    wheel.refreshCursor();
  };
  wheel._handler_onPointerDown = (e) => {
    const point = {
      x: e.clientX,
      y: e.clientY
    };
    if (!wheel.isInteractive)
      return;
    if (!wheel.wheelHitTest(point))
      return;
    e.preventDefault();
    wheel.dragStart(point);
    canvas.setPointerCapture(e.pointerId);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerout", onPointerUp);
    function onPointerMove(e2) {
      e2.preventDefault();
      wheel.dragMove({
        x: e2.clientX,
        y: e2.clientY
      });
    }
    function onPointerUp(e2) {
      e2.preventDefault();
      if (!canvas)
        return;
      canvas.releasePointerCapture(e2.pointerId);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerout", onPointerUp);
      wheel.dragEnd();
    }
  };
  wheel._handler_onMouseDown = (e) => {
    const point = {
      x: e.clientX,
      y: e.clientY
    };
    if (!wheel.isInteractive)
      return;
    if (!wheel.wheelHitTest(point))
      return;
    wheel.dragStart(point);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    function onMouseMove(e2) {
      e2.preventDefault();
      wheel.dragMove({
        x: e2.clientX,
        y: e2.clientY
      });
    }
    function onMouseUp(e2) {
      e2.preventDefault();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      wheel.dragEnd();
    }
  };
  wheel._handler_onTouchStart = (e) => {
    const point = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    };
    if (!wheel.isInteractive)
      return;
    if (!wheel.wheelHitTest(point))
      return;
    e.preventDefault();
    wheel.dragStart(point);
    canvas.addEventListener("touchmove", onTouchMove);
    canvas.addEventListener("touchend", onTouchEnd);
    canvas.addEventListener("touchcancel", onTouchEnd);
    function onTouchMove(e2) {
      e2.preventDefault();
      wheel.dragMove({
        x: e2.targetTouches[0].clientX,
        y: e2.targetTouches[0].clientY
      });
    }
    function onTouchEnd(e2) {
      e2.preventDefault();
      if (!canvas)
        return;
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
      canvas.removeEventListener("touchcancel", onTouchEnd);
      wheel.dragEnd();
    }
  };
  if ("PointerEvent" in window) {
    canvas.addEventListener("pointerdown", wheel._handler_onPointerDown);
    canvas.addEventListener("pointermove", wheel._handler_onPointerMoveRefreshCursor);
  } else {
    canvas.addEventListener("touchstart", wheel._handler_onTouchStart);
    canvas.addEventListener("mousedown", wheel._handler_onMouseDown);
    canvas.addEventListener("mousemove", wheel._handler_onMouseMoveRefreshCursor);
  }
}

// node_modules/spin-wheel-ts/dist/item.js
var Item = class {
  _wheel;
  _backgroundColor = Defaults.item.backgroundColor;
  _image = Defaults.item.image;
  _imageOpacity = Defaults.item.imageOpacity;
  _imageRadius = Defaults.item.imageRadius;
  _imageRotation = Defaults.item.imageRotation;
  _imageScale = Defaults.item.imageScale;
  _label = Defaults.item.label;
  _labelColor = Defaults.item.labelColor;
  _value = Defaults.item.value;
  _weight = Defaults.item.weight;
  path;
  constructor(wheel, props) {
    if (!isObject(wheel)) {
      throw new Error("wheel must be an instance of Wheel");
    }
    if (!isObject(props) && props !== null) {
      throw new Error("props must be an Object or null");
    }
    this._wheel = wheel;
    if (props) {
      this.init(props);
    } else {
      this.init(Defaults.item);
    }
  }
  /**
   * Initialise all properties.
   */
  init(props) {
    this.backgroundColor = props.backgroundColor;
    this.image = props.image;
    this.imageOpacity = props.imageOpacity;
    this.imageRadius = props.imageRadius;
    this.imageRotation = props.imageRotation;
    this.imageScale = props.imageScale;
    this.label = props.label;
    this.labelColor = props.labelColor;
    this.value = props.value;
    this.weight = props.weight;
  }
  /**
   * The background color of the item.
   * When `null`, the actual color rendered will fall back to `Wheel.itemBackgroundColors`.
   * Example: `'#fff'`.
   */
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(val) {
    if (typeof val === "string") {
      this._backgroundColor = val;
    } else {
      this._backgroundColor = Defaults.item.backgroundColor;
    }
    this._wheel.refresh();
  }
  /**
   * The url of an image that will be drawn on the item.
   * Any part of the image that extends outside the item will be clipped.
   * The image will be drawn over the top of `Item.backgroundColor`.
   */
  get image() {
    return this._image;
  }
  set image(val) {
    let img;
    if (typeof val === "string") {
      img = new Image();
      img.src = val;
      img.onload = (e) => this._wheel.refresh();
    } else {
      img = Defaults.item.image;
    }
    this._image = img;
    this._wheel.refresh();
  }
  /**
   * The opacity (as a percent) of `Item.image`.
   * Useful if you want to fade the image to make the item's label stand out.
   */
  get imageOpacity() {
    return this._imageOpacity;
  }
  set imageOpacity(val) {
    if (typeof val === "number") {
      this._imageOpacity = val;
    } else {
      this._imageOpacity = Defaults.item.imageOpacity;
    }
    this._wheel.refresh();
  }
  /**
   * The point along the radius (as a percent, starting from the center of the wheel) to draw the center of `Item.image`.
   */
  get imageRadius() {
    return this._imageRadius;
  }
  set imageRadius(val) {
    if (typeof val === "number") {
      this._imageRadius = val;
    } else {
      this._imageRadius = Defaults.item.imageRadius;
    }
    this._wheel.refresh();
  }
  /**
   * The rotation (angle in degrees) of `Item.image`.
   */
  get imageRotation() {
    return this._imageRotation;
  }
  set imageRotation(val) {
    if (typeof val === "number") {
      this._imageRotation = val;
    } else {
      this._imageRotation = Defaults.item.imageRotation;
    }
    this._wheel.refresh();
  }
  /**
   * The scale (as a percent) to resize `Item.image`.
   */
  get imageScale() {
    return this._imageScale;
  }
  set imageScale(val) {
    if (typeof val === "number") {
      this._imageScale = val;
    } else {
      this._imageScale = Defaults.item.imageScale;
    }
    this._wheel.refresh();
  }
  /**
   * The text that will be drawn on the item.
   */
  get label() {
    return this._label;
  }
  set label(val) {
    if (typeof val === "string") {
      this._label = val;
    } else {
      this._label = Defaults.item.label;
    }
    this._wheel.refresh();
  }
  /**
   * The color of the label.
   * When `null`, the actual color rendered will fall back to `Wheel.itemLabelColors`.
   * Example: `'#000'`.
   */
  get labelColor() {
    return this._labelColor;
  }
  set labelColor(val) {
    if (typeof val === "string") {
      this._labelColor = val;
    } else {
      this._labelColor = Defaults.item.labelColor;
    }
    this._wheel.refresh();
  }
  /**
   * Some value that has meaning to your application.
   * For example, a reference to the object representing the item on the wheel, or a database id.
   */
  get value() {
    return this._value;
  }
  set value(val) {
    if (!!val) {
      this._value = val;
    } else {
      this._value = Defaults.item.value;
    }
  }
  /**
   * The proportional size of the item relative to other items on the wheel.
   * For example, if you have 2 items where `item[0]` has a weight of `1` and `item[1]` has a weight of `2`,
   * then `item[0]` will take up 1/3 of the space on the wheel.
   */
  get weight() {
    return this._weight;
  }
  set weight(val) {
    if (typeof val === "number") {
      this._weight = val;
    } else {
      this._weight = Defaults.item.weight;
    }
  }
  /**
   * Get the 0-based index of this item.
   */
  getIndex() {
    const index = this._wheel.items.findIndex((i) => i === this);
    if (index === -1)
      throw new Error("Item not found in parent Wheel");
    return index;
  }
  /**
   * Get the angle (in degrees) that this item ends at (exclusive), ignoring the current `rotation` of the wheel.
   */
  getCenterAngle() {
    const angle = this._wheel.getItemAngles()[this.getIndex()];
    if (!angle) {
      throw new Error("Item not found in parent Wheel");
    }
    return angle.start + (angle.end - angle.start) / 2;
  }
  /**
   * Get the angle (in degrees) that this item starts at (inclusive), ignoring the current `rotation` of the wheel.
   */
  getStartAngle() {
    const angle = this._wheel.getItemAngles()[this.getIndex()];
    if (!angle) {
      throw new Error("Item not found in parent Wheel");
    }
    return angle.start;
  }
  /**
   * Get the angle (in degrees) that this item ends at (inclusive), ignoring the current `rotation` of the wheel.
   */
  getEndAngle() {
    const angle = this._wheel.getItemAngles()[this.getIndex()];
    if (!angle) {
      throw new Error("Item not found in parent Wheel");
    }
    return angle.end;
  }
  /**
   * Return a random angle (in degrees) between this item's start angle (inclusive) and end angle (inclusive).
   */
  getRandomAngle() {
    return getRandomFloat(this.getStartAngle(), this.getEndAngle());
  }
};

// node_modules/spin-wheel-ts/dist/wheel.js
var Wheel = class {
  _frameRequestId = null;
  _rotationSpeed = 0;
  _rotationDirection = 0;
  _spinToTimeStart = 0;
  // Used to animate the wheel for spinTo()
  _spinToTimeEnd = null;
  // Used to animate the wheel for spinTo()
  _lastSpinFrameTime = null;
  // Used to animate the wheel for spinTo()
  _isCursorOverWheel = false;
  _isInitialising = false;
  _borderColor = Defaults.wheel.borderColor;
  _borderWidth = Defaults.wheel.borderWidth;
  _debug = Defaults.wheel.debug;
  _image = Defaults.wheel.image;
  _isInteractive = Defaults.wheel.isInteractive;
  _itemBackgroundColors = Defaults.wheel.itemBackgroundColors;
  _itemLabelAlign = Defaults.wheel.itemLabelAlign;
  _itemLabelBaselineOffset = Defaults.wheel.itemLabelBaselineOffset;
  _itemLabelColors = Defaults.wheel.itemLabelColors;
  _itemLabelFont = Defaults.wheel.itemLabelFont;
  _itemLabelFontSizeMax = Defaults.wheel.itemLabelFontSizeMax;
  _itemLabelRadius = Defaults.wheel.itemLabelRadius;
  _itemLabelRadiusMax = Defaults.wheel.itemLabelRadiusMax;
  _itemLabelRotation = Defaults.wheel.itemLabelRotation;
  _itemLabelStrokeColor = Defaults.wheel.itemLabelStrokeColor;
  _itemLabelStrokeWidth = Defaults.wheel.itemLabelStrokeWidth;
  _items = Defaults.wheel.items;
  _lineColor = Defaults.wheel.lineColor;
  _lineWidth = Defaults.wheel.lineWidth;
  _offset = Defaults.wheel.offset;
  _onCurrentIndexChange = Defaults.wheel.onCurrentIndexChange;
  _onRest = Defaults.wheel.onRest;
  _onSpin = Defaults.wheel.onSpin;
  _overlayImage = Defaults.wheel.overlayImage;
  _pixelRatio = Defaults.wheel.pixelRatio;
  _radius = Defaults.wheel.radius;
  _rotation = Defaults.wheel.rotation;
  _rotationResistance = Defaults.wheel.rotationResistance;
  _spinToEasingFunction = easeSinOut;
  canvas = null;
  _canvasContainer = null;
  _context = null;
  _size = 0;
  _center = { x: 0, y: 0 };
  _actualRadius = 0;
  _currentIndex = -1;
  _pointerAngle = Defaults.wheel.pointerAngle;
  _rotationSpeedMax = Defaults.wheel.rotationSpeedMax;
  itemLabelFontSize = 0;
  labelMaxWidth = 0;
  dragEvents = [];
  isDragging = false;
  _spinToStartRotation = 0;
  _spinToEndRotation = 0;
  _handler_onResize = () => {
  };
  _handler_onDevicePixelRatioChange = () => {
  };
  _handler_onPointerMoveRefreshCursor = () => {
  };
  _handler_onPointerDown = () => {
  };
  _handler_onMouseDown = () => {
  };
  _handler_onTouchStart = () => {
  };
  _handler_onMouseMoveRefreshCursor = () => {
  };
  _mediaQueryList = void 0;
  /**
   * Create the wheel inside a container Element and initialise it with props.
   * `container` must be an Element.
   * `props` must be an Object or null.
   */
  constructor(container, props) {
    this.add(container);
    this._isInitialising = true;
    this.borderColor = props.borderColor;
    this.borderWidth = props.borderWidth;
    this.debug = props.debug;
    this.image = props.image;
    this.isInteractive = props.isInteractive;
    this.itemBackgroundColors = props.itemBackgroundColors;
    this.itemLabelAlign = props.itemLabelAlign;
    this.itemLabelBaselineOffset = props.itemLabelBaselineOffset;
    this.itemLabelColors = props.itemLabelColors;
    this.itemLabelFont = props.itemLabelFont;
    this.itemLabelFontSizeMax = props.itemLabelFontSizeMax;
    this.itemLabelRadius = props.itemLabelRadius;
    this.itemLabelRadiusMax = props.itemLabelRadiusMax;
    this.itemLabelRotation = props.itemLabelRotation;
    this.itemLabelStrokeColor = props.itemLabelStrokeColor;
    this.itemLabelStrokeWidth = props.itemLabelStrokeWidth;
    this.items = props.items;
    this.lineColor = props.lineColor;
    this.lineWidth = props.lineWidth;
    this.pixelRatio = props.pixelRatio;
    this.rotationSpeedMax = props.rotationSpeedMax;
    this.radius = props.radius;
    this.rotation = props.rotation;
    this.rotationResistance = props.rotationResistance;
    this.offset = props.offset;
    this.onCurrentIndexChange = props.onCurrentIndexChange;
    this.onRest = props.onRest;
    this.onSpin = props.onSpin;
    this.overlayImage = props.overlayImage;
    this.pointerAngle = props.pointerAngle;
  }
  /**
   * Initialise all properties.
   */
  init(props) {
    this._isInitialising = true;
    this.borderColor = props.borderColor;
    this.borderWidth = props.borderWidth;
    this.debug = props.debug;
    this.image = props.image;
    this.isInteractive = props.isInteractive;
    this.itemBackgroundColors = props.itemBackgroundColors;
    this.itemLabelAlign = props.itemLabelAlign;
    this.itemLabelBaselineOffset = props.itemLabelBaselineOffset;
    this.itemLabelColors = props.itemLabelColors;
    this.itemLabelFont = props.itemLabelFont;
    this.itemLabelFontSizeMax = props.itemLabelFontSizeMax;
    this.itemLabelRadius = props.itemLabelRadius;
    this.itemLabelRadiusMax = props.itemLabelRadiusMax;
    this.itemLabelRotation = props.itemLabelRotation;
    this.itemLabelStrokeColor = props.itemLabelStrokeColor;
    this.itemLabelStrokeWidth = props.itemLabelStrokeWidth;
    this.items = props.items;
    this.lineColor = props.lineColor;
    this.lineWidth = props.lineWidth;
    this.pixelRatio = props.pixelRatio;
    this.rotationSpeedMax = props.rotationSpeedMax;
    this.radius = props.radius;
    this.rotation = props.rotation;
    this.rotationResistance = props.rotationResistance;
    this.offset = props.offset;
    this.overlayImage = props.overlayImage;
    this.pointerAngle = props.pointerAngle;
    this.onCurrentIndexChange = props.onCurrentIndexChange;
    this.onRest = props.onRest;
    this.onSpin = props.onSpin;
  }
  /**
   * Add the wheel to the DOM and register event handlers.
   */
  add(container) {
    this._canvasContainer = container;
    this.canvas = document.createElement("canvas");
    this._context = this.canvas.getContext("2d");
    this._canvasContainer.append(this.canvas);
    register(this);
    if (this._isInitialising === false)
      this.resize();
  }
  /**
   * Remove the wheel from the DOM and unregister event handlers.
   */
  remove() {
    if (!this.canvas || !this._canvasContainer) {
      return;
    }
    if (this._frameRequestId !== null) {
      window.cancelAnimationFrame(this._frameRequestId);
    }
    unregister(this);
    this._canvasContainer.removeChild(this.canvas);
    this._canvasContainer = null;
    this.canvas = null;
    this._context = null;
  }
  /**
   * Resize the wheel to fit inside it's container.
   * Call this after changing any property of the wheel that relates to it's size or position.
   */
  resize() {
    if (!this.canvas || !this._canvasContainer || !this._context) {
      return;
    }
    this.canvas.style.width = this._canvasContainer.clientWidth + "px";
    this.canvas.style.height = this._canvasContainer.clientHeight + "px";
    const [w, h] = [
      this._canvasContainer.clientWidth * this.getActualPixelRatio(),
      this._canvasContainer.clientHeight * this.getActualPixelRatio()
    ];
    this.canvas.width = w;
    this.canvas.height = h;
    const min = Math.min(w, h);
    const wheelSize = {
      w: min - min * this.offset.w,
      h: min - min * this.offset.h
    };
    const scale = Math.min(w / wheelSize.w, h / wheelSize.h);
    this._size = Math.max(wheelSize.w * scale, wheelSize.h * scale);
    this._center = {
      x: w / 2 + w * this.offset.w,
      y: h / 2 + h * this.offset.h
    };
    this._actualRadius = this._size / 2 * this.radius;
    this.itemLabelFontSize = this.itemLabelFontSizeMax * (this._size / baseCanvasSize);
    this.labelMaxWidth = this._actualRadius * (this.itemLabelRadius - this.itemLabelRadiusMax);
    for (const item of this._items) {
      this.itemLabelFontSize = Math.min(this.itemLabelFontSize, getFontSizeToFit(item.label, this.itemLabelFont, this.labelMaxWidth, this._context));
    }
    this.refresh();
  }
  /**
   * Main animation loop.
   */
  draw(now = 0) {
    if (!this.canvas || !this._context) {
      return;
    }
    this._frameRequestId = null;
    const ctx = this._context;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.animateRotation(now);
    const angles = this.getItemAngles(this._rotation);
    const actualBorderWidth = this.getScaledNumber(this._borderWidth);
    ctx.textBaseline = "middle";
    ctx.textAlign = this.itemLabelAlign;
    ctx.font = this.itemLabelFontSize + "px " + this.itemLabelFont;
    ctx.save();
    for (const [i, a] of angles.entries()) {
      const path = new Path2D();
      path.moveTo(this._center.x, this._center.y);
      path.arc(this._center.x, this._center.y, this._actualRadius - actualBorderWidth / 2, degRad(a.start + arcAdjust), degRad(a.end + arcAdjust));
      const item = this._items[i];
      if (item !== void 0) {
        item.path = path;
      }
    }
    this.drawItemBackgrounds(ctx, angles);
    this.drawItemImages(ctx, angles);
    this.drawItemLines(ctx, angles);
    this.drawItemLabels(ctx, angles);
    this.drawBorder(ctx);
    if (this._image) {
      this.drawImage(ctx, this._image, false);
    }
    if (this._overlayImage) {
      this.drawImage(ctx, this._overlayImage, true);
    }
    this.drawPointerLine(ctx);
    this.drawDragEvents(ctx);
    this._isInitialising = false;
  }
  drawItemBackgrounds(ctx, angles = []) {
    for (const [i, a] of angles.entries()) {
      const item = this._items[i];
      ctx.fillStyle = item.backgroundColor ?? // Fall back to a value from the repeating set:
      this._itemBackgroundColors[i % this._itemBackgroundColors.length];
      if (item.path !== void 0) {
        ctx.fill(item.path);
      }
    }
  }
  drawItemImages(ctx, angles = []) {
    for (const [i, a] of angles.entries()) {
      const item = this._items[i];
      if (!isImageLoaded(item.image))
        continue;
      ctx.save();
      if (item.path !== void 0) {
        ctx.clip(item.path);
      }
      const angle = a.start + (a.end - a.start) / 2;
      ctx.translate(this._center.x + Math.cos(degRad(angle + arcAdjust)) * (this._actualRadius * item.imageRadius), this._center.y + Math.sin(degRad(angle + arcAdjust)) * (this._actualRadius * item.imageRadius));
      ctx.rotate(degRad(angle + item.imageRotation));
      ctx.globalAlpha = item.imageOpacity;
      const width = item.image === null ? 0 : this._size / 500 * item.image.width * item.imageScale;
      const height = item.image === null ? 0 : this._size / 500 * item.image.height * item.imageScale;
      const widthHalf = -width / 2;
      const heightHalf = -height / 2;
      ctx.drawImage(item.image, widthHalf, heightHalf, width, height);
      ctx.restore();
    }
  }
  drawImage(ctx, image, isOverlay = false) {
    if (!isImageLoaded(image))
      return;
    ctx.translate(this._center.x, this._center.y);
    if (!isOverlay)
      ctx.rotate(degRad(this._rotation));
    const size = isOverlay ? this._size : this._size * this.radius;
    const sizeHalf = -(size / 2);
    ctx.drawImage(image, sizeHalf, sizeHalf, size, size);
    ctx.resetTransform();
  }
  drawPointerLine(ctx) {
    if (!this.debug)
      return;
    ctx.translate(this._center.x, this._center.y);
    ctx.rotate(degRad(this._pointerAngle + arcAdjust));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(this._actualRadius * 2, 0);
    ctx.strokeStyle = Debugging.pointerLineColor;
    ctx.lineWidth = this.getScaledNumber(2);
    ctx.stroke();
    ctx.resetTransform();
  }
  drawBorder(ctx) {
    if (this._borderWidth <= 0)
      return;
    const actualBorderWidth = this.getScaledNumber(this._borderWidth);
    const actualBorderColor = this._borderColor || "transparent";
    ctx.beginPath();
    ctx.strokeStyle = actualBorderColor;
    ctx.lineWidth = actualBorderWidth;
    ctx.arc(this._center.x, this._center.y, this._actualRadius - actualBorderWidth / 2, 0, 2 * Math.PI);
    ctx.stroke();
    if (this.debug) {
      const actualDebugLineWidth = this.getScaledNumber(1);
      ctx.beginPath();
      ctx.strokeStyle = ctx.strokeStyle = Debugging.labelRadiusColor;
      ctx.lineWidth = actualDebugLineWidth;
      ctx.arc(this._center.x, this._center.y, this._actualRadius * this.itemLabelRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.strokeStyle = ctx.strokeStyle = Debugging.labelRadiusColor;
      ctx.lineWidth = actualDebugLineWidth;
      ctx.arc(this._center.x, this._center.y, this._actualRadius * this.itemLabelRadiusMax, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
  drawItemLines(ctx, angles = []) {
    if (this._lineWidth <= 0)
      return;
    const actualLineWidth = this.getScaledNumber(this._lineWidth);
    const actualBorderWidth = this.getScaledNumber(this._borderWidth);
    ctx.translate(this._center.x, this._center.y);
    for (const angle of angles) {
      ctx.rotate(degRad(angle.start + arcAdjust));
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(this._actualRadius - actualBorderWidth, 0);
      ctx.strokeStyle = this.lineColor;
      ctx.lineWidth = actualLineWidth;
      ctx.stroke();
      ctx.rotate(-degRad(angle.start + arcAdjust));
    }
    ctx.resetTransform();
  }
  drawItemLabels(ctx, angles = []) {
    const actualItemLabelBaselineOffset = this.itemLabelFontSize * -this.itemLabelBaselineOffset;
    const actualDebugLineWidth = this.getScaledNumber(1);
    const actualLabelStrokeWidth = this.getScaledNumber(this._itemLabelStrokeWidth * 2);
    for (const [i, a] of angles.entries()) {
      const item = this._items[i];
      const actualLabelColor = item.labelColor || this._itemLabelColors[i % this._itemLabelColors.length] || // Fall back to a value from the repeating set.
      "transparent";
      if (item.label.trim() === "" || actualLabelColor === "transparent")
        continue;
      ctx.save();
      if (item.path !== void 0) {
        ctx.clip(item.path);
      }
      const angle = a.start + (a.end - a.start) / 2;
      ctx.translate(this._center.x + Math.cos(degRad(angle + arcAdjust)) * (this._actualRadius * this.itemLabelRadius), this._center.y + Math.sin(degRad(angle + arcAdjust)) * (this._actualRadius * this.itemLabelRadius));
      ctx.rotate(degRad(angle + arcAdjust));
      ctx.rotate(degRad(this.itemLabelRotation));
      if (this.debug) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-this.labelMaxWidth, 0);
        ctx.strokeStyle = Debugging.labelOutlineColor;
        ctx.lineWidth = actualDebugLineWidth;
        ctx.stroke();
        ctx.strokeRect(0, -this.itemLabelFontSize / 2, -this.labelMaxWidth, this.itemLabelFontSize);
      }
      if (this._itemLabelStrokeWidth > 0) {
        ctx.lineWidth = actualLabelStrokeWidth;
        ctx.strokeStyle = this._itemLabelStrokeColor;
        ctx.lineJoin = "round";
        ctx.strokeText(item.label, 0, actualItemLabelBaselineOffset);
      }
      ctx.fillStyle = actualLabelColor;
      ctx.fillText(item.label, 0, actualItemLabelBaselineOffset);
      ctx.restore();
    }
  }
  drawDragEvents(ctx) {
    if (!this.debug || !this.dragEvents?.length)
      return;
    const dragEventsReversed = [...this.dragEvents].reverse();
    const actualLineWidth = this.getScaledNumber(0.5);
    const actualCircleDiameter = this.getScaledNumber(4);
    for (const [i, event] of dragEventsReversed.entries()) {
      const percent = i / this.dragEvents.length * 100;
      ctx.beginPath();
      ctx.arc(event.x, event.y, actualCircleDiameter, 0, 2 * Math.PI);
      ctx.fillStyle = `hsl(${Debugging.dragEventHue},100%,${percent}%)`;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = actualLineWidth;
      ctx.fill();
      ctx.stroke();
    }
  }
  animateRotation(now = 0) {
    if (this._spinToTimeEnd !== null) {
      if (now >= this._spinToTimeEnd) {
        this.rotation = this._spinToEndRotation;
        this._spinToTimeEnd = null;
        this.onRest?.({
          type: "rest",
          currentIndex: this._currentIndex,
          rotation: this._rotation
        });
        return;
      }
      const duration = this._spinToTimeEnd - this._spinToTimeStart;
      let delta = (now - this._spinToTimeStart) / duration;
      delta = delta < 0 ? 0 : delta;
      const distance = this._spinToEndRotation - this._spinToStartRotation;
      this.rotation = this._spinToStartRotation + distance * this._spinToEasingFunction(delta);
      this.refresh();
      return;
    }
    if (this._lastSpinFrameTime !== null) {
      const delta = now - this._lastSpinFrameTime;
      if (delta > 0) {
        this.rotation += delta / 1e3 * this._rotationSpeed % 360;
        this._rotationSpeed = this.getRotationSpeedPlusDrag(delta);
        if (this._rotationSpeed === 0) {
          this.onRest?.({
            type: "rest",
            currentIndex: this._currentIndex,
            rotation: this._rotation
          });
          this._lastSpinFrameTime = null;
        } else {
          this._lastSpinFrameTime = now;
        }
      }
      this.refresh();
      return;
    }
  }
  getRotationSpeedPlusDrag(delta = 0) {
    const newRotationSpeed = this._rotationSpeed + this.rotationResistance * (delta / 1e3) * this._rotationDirection;
    if (this._rotationDirection === 1 && newRotationSpeed < 0 || this._rotationDirection === -1 && newRotationSpeed >= 0) {
      return 0;
    }
    return newRotationSpeed;
  }
  /**
   * Spin the wheel by setting `rotationSpeed`.
   * The wheel will immediately start spinning, and slow down over time depending on the value of `rotationResistance`.
   * A positive number will spin clockwise, a negative number will spin anticlockwise.
   */
  spin(rotationSpeed = 0) {
    if (!isNumber(rotationSpeed))
      throw new Error("rotationSpeed must be a number");
    this.dragEvents = [];
    this.beginSpin(rotationSpeed, "spin");
  }
  /**
   * Spin the wheel to a particular rotation.
   * The animation will occur over the provided `duration` (milliseconds).
   * The animation can be adjusted by providing an optional `easingFunction` which accepts a single parameter n, where n is between 0 and 1 inclusive.
   * If no easing function is provided, the default easeSinOut will be used.
   * For example easing functions see [easing-utils](https://github.com/AndrewRayCode/easing-utils).
   */
  spinTo(rotation, duration, easingFunction = null) {
    if (!isNumber(rotation))
      throw new Error("Error: rotation must be a number");
    if (!isNumber(duration))
      throw new Error("Error: duration must be a number");
    this.stop();
    this.dragEvents = [];
    this.animate(rotation, duration, easingFunction);
    this.onSpin?.({
      type: "spin",
      method: "spinto",
      targetRotation: rotation,
      duration
    });
  }
  /**
   * Spin the wheel to a particular item.
   * The animation will occur over the provided `duration` (milliseconds).
   * If `spinToCenter` is true, the wheel will spin to the center of the item, otherwise the wheel will spin to a random angle inside the item.
   * `numberOfRevolutions` controls how many times the wheel will rotate a full 360 degrees before resting on the item.
   * The animation can be adjusted by providing an optional `easingFunction` which accepts a single parameter n, where n is between 0 and 1 inclusive.
   * If no easing function is provided, the default easeSinOut will be used.
   * For example easing functions see [easing-utils](https://github.com/AndrewRayCode/easing-utils).
   */
  spinToItem(itemIndex = 0, duration = 0, spinToCenter = true, numberOfRevolutions = 1, direction = 1, easingFunction = null) {
    this.stop();
    this.dragEvents = [];
    const itemAngle = spinToCenter ? this.items[itemIndex].getCenterAngle() : this.items[itemIndex].getRandomAngle();
    let newRotation = calcWheelRotationForTargetAngle(this.rotation, itemAngle - this._pointerAngle, direction);
    newRotation += numberOfRevolutions * 360 * direction;
    this.animate(newRotation, duration, easingFunction);
    this.onSpin?.({
      type: "spin",
      method: "spintoitem",
      targetItemIndex: itemIndex,
      targetRotation: newRotation,
      duration
    });
  }
  animate(newRotation, duration, easingFunction) {
    this._spinToStartRotation = this.rotation;
    this._spinToEndRotation = newRotation;
    this._spinToTimeStart = performance.now();
    this._spinToTimeEnd = this._spinToTimeStart + duration;
    this._spinToEasingFunction = easingFunction || easeSinOut;
    this.refresh();
  }
  /**
   * Immediately stop the wheel from spinning, regardless of which method was used to spin it.
   */
  stop() {
    this._spinToTimeEnd = null;
    this._rotationSpeed = 0;
    this._lastSpinFrameTime = null;
  }
  /**
   * Return n scaled to the size of the canvas.
   */
  getScaledNumber(n) {
    return n / baseCanvasSize * this._size;
  }
  getActualPixelRatio() {
    return this._pixelRatio !== 0 ? this._pixelRatio : window.devicePixelRatio;
  }
  /**
   * Return true if the given point is inside the wheel.
   */
  wheelHitTest(point = { x: 0, y: 0 }) {
    if (!this.canvas) {
      return false;
    }
    const p = translateXYToElement(point, this.canvas, this.getActualPixelRatio());
    return isPointInCircle(p, this._center.x, this._center.y, this._actualRadius);
  }
  /**
   * Refresh the cursor state.
   * Call this after the pointer moves.
   */
  refreshCursor() {
    if (!this.canvas) {
      return;
    }
    if (this.isInteractive) {
      if (this.isDragging) {
        this.canvas.style.cursor = "grabbing";
        return;
      }
      if (this._isCursorOverWheel) {
        this.canvas.style.cursor = "grab";
        return;
      }
    }
    this.canvas.style.cursor = "";
  }
  /**
   * Get the angle (in degrees) of the given point from the center of the wheel.
   * 0 is north.
   */
  getAngleFromCenter(point = { x: 0, y: 0 }) {
    return (getAngle(this._center.x, this._center.y, point.x, point.y) + 90) % 360;
  }
  /**
   * Get the index of the item that the Pointer is pointing at.
   * An item is considered "current" if `pointerAngle` is between it's start angle (inclusive)
   * and it's end angle (exclusive).
   */
  getCurrentIndex() {
    return this._currentIndex;
  }
  /**
   * Calculate and set `currentIndex`
   */
  refreshCurrentIndex(angles = []) {
    if (this._items.length === 0)
      this._currentIndex = -1;
    for (const [i, a] of angles.entries()) {
      if (!isAngleBetween(this._pointerAngle, a.start % 360, a.end % 360))
        continue;
      if (this._currentIndex === i)
        break;
      this._currentIndex = i;
      if (!this._isInitialising) {
        this.onCurrentIndexChange?.({
          type: "currentIndexChange",
          currentIndex: this._currentIndex
        });
      }
      break;
    }
  }
  /**
   * Return an array of objects containing the start angle (inclusive) and end angle (inclusive) of each item.
   */
  getItemAngles(initialRotation = 0) {
    let weightSum = 0;
    for (const i of this.items) {
      weightSum += i.weight;
    }
    const weightedItemAngle = 360 / weightSum;
    let itemAngle;
    let lastItemAngle = initialRotation;
    const angles = [];
    for (const item of this._items) {
      itemAngle = item.weight * weightedItemAngle;
      angles.push({
        start: lastItemAngle,
        end: lastItemAngle + itemAngle
      });
      lastItemAngle += itemAngle;
    }
    if (this._items.length > 1) {
      angles[angles.length - 1].end = angles[0].start + 360;
    }
    return angles;
  }
  /**
   * Schedule a redraw of the wheel on the canvas.
   * Call this after changing any property of the wheel that relates to it's appearance.
   */
  refresh() {
    if (this._frameRequestId === null) {
      this._frameRequestId = window.requestAnimationFrame((t) => this.draw(t));
    }
  }
  limitSpeed(speed = 0, max = 0) {
    const newSpeed = Math.min(speed, max);
    return Math.max(newSpeed, -max);
  }
  beginSpin(speed = 0, spinMethod) {
    this.stop();
    this._rotationSpeed = this.limitSpeed(speed, this._rotationSpeedMax);
    this._lastSpinFrameTime = performance.now();
    this._rotationDirection = this._rotationSpeed >= 0 ? 1 : -1;
    if (this._rotationSpeed !== 0) {
      this.onSpin?.({
        type: "spin",
        method: spinMethod,
        rotationSpeed: this._rotationSpeed,
        rotationResistance: this._rotationResistance
      });
    }
    this.refresh();
  }
  refreshAriaLabel() {
    if (!this.canvas) {
      return;
    }
    this.canvas.setAttribute("role", "img");
    const wheelDescription = this.items.length >= 2 ? ` The wheel has ${this.items.length} slices.` : "";
    this.canvas.setAttribute("aria-label", "An image of a spinning prize wheel." + wheelDescription);
  }
  /**
   * The color of the line around the circumference of the wheel.
   */
  get borderColor() {
    return this._borderColor;
  }
  set borderColor(val) {
    this._borderColor = setProp({
      val,
      isValid: typeof val === "string",
      errorMessage: "Wheel.borderColor must be a string",
      defaultValue: Defaults.wheel.borderColor
    });
    this.refresh();
  }
  /**
   * The width (in pixels) of the line around the circumference of the wheel.
   */
  get borderWidth() {
    return this._borderWidth;
  }
  set borderWidth(val) {
    this._borderWidth = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.borderWidth must be a number",
      defaultValue: Defaults.wheel.borderWidth
    });
    this.refresh();
  }
  /**
   * Show debugging info.
   * This is particularly helpful when fine-tuning labels.
   */
  get debug() {
    return this._debug;
  }
  set debug(val) {
    this._debug = setProp({
      val,
      isValid: typeof val === "boolean",
      errorMessage: "Wheel.debug must be a boolean",
      defaultValue: Defaults.wheel.debug
    });
    this.refresh();
  }
  /**
   * The url of an image that will be drawn over the center of the wheel which will rotate with the wheel.
   * It will be automatically scaled to fit `radius`.
   */
  get image() {
    return this._image;
  }
  set image(val) {
    if (typeof val !== "string" && !!val) {
      throw new Error("Wheel.image must be a url (string) or null");
    }
    if (!val) {
      this._image = null;
    } else {
      const v = new Image();
      v.src = val;
      v.onload = (e) => {
        this.refresh();
      };
      this._image = v;
    }
    this.refresh();
  }
  /**
   * Allow the user to spin the wheel using click-drag/touch-flick.
   * User interaction will only be detected within the bounds of `Wheel.radius`.
   */
  get isInteractive() {
    return this._isInteractive;
  }
  set isInteractive(val) {
    this._isInteractive = setProp({
      val,
      isValid: typeof val === "boolean",
      errorMessage: "Wheel.isInteractive must be a boolean",
      defaultValue: Defaults.wheel.isInteractive
    });
    this.refreshCursor();
  }
  /**
   * The repeating pattern of background colors for all items.
   * Overridden by `Item.backgroundColor`.
   * Example: `['#fff','#000']`.
   */
  get itemBackgroundColors() {
    return this._itemBackgroundColors;
  }
  set itemBackgroundColors(val) {
    this._itemBackgroundColors = setProp({
      val,
      isValid: Array.isArray(val),
      errorMessage: "Wheel.itemBackgroundColors must be an array",
      defaultValue: Defaults.wheel.itemBackgroundColors
    });
    this.refresh();
  }
  /**
   * The alignment of all item labels.
   * Accepted values: `'left'`,`'center'`,`'right'`.
   */
  get itemLabelAlign() {
    return this._itemLabelAlign;
  }
  set itemLabelAlign(val) {
    this._itemLabelAlign = setProp({
      val,
      isValid: typeof val === "string",
      errorMessage: "Wheel.itemLabelAlign must be a string",
      defaultValue: Defaults.wheel.itemLabelAlign
    });
    this.refresh();
  }
  /**
   * The offset of the baseline (or line height) of all item labels (as a percent of the label's height).
   */
  get itemLabelBaselineOffset() {
    return this._itemLabelBaselineOffset;
  }
  set itemLabelBaselineOffset(val) {
    this._itemLabelBaselineOffset = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.itemLabelBaselineOffset must be a number",
      defaultValue: Defaults.wheel.itemLabelBaselineOffset
    });
    this.resize();
  }
  /**
   * The repeating pattern of colors for all item labels.
   * Overridden by `Item.labelColor`.
   * Example: `['#fff','#000']`.
   */
  get itemLabelColors() {
    return this._itemLabelColors;
  }
  set itemLabelColors(val) {
    this._itemLabelColors = setProp({
      val,
      isValid: Array.isArray(val),
      errorMessage: "Wheel.itemLabelColors must be an array",
      defaultValue: Defaults.wheel.itemLabelColors
    });
    this.refresh();
  }
  /**
   * The font family for all item labels.
   * Overridden by `Item.labelFont`.
   * Example: `'sans-serif'`.
   */
  get itemLabelFont() {
    return this._itemLabelFont;
  }
  set itemLabelFont(val) {
    this._itemLabelFont = setProp({
      val,
      isValid: typeof val === "string",
      errorMessage: "Wheel.itemLabelFont must be a string",
      defaultValue: Defaults.wheel.itemLabelFont
    });
    this.resize();
  }
  /**
   * The maximum font size (in pixels) for all item labels.
   */
  get itemLabelFontSizeMax() {
    return this._itemLabelFontSizeMax;
  }
  set itemLabelFontSizeMax(val) {
    this._itemLabelFontSizeMax = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.itemLabelFontSizeMax must be a number",
      defaultValue: Defaults.wheel.itemLabelFontSizeMax
    });
    this.resize();
  }
  /**
   * The point along the radius (as a percent, starting from the center of the wheel)
   * to start drawing all item labels.
   */
  get itemLabelRadius() {
    return this._itemLabelRadius;
  }
  set itemLabelRadius(val) {
    this._itemLabelRadius = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.itemLabelRadius must be a number",
      defaultValue: Defaults.wheel.itemLabelRadius
    });
    this.resize();
  }
  /**
   * The point along the radius (as a percent, starting from the center of the wheel)
   * to calculate the maximum font size for all item labels.
   */
  get itemLabelRadiusMax() {
    return this._itemLabelRadiusMax;
  }
  set itemLabelRadiusMax(val) {
    this._itemLabelRadiusMax = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.itemLabelRadiusMax must be a number",
      defaultValue: Defaults.wheel.itemLabelRadiusMax
    });
    this.resize();
  }
  /**
   * The rotation of all item labels.
   * Use this in combination with `itemLabelAlign` to flip the labels `180°`.
   */
  get itemLabelRotation() {
    return this._itemLabelRotation;
  }
  set itemLabelRotation(val) {
    this._itemLabelRotation = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.itemLabelRotation must be a number",
      defaultValue: Defaults.wheel.itemLabelRotation
    });
    this.refresh();
  }
  /**
   * The color of the stroke applied to the outside of the label text.
   */
  get itemLabelStrokeColor() {
    return this._itemLabelStrokeColor;
  }
  set itemLabelStrokeColor(val) {
    this._itemLabelStrokeColor = setProp({
      val,
      isValid: typeof val === "string",
      errorMessage: "Wheel.itemLabelStrokeColor must be a string",
      defaultValue: Defaults.wheel.itemLabelStrokeColor
    });
    this.refresh();
  }
  /**
   * The width of the stroke applied to the outside of the label text.
   */
  get itemLabelStrokeWidth() {
    return this._itemLabelStrokeWidth;
  }
  set itemLabelStrokeWidth(val) {
    this._itemLabelStrokeWidth = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.itemLabelStrokeWidth must be a number",
      defaultValue: Defaults.wheel.itemLabelStrokeWidth
    });
    this.refresh();
  }
  /**
   * The items to show on the wheel.
   */
  get items() {
    return this._items;
  }
  set items(val) {
    this._items = (val ?? []).map((item) => new Item(this, item));
    this.refreshAriaLabel();
    this.refreshCurrentIndex(this.getItemAngles(this._rotation));
    this.resize();
  }
  /**
   * The color of the lines between the items.
   */
  get lineColor() {
    return this._lineColor;
  }
  set lineColor(val) {
    this._lineColor = setProp({
      val,
      isValid: typeof val === "string",
      errorMessage: "Wheel.lineColor must be a string",
      defaultValue: Defaults.wheel.lineColor
    });
    this.refresh();
  }
  /**
   * The width (in pixels) of the lines between the items.
   */
  get lineWidth() {
    return this._lineWidth;
  }
  set lineWidth(val) {
    this._lineWidth = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.lineWidth must be a number",
      defaultValue: Defaults.wheel.lineWidth
    });
    this.refresh();
  }
  /**
   * The offset of the wheel relative to it's center (as a percent of the wheel's diameter).
   */
  get offset() {
    return this._offset;
  }
  set offset(val) {
    this._offset = setProp({
      val,
      isValid: isObject(val),
      errorMessage: "Wheel.offset must be an object",
      defaultValue: Defaults.wheel.offset
    });
    this.resize();
  }
  /**
   * The callback for the `onCurrentIndexChange` event.
   */
  get onCurrentIndexChange() {
    return this._onCurrentIndexChange;
  }
  set onCurrentIndexChange(val) {
    this._onCurrentIndexChange = setProp({
      val,
      isValid: typeof val === "function" || val === null,
      errorMessage: "Wheel.onCurrentIndexChange must be a function or null",
      defaultValue: Defaults.wheel.onCurrentIndexChange
    });
  }
  /**
   * The callback for the `onRest` event.
   */
  get onRest() {
    return this._onRest;
  }
  set onRest(val) {
    this._onRest = setProp({
      val,
      isValid: typeof val === "function" || val === null,
      errorMessage: "Wheel.onRest must be a function or null",
      defaultValue: Defaults.wheel.onRest
    });
  }
  /**
   * The callback for the `onSpin` event.
   */
  get onSpin() {
    return this._onSpin;
  }
  set onSpin(val) {
    this._onSpin = setProp({
      val,
      isValid: typeof val === "function" || val === null,
      errorMessage: "Wheel.onSpin must be a function or null",
      defaultValue: Defaults.wheel.onSpin
    });
  }
  /**
   * The url of an image that will be drawn over the center of the wheel which will not rotate with the wheel.
   * It will be automatically scaled to fit the container's smallest dimension.
   * Use this to draw decorations around the wheel, such as a stand or pointer.
   */
  get overlayImage() {
    return this._overlayImage?.src ?? null;
  }
  set overlayImage(val) {
    if (typeof val !== "string" && !!val) {
      throw new Error("Wheel.overlayImage must be a url (string) or null");
    }
    if (!val) {
      this._overlayImage = null;
    } else {
      const v = new Image();
      v.src = val;
      v.onload = (e) => {
        this.refresh();
      };
      this._overlayImage = v;
    }
    this.refresh();
  }
  /**
   * The pixel ratio used to render the wheel.
   * Values above 0 will produce a sharper image at the cost of performance.
   * A value of `0` will cause the pixel ratio to be automatically determined using `window.devicePixelRatio`.
   */
  get pixelRatio() {
    return this._pixelRatio;
  }
  set pixelRatio(val) {
    this._pixelRatio = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.pixelRatio must be a number",
      defaultValue: Defaults.wheel.pixelRatio
    });
    this.dragEvents = [];
    this.resize();
  }
  /**
   * The angle of the Pointer which is used to determine the `currentIndex` (or the "winning" item).
   */
  get pointerAngle() {
    return this._pointerAngle;
  }
  set pointerAngle(val) {
    this._pointerAngle = setProp({
      val,
      isValid: val === void 0 || isNumber(val) && val >= 0,
      errorMessage: "Wheel.pointerAngle must be a number between 0 and 360",
      defaultValue: Defaults.wheel.pointerAngle,
      action: () => (val ?? Defaults.wheel.pointerAngle) % 360
    });
    if (this.debug)
      this.refresh();
  }
  /**
   * The radius of the wheel (as a percent of the container's smallest dimension).
   */
  get radius() {
    return this._radius;
  }
  set radius(val) {
    this._radius = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.radius must be a number",
      defaultValue: Defaults.wheel.radius
    });
    this.resize();
  }
  /**
   * The rotation (angle in degrees) of the wheel.
   * `0` is north.
   * The first item will be drawn clockwise from this point.
   */
  get rotation() {
    return this._rotation;
  }
  set rotation(val) {
    this._rotation = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.rotation must be a number",
      defaultValue: Defaults.wheel.rotation
    });
    this.refreshCurrentIndex(this.getItemAngles(this._rotation));
    this.refresh();
  }
  /**
   * The amount that `rotationSpeed` will be reduced by every second.
   * Only in effect when `rotationSpeed !== 0`.
   * Set to `0` to spin the wheel infinitely.
   */
  get rotationResistance() {
    return this._rotationResistance;
  }
  set rotationResistance(val) {
    this._rotationResistance = setProp({
      val,
      isValid: isNumber(val),
      errorMessage: "Wheel.rotationResistance must be a number",
      defaultValue: Defaults.wheel.rotationResistance
    });
  }
  /**
   * (Readonly) How far (angle in degrees) the wheel will spin every 1 second.
   * A positive number means the wheel is spinning clockwise, a negative number means anticlockwise, and `0` means the wheel is not spinning.
   */
  get rotationSpeed() {
    return this._rotationSpeed;
  }
  /**
   * The maximum value for `rotationSpeed` (ignoring the wheel's spin direction).
   * The wheel will not spin faster than this value in any direction.
   */
  get rotationSpeedMax() {
    return this._rotationSpeedMax;
  }
  set rotationSpeedMax(val) {
    this._rotationSpeedMax = setProp({
      val,
      isValid: val === void 0 || isNumber(val) && val >= 0,
      errorMessage: "Wheel.rotationSpeedMax must be a number >= 0",
      defaultValue: Defaults.wheel.rotationSpeedMax
    });
  }
  /**
   * Enter the drag state.
   */
  dragStart(point = { x: 0, y: 0 }) {
    if (!this.canvas) {
      return;
    }
    const p = translateXYToElement(point, this.canvas, this.getActualPixelRatio());
    this.isDragging = true;
    this.stop();
    this.dragEvents = [
      {
        distance: 0,
        x: p.x,
        y: p.y,
        now: performance.now()
      }
    ];
    this.refreshCursor();
  }
  dragMove(point = { x: 0, y: 0 }) {
    if (!this.canvas) {
      return;
    }
    const p = translateXYToElement(point, this.canvas, this.getActualPixelRatio());
    const a = this.getAngleFromCenter(p);
    const lastDragPoint = this.dragEvents[0];
    const lastAngle = this.getAngleFromCenter(lastDragPoint);
    const angleSinceLastMove = diffAngle(lastAngle, a);
    this.dragEvents.unshift({
      distance: angleSinceLastMove,
      x: p.x,
      y: p.y,
      now: performance.now()
    });
    if (this.debug && this.dragEvents.length >= 40)
      this.dragEvents.pop();
    this.rotation += angleSinceLastMove;
  }
  /**
   * Exit the drag state.
   * Set the rotation speed so the wheel continues to spin in the same direction.
   */
  dragEnd() {
    this.isDragging = false;
    let dragDistance = 0;
    const now = performance.now();
    for (const [i, event] of this.dragEvents.entries()) {
      if (!this.isDragEventTooOld(now, event)) {
        dragDistance += event.distance;
        continue;
      }
      this.dragEvents.length = i;
      if (this.debug)
        this.refresh();
      break;
    }
    this.refreshCursor();
    if (dragDistance === 0)
      return;
    this.beginSpin(dragDistance * (1e3 / dragCapturePeriod), "interact");
  }
  isDragEventTooOld(now = 0, event) {
    return now - event.now > dragCapturePeriod;
  }
};
export {
  Item,
  Wheel
};
//# sourceMappingURL=spin-wheel-ts.js.map
