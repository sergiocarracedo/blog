---
title: Automate the startup of your projects with yarn create and SAOjs
date: 2020-09-22
alias: automate-project-startup-with-yarn-create
cover: /images/yarn-create.jpg
---
Start a project in any language, framework, etc it's not as simple as it seems. I mean, usually, the project requires a lot of configuration files, installing dependencies, set the environment, create skeleton files, etc.

Talking about JavaScript frameworks: everyone has his own CLI tool to start a project with the required files to start to code.

For example **Angular** has [@angular/cli](https://cli.angular.io/) and you could execute `ng new [app-name]`or 
**Vue** has [@vue/cli](https://cli.vuejs.org/) and you can start a Vue project executing `vue create [project name]`.

This is nice, but usually, the default config is not complaining your development's requisites you still must editing the config files to set up the project according to your needs, for example, change `tsconfig.json` configuration, more _advanced_, you would like to add some code in router file or you would like to create a folder structure for the store, or anything.

Do all those tasks every time you start a project is boring and spend time.

In the background, these CLI tools are using a skeleton repo or similar to prepare your project, but thinking in a generic use case.

So we can do the same but adapting this use case to our use case.

## `yarn create` (or `npx create`) 
 
[Yarn](https://yarnpkg.com/) is a node package manager with vitamins, and provides the command `create`

```bash
$ yarn create [my-starter-kit]
```

You only need to have installed `yarn`, nothing else. This command gets from your _npm registry_ a package named `create-` + the name you use in the command, in our example tries to get the package `create-my-starter-kit`

Then, yarn reads the `package.json` file of the package, installs the dependencies, and run the command in the `bin` entry

```json
// package.json
{
  "name": "create-my-starter-kit",
  "version": "1.0.0",  
  "bin": "lib/cli.js",
  ...
}
```

**`yarn create` won't do anything else**

You must create the next steps, but, think about it, the user (you, a teammate, a user of an open-source project) only need yarn as a dependency.

In your `cli.js` you can do things to prepare the development environment by yourself. But, let's see how to simplify all these tasks.


## SAOjs

[SAO](https://saojs.org/) describes itself as a *Futuristic scaffolding tool*. and it's inspired in [Yeoman](https://yeoman.io/)

These tools allow you to ask the user who runs your *create-app* questions that you could use to make decisions to install or configure different elements.

You must create the file `saofile.js`, and this file must export this elements:

```js 
module.exports = {
  templateData: ...,
  prompts: ...,
  actions: ...,
  prepare: ...,
  subGenerators: ...,
  completed: ...
}
``` 

## Prompts

Let's talk about `prompts`. That must return an array of questions to want to do to the user, for example

```js
  prompts: [
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?'
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Your favourite package manager',
      choices: ['yarn', 'npm']
    }
  ]
```

When you run SAO (we'll see how to do soon), it'll ask the user the questions.

The "prompts" system is very useful, you can ask questions only if a previous question is has some value, etc.

You can also save some answers as preset for the next projects (Like Vue CLI does)

[More information about prompts](https://v1.saojs.org/saofile.html#prompts)
   
## Actions
The other important key in the saofile's object is the actions. They define the actions to do. The important thing is that the actions can be conditioned by the user answers.

### Add
You can copy files from a `templateDir` (in your create package) to the target (the project to create). That's that we needed ;) 
```js
{
  type: 'add',
  files: '**', 
  templateDir: '/template',
  ...
}
```
You could even filter the files to add depending on the user's answers 
[More info](https://v1.saojs.org/saofile.html#type-add)

### Move
Moves files in the target (the project to create)

### Modify
Modify files in the target (the project to create), that is very interesting too, for example, for updating config files according to what the user answered

```js
const packageName = this.packageName
{
  type: 'modify',
  files: 'package.json',
  handler: (data) {
    data.name = packageName
    return data
  }
}
```

In the example, we changed the project name in the `package.json` according to the user's previous answers.

### Delete
Delete files in the target.

## Running SAO

You can run SAO from command line or from your `cli.js` file:

```js
sao({...customVariables})
  .run()
  .catch((err) => {
    console.trace(err)
    process.exit(1)
  })
```

## Summary

Probably you worked before with something similar, every time you have been created a project with Vue CLI, Nuxt, React, etc. 

That is a shallow introduction to all the SAO functionalities, but as you can see the possibilities to customize your project creation are high. 

You could create a template with the config files you use habitually and store the creation script in NPM.js, in a private registry, and every time you create a project, invoke `yarn create my-project-scaffolding` and start to code without the need of prepare manually the config files or miss some dependency.
