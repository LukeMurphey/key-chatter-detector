# key-chatter-detector
An app that helps identify which characters on a mechanical keyboard has key chatter. I made this because my Logitech G515 was experiencing key chatter such that some characters were being duplicated. I needed a good way to get statistics regarding which characters were being repeated.

You can see the page at https://lukemurphey.github.io/key-chatter-detector/

## Known issues
There are a couple of scenarios in which the app will detect key chatter even though it is not valid:

1. When auto-complete is used
2. When you hold the keypress in order for the OS to enter several of the same characters

## Made with AI
This was made with AI with the following prompt:

Make a web application that counts the number of times a keypress happens more than once for the same key within a short duration. To count as a duplicated keypress, it must be the same key pressed twice within the given time-frame.

The app should have two inputs: the first takes the number of milliseconds and it indicates whether the keypresses are counted. The default value should be 50 milliseconds.

The second input is for the text input in which the user types.

The app should show which characters had multiple keypresses, and how many times the duplicates happened.


