---
title: "Cu Input Walk Through"
date: 2018-05-14T15:34:14+01:00
position: 7
---

Every DFT code has it's own input format. Some more intuitive and convinient than others. But they require similar *types* of input. We will use [Quantum Espresso](https://www.quantum-espresso.org) for this tutorial and walk through the most common input sections step-by-step. Quantum Espresso is a widely used free DFT code that is open-source. The large user community ensures that it is feature rich and reasonably stable. Another very popular DFT code is [VASP](https://www.vasp.at/), which consumes about 40% of the worlds super-computer time! VASP is very stable and relatively easy to use. But it is not free. 

# Input file format

You can find a detailed description of the file format on the [Quantum Espresso webpage](https://www.quantum-espresso.org/Doc/INPUT_PW.html).

## Namelists

The input file is sectioned into `NAMELIST`s. There are three **mandatory** `NAMELIST`s:

- `&CONTROL` contains input variables that control the type of calculation performed and the amount of I/O
- `&SYSTEM` contains input variables that specify the system. Most notably the Bravais lattice
- `&ELECTRONS` describes the algorithm used to reach a self-consistent solution of the Kohn-Sham equations

> Note: There are other (optional) `NAMELIST`s with more configuration variables.

## Cards

There are three *mandatory* `CARD`s:

- `ATOMIC_SPECIES` contains information about the atoms. At the moment, this is only Cu. You will see the symbol for copper, it's atomic mass, and a filename describing the core electrons. More on this later.
- `ATOMIC_POSITIONS` holds the positions of all atoms in the unit cell as fractions of the lattice vectors. So you only need to specify the unique atoms per unit cell.
- `K_POINTS` defines the number of points and weights used for the first [Brillouin zone](https://en.wikipedia.org/wiki/Brillouin_zone). Parts of the calculations are performed in reciprocal space, and the the `K_POINTS` card defines the accuracy (and cost) of these.

## Control namelist

The first line in the `CONTROL` namelist defines the type of calculation. Every DFT code can perform various kinds of calculations. This usually includes as a minimum:

- Solving the Kohn-Sham equations self-consistently (i.e., iteratively)
- *Ab-Initio* molecular dynamics
- Relaxation of atomic coordinates and geometric optimisation to minimise forces

Here we request a `scf` calculation, which stands for **S**elf **C**onsistent **F**ield calculation. We ask the code to solve the electronic degrees of freedom, but not move the atoms. Other options include `relax`, `md`, and `bands` for band structure calculations.

The next lines in the `CONTROL` namelist define some directories the code will look in for additional information and data and a prefix for output filenames.

Finally, some boolean flags control the computation of some quantities. In this case, using `tstress = .true.` is a bit wasteful, because the stress tensor is mostly needed to compute forces and move atoms and lattice vectors, which we ask the code **not** to do.

## System namelist

### Crystal geometry 

The `SYSTEM` namelist is used to describe the geometry, which consists of

- defining the lattice
- cystral symmetry
- (irreducible) atomic coordinates and the atom types occupying these coordinates

Here we define a [face-centred cubic](https://en.wikipedia.org/wiki/Cubic_crystal_system) crystal system with `ibrav = 2`. Because of the high symmetry of the fcc system, we only need to define one lattice parameter with `celldm(1) = 6.73`, which sets the edges of the cube to 6.73 Bohr.

> A Bohr is the unit length in the atomistic unit system. 1 Bohr equals 0.529 Angstrom or 0.0529 nm.

The unit cell contains **one** irreducible coordinate (`nat = 1`), which is occupied by the first species (`ntype = 1`). Which element this represents is defined later.

### Basisset

Quantum espresso is a *plane-wave* code, which means that the wave function is exanded in plane-waves (i.e., complex-valued sin and cos). A plane-wave

$$ \psi({\bf r}) = \exp\left(i {\bf k}\cdot{\bf r}\right) $$

characterised by quantum number ${\bf k}$ has a kinetic energy of

$$ \langle \psi | \nabla^2 |\psi\rangle = \frac{1}{2}{\bf k}^2 $$

The bassis set is truncated by dropping plane-waves with an energy larger than the cut-off energy of 25 Ry (`ecutwf = 25.0`).

> Rydberg is the unit for energy in atomic units. A Ry equals 13.6 eV.

Computation of the charge density is also supported by a plane-wave basis with substantially higher energy cutoff (`ecutrho = 300`). 

In general, energy cut-offs need to be tested for convergence, but there are [guidelines](https://www.quantum-espresso.org/Doc/INPUT_PW.html#idm45922794555488) for sensible starting points.

## Electrons namelist

## Atomic species

## Atomic positions

Note that we have only one atom specified although the FCC unit cell contains four atoms. We have already told the code that we have an FCC lattice (`ibrav=2` under `@SYSTEM`), and all atoms in an FCC unit cell are related by symmetry.

## K-point mesh

