function displayResults (results, store) {
  // grab the element that we will use to place our search results
  const searchResults = document.getElementById('results')
  // if the result(s) found
  if (results.length) {
    let resultList = ''
    // iterate over the results
    for (const n in results) {
      // get the data
      const item = store[results[n].ref]
      // build result list elements
      // if you want to style the list, edit this
      resultList += `
            <li>
              <article class="post post--teaser">
  <div class="post__aside">
    <div class="post__cover">
       <img src="${item.image}" width="500" height="250" alt="${item.title}"/>      
    </div>
  </div>

  <div class="post__main">
  <aside class="post__metadata">
    <time class="post__date" datetime="${item.date}">
      <i class="far fa-calendar-alt"></i> ${item.date}
    </time>
  
      ${item.tags.map(tag => `<a href="tags/${tag}" class="post__tag"><span>${tag}</span></a>`).join('')}      
  
    <span class="post__reading-time">
      <i class="far fa-clock"></i> ${item.readingTime}
    </span>
  </aside>
  
    <header>
      <h3 class="post__title">
        <a class="post__link" href="${item.url}">
          ${item.title}
        </a>
      </h3>
    </header>


    <a href="${item.url}"class="post__summary">
      <p>${item.content.substring(0, 150)}...</p>
    </a>

    <a href="${item.url}"class="post__read-more btn">
      Read more
    </a>
  </div>
</article>
        `;
    }
    // place the result list
    searchResults.innerHTML = resultList
  } else {
    // if no result return this feedback
    searchResults.innerHTML = 'No results found.'
  }
}

// Get the query parameter(s)
const params = new URLSearchParams(window.location.search)
const query = params.get('query')

// if query exists, perform the search
if (query) {
  // Retain the query in the search form after redirecting to the search page
  document.getElementById('search-input').setAttribute('value', query)

  // Search these fields
  const idx = lunr(function () {
    this.ref('id')
    this.field('title', {
      // boost search to 15
      boost: 15
    })
    this.field('tags')
    this.field('content', {
      // boost search to 10
      boost: 10
    })

    // provide search index data to lunr function / idx
    for (const key in window.store) {
      this.add({
        id: key,
        title: window.store[key].title,
        tags: window.store[key].category,
        content: window.store[key].content
      })
    }
  })

  // Perform the search
  const results = idx.search(query)
  // get the result and build the result list
  displayResults(results, window.store)

  // Replace the title to 'Search Results for <query>' so user know if the search is successful
  document.getElementById('search-title').innerText = 'Search Results for ' + query
}
