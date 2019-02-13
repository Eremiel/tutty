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
- `ATOMIC_POSITIONS` holds the positions of all atoms in the unit cell as fractions of the lattice vectors. 
- `K_POINTS` defines the number of points and weights used for the first [Brillouin zone](https://en.wikipedia.org/wiki/Brillouin_zone). Parts of the calculations are performed in reciprocal space, and the `K_POINTS` card defines the accuracy (and cost) of these.

## Control namelist

The first line in the `CONTROL` namelist defines the type of calculation. Every DFT code can perform various kinds of calculations. This usually includes as a minimum:

- Solving the Kohn-Sham equations self-consistently (i.e., iteratively)
- *Ab-Initio* molecular dynamics
- Relaxation of atomic coordinates and geometric optimisation to minimise forces

Here we request a `scf` calculation, which stands for **S**elf **C**onsistent **F**ield calculation. This means: find the electronic density for a set of atoms with fixed positions. Other options include `relax`, `md`, and `bands` for band structure calculations.

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

Quantum espresso is a *plane-wave* code, which means that the wave function is expanded in plane-waves (i.e., complex-valued sin and cos). A plane-wave

$$ \psi({\bf r}) = \exp\left(i {\bf k}\cdot{\bf r}\right) $$

characterised by quantum number ${\bf k}$ has a kinetic energy of

$$ \langle \psi | \nabla^2 |\psi\rangle = \frac{1}{2}{\bf k}^2 $$

The basis set is truncated by dropping plane-waves with an energy larger than the cut-off energy of 25 Ry (`ecutwf = 25.0`).

> Rydberg is the unit for energy in atomic units. A Ry equals 13.6 eV.

Computation of the charge density is also supported by a plane-wave basis with substantially higher energy cutoff (`ecutrho = 300`). 

In general, energy cut-offs need to be tested for convergence, but there are [guidelines](https://www.quantum-espresso.org/Doc/INPUT_PW.html#idm45922794555488) for sensible starting points.


### Smearing

Standard DFT formally operates at zero Kelvin. This means that there is a sharp front between occupied and unoccupied electronic states. This can lead to significant variation of the charge density during the self-consistency loop and numerical instability, especially for metallic systems. A common scheme is to **smear** out the occupation of electrons across the Fermi level (i.e., most energetic occupied state) to achieve a smoother response of the charge density. This is similar to increasing the temperature (for the electrons only). Because smearing is only a numerical tool to achieve better convergence, the results need to be extrapolated back to zero temperature, which usually can be done with sufficient accuracy for practical applications.

The input file request a Gaussian smearing (`smearing='gaussian'`) and the `degauss=0.02` parameter sets the width of the Gaussian smearing operator.

## Electrons namelist

The `ELECTRONS` namelist controls the iterative solution of the Kohn-Sham equations. Density-Functional-Theory is a mean-field theory were electrons do not directly interact with each other. Instead, the interaction is mitigated through the collective charge density. Although this reduces the complexity of the many-body problem, it leads to non-linear eigenvalue problems that require iterative solution:

$$ \hat {\rm H}(\rho(\psi))\cdot\psi = \epsilon \psi $$

where $ \hat {\rm H} $ is the DFT Hamiltonian (or energy) operator, which depends on the charge density $\rho$, which in turn is a functional of the wavefunction $\rho({\bf r}) = \langle\psi|{\bf r}|\psi\rangle$. 

There are usually a number of numerical algorithms available to diagonalise (i.e., solve) the DFT eigenvalue problem. The input file specifies the Davidson scheme (`optimisation='david'`) for this purpose. Metals are particularly prone to *charge sloshing* where the charge density oscillates between iterations, because of the many bands crossing the Fermi level. The `mixing_beta=0.7` parameter mixes 70% of the old charge density with 30% of the new charge density in each iteration. This "damping" slows convergence down but increases numerical stability, which is a very common characteristic of iterative solvers in general.  

### Cards

#### Effective core potentials

The `ATOMIC_SPECIES` card specifies potentials for all elements. Most DFT codes do not explicitly consider the core electrons, because they do not participate in chemical interactions. Instead, they define atomic potentials that combine the effect of the positive nucleus and the core electrons on the valence electrons. Such an approach has two advantages:

- It requires less electrons to be considered explicitly reducing the size of the Hamiltonian and speeding up calculations
- It allows to use a much lower energy cut-off in plane-wave codes because the spatially narrow and highly featured core region around a nucleus is not treated explicitly. This is shown in the figure below where the screened effective core potential approaches a finite value at the core, which leads to a smoother wavefunction in that region. Core potentials are constructed to guarantee that they reproduce the exact wave-function outside the core region $r_c$.

{{% figure src="/img/pseudopotentials.png" caption="Pseudopotentials with smooth core region" %}}

Constructing effective potentials is a bit of a black art and you should not generally come into a situation where you need to construct one yourself. 

> DFT codes provide libraries of potentials that are specific to the code. The potentials for Quantum Espresso can be downloaded from their [library](https://www.quantum-espresso.org/pseudopotentials). 

You will often find more than one potential available for each element. It is very important to be consistent in the choice of potentials. **Effective core potentials need to be mutually compatible and remain unchanged across a set of calculations (e.g., needed to compute a formation energy).**

#### Atomic coordinates

The `ATOMIC_POSITIONS` card defines the atomic coordinates. Note that we have only one `Cu` atom specified at the origin although the FCC unit cell contains four atoms. We have already told the code that we have an FCC lattice (`ibrav=2` under `@SYSTEM`), and all atoms in an FCC unit cell are related by symmetry. So you only need to specify the unique atoms per unit cell. If symmetry is considered depends on the code. Vasp, for instance, requires to explicitly list all atoms in the unit cell. 

<figure>
{{< fcc-x3d >}} 
<figcaption>Face-centered-cubic (FCC) crystal structure of Copper; (blue) crystallographically unique sites, (green) symmetry equivalent sites.</figcaption>
</figure>

#### Reciprocal space

Periodicity in crystalline materials means that wave functions have to obey the form

$$ 
\psi\_{{\rm n},{\bf k}}({\bf r}) = \exp(i{\bf k}\cdot{\bf r})\cdot u\_{\rm n}({\bf r}) 
$$

with $ u_{\rm n}({\bf r}) $ being a function with the same periodicity as the lattice. 

{{% figure src="/img/band_formation.png" caption="Illustration of the formation of continuous bands from atomic orbitals" %}}

The atomic quantum numbers $|n,l,m\rangle$ enumerating atomic orbitals in molecules transpose into a set of band indices $\rm n$ and a continuum of reciprocal space ${\bf k}$ vectors called crystal momentum. While the band indices are discrete numbers, crystal momentum is not. Every quantity that sums over states, therefore, has to integrate over $\bf k$-space in the first [Billouin zone](https://en.wikipedia.org/wiki/Brillouin_zone). This is usually done numerically on a grid in reciprocal space and the `KPOINTS` card defines this grid. In this case, we ask for a regular grid that has dimensions 8x8x8 centered at the origin.

> Checking k-mesh convergence is always one of the first convergence tests that needs to be done in a new project. Insulators and semi-conductors usually require a less dense grid than metals.
