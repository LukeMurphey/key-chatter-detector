# key-chatter-detector
An app that helps identify which characters on a mechanical keyboard has key chatter. I made this because my Logitech G515 was experiencing key chatter such that some characters were being duplicated. I needed a good way to get statistics regarding which characters were being repeated.

You can see the page at https://lukemurphey.github.io/key-chatter-detector/

## Known issues
There are a couple of scenarios in which the app will detect key chatter even though it is not valid:

1. When auto-complete is used
2. When you hold the keypress in order for the OS to enter several of the same characters
