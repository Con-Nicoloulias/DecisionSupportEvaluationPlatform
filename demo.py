"""
Wolf Goat Cabbage

Greg O'Keefe, February 2020
"""

from core.engine import WolfGoatCabbageGameEngine
from core.player import PlannedPlayer
import sys

verbose_engine = True
verbose_player = True

if len(sys.argv) > 1:
    file_path = sys.argv[1]
else:
    file_path = 'GoodPlan.txt'

print("loading "+file_path)
engine = WolfGoatCabbageGameEngine()
player = PlannedPlayer(file_path, verbose=verbose_player)
engine.set_player(player)
engine.set_up()
engine.run(verbose=verbose_engine)

