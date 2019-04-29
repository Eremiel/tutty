---
title: "The Unix Way"
date: 2018-05-07T14:17:42+01:00
position: 2
---

When starting with atomistic simulations, one quickly out-grows the capabilities of the own PC or Mac. Some form of High-Performance-Computing platform is needed, and these almost exclusively use some form of Unix (actually Linux in most cases these days). Some basic familiarity with a Unix environment is, therefore, needed. 

> If you are serious about using HPC, you should check out your Universities training offers. Most of them will provide a basic training course on how to operate on their local HPC infrastructure.

# The Unix terminal

We will use the **Terminal** for our work, because DFT codes are text-based. Let's have a look around. The terminal shows the **command prompt**, which shows you the current directory in red followed by a yellow `>` sign. The `~` is a shorthand for **home directory**. You can use

```bash
pwd
``` 

to print the full path of the current directory, which should be something like `/home/xxxx` with `xxxx` being your username. 

## File commands

A key part of working in the terminal is knowing how to navigate the file system.

You will work in your *home directory*, but it is advisible to use subdirectories to organise your calculations. This is were you can store your files. Let's have a look:

```bash
ls
```

shows you all your files. At the moment there are none. So lets create a directory:

```bash
mkdir dft
```

This will create a new subfolder called `dft`. This is were we will work. Let's change to this directory:

```bash
cd dft
```

Note that the prompt has changed. It always gives you an indication where you are. If you get lost

```bash
cd $HOME
```

will bring you right back to your home directory.

We will come across a few more useful commands as we go along.
