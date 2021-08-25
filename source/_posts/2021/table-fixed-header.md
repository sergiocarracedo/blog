---
title: How to create a table with fixed header
date: 2021-08-27
permalink: how-to-create-a-table-with-fixed-header/
cover: /images/2021/vue-typescript-tips-rF4kuvgHhU-unsplash.jpg
---
Tables in HTML are one of the older things in the standard, even before CSS we had HTML tables. In the past tables were used to markup the webpages, but the correct usage is to display tabular data.

Over times the standard improves the table styling covering most of the use cases you can consider.

But, there is a use case it's not easy to get with the table attributes or style properties, I'm talking about create a table with a fixed/sticky header (or footer).

The behavior we want to get is, for a large table, make possible to scroll the table content showing always on top the header.

# Possible solutions
There are more than one solution to this problem. It depends on your needs.

The simplest solution I found is to use CSS to set `position: sticky` to the `th` elements: 

{% iframe https://codesandbox.io/s/table-fixed-header-riho5?file=/index.html?fontsize=14&hidenavigation=1&theme=dark&view=preview 100% 300px %}

This solution can work in the most of the cases, but have some limitations, for example `position: fixed` is not supported for the legacy browsers https://caniuse.com/css-sticky. 

In my opinion, the most important limitation is you must set a background color for the header elements to avoid overlapping the table content. This is not always a good solution for all the cases, and 

https://codesandbox.io/s/table-fixed-header-riho5?file=/fixed-header-css-no-bg.html

One possible solution is removing the `display: table / table-row / table-cell` from the table elements to use `display: flex` or `display: grid` and add the `position: fixed` to the table head 



TODO
1. Using CSS
2. Using JS
3. Duplicating Header
