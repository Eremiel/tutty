---
title: "Cu Input Walk Through"
date: 2018-05-14T14:29:26+01:00
position: 6
---

# Copper example

An example input for FCC copper is part of the examples. Let's have a look at it:

```bash
cd Cu_bulk
```

The `cu.scf.in` file within this folder contains all that is needed to calculate the **total energy** of FCC copper. Let's have a look at it with a text editor.

## Text editors

In principle, you can use whatever text editor you like, but your choices are limited if you work directly in the terminal. You usually have at least these terminal-based editors available:

- `vim` is one of the oldest text editors, extremely powerful and practically omni-present. But it has as learning curve. 
- `nano` is also widely available, has less features than `vim`, but comes with a much gentler entry.
- `emacs` is even more powerful than `vim` and more user-friendly, but not that commonly available in an HPC environment.

You can choose between `vim` and `nano` for this tutorial. 

Let's have a look at the input file:

```bash
nano cu.scf.in
```
