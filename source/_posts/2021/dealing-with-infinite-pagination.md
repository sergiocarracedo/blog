---
title: Dealing with infinite pagination
date: 2021-11-30
permalink: dealing-with-infinite-pagination/
cover: /images/2021/infinite-pagination-GVYRkT5f1tA-unsplash.jpg
---

In the software development context, pagination is the process of dividing a list of items (rows) into groups of the same size.

For example if we have these items:
```js
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```
and we want to paginate in pages (groups) of 5 elements we should know the list or the total items in the list, and we can calculate the number of pages, and how to get the items on a page (I'm assuming that the page value starts in 0)

```js
const itemsPerPage = 5
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]

const pages = Math.ceil(items.length / itemsPerPage)

const getPageItems = (items, page, itemsPerPage) => {
  return items.slice(page * itemsPerPage, itemsPerPage)
}
```
 This is the ideal situation where the list of items is known, and we are working only on frontend or backend.

The common situation is when your frontend shows the items and the paginator, and you get the data from an API. In this case, you will do a request like `https://example.com/list-items/?page=1` or better using `offset` and `limit` instead of `page` for more flexibility: `https://example.com/list-items/offset=0&limit=5`

In this situation to render the paginator, we must know the total number of items or pages, that is why the response of the server should be something similar to:

```json
{
  "pagination": {
    "totalItems": 16
  },
  "items": [...]
}
```
Then, after loading the first page we will get the total items in the server, and we can calculate the number of pages and render the paginator.

If our database table from where we get the items is big, the operation of counting the total number of events can be very expensive.

# Pagination without knowing the total count of items (a.k.a. Infinite pagination)

The concept is very similar to the _infinite scrolling_, where the user does scroll and when the scroll is in the last item, your component loads a few items more, and so on.

The different thing is we must show a paginator. How we should show the paginator?

As we don't know the total number of pages we have some questions to answer: 

* How many pages we must show in the paginator?
* What is the last page?

## The algorithm
This algorithm will help us to know how many pages we must show and how to know the last page

In our paginator component we must have two variables: 
* `page` is the current page
* `pages` is the total number of pages
* `lastPage` is the last confirmed page (default value `Number.POSITIVE_INFINITY`)

`pages` is a dynamic value, the initial value is `1`

1. Load the first page using the `offset` and `limit` params. `offset` will be 0 (it's the first page), and limit will be, let's say 10
2. If the count of loaded items is less than the `limit` in this case 10, then we know this is the last page
3. If not, if the count is 10, we increment the value of `pages` by 1, then our component must render a new page button.

There is a special case: What happens if the last page has 10 items?
In that case when the user tries to go to this page, when we will load it we will get an empty list of items, then, we must set the value of `lastPage` to the last page with items and use `lastPage` to only render this number of pages.

With this simple algorithm we can create an infinite paginator, and obviously, it has some disadvantages:

* The user only can navigate the pages in order (Can't go to page 10 from page 1 without pass through the page 2,3,4,5...)
* If we have the case of 10 items (`limit` = page items) in the last page, is strange for the user to go back to the last page and remove the next button

Despite these disadvantages is a good solution if our backend doesn't let us know the total number of pages.



