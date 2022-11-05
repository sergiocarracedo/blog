---
title: "Custom SVG icon set management with Vue"
date: 2021-04-01
url: custom-svg-icon-set-management-with-vue/
cover: svg-iconset.jpg
tags:
- svg
- ui
---

Manage an icon set can seem a simple task but can be tricky.

First, there a lot of ways to use an icon on a web page, all with pros and contras:

Let's use this SVG image created by [Anu Rocks](https://freeicons.io/profile/730) for all examples.

**We will assume our icon set is monochrome.**

<div style="background: #fff; display: block; padding: 10px; width: 25px; height: 25px; margin: auto;">

[![](example.svg)](https://freeicons.io/common-ui-icons/battery-medium-icon-54110)
</div>


## \<img\> tag
The simplest way of adding an icon is using the `<img>` tag as the other images.

Example: `<img src="/i/example.svg" alt="Battery">`
> You can also use the tag `<object>` with same result: `<object type="image/svg+xml" data="/i/example.svg"></object>`

#### Advantages:
* Simple method
* Image can be cached by the browser: if you use in multiple places, only need to download once
* Good usability using the `alt` attribute

#### Disadvantages:
* Lost all SVG styling by CSS (Still using style over the image tag, but for example, you can't change the color of the stroke or )
* Lost all the possibilities of the SVG's DOM manipulation

## CSS
Another way to insert an icon on your page is creating an HTML placeholder and use the image as a background

HTML:
```html
Lorem ipsum dolor <span class="icon icon-battery" aria-label="Battery" title="Battery"></span> 50%
```

CSS:
```css
.icon {
    display: inline-block;
    width: .5em; 
    height: .5em;
}
.icon-battery {
    background: url(/i/example.svg) no-repeat center center;
    background-size: contain;
}
```
> Note the use of `.5em` as width and height to create a container width a size relative to container font size, `.5em` is better than 1em, because 1em uses the full size, but you can play with the value.

This method is very similar to the previous one in terms of advantages and disadvantages.
You can also insert text into the `span` tag and  

## Font
This method requires some extra work to convert SVG to font. It could be done [online](https://glyphter.com/): 

Once we have the icons as font, we must import the font

```css
@font-face {
    font-family: 'My icon set font';
    font-style: normal;
    font-weight: normal;
    font-display: auto;
    src: url("../webfonts/my-icon-set.eot");
}
```

To use the icons we can use the glyph associated with an icon, for example, our battery icon can be the `A`

```html
Lorem ipsum dolor <span style="font-family: 'My icon set font'" aria-label="Battery">A</span> 50%
```

There is another way: use the `:before` pseudo selector and the `content` property in your CSS to insert the font glyph

```css 
.icon {
 font-family: 'My icon set font';
}

.icon-batery:before {
 content: 'A'
}
```

```html
Lorem ipsum dolor <i class="icon icon-battery"  aria-label="Battery"></i> 50%
```

#### Advantages
* It's very easy changing the icon color, the icon inherits the context color
* Font can be cached

#### Disadvantages
* Requires extra work to convert the icons to fonts
* Add a new icon requires to update the font
* No tree-shaking, unused icons still there
* Is confusing for screen readers, because we are inserting text
* Sometimes align with the regular text fonts isn't good


> Note that is possible define a font using just SVG, but this method is not fully supported by commonly used browsers: https://caniuse.com/svg-fonts 

## Inline SVG
This is my favorite method in most cases. The method consists in inserting the SVG markup in your HTML.

In our example
```html
Lorem ipsum dolor  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M17,5 C18.5976809,5 19.9036609,6.24891996 19.9949073,7.82372721 L20,8 L20,8.17 L20.1933113,8.24671351 C21.1458614,8.66012858 21.8418803,9.55339202 21.9763495,10.6214854 L21.9949073,10.8237272 L22,11 L22,13 C22,14.2181391 21.2716631,15.274045 20.201161,15.7433631 L20,15.822 L20,16 C20,17.5385075 18.8418794,18.8065215 17.3498634,18.9798168 L17.1762728,18.9949073 L17,19 L5,19 C3.40231912,19 2.09633912,17.75108 2.00509269,16.1762728 L2,16 L2,8 C2,6.40231912 3.24891996,5.09633912 4.82372721,5.00509269 L5,5 L17,5 Z M17,7 L5,7 C4.48716416,7 4.06449284,7.38604019 4.00672773,7.88337887 L4,8 L4,16 C4,16.5128358 4.38604019,16.9355072 4.88337887,16.9932723 L5,17 L17,17 C17.5128358,17 17.9355072,16.6139598 17.9932723,16.1166211 L18,16 L18,15 C18,14.5004355 18.3670085,14.0840077 18.8498945,14.0112465 L18.9632725,14.0006747 L19.075685,13.9972247 C19.5546159,13.9618905 19.9369487,13.5888432 19.9929352,13.1192658 L20,13 L20,11 C20,10.4871642 19.6139598,10.0644928 19.1166211,10.0067277 L18.8833789,9.99327227 C18.424297,9.93995063 18.0600494,9.57570299 18.0067277,9.11662113 L18,9 L18,8 C18,7.48716416 17.6139598,7.06449284 17.1166211,7.00672773 L17,7 Z M11,9 C11.5522847,9 12,9.44771525 12,10 L12,14 C12,14.5522847 11.5522847,15 11,15 L7,15 C6.44771525,15 6,14.5522847 6,14 L6,10 C6,9.44771525 6.44771525,9 7,9 L11,9 Z" fill="currentColor"/>
</svg> 50%
```

> Note the use of `currentColor` for the fill attribute to inherit the fill color from the CSS context (color)

#### Advantages
* It's very easy changing the icon color, the icon inherits the context color
* Even, if your icon is not monochrome you can change the color of every single path.
* Can manipulate SVG elements independently
* Icons can be animated (not only a doing a transform of the full icon, but you can also manipulate every path independently)
* 

#### Disadvantages
* Non-cachable. If the icons appear in several places you must insert the full code.
* In static sites adds a lot of "bytes" to the HTML.
* A change in your icon, require to find and replace on all icon occurrences.



## Encapsulated inline SVG
We can improve the previous method using Vue (or another framework: React, Angular, etc, or just using web components). The idea is encapsulated every single icon in a Vue component:

```html
<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24">
    <path fill-rule="evenodd" d="M17,5 C18.5976809,5 19.9036609,6.24891996 19.9949073,7.82372721 L20,8 L20,8.17 L20.1933113,8.24671351 C21.1458614,8.66012858 21.8418803,9.55339202 21.9763495,10.6214854 L21.9949073,10.8237272 L22,11 L22,13 C22,14.2181391 21.2716631,15.274045 20.201161,15.7433631 L20,15.822 L20,16 C20,17.5385075 18.8418794,18.8065215 17.3498634,18.9798168 L17.1762728,18.9949073 L17,19 L5,19 C3.40231912,19 2.09633912,17.75108 2.00509269,16.1762728 L2,16 L2,8 C2,6.40231912 3.24891996,5.09633912 4.82372721,5.00509269 L5,5 L17,5 Z M17,7 L5,7 C4.48716416,7 4.06449284,7.38604019 4.00672773,7.88337887 L4,8 L4,16 C4,16.5128358 4.38604019,16.9355072 4.88337887,16.9932723 L5,17 L17,17 C17.5128358,17 17.9355072,16.6139598 17.9932723,16.1166211 L18,16 L18,15 C18,14.5004355 18.3670085,14.0840077 18.8498945,14.0112465 L18.9632725,14.0006747 L19.075685,13.9972247 C19.5546159,13.9618905 19.9369487,13.5888432 19.9929352,13.1192658 L20,13 L20,11 C20,10.4871642 19.6139598,10.0644928 19.1166211,10.0067277 L18.8833789,9.99327227 C18.424297,9.93995063 18.0600494,9.57570299 18.0067277,9.11662113 L18,9 L18,8 C18,7.48716416 17.6139598,7.06449284 17.1166211,7.00672773 L17,7 Z M11,9 C11.5522847,9 12,9.44771525 12,10 L12,14 C12,14.5522847 11.5522847,15 11,15 L7,15 C6.44771525,15 6,14.5522847 6,14 L6,10 C6,9.44771525 6.44771525,9 7,9 L11,9 Z" fill="currentColor"/>
  </svg>
</template>
<script>
export default {
  name: 'battery-icon',
  props: {
    size: [String, Number]
  }
})
</script>
```

I added the `size` property to make the icon resizable without need CSS, and as you know icon aspect ratio you only need one dimension.
If the icon aspect ratio weren't 1:1, you only need to do the math in the component:

For example a icon with a 16:10 aspect ratio (Using height as the base dimension):

```
<svg xmlns="http://www.w3.org/2000/svg" :width="size * 15 / 24" :height="size" viewBox="0 0 24 15">
```

You must create a component for every icon, and insert in your page is simple, just insert the component

```html
Lorem ipsum dolor <battery-icon size="11"> 50%
```

With this method, you can encapsulate the icon markup, and his logic (for example you can add a property to set the color of the bar in the battery icon, or even the bar size, creating a dynamic icon)

If your page is not an SSR page you skip the cache disadvantage because your icon markup is not repeated in your code (but it's in the browser memory)

Also, the disadvantage of replacing all the occurrences is fixed with this method.

Using this method, unused icons don't are bundled in the build because your bundler (for example _webpack_) do the threeshaking before build.

One nice example of project using this method is https://www.npmjs.com/package/vue-material-design-icons, a Vue wrapper for the great project https://materialdesignicons.com/

