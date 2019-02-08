---
title: "Cu run calculation"
date: 2018-05-14T15:34:14+01:00
position: 8
---

# Running a DFT calculation

OK. We are ready to do our first serious calculation:

```bash
pw.x < cu.scf.in | tee cu.scf.out
```

The first part of that command runs Quantum Espresso and feeds it the `cu.scf.in` input file. The second part deals with the output. `tee` is a little helper program that copies all output into a file. The `|` symbol is called a pipe and connects the output from `pw.x` to `tee`.

> This should not take longer than a few seconds to complete.

DFT codes are quite verbose. They provide lots of information for you, and it is important to find the most relevant data in the output. Quantum Espresso is somewhat helpful by printing an exclamation mark in front of the most important lines. You can filter these using `grep`, another unix command-line tool

```bash
grep ! cu.scf.out
```

In this case, only one line with the *total energy* is returned:

```
!   total energy                = -213.04983910 Ry
```

Congratulation. This is your first DFT result. The total energy of fcc Cu is `-213.04984 Ry`. There are two thing to consider:

- DFT uses it's own reference frame for energy. Hence, the energy of reference compounds is not automatically zero as we can see here.
- Quantum Espresso uses [Rydberg](https://en.wikipedia.org/wiki/Rydberg_constant) as energy unit. 

> 1 Ry = 13.605 eV
