---
title: Improving your Vue (and JS) coding quality and workflow
date: 2020-06-21 12:47:40
tags:
cover: /images/js-workflow-38537.jpeg
---
To start coding Javascript (and other languages), you almost need nothing, just a simple, text editor. That is good to start coding when you are learning the language, just code without distractions.

But when you develop bigger projects or/and with others, some problems appears: code organization, coding style, and other. That is because all languages have at a least clean code style guide.

Things like use semi-colon or not at the end of the line, the number of spaces indenting code, etc. 

In Javascript, we have several code styles

* [Google Javascript Style Guide](https://google.github.io/styleguide/jsguide.html)
* [AirBnb Javascript Style Guide](https://github.com/airbnb/javascript)
* [Javascript Standard Style](https://standardjs.com/)
* ...

Personally I prefer StandardJS (Javascript Standard Style), despite this style bans semicolons, and I come from PHP where semicolons are mandatory.

And to complicate it a little more if you use a JS framework like Vue, Angular, or React have their coding styles.

And also if your project uses Typescript, it has is own [coding style guide](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)


Then, how could we ensure all our code complains chosen style guides?
 
## Lint

A [linter](https://en.wikipedia.org/wiki/Lint_(software)) is a tool that analyzes statically our code to ensure that complaints the rules of our coding style(s).

One of the most used tools in the Javascript world is [ESLint](https://eslint.org/). This tool allows you to find coding style errors, and fix them automatically if is possible.

For example when you create a Vue project using `vue-cli` the setup wizard ask you if you want to use a Linter / Formatter (you should) and allows you to choose the coding style, and when you want the linter runs: on file save and/or when you commit your files.

{% asciinema 34AKksPvMuJ7qpUk6K5gBruyS %}

Please notice I choose lint on commit. When your project is small, there is no problem in use "lint on save", but when the project makes bigger check the files on save would be very slow and unproductive. Even with lint on saving, when you are testing things in your code and for example, you comment lines and have an unused import, or remove last value of a list keeping the trailing comma, lint returns an error when you save, and make the tests slower. When you are experimenting you should be concentrated on the experiment, not in the code, when all works ok, then is time to refactor and take care of the coding style.

Let's make an example adding some end line semicolons `;`, spaces between lines, etc

{% asciinema ghtOPskHMcmtMmj8q7RUQZb47 %}

As you can see, before commiting the code, a git hook runs the linter and fix the code (not always is able to fix the code)

This is the `package.json` section related to githooks and linter

```json
{
  "gitHooks": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,vue}": [
      "vue-cli-service lint",
      "git add"
    ]
  }
}
```

Vue uses a tool called [Lint-staged](https://github.com/okonet/lint-staged) that allows the linter to only check staged files. I can assume all files in the repo (not modified) are ok because they were linted before commiting to the repo.

If you want, you could manage git hooks using [Husky](https://github.com/typicode/husky)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "vue-cli-service test:unit",
      "...": "..."
    }
  }
}
```
For example, you can force run tests before push.

# Optimizing

If you are using Webpack, another interesting tool to know the optimization of your project is [Speed Measure Pluing](https://github.com/stephencookdev/speed-measure-webpack-plugin)

This tool shows the time elapsed by each webpack plugin when you build (even using HRM) your project using webpack. It's very useful to detect if some loader is taking too much time to run.

If you use `vue-cli` in your project, you can take advantage of using the integrated analyzer. That allows you to see every imported package, css, or library and check the sizes, and put the focus on heavier ones and try to optimize imports (not importing whole package, just the necessary libraries)   

{% img "photoswipe" /images/vue-cli.jpg %}







