---
title: "What is VuePress and why you should use it to document your project?"
alias: 2020/08/22/vuepress
date: 2020-08-22
permalink: vuepress/
tags: 
  - vue
  - vuepress
  - markdown
  - documentation
cover: /images/vuepress.jpg
---
[VuePress](https://vuepress.vuejs.org/) defines itself as a *Vue-powered Static Site Generator*. In other words, is a tool to create static sites. A static site is a website where nothing runs on the server. The server only takes care of return the file (HTML file) as is stored in the server.

Is the opposite of a **dynamic site**, like for example a PHP webpage, in that case, your browser makes a request to the server, and the server executes PHP code that, for example, get a post from a database, process it, put that post in an HTML template, etc and returns the result to the browser.

#### What's better dynamic or static?

This is not the goal of this blog post, but I will say: 'It depends'. There is no "magic" answer: the best type depends on the use case.

## What does VuePress?

With VuePress you can create content in *markdown* files and when you generate the website every markdown file will be converted to an HTML page.

VuePress also provides you other content-relates features:
 
 * Menus
 * Search box (yes, works even as static website)
 * Markdown extensions (that will make your life easier)
 * etc.
 
We will come back to these elements in a moment, but first, we will learn how to start a VuePress website

## Creating a VuePress website
It's very easy, just:

```bash
yarn create vuepress [project-name]
cd [project-name]
```

And then, to start the dev server `yarn docs:dev`.

(This command starts a local dev server, by default, on `http://localhost:8080`

At this point, you can create content just creating markdown files in `docs` folder

If you create a file named `my-content.md` you could access it in `http://localhost:8080/my-content.html`

(If you want to serve a default page a.k.a `http://localhost:8080/` the filename should be `README.md)

You also could create folders in `docs/` and folder name will be in the URL of that content. For example: `docs/blog/README.md` will be served at `http://localhost:8080/blog/`


## Markdown extensions
VuePress provides markdown extensions add more features than "standard" markdown provides.

For example: 

 * Write Github-styled tables: You can create tables in markdown just writing something like:
``` 
 | Col 1        | Col 2           | Col 3  |
 | ------------- |:-------------:| -----:|
 | Content col 1 | Content col 2 | 1234 |
```
 * Frontmatter support: [Frontmatter](https://vuepress.vuejs.org/guide/frontmatter.html) is a way to add YAML content in a markdown file, to set content metadata, for example, the title, the language, etc )
 * Emoji support: :joy: Nothing more to say
 * ToC (Table of contents): A very useful extension, you only need to add `[[toc]]` in your markdown, and it will be rendered as a table of contents (a tree of document headings)
 * Vue components: You can add Vue components directly in the markdown. That is very useful for main the VuePress's use. 

Go to https://vuepress.vuejs.org/guide/markdown.html for further information

## VuePress as documentation generator

Applications and uses are infinite, but VuePress is a very simple but powerful tool to create technical documentation.

Most of Vue ecosystem uses VuePress to create their documentation websites: [Vue.js](https://vuejs.org/), [Vuex](https://vuex.vuejs.org/), [Vue Apollo](https://vue-apollo.netlify.app/), [Portal Vue](https://portal-vue.linusb.org/), [Vue ChartJs](https://vue-chartjs.org/), etc....

I think this simplicity makes easy the task of creating your project documentation.


## Using in an existing project

I think is a good idea to keep your project and its documentation together, and with VuePress is possible to do it.

In your project, you only need to add Vuepress as *development dependency*, that's all

```bash
yarn add vuepress -D 
```

And edit your `package.json` to add the following items in the scripts section to start dev server and build documentation.

```json
...
  "scripts": {
    ...
    "docs:dev": "vuepress dev docs",
    "docs:build": "export NODE_ENV=production && vuepress build docs"
  },
...
```

## Advantages

* Keep the documentation together with the code makes it easier for developers to read the project documentation and update it, because it is near to the code.
* As documentation is markdown, you can still be reading it even without use VuePress, for example in your IDE or in GitHub.
* You could insert your project's Vue components in the documentation to create a "playground", for example, to demonstrate how your component change if you change some property. Like Buefy does in its [documentation](https://buefy.org/documentation/pagination)
* VuePress is themable and highly configurable, you can do advanced things, but you can start to write and serve docs in a few minutes.


## Other VuePress uses
Create technical documentation website isn't the only VuePress use case, you could use VuePress to create a blog [Example](https://ulivz.com/), or a simple webpage but, unless it is something very simple, i think VuePress is not the best tool.
 

## VitePress

At this moment, Evan You, VuePress and Vue.js creator is working on [Vite](https://github.com/vitejs/vite), a build tool that uses native ES Module imports and promises be very fast, and over Vite is creating too [VitePress](https://github.com/vuejs/vitepress), a VuePress brother built on top of Vite, that will have some improvements over VuePress, to highlight Vue 3 usage and faster dev server and build and with lighter page weight.

## Summary

If you need to serve your project documentation **VuePress** is a good option to do that.
