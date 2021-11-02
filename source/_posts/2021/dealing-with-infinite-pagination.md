---
title: Dealing with infinite pagination
date: 2021-11-31
permalink: dealing-with-infinite-pagination/
cover: /images/2021/go-migrate-pexels-james-wheeler-1598075.jpg
---

In the software development context, pagination is the process of dividing a list of items (rows) in groups with the same size.

For example if we have these items:
```js
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```
and we want to paginate in pages (groups) of 5 elements we should know the list or the total items in the list , and we can calculate the number of pages, and how to get the items in a page (I'm assuming that the page value starts in 0)

```js
const itemsPerPage = 5
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

const pages = Math.ceil(items.length / itemsPerPage)

const getPageItems = (items, page, itemsPerPage) => {
  return items.slice(page * itemsPerPage, itemsPerPage)
}
```
 This is the ideal situation where the list of items is known, and we are working only on frontend or backend.

The common situation is when your frontend shows the items and the paginator, and you get the data from an API. In this case you will do a request like `https://example.com/list-items/?page=1` or better using `offset` and `limit` instead of `page` for more flexibility: `https://example.com/list-items/offset=0&limit=5`

In this situation to render the paginator we must know the total number of items or pages, that is why the response of the server should be something similar to:

```json
{
  "pagination": {
    "totalItems": 16
  },
  "items": ...
}
```
Then in after load the first page we will get the total items in the server, and we can calculate the number of pages an render the paginator


