---
title: "Copper Nitride"
date: 2018-05-14T14:29:26+01:00
position: 20
---

# Input
Let's turn to another compound. You also received a 'ready-to-go' input for CuN within the `CuN_bulk` folder.

Let's change to that directory and examine the input file.

```bash
cd ../CuN_bulk
subl cun.relax.in
```

This file looks fairly similar to the copper input file. But there are some noteworthy differences.

## Geometry

### Namelists

There are changes in the `&system` namelist:

```
ibrav = 1, celldm(1) =7.20, nat= 2, ntyp= 2,
space_group = 221,
```

- The Bravais lattice type has changed to one, which indicates a simple cubic lattice (rather than FCC)
- The number of atoms has increased to two
- The number of atom types is also two now
- The lattice constant is different, and
- There is a new variable `space_group` with a value of 221

### Cards

There are also changes in the cards:

```
ATOMIC_SPECIES
 Cu 63.55 Cu.pbe-dn-kjpaw_psl.0.2.UPF
 N  14.00 N.pbe-n-kjpaw_psl.0.1.UPF
ATOMIC_POSITIONS crystal_sg
 N  0.0 0.0 0.0
 Cu 0.5 0.0 0.0
```

- There is a new definition for nitrogen in the `ATOMIC_SPECIES`
- The coordinates of two symmetry in-equivalent atoms are given in `ATOMIC_POSITIONS`

> Also notice the new keyword `crystal_sg`. This instructs the code to take the coordinates relative to the lattice vectors and also consider the space group symmetry operations to find symmetry equivalent atoms in the unit cell.

# Run

The input file is ready for a run. So go ahead and start a relaxation run for CuN:

```bash
pw.x < cun.relax.in | tee cun.relax.output
```
