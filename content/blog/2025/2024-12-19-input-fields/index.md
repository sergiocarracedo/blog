---
title: "Input-field concept to improve reusability and consistency in your form related UI components"
date: 2025-01-08
cover: PXL_20250105_233533375.MP.jpg
url: /input-field
tags:  
  - ui
---

 Reusability and consistency are two concepts I am "obsessed" with. Maybe is because I know the effort and pain of maintaining a UI component library without those concepts in mind. It's also about the developer experience, and the less time you spend on repetitive tasks, the more time you have to focus on the real problems and deliver value to your users. And from the user point of view, consistency is a key factor in the usability of an application.

## The problem

When you develop an UI components library, it's very common to have different components to allow user to introduce information in different ways: (I'm going to use [NextUI](https://nextui.org/) components as an example, but you can apply this concept to any UI library)
- Text fields
- Text areas
- Selects or Dropdowns
- Date pickers
- File fields
- Checkboxes
- Radio buttons
- ....


Lets focus on the fields that allow the user to introduce text or a value, like text fields, text areas, selects, date pickers, file fields etc.

![Different input types](input-types.png)

**Do you see the pattern?**

All these kind of fields have a label, help messages, error messages, slots for icons, and most of the behavior is the same: focus, blur, change, etc. Set the border color in red if error, set the color and the background to gray if disabled, etc.

There are a lot of common things, implement them in each component is a waste of time, and a source of bugs, as you need to maintain the same behavior in different components. When you need to change something, you need to do it in all the components, and it's also a source of inconsistency, as you can forget to update one of the components.

There are some differences between the components, like the way to introduce the value or to render it, or example a text field uses an `input type="text"` to let the user change the value, a select component doesn't need an input (not in this example, maybe if its autocomplete, but a list of options, a date picker needs a calendar, etc. 

Those are the differences that make the components unique, but the common behavior is the same, with some exceptions or predefined behaviors for the commons cases. For example the dropdown uses the right slot to render the arrow will open the popover with the options, the datepicker renders a calendar to identify it, etc.

## The solution

The solution is to create a helper component that encapsulates the common behavior and the common structure of the fields. A helper component makes no sense use as is, you can think on that like an abstract class in OOP, you can't create an instance of it, but you can extend it and create a new class that inherits the behavior and structure of the abstract class.

Each component can set a preset of properties or slots for the helper component, and the helper component will render the structure and the behavior based on that. For example, the Textfield or Textarea component expose the slot for left and right icons to the developer, but the dropdown uses the right slot for the arrow and only exposes the left slot for the icon. But the helper component still the same








