---
title: "Using charts in the frontend: Echarts with examples"
date: 2022-11-22
url: /using-charts-frontend-Echarts-with-examples
cover: pexels-lukas-590022.jpg
tags:
 - data visualization
---
If you are working in frontend and in data visualization one of the tasks you need to solve is to represent data in 
different ways (charts) and there are multiple ways of resolving it:
* Do it from the scratch, with js and css, svg, canvas, etc
* Using a low-level library that abstracts for you things like dom manipulation, scales, etc, [d3.js](https://d3js.org/) is a very good one: I wrote a [blog post about it]({{< ref "blog/2021/understanding-d3-js-introduction" >}})
* Using chart libraries

Let's see some pros and cons of the different approaches there is no perfect solution, depends on your needs.
|                          | From the scratch | d3.js | Charts library                |
|--------------------------|------------------|--|-------------------------------|
| **Customization effort**      | Low              | Mid | Depends on the library (High) |
| **Team experience required** | Higher           | High | Low                           |
| **Experience required**      | Higher           | High | Low                           |
| **Out-of-the-box features**  | None             | Axis, data transformations, draw svg/canvas management | Full charts                   |
| **Time to production**  | High             | High | Low                   |


# The charts' library way
Using a charts library to generate data visualizations could look like a simple way to solve the task, but is not, it depends on your requirements and how much you need to customize the chart if your requirements in visual style and behavior are simple any library can work, but the thing can get complicated when you need to customize them.

Throughout my career, I explored all those ways and a lot of different charts libraries: amCharts, chart.js, highcharts.js, etc... and to meet the requirements we had I started to create and use custom chart components based on d3.js, but I discovered [ECharts](https://echarts.apache.org/en/index.html)

# ECharts
ECharts is an opensource Javascript (and Typescript) visualization library written in pure javascript and based on [zrender](https://github.com/ecomfe/zrender) incubated under the Apache Software Foundation (ASF) and created originally by Baidu (that is the reason why you will found a lot of Chinese entries looking for ECharts, but you shouldn't worry about it, there is a lot of documentation in English too).

This library allows you to create a lot of different and customizable charts (series types, as we will see later), you only need to visit the [examples page](https://echarts.apache.org/examples/en/index.html) to see it, from a simple line chart to a 3D globe with flight lines, including bars, donut, boxplot, candlestick, map, scatter, heatmap, tree, treemap, sunburts, parallel, sankey, funnel, gauge, themeriver, calendar, and completely custom charts.

{{< iframe "https://echarts.apache.org/examples/en/editor.html?c=lines3d-flights&gl=1"  "100%" "500" >}}

Probably you find the chart you need to meet your requirements with the available charts out-of-the-box, but in any case, you can go deep into the documentation and start to customize your chart visualizations.

## What makes ECharts different
Working with other libraries you can customize things but far as the customization level of ECharts.
You have literally [thousands of params to customize it](https://echarts.apache.org/en/option.html), anything you want to configure exists in the config.

This configuration is a plain js object and includes all, the chart data, the chart definition, the chart visual configuration, and the chart behavior configuration.

My first thought was having a JS API it's better to customize the charts, but believe me, just using this big object you can do customization and fine-tuning.

Another fully customizable thing is the theme, you can use [pre-build themes](https://echarts.apache.org/en/download-theme.html) or [create a new one](https://echarts.apache.org/en/theme-builder.html)  customizing every aspect of the charts. For example, you can customize the default series's colors for all charts without the need to set them in every chart

As I mentioned before, all the configs are js' plain objects, so you can store this data as JSON and then import as an `Object` and use `Object.assign` to set default shallow values, or lodash defaults (`_.defaults`)
` for example to set the defaults for the tooltip


```js
const echartsDefaults = {
  tooltip: { show: true, trigger: 'axis', position: ['50%', '50%'] },
  xAxis: { itemStyle: { color: '#f00' } }
}
...
const chart = echarts.init(document.getElementById("app"));
chart.setOption(_.defaults(
  { tooltip: { trigger: 'item' },
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }
}, echartsDefaults))
// The actual options
// { 
//   tooltip: { show: true, trigger: 'item', position: ['50%', '50%'] },
//   xAxis: { itemStyle: { color: '#f00' }, type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }
// }
```

### Canvas vs SVG
One of the most common questions, when you start to develop a chart solution is if use SVG or Canvas.

**SVG** defines the visual representation as a document, exactly the same as HTML defines a page as a document, the events work similarly as in HTML, and the visualization of the elements can be modified using simple CSS. SVG also it's better in terms of accessibility. **It's a vectorial representation**, so the charts will look nice in any resolution, and in any SVG object change the browser will take care of the redraw.

**Canvas it's a pixel-oriented (bitmap)** way to represent drawings (SVG can also include bitmap), basically after drawing a pixel the browser stop taking care of the object you drew and only stores the pixels. This makes you need to care of the redraw if something changes.

> Canvas gives better performance on small surfaces or large numbers of objects to draw and SVG is better for large surfaces and small numbers of objects.

ECharts uses ZRender a library that abstracts the 2D draw exposing the same API to render **canvas** or **SVG**. **This allows you to decide which renderer to use** but without do extra changes in your chart, it's just a flag. 

As a general rule canvas is recommended for large datasets (>1000 items), and SVG in low-end Android or specific charts. More info at https://apache.github.io/echarts-handbook/en/best-practices/canvas-vs-svg/

This feature makes ECharts very different from other chart solution as they use SVG or Canvas, but you can't decide (d3.js also allows you to decide the renderer) the render, you should do the render in the system the charts library uses.


## Basic example

Let's do a simple example, a bar chart
{{< iframe "https://codesandbox.io/embed/practical-christian-lm8dmx?fontsize=14&view=preview&hidenavigation=1&module=%2Fsrc%2Fexample_1.js&theme=dark" "100%" 400 >}}

You can compare how to create a similar chart in d3.js [here](https://d3-graph-gallery.com/graph/barplot_basic.html)

The amount of code is higher even for the basic case, and the d3.js version doesn't include the tooltip and the gradients

Creating a chart is simple (check the code) as fill a js plain object, maybe you would need time to find the property you need to use, but basically, we define the xAxis, yAxis, the series (the values), the series type, and the style of those elements in the same object.


## Multiple series example
The representation type (chart) type is defined by the series, so we can mix different visualization types in the same chart. 
Let's see an example.

{{< iframe "https://codesandbox.io/embed/echarts-examples-lm8dmx?fontsize=14&view=preview&hidenavigation=1&initialpath=%2Fexample_2.html&module=%2Fsrc%2Fexample_2.js&theme=dark" "100%" 400 >}}

Series could share the axis, but in the example, we added a new axis with a different scale and units.

### Animations example
ECharts gives you the possibility of transforming a series type into another using animation, it's easy as changing the Echart's options object and ECharts will do the animation for you

{{< iframe "https://codesandbox.io/embed/echarts-examples-lm8dmx?fontsize=14&view=preview&hidenavigation=1&initialpath=%2Fexample_3.html&module=%2Fsrc%2Fexample_3.js&theme=dark" "100%" 400 >}}


## Custom series
Besides the series types I mentioned before (there are a lot), you can use the custom series type and [using a function](https://echarts.apache.org/en/option.html#series-custom) you can define programmatically how each render should be rendered. This feature gives you more control over the representation.

And even, if you really need it you can write a plugin type to create a new series type for a custom data representation, for example, a word cloud viualization: https://github.com/ecomfe/echarts-wordcloud

But in most cases you don't need to go into deep and create a custom series type or use a custom one, you can use multiple series to achieve the result you want. For example, this line chart with confidence band uses a line type and area type stacking the series

{{< iframe "https://echarts.apache.org/examples/en/editor.html?c=confidence-band" "100%" "400" >}}

Using other features like `visualMap` you can set different colors on different series parts.

{{< iframe "https://echarts.apache.org/examples/en/editor.html?c=line-sections" "100%" "400" >}}

## Vue, React, Angular
You can use ECharts with your favorite js framework, there are wrappers available, and they take care of the data responsibility, and of resizing the chart on window width change.

* Vue: https://vue-echarts.dev/
* React: https://git.hust.cc/echarts-for-react/
* Angular: https://xieziyu.github.io/ngx-echarts


## Summary
ECharts is an amazing charts library that allows you to customize it in a lot of different ways, and that probably solves your requirements without writing code, just using customization options. 

There are a lot of features I didn't mention but are very interesting, I'll do it in another post.

I invite you to try it and experiment a bit, soon you will realize you can do almost anything just using options, without coding any line.

> If you like this post and you are interested in ECharts, let me know with a comment or a tweet and I will write more posts with other use cases.
