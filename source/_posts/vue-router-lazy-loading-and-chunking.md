---
title: Vue Router lazy loading and chunking
date: 2019-12-29
tags: vue
cover: /images/pexels-photo-64782.jpg
---
When you start to create SPA _(Single page application)_ you must bear in mind that SPA doesn't mean _Single JavaScript file_.

Usually you use _Webpack_ for handle your app builds, by default _Webpack_ create one file for all assets, *even CSS*. 

The first step, maybe, is separate styles from _app.js_ in they own CSS files.

To do this, we'll use the _Webpack_ plugin _[MiniCssExtractPlugin](https://webpack.js.org/plugins/mini-css-extract-plugin/)_ witch we configure like this:

```js
// webpack.config.js
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ],
  ...
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/public/path/to/',
            },
          },
          'css-loader',
          ... // Other loaders like sass-loader or postcss-loader
        ],
      }
      ...
    ]
  },
```

This forces _Webpack_ to extract CSS into a separate file, for example `app.css`

If you use _vue-cli_, this is the default config for _Webpack_. 

### Going forward

For simple apps is a good idea keep all your build code into a single file, because client's browser load `app.css` the first time user access your app and keep in cache, next access the file will be served from local browser's cache (until cache expire).

But, when your application starts to grow the `app.js` will be huge, slowly down the page loading. There will even be parts of the app that are never used, for example "pages" (in this context think pages as Vue page component, not static pages) forbidden for regular users.

In this case a good solution is chunking your `app.js` using [async components](https://vuejs.org/v2/guide/components-dynamic-async.html) for page components. You can split every page into different files which will be loaded when user navigate to route.

This strategy uses the _[Webpack's code splitting](https://webpack.js.org/guides/code-splitting/)_ feature.

In Vue router configuration you just do 
```js
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeComponent')
  },
  ...
]
```

_Webpack_ now will create a separated file for your page component. But as is, the user receives no feedback about the loading process. We could improve the router using a loading component. 

An async component must provide a _Promise.resolve_. When you write `() => import('./views/HomeComponent')` implicit you return a _Promise_ that resolves the component. But if you want use the _[handling loading state](https://vuejs.org/v2/guide/components-dynamic-async.html#Handling-Loading-State)_ you need return an explicit _Promise_

Like this:
```js
import LoadingComponent from './LoadingComponent'

const routes = [
  {
    path: '/',
    name: 'home',
    component: lazyLoading(import('./views/HomeComponent')) 
  },
  ...
]
function lazyLoadView (AsyncPageComponent) {
  const AsyncHandler = () => ({
    component: AsyncPageComponent,    
    loading: LoadingComponent,
    ...
  })

  return Promise.resolve({
    functional: true,
    render: (h, { data, children }) => h(AsyncHandler, data, children)
  })
}
```

As you see, we use a _Promise.resolve_ that return component render function.

_data_ and _children_ are necessary to pass props, attributes and events to component [More info](https://vuejs.org/v2/guide/render-function.html#Passing-Attributes-and-Events-to-Child-Elements-Components)

With these changes, when the user navigate to `/` in first the app show the _LoadingComponent_ and then, when the component is fully loaded, shows it.

To end, say that you can group the components in the same _chunk_ using following notation.

```js
import(/* webpackChunkName: "group-main" */ './HomeComponent.vue')
import(/* webpackChunkName: "group-main" */ './LoginComponent.vue')
import(/* webpackChunkName: "group-admin" */ './AdminPageComponent.vue')
```







