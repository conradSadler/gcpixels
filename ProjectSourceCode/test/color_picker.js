const server = require('../src/index.js');
const chai = require('chai');
const chaiHttp = require('chai-http');
const color_utils = require('../src/public/js/color_utils.js');

chai.should();
chai.use(chaiHttp);
const {assert, expect} = chai;
const color = {r: 0, g:0, b: 0};

describe('HSV to RGB Tests', () => {
  let hue = 0;
  const INCREMENT = 90;
  // Values are compared to aseprite
  it('grayscale colors', (done) => {
    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0, 1); 
    expect(color_utils.stringifyColor(color)).to.equal("ffffff");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0, 0.5); 
    expect(color_utils.stringifyColor(color)).to.equal("808080");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0, 0.1); 
    expect(color_utils.stringifyColor(color)).to.equal("1a1a1a");

    hue += INCREMENT;
    done();
  });

  it('greens', (done) => {
    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.1, 1); 
    expect(color_utils.stringifyColor(color)).to.equal("f2ffe6");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.5, 0.5); 
    expect(color_utils.stringifyColor(color)).to.equal("608040");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 1, 0.1); 
    expect(color_utils.stringifyColor(color)).to.equal("0d1a00");

    hue += INCREMENT;
    done();
  });

  it('blues', (done) => {
    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.1, 1); 
    expect(color_utils.stringifyColor(color)).to.equal("e6ffff");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.5, 0.5); 
    expect(color_utils.stringifyColor(color)).to.equal("408080");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 1, 0.1); 
    expect(color_utils.stringifyColor(color)).to.equal("001a1a");

    hue += INCREMENT;
    done();
  });

  it('purples', (done) => {
    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.1, 1); 
    expect(color_utils.stringifyColor(color)).to.equal("f2e6ff");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.5, 0.5); 
    expect(color_utils.stringifyColor(color)).to.equal("604080");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 1, 0.1); 
    expect(color_utils.stringifyColor(color)).to.equal("0d001a");

    hue += INCREMENT;
    done();
  });

  it('reds', (done) => {
    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.1, 1); 
    expect(color_utils.stringifyColor(color)).to.equal("ffe6e6");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.5, 0.5); 
    expect(color_utils.stringifyColor(color)).to.equal("804040");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 1, 0.1); 
    expect(color_utils.stringifyColor(color)).to.equal("1a0000");

    hue += INCREMENT;
    done();
  });

  it('invalid hue, saturation, or value should return black', (done) => {
    [color.r, color.g, color.b] = color_utils.hsvToRGB(hue, 0.1, 1); 
    expect(color_utils.stringifyColor(color)).to.equal("000000");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(0, 2, 1); 
    expect(color_utils.stringifyColor(color)).to.equal("000000");

    [color.r, color.g, color.b] = color_utils.hsvToRGB(0, 1, 2); 
    expect(color_utils.stringifyColor(color)).to.equal("000000");
    done();
  });
});
