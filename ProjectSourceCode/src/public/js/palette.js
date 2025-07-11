import { chosen_color, setChosenColor, stringifyColor } from "./color_utils.js"

const preview_canvas = document.getElementById("color_preview");
const preview_context = preview_canvas.getContext("2d");
const add_button = document.getElementById("palette_add");
const clear_button = document.getElementById("palette_clear");
const palette_pixels = document.querySelectorAll('.palette');

add_button.addEventListener('click', () => {
  // add current color to palette
  for (const pixel of palette_pixels) {
    let pixel_color = pixel.style.backgroundColor;
    
    if (pixel_color === "") {
      pixel.style.backgroundColor = chosen_color;
      break;
    }

    // check for duplicates
    // backgroundColor is in form "rgb(#, # ,#)", so we have to convert
    const rgb = pixel.style.backgroundColor.split(/[\(\)]/)[1].split(",");
    const r = Number.parseInt(rgb[0]);
    const g = Number.parseInt(rgb[1]);
    const b = Number.parseInt(rgb[2]);
    pixel_color = `#${stringifyColor({r, g, b})}`;

    if (pixel_color === chosen_color) {
      break;
    } 

  }
})

clear_button.addEventListener('click', () => {
  for (const pixel of palette_pixels) {
    pixel.removeAttribute('style');
  }
})

for (const pixel of palette_pixels) {
  pixel.addEventListener('click', function() {
    const row = Number.parseInt(this.getAttribute('data-row'));
    const col = Number.parseInt(this.getAttribute('data-col'));

    setChosenColor(this.style.backgroundColor);
    preview_context.fillStyle = this.style.backgroundColor;
    preview_context.fillRect(0, 0, preview_canvas.width, preview_canvas.height);
  });
};
