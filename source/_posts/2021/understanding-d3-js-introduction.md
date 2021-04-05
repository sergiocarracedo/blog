---
title: Understanding d3.js - A simple line chart
date: 2021-04-01 11:58:32
permalink: understanding-d3-js-introduction/
cover:
---

Before starting is important to say that **d3.js is not a chart library is a library for making charts**, if you are expecting to pass the data to the library and set 4, 5,... 10 params and get the chart render, d3.js is not your library.

[d3.js](https://d3js.org/) is more than that, is a very flexible library to manage data (data-driven documents) and create the representation of that data (not only charts). **d3.js** provides you the different pieces to crete your customized data visualizations (for example charts)

Let's start creating a simple line chart:

![](/images/2021/d3.js/line-chart.png)

# Scales, domain and range
Simplifying, there are two pieces in the chart: Axis and line. Let's talk about the axis.
In the example chart we have two axis: X and Y, but we can have more or less, depending on the chart type.

Axis is one of the reference lines of a coordinate system, every single point represent a value in the coordinate system and also a position in the canvas witch is displaying the chart.

In our example, in the Y axis the "1" value of the chart is drawn in the position 31px from the axis start, but in SVG or canvas the origin of the coordinate system start on the top left corner, and "y" grows in the direction to monitor bottom. Then to print the 1 value in our chart we must use 319 - 31 (288) as y position.
![](/images/2021/d3.js/line-chart-axis.png)

That's complicated, and can be even more, for example if the relation between screen coordinates and chart coordinates aren't lineal, for example un a logarithmic chart.

**d3.js** brings us a component to help us to abstract the conversion between screen coordinates and chart coordinates:

## d3-scale
[**d3-scale**](https://github.com/d3/d3-scale) is our component.
The are a lot of different types of scales: Continuous (Linear, Power, log, indentity, time, radial), Sequential, Ordinal, etc...  For our example chart we will use Linear.

Before continuing with *scale* I'm going to introduce 2 important concepts: **domain** and **range**

**Domain** is the complete set of values chart can use, in our case is all the values between 0 and 10.

**Range** is the coordinates (in the screen) where the chart can draw, in case from 0 to 319

Putting all together: 

```js
const xScale = d3.scaleLinear().domain([0, 10]).range([319, 0]) 
```

This returns a function





https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89