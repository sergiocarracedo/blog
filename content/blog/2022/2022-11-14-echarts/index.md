---
title: "Using charts in the frontend: Echarts with examples"
date: 2022-11-10
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

Let's see the pros and cons

### From the scratch
* **Pros**: Full customization
* **Cons**: Needs an experienced team. You must write all low-level utils: dom management, canvas management, scale utils, data transform; mid-level components: axis, zoom; everything


### d3.js
* **Pros**:A lot of low-level utils are provided by d3.js, Great customization levels
* **Cons**: Still requiring effort for simple charts

### Charts library
* **Pros**: Time to chart very low
* **Cons**: Depending on the library it's hard or impossible to customize charts,  Usually bigger bundle


# The charts' library way
Using a charts library to generate data visualizations could look like a simple way to solve the task, but is not, it depends on your requirements how much you need to customize the chart if your requirements in visual style and behavior are simple any library can work, but the thing can get complicated when you need to customize them.

Throughout my career, I explored all the ways and a lot of different charts libraries: amCharts, chart.js, highcharts.js, etc... and to meet the requirements we had I started to create and use custom chart components based on d3.js, but I discovered [ECharts](https://echarts.apache.org/en/index.html)

# ECharts
ECharts is an opensource Javascript (and Typescript) visualization library written in pure javascript and based on [zrender](https://github.com/ecomfe/zrender) incubated under the Apache Software Foundation (ASF) and created originally by Baidu (that is the reason why you will found a lot of Chinese entries looking for ECharts, but you shouldn't worry about it, there is a lot of documentation in English too).

This library allows you to create a lot of different and customizable charts (series types, as we will see later), you only need to visit the [examples page](https://echarts.apache.org/examples/en/index.html) to see it, from a simple line chart to a 3D globe with flight lines, including bars, donut, boxplot, candlestick, map, scatter, heatmap, tree, treemap, sunburts, parallel, sankey, funnel, gauge, themeriver, calendar, and completely custom charts.

{{< iframe "https://echarts.apache.org/examples/en/editor.html?c=lines3d-flights&gl=1"  "100%" "500" >}}

Probably you find the chart you need to meet your requirements with the available charts out-of-the-box, but in any case, you can go deep into the documentation and start to customize your chart visualizations.

## What makes ECharts different
Working with other libraries you can customize things but far as the customization level of ECharts.
You have literally [thousands of params to customize it](https://echarts.apache.org/en/option.html), anything you want to configure exists in the config.

This configuration is a plain js object, and includes all, the chart data, the chart definition, the chart visual configuration, and the chart behavior configuration.

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
ECharts uses ZRender a library that abstracts the 2D draw exposing the same API to render **canvas** or **SVG**, so you can decide where to render your charts.
This allows you to decide which renderer use depending on the use case. As a general rule canvas is recommended for large datasets (>1000 items), and SVG in low-end Android or specific charts. More info at https://apache.github.io/echarts-handbook/en/best-practices/canvas-vs-svg/

This feature makes ECharts very different to other chart solution as they uses SVG or Canvas, but you can't decide (d3.js allows to decide the renderer) the render, you should do the render in the system the charts library uses.


## Examples

Let's do a simple example, a bar chart
{{< iframe "https://codesandbox.io/embed/practical-christian-lm8dmx?fontsize=14&hidenavigation=1&module=%2Fsrc%2Fexample_1.js&theme=dark" "100%" 400 >}}

Create a chart it's simple (check the code), we define the xAxis, yAxis, the series (the values), and the chart type. As you can see the chart type is defined in the series, so we can mix different visualization types in the same chart.

{{< iframe "https://codesandbox.io/embed/echarts-examples-lm8dmx?fontsize=14&hidenavigation=1&initialpath=%2Fexample_2.html&module=%2Fsrc%2Fexample_2.js&theme=dark" "100%" 400 >}}

ECharts even gives you the possibility of transforming a series type into another using an animation


{{< iframe "https://codesandbox.io/embed/echarts-examples-lm8dmx?fontsize=14&hidenavigation=1&initialpath=%2Fexample_3.html&module=%2Fsrc%2Fexample_3.js&theme=dark" "100%" 400 >}}


## Custom series
Besides the series types I mentioned before, you can use a custom series type and [using a function](https://echarts.apache.org/en/option.html#series-custom) you can define programmatically how each render should be rendered.

```js
var option = {
    ...,
    series: [{
        type: 'custom',
        renderItem: function (params, api) {
            var categoryIndex = api.value(0);
            var start = api.coord([api.value(1), categoryIndex]);
            var end = api.coord([api.value(2), categoryIndex]);
            var height = api.size([0, 1])[1] * 0.6;

            var rectShape = echarts.graphic.clipRectByRect({
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height
            }, {
                x: params.coordSys.x,
                y: params.coordSys.y,
                width: params.coordSys.width,
                height: params.coordSys.height
            });

            return rectShape && {
                type: 'rect',
                shape: rectShape,
                style: api.style()
            };
        },
        data: data
    }]
}
```
<small>Example from Echarts page</small>

But in most cases you don't need to go into deep, you can use multiple series types to achieve the result you want, for example, this line chart with confidence band that uses a line type and area type stacking the series

{{< iframe "https://echarts.apache.org/examples/en/editor.html?c=confidence-band" "100%" "400" >}}

Or using features like `visualMap` (maybe I'll write about that in a future post)

## Vue, React, Angular
Wrappers for the most popular frameworks are available. They take care of the data responsibility, and of resizing the chart on window width change

* Vue: https://vue-echarts.dev/
* React: https://git.hust.cc/echarts-for-react/
* Angular: https://xieziyu.github.io/ngx-echarts


## Summary
ECharts is an amazing charts library that allows you to customize it in a lot of different ways, and that probably solves your requirements without write code, just using customization options. 

There are a lot of features I didn't mention but are very interesting, I'll do it in another post.

I invite you to try it and experiment a bit, soon you will realize you can do almost anything just using options, without coding any line.



