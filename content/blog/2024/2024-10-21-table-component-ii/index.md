---
title: "Lessons I learned creating a table component (part II)"
date: 2024-10-30
cover: pexels-pixabay-159510.jpg
url: /creating-a-table-component-ii
tags:
  - table
  - ui
---

In the [first chapter]({{< ref "/blog/2024/2024-10-19-table-component" >}}) I talked about the data and cols definition. How to manipulate the data, transform it, and format it.

This second chapter will focus on the pagination, sorting, and filtering features and the row selection.

Those features can be or cannot be the responsibility of the table, maybe you can delegate them in your code, and in some true way, but I like to provide a homogeneous and complete developer experience minimizing the repetitive tasks and putting them all together where they are needed.

## Internal pagination (or filtering or sorting).

Let's start with the simplest case: the table gets, via props, all the rows.

In this case, the table can do the filtering, sorting, and pagination. The order of the words is very relevant, as it is the order we should follow: first filter the rows, then sort them, and finally, paginate them.

We can not paginate first as filtering will remove items from the page, and we need to sort the full list to return valid results.

### Sorting

Typically, the table will render a kind of button/arrow in the header to allow the user to select the column to sort by and the direction of the sorting. But not all the columns must be sortable, that is something you can define in the col definition structure. (You can consider if the attribute is not present, the column is sortable by default to avoid being very verbose)

```ts
const cols = [
 {
   id: 'identifier',
   value: 'id',
   sortable: false
 },
 {
   id: 'fullName',
   value: (row) => `${row.firstName} ${row.lastName}`,
   format: (value) => value.toUpperCase()
 },
 ...
]
```

Adding that to the col's definition, we are letting the developer use the table to define the column's behavior, making it flexible.

We need a way to communicate to the developer the sort and sort direction the user selected outside the component, we can use custom events.

### Internal filtering

You can implement the filtering inside the table, the basic filtering is a search box that finds elements that partially fit the user's texts in any row of any column, but as we did before we can define a col's definition attribute to disable the search.

#### What about complex filtering

Search is nice, but probably you will need more complex filtering, for example, values of a col `temperature` higher `0` and lower `10`, or even filter using multiple criteria in the same or different columns and different operators. You can achieve that using a filtering definition system (I will talk about this in the next chapter)

### Pagination

This is the last step, we split the data into chunks of certain elements (page size) and render only the one that corresponds with the selected page.

The table should provide a pagination component to let the user select the page navigate between pages, and maybe select the page size (items per page). All those values should emitted as events outside the table to let the developer know them.

As you know the total rows you can also calculate the number of pages

#### Some tips about the pagination

* Define with your team which is the first page: 0 (like the arrays) or 1 (more natural). This is very important to avoid misleading and errors.
* You should reset the active page to the first one when the data or filters change, but not with sorting
* When the page size (items per page) changes you can reset the active page or calculate the new page will show the same first item

When the table provides these features internally the code will be something like this (pseudocode)

```ts
const filteredRows = props.rows.filter(item => /*[filter by criteria]*/)
const sortedRows = filteredRows.sort((a,b) => /*[filter by criteria]*/)
const totalPages = Math.ceil(sortedRows.length / itemsPerPage)
const rowsToRender = sortedRows.slice((page - 1) * itemsPerPage, page * itemsPerPage)
```

Remember the array operation we are doing returns shallow copies.

## Internal pagination (or filtering or sorting).

When the pagination, sorting, or filtering occurs outside the table, for example in the backend. In this case, we can NOT provide the features in the table, if the table haven't all the rows the sort will be incorrect, and the same with filtering.

In this case, we should provide an 'external' mode property to let the table the data to render is the one provided in the property it doesn't need to do anything else than render it.

We still need the pagination component, the sorting buttons, and the filtering ui, but those only must emit the changes in the values outside the table and the code in charge of retrieving the data from the backend will use them to do the correct request and get the correct page, filtering, and sorting.

This solution of `internal` and `external` modes, lets me create a component that covers multiple use cases, making developers' lives easier, Creating a table with pagination, sorting, and filtering is easier as do:

```ts
// mypage.tsx
export default () => {
  const data = [
    {id: 1, firstName: 'Sergio', lastName:'Carracedo', country: 'Spain'},
    {id: 2, firstName: 'Manolito', lastName:'Gafotas', country: 'Andorra'},
    ...
  ]

  const cols = [
    {
      id: 'identifier',
      value: 'id',
      sortable: false
    },
    {
      id: 'fullName',
      value: (row) => `${row.firstName} ${row.lastName}`,
      format: (value) => value.toUpperCase()
    },
    ...
  ]
  
  return (<MyTable rows={data} cols={cols} />)
}
```

For an external mode we only need to get the changes in the page, filter (search), and sort:

```ts
// mypage.tsx
export default () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ col: 'id', desc: false})
  const [data, setData] = useState([])

  const cols = [
    {
      id: 'identifier',
      value: 'id',
      sortable: false
    },
    {
      id: 'fullName',
      value: (row) => `${row.firstName} ${row.lastName}`,
      format: (value) => value.toUpperCase()
    },
    ...
  ]
  
  useEffect(() => {
    // get data from API
    setData(....)
  }, [page, search, order])
  
  return (<MyTable rows={data} cols={cols} mode="external" onPageChange={(e) => setPage(e.value)} onSearchChange={(e) => setSearch(e.value)} onSortChange={(e) => setSort(e.value)}/>)
}
```

## Row selection

You could want to allow users to select a row or multiple rows (this behavior is configurable via prop), for example clicking in a checkbox in the first col, and/or clicking in a checkbox in the header that will select all the rows when the selection is multiple.

### Row value
First, you need to provide a way to assign a unique value to each row to let the table know which one is selected, even when the data is not in memory (external pagination).

If the user selects a row, changes the page, and later goes back to the page with the selected item, the table must show the item selected.

I used the same strategy as for the col value provider, but in this case is a table property.
The row value provider can be:

* a `string` that identifies the col by `id` and uses the col's row value to provide the row id
* a `function` that returns a value

> The row value must be unique for each row, even for the ones that are not in memory, for example, using a value based on the row index, can generate issues when the pagination occurs in the backend, If you are not careful about how you calculate the index, you can have values repeated in different pages.

### The 'Select all checkbox'

This one is tricky, for an 'internal' table mode, when you select it, the table must check all the rows (even those that are not rendered). Typically you will get the selected row values in an array.

But for the 'external' table mode, that is not enough as you don't know all the row values available, as they are in the backend. In this case, you must continue checking all the rows, but also send outside the table a value `allSelected = true`, which lets the developer get it from the table and send it to the backend to let it know you want to apply an operation over all items, the backend must know how to do that.

In the case the user deselects one row, the global check must acquire an intermediate state, and let the outside of the table know the non-selected rows.

## Summarizing

I strongly believe that a table component must provide those functionalities and the developer can decide which ones or how some behaviors should be via configuration props, as you can see above using the table component is very straightforward, you pass the data, the columns definitions and some props to configure the table features and behaviors and you will get a table with the expected behavior. One advantage of this approach is it works as a black box, and any change or improvement will be applied in any table use after updating the component, for example, if you add a recycle view to improve the performance, all the table usage will be benefited of it without any change.
