---
title: "Scientific problem"
date: 2018-05-06T11:09:16+01:00
type: "introductions"
position: 2
---

The scientific problem we are going to investigate is the stability of copper nitride in aqueous environments. This [paper](/Cu3N_paper.pdf) by Li, Hector, and Owen investigates the electrochemistry of $ {\rm Cu}_3{\rm N} $ in EC/DC electrolyte. The researchers cycled the material in a voltage range of 0-3 V vs. Na and found reversible capacity of the order of 100 mAh/g.

{{% figure src="/img/Cu3N_cycling_results.png" caption="Cycling behaviour of copper nitride in EC/DC electrolyte." %}}

They provide experimental evidence for Cu formation upon reduction with initial capacities close to the theoretical expectation for full reduction of $ {\rm Cu}_3{\rm N} $ to $ {\rm Na}_3{\rm N} $ and $ {\rm Cu} $ (approx. 400 mAh/g), but limited reversiblity back to copper nitride.

The question we ask is what is the thermodynamic equilibrium potential for full reduction of $ {\rm Cu}_3{\rm N} $ to $ {\rm Cu} $. Specifically, we are interested in the thermodynamics of the reaction

$$
{\rm Cu}_3{\rm N} + 3 {\rm Na}^+ + 3 e^- \rightleftharpoons {\rm Na}_3{\rm N} + 3{\rm Cu}
$$

To achieve this, we will have to:

1. Compute the formation energy of the involved compounds, and
2. Relate this to the thermochemistry of dissolved species to account for $ {\rm Na}^+ $

To complete the first part, we will employ Density-Functional-Theory. For the second part, we will draw on classical thermodynamics to relate our computed results to electrochemical environments. This is a very common *trick*, because it is very costly to investigate dissolved phases where the solvent degrees of freedom contribute substantially to Gibb's free energy.
