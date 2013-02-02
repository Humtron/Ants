# The M Project

An experimental project using many small AMD libraries. The goal is 
to build loosely-coupled modules that interact asynchronously when 
possible, and interact using pure functions and no shared mutable 
state.

The first step is safe, asynchronous DOM updating in m/DOM. The main 
controller will be m/Brain. Next steps include building a message 
passing library with publication/subscription abilities, and finally 
prototypal objects with the building blocks of L-system generation.

## Test the prototype

Hosted at Cloud9, in active development:
[Test prototype](https://c9.io/humtron/m/workspace/index.htm)