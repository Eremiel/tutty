---
title: "What now?"
date: 2018-05-14T14:29:26+01:00
position: 90
---

We have covered all that is needed to calculate the equilibrium potential for the reaction

$${\rm Cu_3N} + 3{\rm Na^+} + 3e^- \leftrightarrow {\rm Na_3N} + 3{\rm Cu}$$

We already have energies for CuN and Cu, and can easily follow the same procedure
for sodium and its nitride.

# Your tasks

- Prepare calculations to compute the total energy of Na and Na<sub>3</sub>N
- Calculate the equilibrium potential

# What else do you need?

## Crystalography

### Na3N

Sodium Nitride has the same crystal structure as Cu3N.

- Experimental lattice constant: 3.814 A

### Na

Sodium crystallises in a BCC structure with an experimental lattice constant of 4.282 A.

> Hint: The ibrav = 3 parameter sets up a BCC crystal.

## Ab-Initio Thermodynamics

The equilibrium voltage $U$ is given by

$$
\Delta G_f({\rm Cu}_3{\rm N}) + 3\Delta G_f({\rm Na}^+) - 3\cdot U =  \Delta G_f({\rm Na}_3{\rm N}) + 3\Delta G_f({\rm Cu})
$$

A very common approximation in First Principles thermodynamics is to ignore entropic contribution to Gibb's Free Energy. This is often justified when solid-solid equilibria are investigated, because the vibrational entropies of the various compounds tend to cancel. This allows to approximate Gibb's Free Energy by the internal energy:

$$
3\cdot U = \left[ E({\rm Na}_3{\rm N}) + 3E({\rm Cu})\right] - \left[ E({\rm Cu}_3{\rm N}) + 3\Delta G_f({\rm Na}^+)\right]
$$

In solid-liquid equilibria, this is less justified. We can, nonetheless, find an expression for the formation energy of $\rm Na^+$ by using some experimental information. We can regard a metallic Na electrode as reference

$$
{\rm Na} | {\rm Na}^+ : E({\rm Na}) = \Delta G\_{f}({\rm Na}^+) - U\_{\rm ref}
$$

This gives

$$
3(U-U_{\rm ref}) = \left[ E({\rm Na}_3{\rm N}) + 3E({\rm Cu})\right] - \left[ E({\rm Cu}_3{\rm N}) + 3E({\rm Na})\right]
$$

as expression for the equilibrium voltage.
