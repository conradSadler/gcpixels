import { drawInitialCanvases, addClickEvents } from "./color_utils.js";
const preview_canvas = document.getElementById("color_preview");
const hue_slider_canvas = document.getElementById("hue_slider");
const sv_slider_canvas = document.getElementById("sv_slider");

drawInitialCanvases(preview_canvas, hue_slider_canvas, sv_slider_canvas);
addClickEvents(preview_canvas, hue_slider_canvas, sv_slider_canvas);
