function displayResults(e,t){const n=document.getElementById("results");if(e.length){let s="";for(const o in e){const n=t[e[o].ref];s+=`
            <li>
              <article class="post post--teaser">
  <div class="post__aside">
    <div class="post__cover">
       <img src="${n.image}" width="500" height="250" alt="${n.title}"/>      
    </div>
  </div>

  <div class="post__main">
  <aside class="post__metadata">
    <time class="post__date" datetime="${n.date}">
      <i class="far fa-calendar-alt"></i> ${n.date}
    </time>
  
      ${n.tags.map(e=>`<a href="tags/${e}" class="post__tag"><span>${e}</span></a>`).join("")}      
  
    <span class="post__reading-time">
      <i class="far fa-clock"></i> ${n.readingTime}
    </span>
  </aside>
  
    <header>
      <h3 class="post__title">
        <a class="post__link" href="${n.url}">
          ${n.title}
        </a>
      </h3>
    </header>


    <a href="${n.url}"class="post__summary">
      <p>${n.content.substring(0,150)}...</p>
    </a>

    <a href="${n.url}"class="post__read-more btn">
      Read more
    </a>
  </div>
</article>
        `}n.innerHTML=s}else n.innerHTML="No results found."}const params=new URLSearchParams(window.location.search),query=params.get("query");if(query){document.getElementById("search-input").setAttribute("value",query);const e=lunr(function(){this.ref("id"),this.field("title",{boost:15}),this.field("tags"),this.field("content",{boost:10});for(const e in window.store)this.add({id:e,title:window.store[e].title,tags:window.store[e].category,content:window.store[e].content})}),t=e.search(query);displayResults(t,window.store),document.getElementById("search-title").innerText="Search Results for "+query}