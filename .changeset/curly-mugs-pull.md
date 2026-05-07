---
"use-stepper": patch
---

Fix custom reducer delegation across multiple stepper instances. Previously, multiple instances would erroneously share whichever default reducer was assigned by the most recently rendered instance.
