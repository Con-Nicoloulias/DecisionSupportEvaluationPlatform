# Wolf Goat Cabbage

This is an ultra-simple toy problem to begin trying out some decision support ideas such as Plan Monitoring, logging action and decisions with PROV, and Narrative Generation. It has a similar structure to the Joadia game (Williams, Wong, Kamenetsky), and thus should be a stepping stone toward exercising concepts in that more sophisticated toy problem.

Run `demo.py` to see a game played. The Jupyter notebook `test.ipynb` is a good place to start seeing some of the parts do their thing. The underlying code is quite general, and can be used to model any situation with discrete time and locations and entities which can move, carry one another and conditionally do stuff at the end of each turn.

## Scenario
The scenario is a well known puzzle and goes as follows. A farmer is on one side of a river with his wolf, goat and cabbage. He has a boat and needs to move the three items to the other side of the river. He can only fit one item at a time in the boat, and neither the goat and cabbage nor the wolf and goat can be left alone together, because in each case one will eat the other.

Reference https://en.wikipedia.org/wiki/Wolf,_goat_and_cabbage_problem.

## To Do
  - human interface (simple terminal text based)
  - logging mechanism for PROV and other formats (find the right way to do this)
  - plan reading player
  - unity animated 3d interface (!)
  - non-deterministic actions (small probability of failure or wrong result)
  - random appearance of new entities

_Greg O'Keefe, February, June 2020, with important contributions from Steve Wark and Wolfgang Mayer_
`greg.okeefe@dst.defence.gov.au`