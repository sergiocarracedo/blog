---
title: Query builder to filter data in TypeScript
date: 2024-11-07
cover: pexels-igor-starkov-233202-1117452.jpg
url: /query-builder-filter-data
tags:
  - typescript
  - ui
  - filtering 
---

I wrote posts ([1]({{< ref "/blog/2024/2024-10-19-table-component" >}}), [2]({{< ref "/blog/2024/2024-10-21-table-component-ii" >}}) and [3]({{< ref "/blog/2024/2024-10-27-table-component-iii" >}})) about my learnings creating table components, and this post can be the third part as I made a query builder for that component, but it can be used in other uses cases.

A query builder provides a convenient and (usually) simple interface for creating and executing queries (filtering) on a data set.

In TypeScript (or any other language) if you want to filter an array of objects like:

```ts
const data = [
  { field1: 1, field2: "a", field3 ....},
  { field1: 2, field2: "b", field3 ....}
  ...
]
```
We must write a code like this, with the logic to do the filtering:

```ts
const filteredData = data.filter(row => {
  return row.field1 > 10 && row.field2 === "b" || ....
})
```

The goal is to define a dynamic way to define the filters without changing the code.

## Characterizing a filter

A simple filter, is basically, a value source (the attribute name), a value to compare with and the comparator operator.

Using Typescript we can model that like:

> NOTE: I'm not going to do complex typing to simplify the code, but in production is necessary to type the field to ensure is a key of the data and the value type

```ts
type FilterComparationOperator = 'eq' | 'neq'| 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'notContains' | 'startsWith' | 'endsWith'
interface Filter {
  field: PropertyKey
  value: unknown
  operator: FilterComparationOperator
  caseSensitive?: boolean
}
```
First, we model in the type `FilterComparationOperator` the different ways to compare the field value and the filter value:
* equal (eq):
* non-equal (neq)
* great than (gt)
* great than or equal (gte)
* less than (lt)
* less than or equal (lte)
* contains the value (contains)
* non-contains the value (notContains)
* starts with the value (startsWith)
* endsWith (endsWith)
* You can think more operators if you need it

Then we model the filter, with the field we will use to the the value in the data, the value for the filter, the comparator operator, and a couple of flags to refine the filter behavior, if it should be case-sensitive (case-insensitive by default)

With that, we will write a function to compare 2 values using the operator and the filter constraints like if the comparative should be case-sensitive or non-case-sensitive:

```ts
function compare<T = unknown>(
  value: T,
  operator: FilterComparationOperator,
  filterValue: T,
  caseSensitive = false
): boolean {
  function isString(value: unknown): value is string {
    return typeof value === "string";
  }

  // If the filter value is a string and the filter is not caseSensitive
  // converts the values to lowercase for a case insensitive comparison
  const filterValueComp =
    isString(filterValue) && !caseSensitive
      ? filterValue.toLocaleLowerCase()
      : filterValue;
  const valueComp =
    typeof value === "string" && !caseSensitive
      ? String(value).toLocaleLowerCase()
      : value;

  // Checks if we can do numeric comparations with the values
  function isComparable(value: unknown): value is string | number {
    return typeof value === "string" || typeof value === "number";
  }

  type OrString<TValue> = TValue | string;

  const comparationFuncs: Record<
    FilterComparationOperator,
    (value: OrString<T>, filterValue: OrString<T>) => boolean
  > = {
    // Note the == instead of ===. We want to allow to compare 1 and "1" as the same value
    eq: (value, filterValue) => value == filterValue,
    neq: (value, filterValue) => value != filterValue,
    contains: (value, filterValue) =>
      String(value).includes(String(filterValue)),
    notContains: (value, filterValue) =>
      !String(value).includes(String(filterValue)),
    startsWith: (value, filterValue) =>
      String(value).startsWith(String(filterValue)),
    endsWith: (value, filterValue) =>
      String(value).endsWith(String(filterValue)),
    gt: (value, filterValue) =>
      isComparable(value) && isComparable(filterValue)
        ? value > filterValue
        : false,
    gte: (value, filterValue) =>
      isComparable(value) && isComparable(filterValue)
        ? value >= filterValue
        : false,
    lt: (value, filterValue) =>
      isComparable(value) && isComparable(filterValue)
        ? value < filterValue
        : false,
    lte: (value, filterValue) =>
      isComparable(value) && isComparable(filterValue)
        ? value <= filterValue
        : false,
  };

  return comparationFuncs[operator]
    ? comparationFuncs[operator](valueComp, filterValueComp)
    : false;
}

console.log(compare(12, "gt", 8)); //True
console.log(compare("lorem ipsum dolor est", "contains", "DOloR")); //True
console.log(compare("lorem ipsum dolor est", "contains", "DOloR", true)); //False
```

## Having multiple filters and complex relationships between them

We want to let the user create complex comparatives like if the (temperature is lower than 20 and temperature is higher than 0) or the temperature is -999 or ((the city name is Vigo and country is Spain) or (city name is Santiago and the country is chile))

Note the parenthesis that groups the logic as is not the same `A and B or C` (same as `(A and B) or C) than `A and (B or C)`. [Read more about the order of operations](https://en.wikipedia.org/wiki/Order_of_operations#Programming_languages)

So we need to define a struct to model these groups and the relationship.

```ts
interface GroupFilter {
  filters?: Filter[]
  groups?: GroupFilter[]
  operator: 'and' | 'or'
}
```

This "filter group" can contain filters and other groups (that can contain more filters and more groups,....) and the operator to define the relationships between the filters and groups. For example:

```ts
const group: GroupFilter = {
  operator: "or",
  filters: [{ field: "temperature", value: 20, operator: "lt" }, { field: "temperature", value: 0, operator: "gte" }],
};
```
defines a filter group that checks if the temperature is lower than 20 OR higher (or equal) than 0.

With this simple nested struct, we can create complex filters like the one in the example:

```ts
// if the (temperature is lower than 20 and temperature is higher than 0) or the temperature is -999 or ((the city name is Vigo and country is Spain) or (city name is Santiago and country is Chile))

const filters: GroupFilter = {
  operator: 'or',
  filters: [{ field: 'temperature', operator: 'eq', value: -999 }],
  groups: [
    {
      operator: 'and',
      filters: [
        { field: 'temperature', operator: 'lt', value: 20 },
        { field: 'temperature', operator: 'gt', value: 0 },
      ]
    },
    {
      operator: 'or',
      groups: [
        {
          operator: 'and',
          filters: [
            { field: 'city', operator: 'eq', value: 'Vigo' },
            { field: 'country', operator: 'eq', value: 'Spain' },
          ],
        },
        {
          operator: 'and',
          filters: [
            { field: 'city', operator: 'eq', value: 'Santiago' },
            { field: 'country', operator: 'eq', value: 'Chile' },
          ],
          
        }
      ]
    },
  ]
}
```

The last piece we need is a function to filter the data rows:

```ts
function filter<T extends Record<PropertyKey, any>>(
  data: T[],
  filterGroup: GroupFilter
): T[] {
  // If the no rows, we don't need to continue
  if (data.length === 0) {
    return data;
  }

  // Check if a row fulfill the constraints
  const filterRow = (row: T, filterGroup: GroupFilter | undefined): boolean => {
    // Exit condition for this recursive function
    if (!filterGroup) {
      return true;
    }
    // Checks if a col in the row matches a filter
    const filterColFunc = (filter: Filter): boolean => {
      // If the row has no a field with the field name continue
      if (!row[filter.field]) {
        return true;
      }

      return compare(
        row[filter.field],
        filter.operator,
        filter.value,
        filter.caseSensitive
      );
    };

    const groups = filterGroup.groups || [];
    const filters = filterGroup.filters || [];

    if (filterGroup.operator === "and") {
      // For the and operator, we should return true if all of the filters and groups are fulfilled. If no filters or no groups we consider it a match
      return (
        (filters.length === 0 || filters.every(filterColFunc)) &&
        (groups.length === 0 ||
          // For the groups we apply again the filterRow function to get the result for the group
          groups.every((group: GroupFilter) => filterRow(row, group)))
      );
    } else {
      // For or operator, we should return true if any of the filters or groups fulfill or they are empty
      return (
        filters.some(filterColFunc) ||
        groups.some((group: GroupFilter) => filterRow(row, group)) ||
        (filters.length === 0 && groups.length === 0)
      );
    }
  };

  // Loops the rows and filter them
  return [...data].filter((row) => filterRow(row, filterGroup));
}
```

Now we can execute our filter just by doing:

```ts
const filteredData = filter(data, filters)
```

## Putting all together

{{< iframe "https://codesandbox.io/embed/w3w4qc?view=editor+%2B+preview&module=%2Fsrc%2Findex.ts" "100%" "350px" >}}

[Run it in TS playground](https://www.typescriptlang.org/play/?#code/C4TwDgpgBAYglgG2BATgYQPYFswEMW7BwYB2A8pAcBilALwBQUUAPlAEQQCO7TrHJbr2Zt2Ac2DD+45FNFI5HJBEXsAxqWC44JAM6qSGYJhJad+vqN1aUwXQHU4wABaqIJACYOnrgNwMGHWQUADNcNWh4ZVoAbz4QuAgEDwAuKAAFFAxKUABpCBB-ZgA3XAQAVwg08pIAa0MAdxIiqGzUQho0qODMHHxCYnJKDpQWtVxdCABld10nOGKIAH40gCMMDAQIXGa+axQ4NWAVqHXN7d2AXwDQSCgAcSzysG7UeksoOOZv1uHqFDS7B2HnY0ho7BazEuUAAZJ8+D8EtFdCdXigANoAXUh3zETzAKLSjwwzzRWJxl38DBCNSOgygGj6KAgAB4ACr0KA1eoYJoAPgAFHxShUqlA2QAaPhtKidWCIHrYPBUQYUdr-KXMJHBABqZUqaUlfHGkxmenmi05YQQkwYAEo1hstjt4VraURSFA4LopsADiQxAKRQauXVGiQHVBg9BvVB9joxK7vszgOUUCQoLcIBgQlH9dA6IWOPGAxC+Nc+AB6StQACSuZc0G1b2jXt0UBdJcTwMzzibCrescMwAZE2mswtECrNY0JEWtnbjbzosXGCgCF5qBNTZoHdHky9egnREtjOVA1IxtI1igzZQetFvTA7x+3t9-sDd4flTtsLhAEJtzNOYTynH5mCWW8B3vfMADpqAAGQwcYtiQhpUDQMcBTtBFvjSL98zGa8R2jJ8X2+LMc2XSp6CLdgu1BGEAKA48FjA8DIPfBMg3zO14IwJCUIgNCMKwnDwKgNJoypZhqygNA+zUWp2zgXN0NHDMPDXEhyiwVBDgZJV+g9PQoAaHxe2gaNdHid16W9J9+lWLYeNFaow15CMpPzNs4z9BN+B0rBVjeL5kwgVN00zcBs1zVtCzoYt-NLVg2EouKfISgRdJClAyyhAJmCzKAyBQLiA3Zb8ID5Tk2Sq-guxkwy9BHM9jMGGBaV0NIACUIA0FAPBZXC0UclVSDVWUUE1b5XJDUryrEdk+QlKDoiqtIFuSpa2T5X86Bqs5nRIPgasSsLZJrAA5IxoCXItzGQXAPFaXMEtgqB7GgBodhHagOwQDcGkzNc2uZKAAEYO08DgIdBCZLLjXA9Oo9jmG4NI5ogVaCNFfaavixLccqGbmEELhMejHHoKq-HUagf8iZp-NSeasw9Eplm1t1Xj6D5XDmEWrG+J0NQKg8CBdAFIXiYgO07VZ4cTHZ7qoCx6n1t5g6BYZoXoxFkgxfKCWpZl5m8YV3DrHwOxHBcTnRQ1nm8b5nW9d42DrYXO3nGl7aBVl+XWfcLwfYdknudQWnXYk928dgkPvBcP2PwD82f0tn4JHD7HI5gl3tYkhyjIIZyIGFv82zG3Ay7TzW8Z1iD6Zq2XG8k28ykmVmJDFdW8+jwvwOLpka5c-XK+H89a8DtvINbPkmfryo2-wzvsdwpAc6dqOtf5ovdGr2vx6YquS9H8uZ4kpvWxZfv8xXjubXXn5lC3u+C73oeD7Po-eZPyenIuUvlfOePkWSL2dsvK+7drRd3LE1FMaYMxgwvCQTqhtdDohlCMTEuFIIoJMugtQmDsH-ExFjJ82986VCfOJPCj9Jj+ArDSQ2Jk87sigBAAAHsgTw7Y+oDSGpkGUeQCirR2CAPkgo+AeEILgQ0WIZp3mJM8Ik+I0T2gUZiJMqk1ayK0LBLYAYXC0USgABl-BdKAiCor6NwC0CszBZw3jvD1XknIBRZAaIaKhKiwBqJJC8aC-AagSwSIIDwkYjoXD5kmZguiBT-mUfiSxOsbEZj9JUCkuFnEjjvJgBARCPF3i6NBKJToYkHTid8BJ-4vHojvLBBISQPCYlSdA9JmYUBZJ1o48CuTDIIHqolepjTmnJGxGkiKSDDJMnLm3DQQyWZt0aaQmgrNETQVglTFZWyWLmlAjrO0FImpOOIlAPEgT2wQNQH42ClznjthYGwckOTzl3muXnO5HzUpQFebhBJyTAmwTWbQLKQJPDsHaeBOSMBdxLh7KC1a6kfqmBBtY6ZUVMkxlzGUBAr1EY-J7A8gkUAsCEDUM4D69YoCGDzu2XcdKSXtnUs4uAEtaBOD3OS4AlKpmRQzEKaBddgi6EMe4CQzhTFQDMb8j5Cd5wgBFRhTYRD5Z-jbgKZl4rjFSqyrK55bdmDaogIqgUWr8QBNJGU2JrjeSeN5KtEl8s6E-GObhaESQDxWMurAXc-q-jrLMtAXQzgSTJAxQKrpNFdESIJUuH5u5mVkopVK+FfZQAdnBhAHAKAQD8pmUKq+8rdDYAvtBAparUpt21aWvS5qSVWqCdEOmdqGgOoaE6lJv5DXCvlUYyV0rZUn21QOkx+rXXfHdT8a4UIEGYozOiWCy67GYiadBc1XjW3QTce2rxvju1MICAMuxnJ0R8BiJmHNfw0xighgATlWmoJwIBAQAFlnoHBBE+kkpg82AimHgHQoJLgzUvcgHA6pb1pAAExmKfS+wEAAhfAEQNwkFwOwH9NQ-Svo4IB7QJAQNgavZBqg0GoAwYhgh0AgIdRwDEBgLDhkcP-vw0BojUBQMXtIze5kaQAC01GGSIY4PRxjzGNCsbw+wAjwGuMkYg3xsUMGYM0Zk+Jpj2G-0ybk5x7jzBwPXqg-xyjwnn20fw79OAuAJPadw4CBSiAVAKZ40pkzKmADM6mAPWds1pljOnHPOGc8RtzxnyOmdUz5qzpgbN2cCw5jgTmthhcM7xjzgn73ZZi7JvzCWpNBfY4RtLnwMuRZU2pkTlm8txf85J39SXZMcdK0ZsjhAKOefg9V3T+WAuFaa3p1r5WOumcfT15DqGkikEw-ZtjzWSuufS+5iraRPPjYszJlDKA0MzYa9JgDLWltlZW6Nu93XNu+bqwVxr82huucmQwAZHym1ok5GFUFgJwRKOgqrdEl7xmpA4KdyKKhVqfY4EIVa0YsvZa45iGazK0jnp+D6346o5QQu-TrF7fy24A8SMkQEIPb3MYh+wBQ0P8ywdlQZq+BOWnE4i2dsngaAQcAkMxmHMrjs-ARx61maPyffZ1kjvH0C0c-HJ8CLDRr6XI7l+lwHgJNus4x+zzgPAqduTEwxpjvPoFleVxwAbea1dTUBFD1Gh3Ft0+gfz6BdvwKS++NLyFGzwK45R4bpXhOgfqBfebkYlutfW9i0QerBuJdQUZyb27IAg--BD1z6nyWQupaj+BB3V8nfMGz1CGa-PKTHuvOcQxGBPwbrsVQ3Q8t-BAA)


## Last thoughts

The code I show you here is just a base, there are improvements it needs to be production-ready, for example the typings, the comparison between numbers and strings (now 1 !== "1" and maybe you want to consider that is the same for filtering porpoises), the performance, etc.

But my goal is to show you how simple is to create a dynamic filter that allows the user to define how to filter the data, for example, the user can generate the filter groups using a query builder UI or just a form to select a couple of value, but the developer can define the operators depending on the field without the need to write it in the code.

Read the code carefully and check how powerful are the recursive functions, they can seem complicated in the beginning, but when you start to understand them, they make the code simpler and more flexible.


