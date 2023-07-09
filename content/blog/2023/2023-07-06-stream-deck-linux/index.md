---
title: "elgato stream deck on Linux"
date: 2023-07-10
url: /stream-deck-linux
cover: 
tags:
  - linux
  - hardware
---

The last Christmas I got a [Elgato Stream Deck](https://www.elgato.com/en/gaming/stream-deck) as a present. My very beginning thoughts were: "I don't need this, I don't know an real use case for that". But I decided to keep it and try to use it for something.

# What is a stream deck?
The stream deck is a device with 15 buttons (in my case), each button has a small screen that can show an icon or a text. The device is connected to your computer via USB and it has a software that allows you to configure each button and the action to do when you press it. I Think it's called "stream" because one of the typical use cases is to change the [OBS](https://obsproject.com/) scenes when you are streaming, but in general terms you can control anything you want. You can thing on it as a macro keyboard with customizable button, both action and key visualization.

## Optimus keyboard the "father" of stream deck?
The first thing I thought when I saw the stream deck was: "This is very similar to something I saw before", and I remembered the [Optimus keyboard](https://en.wikipedia.org/wiki/Optimus_Maximus_keyboard), a keyboard project born in 2007 with a screen on each key, that allows you to change the key visualization and even the key function. This was a big vaporware and as far as I know not to many unit were produced. But you can see the similarities
![optimus.png](optimus.png)


# How stream deck works
The stream deck is a USB device, when you plug it to your computer. A software controls the visualization of each key and the action to do when you press it. The official software is available for Windows and Mac, but not for Linux.

I was curious about stream deck internals, and how it works. I started to search for information about it, and I found a lot of interesting things.

* **It depends on the computer**: The stream deck is just a USB device, it doesn't have any kind of processor or memory, all the logic is done by the computer. The stream deck software is the responsible to control the visualization of each key and the action to do when you press it. If you unplug the stream deck, the keys will be blank, and if you plug it in another computer, the keys will be blank too. That means no configuration is stored in the device, and the software is the responsible to control the device.

* **Just one screen**: As you can see in the video bellow, the stream deck it's just a big screen with a mask to emulate multiple small screens (and buttons). 

{{< youtube rOQu9_t2zOY >}}


# Using in linux?

The first issue was there is no official support for Linux, I started to search for community and opensource projects related to the stream deck and I found [Streamdeck UI](https://timothycrosley.github.io/streamdeck-ui/)

## Streamdeck UI
It's a graphical interface (GUI) application written in python, that allows you to configure each steam deck button, setting the icon, the label, and the action to do on key press. The action can be a CLI commnand, key press emulation, for example: emulate some key combination or key stroke series, or event write a text for you.

Tha application is nice, but I wanted go futher and understand how the stream deck works



