---
title: How to create a table with fixed header
date: 2021-10-12
permalink: how-to-create-a-table-with-fixed-header/
cover: /images/2021/table-fixed-header.jpg
---
Tables in HTML are one of the older things in the standard, even before CSS we had HTML tables. In the past tables were used to markup the webpages, but the correct usage is to display tabular data.

Over time the standard improves the table styling covering most of the use cases you can consider.

But, there is a use case it's not easy to get with the table attributes or style properties, I'm talking about creating a table with a fixed/sticky header (or footer).

The behavior we want to get is, for a large table, make it possible to scroll the table content showing always on top of the header.

# Possible solutions
There is more than one solution to this problem. It depends on your needs.

The simplest solution I found is to use CSS to set `position: sticky` to the `th` elements: 

{% iframe https://codesandbox.io/embed/table-fixed-header-s37y4?fontsize=14&hidenavigation=1&initialpath=%2Ffixed-header-css.html&module=%2Ffixed-header-css.html&theme=dark 100% 350px %}

This solution can work in most of cases, but have some limitations, for example `position: sticky` is not supported in legacy browsers https://caniuse.com/css-sticky. 

In my opinion, the most important limitation is you must set a background color for the header elements to avoid overlapping the table content. This is not always a good solution for all cases.

_Following is the same without set the background color for the `th` elements_ 
{% iframe https://codesandbox.io/embed/table-fixed-header-s37y4?fontsize=14&hidenavigation=1&initialpath=%2Ffixed-header-css-no-bg.html&module=%2Ffixed-header-css-no-bg.html&theme=dark 100% 350px %}

Another possible solution is to use `display: grid` and add the `position: fixed` to the first row

But I don't feel comfortable with this solution because:
* It has the same problem with the header's background color 
* We lose the semantic tags (we are displaying as a table, but the html is not a real table, we have a list of div or other tags that don't set a semantic meaning)
* We must know the number of cols of the table because we must set it in CSS, for example `grid-template-columns: repeat(4, 1fr)`

{% iframe https://codesandbox.io/embed/table-fixed-header-s37y4?fontsize=14&hidenavigation=1&initialpath=css-grid.html&module=%2Fcss-grid.html&theme=dark 100% 300px %}


## Duplicating header technique
Why don't just put the header outside the table and only scroll the `tbody`. You can see the result in the following codesandbox. Please notice now, the header can have a transparent background working well with the gradient page background.

{% iframe https://codesandbox.io/embed/table-fixed-header-s37y4?fontsize=14&hidenavigation=1&initialpath=duplicate.html&module=%2Fduplicate.html&theme=dark 100% 300px %}

Ok, but probably you noticed it, this solution as we did it doesn't work well, the header column sizes are not the same as the content, and if the content has a horizontal scroll the header doesn't follow the scroll position.

To fix it we need some _javascript_ to sync the header columns width and the scroll position.

It's important don't hide the original table head using something like `display: none` or alter its width with `position: absolute` we want the original header with the same column width as in a regular table to copy these values to the cloned header. The best way to do it is using `visibility: collapse;` that for table rows or columns hide the element, and the space occupied is removed, but the size of the columns is still calculated https://developer.mozilla.org/en-US/docs/Web/CSS/visibility 

It's also necessary to set the `table-layout: fixed` to avoid the browser tries to fit the columns space, we want to use the same space we copy from the original header 

To copy these widths we can use something like this. The column width sync function is called when the table can change the width, for example on window resize. We can improve this just observing when the table is resized, not when the window is resized using the [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
```js
const syncColsWidth = () => {
  const thead = document.getElementById("thead");
  const theadClone = document.getElementById("thead-clone");
  const theadCols = thead.getElementsByTagName("th");
  const theadCloneCols = theadClone.getElementsByTagName("th");

  for (i in theadCols) {
    theadCloneCols[i].style.width = `${theadCols[i].offsetWidth}px`;
  }
};
 window.onresize = syncColsWidth;
```

We must also sync the scroll position

```js
const onScrollTable = () => {
  const wrapper = document.getElementById("table-wrapper");
  const clone = document.getElementById("wrapper-header");
  clone.scrollLeft = wrapper.scrollLeft;
};
       
document.getElementById("table-wrapper").onscroll = onScrollTable;
```

And with that, we have a fully fixed header for our table.

This solution adds more complexity than the CSS one, but it's more flexible and allows us to use gradient or image backgrounds. 


{% iframe https://codesandbox.io/embed/table-fixed-header-s37y4?fontsize=14&hidenavigation=1&initialpath=duplicate-js.html&module=%2Fduplicate-js.html&theme=dark 100% 400px %}


