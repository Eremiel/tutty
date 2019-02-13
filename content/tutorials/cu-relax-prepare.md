---
title: "Structural relaxation"
date: 2018-05-14T14:29:26+01:00
position: 10
---

# Structural relaxation

The crystal structure we have used is close to the equilibrium lattice constant, but not exactly. The code allows to automatically **relax** atomic coordinates and lattice constants to obtain an energetic minimum. The total energy is quite sensitive to the geometry, and the equilibrium constant in DFT is generally not the same as seen experimentally (although they should be close).

# Changing the calculation type

We need to change the input file to tell the code that we want to do a structural relaxation (`vc-relax`) instead of a simple self-consistency cylce (`scf`).

- Make a copy of the input file
```bash
cp cu.scf.in cu.relax.in
```

- Make sure you have `cu.relax.in` open in the text editor.

- Locate the
```
calculation = 'scf'
```
line in the `&CONTROL` namelist and change it to
```
calculation = 'vc-relax'
```

This will instruct the code to relax the atomic positions and the unit cell (the `vc` part stands for 'variable cell'). But we need to tell it *how* to change them. Two additional `NAMELIST`s provide variables to steer the atomic position and the cell manipulations.

- Add the following **below** the `&electrons` namelist:
```
&ions
  ion_dynamics = 'bfgs'
/
&cell
  cell_dynamics = 'bfgs'  
/
```

- Save the file as `cu.relax.in`

We told the code to use a `Quasi-Newton algorithm` to find the next local minimum (this is what `bfgs` stands for). We could also have instructed Quantum Espresso to do a molecular dynamics run and other things.
