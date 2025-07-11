const color = {h: 0, s: 0, v: 0, r: 0, g: 0, b: 0};
export let chosen_color = "#000000";

export function drawInitialCanvases(preview_canvas, hue_slider_canvas, sv_slider_canvas) {
  const preview_context = preview_canvas.getContext("2d");
  const hue_slider_context = hue_slider_canvas.getContext("2d");
  const sv_slider_context = sv_slider_canvas.getContext("2d");

  preview_context.fillStyle = "black";
  preview_context.fillRect(0, 0, preview_canvas.width, preview_canvas.height);

  const hue_gradient = hue_slider_context.createLinearGradient(0, 0, hue_slider_canvas.width, 0);

  for (let i = 0; i <= 360; i++) {
      const [r, g, b] = hsvToRGB(i, 1, 1);
      hue_gradient.addColorStop(i / 360, `rgba(${r}, ${g}, ${b}, 1)`);
  }

  hue_slider_context.fillStyle = hue_gradient;
  hue_slider_context.fillRect(0, 0, hue_slider_canvas.width, hue_slider_canvas.height);

  const saturation_gradient = sv_slider_context.createLinearGradient(0, 0, sv_slider_canvas.width, 0);
  saturation_gradient.addColorStop(0, "#FFFFFF");
  saturation_gradient.addColorStop(1, "#FF0000");
  
  sv_slider_context.fillStyle = saturation_gradient;
  sv_slider_context.fillRect(0, 0, sv_slider_canvas.width, sv_slider_canvas.height);

  const value_gradient = sv_slider_context.createLinearGradient(0, 0, 0, sv_slider_canvas.height);
  value_gradient.addColorStop(0, "#FFFFFF");
  value_gradient.addColorStop(1, "#000000");

  sv_slider_context.globalCompositeOperation = 'multiply';
  sv_slider_context.fillStyle = value_gradient;
  sv_slider_context.fillRect(0, 0, sv_slider_canvas.width, sv_slider_canvas.height);
  sv_slider_context.globalCompositeOperation = 'source-over';
}

export function addClickEvents(preview_canvas, hue_slider_canvas, sv_slider_canvas) {
  const preview_context = preview_canvas.getContext("2d");
  const hue_slider_context = hue_slider_canvas.getContext("2d");
  const sv_slider_context = sv_slider_canvas.getContext("2d");

  sv_slider_canvas.addEventListener('click', function(event) {
    // get mouse position relative to canvas
    const rect = this.getBoundingClientRect();
    const pos = {
      x: (event.clientX - rect.left) / (rect.right - rect.left) * this.width,
      y: (event.clientY - rect.bottom) / (rect.top - rect.bottom) * this.height
    }

    // console.log(pos);

    // convert pos to saturation and value (0-1)
    // x pos is saturation, y is value
    color.s = pos.x / this.width;
    color.v = pos.y / this.height;
    [color.r, color.g, color.b] = hsvToRGB(color.h, color.s, color.v);
    chosen_color = `#${stringifyColor(color)}`;

    preview_context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
    preview_context.fillRect(0, 0, preview_canvas.width, preview_canvas.height);
  }); 

  hue_slider_canvas.addEventListener('click', function(event) {
    // get mouse position relative to canvas
    const rect = this.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / (rect.right - rect.left) * this.width;

    // convert x pos to hue (in degrees)
    color.h = (pos / this.width) * 360;
    // don't want to change chosen color when we change hue
    const [r, g, b] = hsvToRGB(color.h, 1, 1);

    // display saturation/value gradient
    // start with saturation
    const saturation_gradient = sv_slider_context.createLinearGradient(0, 0, sv_slider_canvas.width, 0);
    saturation_gradient.addColorStop(0, "#FFFFFF");
    saturation_gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 1)`);
    
    sv_slider_context.fillStyle = saturation_gradient;
    sv_slider_context.fillRect(0, 0, sv_slider_canvas.width, sv_slider_canvas.height);

    // then add value
    const value_gradient = sv_slider_context.createLinearGradient(0, 0, 0, sv_slider_canvas.height);
    value_gradient.addColorStop(0, "#FFFFFF");
    value_gradient.addColorStop(1, "#000000");

    sv_slider_context.globalCompositeOperation = 'multiply';
    sv_slider_context.fillStyle = value_gradient;
    sv_slider_context.fillRect(0, 0, sv_slider_canvas.width, sv_slider_canvas.height);
    sv_slider_context.globalCompositeOperation = 'source-over';
  });
}

export function setChosenColor(color) {
  if (color !== "") {
    chosen_color = color;
  }
}

/*
  formula taken from https://www.rapidtables.com/convert/color/hsv-to-rgb.html 
*/
export function hsvToRGB(hue, saturation, value) {
  if (hue < 0 || hue > 360) {
    console.log("Invalid Hue");
    return [0, 0, 0];
  }

  if (saturation < 0 || saturation > 1) {
    console.log("Invalid Saturation");
    return [0, 0, 0];
  }

  if (value < 0 || value > 1) {
    console.log("Invalid Value");
    return [0, 0, 0];
  }

  const C = saturation * value;
  const X = C * (1 - Math.abs( ( (hue / 60) % 2) - 1) ); 
  const m = value - C;
  let r;
  let g;
  let b;
  
  if (hue >= 0 && hue < 60) {
    r = C;
    g = X;
    b = 0;
  }
  else if (hue < 120) {
    r = X;
    g = C;
    b = 0;
  }
  else if (hue < 180) {
    r = 0;
    g = C;
    b = X;
  }
  else if (hue < 240) {
    r = 0;
    g = X;
    b = C;
  }
  else if (hue < 300) {
    r = X;
    g = 0;
    b = C;
  }
  else if (hue <= 360) {
    r = C;
    g = 0;
    b = X;
  }

  r = Math.round( 255 * (r + m) );
  g = Math.round( 255 * (g + m) );
  b = Math.round( 255 * (b + m) );

  return [r, g, b]; 
}

export function stringifyColor(color) {
  let red = color.r.toString(16);
  if (color.r < 16) {
    red = `0${red}`;
  }
  let green = color.g.toString(16);
  if (color.g < 16) {
    green = `0${green}`;
  }
  let blue = color.b.toString(16);
  if (color.b < 16) {
    blue = `0${blue}`;
  }
  return red + green + blue;
}

export function rgbToHex(color_string) {
  const rgb = color_string.split(/[\(\)]/)[1].split(",");
  const r = Number.parseInt(rgb[0]); 
  const g = Number.parseInt(rgb[1]);
  const b = Number.parseInt(rgb[2]);
  return `#${stringifyColor({r, g, b})}`;
}