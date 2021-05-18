"""
Wolf Goat Cabbage

Greg O'Keefe, February 2020
Greg O'Keefe, September 2020, player drives game, 'engine' eliminated.
"""

from core.model import Game, Boat, Wolf, Goat, Cabbage

MAX_MOVES = 25

class WolfGoatCabbageGame(Game):
    def __init__(self, game_parms=None):
        if game_parms and 'max_moves' in game_parms:
            self.max_moves = game_parms['max_moves']
        else:
            self.max_moves = MAX_MOVES
        super().__init__(location_names=['near_side', 'far_side'])
        self.add_entity(Wolf('wolf'), 'near_side')
        self.add_entity(Goat('goat'), 'near_side')
        self.add_entity(Cabbage('cabbage'), 'near_side')
        self.boat = Boat('boat')
        self.add_entity(self.boat, 'near_side')
        self.move_number = 0

    def moves_remaining(self):
        return self.max_moves - self.move_number

    def load(self, cargo):
        self.move_number += 1
        self.boat.load(cargo)
        self.update()
        return self.game_state()

    def unload(self):
        self.move_number += 1
        self.boat.unload()
        self.update()
        return self.game_state()
    
    def cross(self):
        self.move_number += 1
        destination = 'far_side' if self.boat.location == 'near_side' else 'near_side'
        self.boat.move(destination)
        self.update()
        return self.game_state()
        
    def update(self):
        # since things can get eaten, we can't just iterate through the entities
        entity_names = list(self.entities.keys())
        for en in entity_names:
            if en in self.entities:
                self.get_entity(en).do_turn()
        return self.status()
                
    def status(self):
        if self.lose():
            return 'lose'
        elif self.win():
             return 'win'
        elif self.move_number >= self.max_moves:
            return 'timesup'
        else:
            return 'continue'

    def lose(self):
        return not self.xs(Goat) or not self.xs(Cabbage)
                
    def win(self):
        return self.xs_at(Wolf, 'far_side') \
            and self.xs_at(Goat, 'far_side') \
            and self.xs_at(Cabbage, 'far_side')

    def game_state(self):
        return { 'status':  self.status(),
                 'moves_remaining': self.moves_remaining(),
                 'state': self.state_observation() }
