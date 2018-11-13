---
title: "Cu Input Walk Through"
date: 2018-05-14T15:34:14+01:00
position: 7
---

# Input file format

You can find a detailed description of the file format on the [Quantum Espresso webpage](https://www.quantum-espresso.org/Doc/INPUT_PW.html).


## Namelists

There are three **mandatory** `NAMELIST`s:

- `&CONTROL` contains input variables that control the type of calculation performed and the amount of I/O
- `&SYSTEM` contains input variables that specify the system. Most notably the Bravais lattice
- `&ELECTRONS` describes the algorithm used to reach a self-consistent solution of the Kohn-Sham equations

> Note: There are other (optional) `NAMELIST`s with more configuration variables.

## Cards

There are three *mandatory* `CARD`s:

- `ATOMIC_SPECIES` contains information about the atoms. At the moment, this is only Cu. You will see the symbol for copper, it's atomic mass, and a filename describing the core electrons. More on this later.
- `ATOMIC_POSITIONS` holds the positions of all atoms in the unit cell as fractions of the lattice vectors. Note that we have only one atom specified although the FCC unit cell contains four atoms. We have already told the code that we have an FCC lattice (`ibrav=2` under `@SYSTEM`), and all atoms in an FCC unit cell are related by symmetry. So you only need to specify the unique atoms per unit cell.
- `K_POINTS` defines the number of points and weights used for the first [Brillouin zone](https://en.wikipedia.org/wiki/Brillouin_zone). Parts of the calculations are performed in reciprocal space, and the the `K_POINTS` card defines the accuracy (and cost) of these.
