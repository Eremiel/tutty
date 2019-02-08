---
title: "Structural relaxation"
date: 2018-05-14T14:29:26+01:00
position: 11
---

# Run a relaxation run

Start the calculation with

```bash
pw.x < cu.relax.in | tee cu.relax.out
```

This will take quite a bit longer than the simple scf calculation we have done before. The code does the following:

- Start with the provided geometry
- Calculate the total energy in a scf calculation
- Calculate forces and stresses
- Obtain a new geometry (atomic positions and cell parameters) based on the forces/stresses
- Do another scf calculation

This is repeated until a specified convergence criterium is fulfilled.

# Look at the output

Let's examine the evolution of the **total energy** during the relaxation calculation:

```bash
grep ! cu.relax.out
```

You should see how the energy generally reduces with increasing number of cycles. However, in the last line the energy actually increases again. This is a sign that the algorithm could not find another configuration with even lower energy. It therefore stopped.

The results are

| calculation | energy [eV]   | volume [Bohr^3] |
| ----------- | ------------- | --------------- |
| initial     | -213.04983910 | 76.2053         |
| relaxed     | -213.06077174 | 69.5493         |

### Energy

This might not seem such a large change in energy. But 0.01 Ry are almost 130meV, which is significant. The formation energy of many alloys is of this order of magnitude. The total energy by itself is almost never relevant. Usually, one is interested in energy differences. Hence, one tends to compare fairly large numbers with small changes.

### Volume

You can find the volume using grep as well

```bash
grep volume cu.relax.out
```

The cell has somewhat contracted, which suggests that our initial lattice constant was slightly too large. Take note that the volume is given in *Bohr*. 

> 1 Bohr = 0.529 A

For convininience, the volume in Angstrom is printed in parenthesis as well. You can compare this with the experimental unit-cell volume for FCC copper, which is 47.24 A^3. The volume seems to be out by a substantial factor!  

{{% figure src="/img/fcc_unit_cells.png" caption="Illustration of the primitive (red) and crystalographic unit cell of fcc crystals" %}}


What is going on here? Quantum Espresso internally uses the *primitive* unit cell, which is rhombohedral with one irreducible atom. The crystalographic unit cell is cubic and has four atoms. It is very important to be aware of the size of the internal unit cell and appropriately normalise when reporting results!
