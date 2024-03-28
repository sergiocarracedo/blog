---
title: "Why you should replace Typescript enums with union types"
date: 2024-03-28
url: /typescript-enums-ii
cover: OIG2.jpeg
tags:
  - typescript
---

Last year [I wrote a post about the typescript enums]: how to use them, and some of the problems you can find

A UI components library is a set of reusable components that can be used to build a user interface. These components can be used in different projects and applications. A component wraps app behavior, visual behavior, and presentation. Typically, the components represents the visual style of the company or the product.

An example of this is the [Material Design](https://material.io/design) library, which is Google's design system, and it's used in all Google's products and services (and as is open source anyone can create apps with the same visual style).

**A components library contains the building blocks of the UI of an application.** 

### What is a design system?

You will find this concept usually related to UI components library, but they are not the same. **A design system is a set of rules and guidelines that define how an application or web and all its elements should look like, and how they should behave**. It can ensure the consistency of the application and the quality. 

A design system is a concept over the UI components (and UI components library), as those rules apply to the components (and usually define some of them), but also apply to the whole application defining a visual language (the typography, the colors, the spacing, layout, etc).

## Advantages of using a UI components library
I think that using a UI components library is something that doesn't need discussion, it's a must in most cases. But let's see some advantages of using a UI components library.

* **Consistency**: All the components will have the same look and feel, and will behave in the same way. This is especially important when you have a big team working on the same project, as you can ensure that all the components will look and behave in the same way.
* **Re-usability**: You can reuse the components in different projects **and applications**. This is a huge advantage, as you can save a lot of time and effort. This is especially important for big and complex components, for example a date picker, or a table component. You don't need to write the code to display the component and the logic to make it work, you just need to use the component.
* **Maintainability**: As you have a single source of code for the components, you can maintain them in a single place, and all the applications that use them will be updated (we will see in other posts how to manage the breaking changes and the versions). This is especially important when you need to fix a bug or add a new feature to a component, as you only need to do it once in one place.
* **Encapsulation**: This is related to the re-usability. With well-encapsulated components you only need to worry about the component interfaces, the internal implementation can change without affecting the rest of the application. Remember that it not only affects the code, but affects the visual style, so you can change the visual style of a component without affecting the rest of the application.

In a few words, a UI components library can save you a lot of time and effort and can ensure the quality, maintainability, and consistency (visual and behavior) of your application(s).

## Why to create a UI library?

After the previous section, we can agree that a UI library is a good idea, but why create a new one? There a lot of UI libraries available (even for free), and most are very good and very complete. So, why create a new one?

**There is no correct answer to this question**, maybe the best one is: "It depends". And even if you make a decision today, it can change in the future when the project scope or requirement changes.

Let's see some reasons to create a new UI library:

### Other existing libraries are not adapting to your needs 

Maybe you need a very specific component, or you need to change the behavior of an existing component, or you need to change the visual style of the components in a way the third-party library can not support or the behavior is not the one you need. 

### Independence and control

Related to the previous point, maybe you want to have full control of the components, and you don't want to depend on a third-party library. This is specially important when you need to make a lot of changes to the components, or when you need to have control of the roadmap. You can help to maintain the third-party library, but you can not control the roadmap.

### Custom design system

Third-party libraries are very good, but they are generic, and maybe you need a very specific visual style, with a third-party library it's very hard to achieve that.

Most third-party libraries are very customizable, some even provide an _un-styled_ version that allows you to provide all the CSS to theme the components, but in some cases is not enough, and you need to change the structure of the components, or the behavior, and that's not possible just with CSS. (There are helpers to build libraries that allow to you to achieve that, I will explain in detail later.)

### Why not create a UI library?

If you are not sure if you need to create a new UI library, maybe you don't need it. If your project is a PoC or a small project, or you are not sure about the requirements, maybe you don't need to create a new UI library. You can start using a third-party library, and consider evolving it to a custom library if you need it. 

A custom UI library requires a lot of effort, and it's a long-term commitment, makes the development slower in the early stage (make it faster later), needs developers with more expertise and knowledge, needs to be very well defined in terms of requirements, and needs to be maintained and updated. 

> In this case, my recommendation is to wrap the third-party library in your components, not just copying the properties and events, it's about what they mean and implementing only the ones make sense for you. This way you can change the third-party library in the future without affecting the rest of the application, keeping the same interface. I will talk about the components UI interfaces in a future post of the series.

## Characteristics of a good UI library

A good library should:
 
### Be flexible, but not infinitely

The components should be able to be customized in a lot of ways and should be able to be extended. For example, a button component should be able to be customized in terms of colors, sizes, shapes, etc. Add it an icon or have a loading state, be disabled, etc.
But those customizations should be limited, for example, size instead of a number, can be a set of predefined values (small, medium, large, etc). This is important to ensure the consistency of the application, it's not nice to see buttons with a typography that differs 1px from the next one. Same with the colors (also de colors have a semantic meaning it's not just a visual to make it beautiful).

The components should provide the needs of the application, without the need to change the component. If you need to change the component, maybe you need a new component or something is wrong in the design, usability, etc.

It's very important to be strict with that and avoid very specific customizations just because the component does not fit a specific usecase. It's better to stop and about the use cases and try to find a solution that fits the component.

### Adaptability

The components should be able to be adapted to different projects and applications. To achieve that the components should provide an abstract solution to the problem, it requires thinking, not only about the current requirement, requires to understanding them deeply and think in the future requirements (without trying to cover all the future, I know it's hard to find the balance).

### Be well documented

This is more important than you can think. A good documentation can save a lot of time and effort and can make the difference between a good library and a bad one. The documentation should be clear, concise and should provide examples and use cases. 

The documentation is the entry point for any new member of the team (and a no new member in the team, after a couple of months without using a component I'm sure an experimented developer will need to read the docs again to refresh the knowledge) , and it's the first place to look for when you need to use a component. It's very important to have good documentation, and to **keep it updated**.
 
[Stortbook](https://storybook.js.org/) is a very good tool for creating the documentation of the components, as is not just a text, you can experiment with the behavior of the components, and see what they look like.

### Avoid repeat code and overlap component functionality

Related to adaptability, and flexibility, the components should be well-defined, and should not overlap functionality. For example, if you have a button component, makes no sense (in my opinion) to have a link button component, or a submit button component. You should have a generic button component, and you should be able to customize it to make it look like a link, a submit button or a cancel button, etc.

### Example

Usually is easier to understand the bad behaviors and practices than the best ones. Let's see an example of what I found in my professional life:

> Note: The objective of this example is not to blame the library or anyone, it's just to show an example of things you should avoid without the need to pass the process.

The library had a *Dropdown* component, which is totally common in a UI library. The component as you can imagine represents a list of options that can be selected. Provides properties to customize the visual style (size, label position, etc), and events to handle the user interaction. 

This seems normal and logical, but by exploring the library you can find another component: *Static Picker*: Which does the same but allows you to select options in a tree (the previous one was a flat list). 🤯

And this is not all, you can find another component: *Lazy Picker*: Which does the same as the previous but allows loading the item children on demand. 🤯🤯🤯

The visuals were the same and the behavior was the same, the only difference was the internal implementation. of the items, but common for all the other properties and behavior, but the code was not shared, each component had the same lines of code in its file.

This is a clear example of what you should avoid. Nobody created these 3 components at the same time just for fun, the team developed the first one, and when the requirement of show the items in a tree came, instead of extending the previous component, someone decided to create a new one from the code of the previous one. And months later the requirement of the lazy load came, and the same happened.

This is why I say you need to understand the components and the requirements deeply and think about the future requirements. Even if the new requirements are not on the list of the possible future requirements you planned, you need to stop and think if the component needs a redefinition to fit all new requirements

In this case, I think you can extend the *Dropdown* component to allow you to show the items in a tree without breaking the compatibility with the previous version, and the same with the lazy load (for example emitting an event when the user opens a tree node to let the page or component is using out dropdown load the children).

## Conclusion of the chapter I

A UI library is a set of reusable components that can be used to build a user interface. It's a must in most cases, as it can save you a lot of time and effort, and can ensure the quality, maintainability and consistency of your application(s).

You can use a third-party library, but in some cases, you need to create a new one, in this case, you need to pay the price in the early stages and have a more experienced frontend and design team

In the next chapter of this series. I will go deeper in the interfaces of the components and how to define them to ensure the flexibility and adaptability of the components.
