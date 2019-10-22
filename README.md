# pack-animal [![Build Status](https://travis-ci.org/shopgun/pack-animal.svg?branch=master)](https://travis-ci.org/shopgun/pack-animal) [![npm version](https://badge.fury.io/js/pack-animal.svg)](https://badge.fury.io/js/pack-animal)
it's hip to be in a square

This is the utility we use to generate product image positions within layouts for our digital catalogues(incito), such as [this one](http://shopgun.com/publications/incito/SW5jaXRvUHVibGljYXRpb246MTE2NDY1MTM2OTU3NjAwNTk2Nw==).

Basically you give packAnimal some box dimensions and a list of polygons, then it will give you back a list of transforms to apply to put the polygons neatly in the box.

These transforms are expressed in several ways on the output objects, so that you may choose whichever is appropriate for your use case. [You can check that out here.](https://shopgun.github.io/pack-animal/interfaces/itransform.html)

## Installation
```sh
npm install pack-animal --save
```

## Import
ESM supporting environment:
```js
import packAnimal from 'pack-animal'; // ES6
```
CommonJS environment: 
```js
var packAnimal = require('pack-animal'); // ES5 with npm
```
Browser environment
```js
<script src="https://unpkg.com/pack-animal"></script>
<script>const packAnimal = window.packAnimal;</script>
```
## Usage
Pass a pack size and a list of polygons to `packAnimal`, the polygons argument must be an array of polygons each of which is an array of points represented each by a `{ x: number, y: number }` shape object.
```js
const width = 600;
const height = 400;
const polygons = [
  [{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 120 }, { x: 0, y: 120 }],
  [{ x: 0, y: 0 }, { x: 400, y: 0 }, { x: 500, y: 220 }, { x: 0, y: 120 }]
];
const polygonTransforms = packAnimal(width, height, polygons);
```

The `polygonTransforms` returned by packAnimal are sets of instructions that you can use to "transform" the input polygons into their packed positions. You can [check out the `transform` properties here.](https://shopgun.github.io/pack-animal/interfaces/itransform.html)

### `<img/>` in HTML
For the use case of positioning `<img/>`s in HTML, this transform object includes a handy `cssText` So you can do something like this with that object:
```js
const boxToPack = document.querySelector('.boxToPack');
polygonTransforms.forEach((polygonTransform, index) => {
  const image = document.createElement("img");
  image.src = realData[index].url;
  image.style.cssText = polygonTransform.cssText;
  boxToPack.appendChild(image);
});
boxToPack.style.width = width;
boxToPack.style.height = height;
boxToPack.style.position = 'relative';
```
```html
<div class="boxToPack"></div>
```
## Contributing
Check out the [internal API documentation](https://shopgun.github.io/pack-animal/)

This project uses TypeScript for static typing and TSLint for linting. You can get both of these built into your editor with no configuration by opening this project in [Visual Studio Code](https://code.visualstudio.com/), an open source IDE which is available for free on all platforms.

### Running the example(s):

```sh
npm install
npm run build
npx serve
```
And navigate to the shown URL.

### Running development mode:

```sh
npm install
npm run start
```

### Running tests locally:

```sh
npm install
npm test
```
# test
