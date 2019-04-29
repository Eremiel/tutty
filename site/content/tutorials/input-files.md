---
title: "Input Files"
date: 2018-05-14T14:21:30+01:00
position: 5
---

# Getting material

Make sure you are back in the `dft` folder. You should see the directory where you are to the left of the cursor.

Let's get some material to work with. We will use `git`, a version control software for this. Type

```bash
git clone https://git.soton.ac.uk/CHEM6136/exercises.git
```

What just happened? `git` fetched some pre-made files for us by checking out a repository from GitHub. Version control is a great way to keep track of changes to text files etc. and a natural fit to moving your calculations to and from an HPC cluster You are welcome to learn as much about it as you can. But not right now.

> The traditional way to move files to/from clusters is using `scp`, which works fine, but does not allow you to keep versions of your calculations. But `git` also has some disadvantages: keeping (many) vesions might not be practical if your calculations produce large output files (e.g., several GBs) or `git` might not be available on your cluster.

You have a new directory called `exercises`. Check it:

```bash
ls
```

and change into this directory

```bash
cd exercises
```

You should have noticed that the command prompt has changed. It now has a `[master]` section. This gives you visual information about the state of your git repository. It currently tells you that you are working on the **master** branch and that your local copy is **clean**, meaning you have no changes in your local copy.

> This dynamic command prompt is not commonly configured in HPC environments. If you want to use these features in your own work, this [online promt generator](http://ezprompt.net/) is extremely useful.
