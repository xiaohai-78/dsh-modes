# Built-in updates are merged three ways

Each save records the built-in plugin list the mode's override was based on. The next save merges the user's list onto the latest built-in list against that base: rows the user left alone follow DSH, fields the user changed keep the user's value, and a field both sides changed keeps the user's value and is reported as a conflict. Without this, an edited mode would never receive DSH's later fixes, and taking the built-in list as it is would throw away the user's edits.
