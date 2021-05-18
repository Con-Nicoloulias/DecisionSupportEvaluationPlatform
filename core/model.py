"""
Wolf Goat Cabbage

Greg O'Keefe, Febrary 2020
"""

class Game:
    """Maintains entities and locations. An entity can be at a location, 
    or loaded on another entity. Entities can move from one location to another."""

    def __init__(self, location_names):
        "entities is a dictionary indexed by name"
        self.entities = {}
        self.locations = { n:set() for n in location_names }
        
    def reset(self):
        self.entities = {}
        self.locations = { n:set() for n in self.locations.keys() }
        
    def entity_exists(self, entity_name):
        return entity_name in self.entities.keys()
    
    def location_exists(self, location_name):
        return location_name in self.locations.keys()
    
    def is_at(self, entity_name, location_name):
        return self.get_entity(entity_name).location == location_name
        
    def add_entity(self, entity, location_name):
        assert not self.entity_exists(entity.name)
        assert self.location_exists(location_name)
        entity.game = self
        entity.location = location_name
        self.entities[entity.name] = entity
        self.locations[location_name].add(entity)
        
    def get_entity(self, entity_name):
        return self.entities[entity_name]
        
    def remove_entity(self, entity_name):
        entity = self.get_entity(entity_name)
        del self.entities[entity.name]
        self.locations[entity.location].remove(entity)
        
    def _place_entity(self, entity_name, new_location_name):
        # used when unloading one entity from another
        assert self.location_exists(new_location_name)
        entity = self.get_entity(entity_name)
        self.locations[new_location_name].add(entity)
        entity.location = new_location_name
        
    def _unplace_entity(self, entity_name):
        # used when loading one entity onto another
        entity = self.get_entity(entity_name)
        self.locations[entity.location].remove(entity)
        entity.location = None
        
    def move_entity(self, entity_name, new_location_name):
        assert self.entity_exists(entity_name)
        assert self.location_exists(new_location_name)
        self._unplace_entity(entity_name)
        self._place_entity(entity_name, new_location_name)
        
    def xs(self, xs_class):
        "Return all Entities of the class."
        return [ob for ob in self.entities.values() if isinstance(ob, xs_class)]
    
    def xs_at(self, xs_class, location_name):
        "Return all Entities of the class at the location."
        return [ob for ob in self.locations[location_name] if isinstance(ob, xs_class)]

    def state_observation(self):
        loaded = { lme.loaded_entity.name:lme.name
                   for lme in self.entities.values()
                   if isinstance(lme, LoadMovingEntity) and lme.loaded_entity }
        unloaded = { e.name:loc for loc in self.locations.keys() for e in self.locations[loc] }
        return {**loaded, **unloaded}
    
    def print_state(self):
        for n,c in self.locations.items():
            print(f'{n:10} {[e.name for e in c]}')
        for e in self.entities.values(): 
            if isinstance(e, LoadMovingEntity):
                l = e.get_load()
                if l:
                    print(f'{e.name:10} {l.name}')
                    
    def integrity(self):
        # check that the entities are where they think they are
        locs_ok = all([e.location == location_name 
                    for location_name, location in self.locations.items()
                    for e in location])
        # placeholder for further integrity checks
        nothing_else = True
        return locs_ok and nothing_else

    
class Entity:
    """A named thing that exists at a location in a game."""

    def __init__(self, name='unnamed'):
        self.name = name
        self.game = None
        self.location = None
        
    def move(self, destination):
        self.game.move_entity(self.name, destination)
        
    def do_turn(self):
        "Subclasses can override to do stuff at the end of each turn."
        pass


class LoadMovingEntity(Entity):
    """An entity that can load, carry, and unload another entity."""
    
    def __init__(self, name='truck'):
        super().__init__(name=name)
        self.loaded_entity = None
        
    def load(self, load_name):
        assert self.game.get_entity(load_name).location == self.location
        assert self.loaded_entity == None
        self.loaded_entity = self.game.get_entity(load_name)
        self.game._unplace_entity(load_name)
        
    def unload(self):
        self.game._place_entity(self.loaded_entity.name, self.location)
        self.loaded_entity = None
        
    def get_load(self):
        return self.loaded_entity


class Boat(LoadMovingEntity):
    def __init__(self, name='boat'):
        super().__init__(name=name)

        
class Wolf(Entity):
    def __init__(self, name='wolf'):
        super().__init__(name=name)
        
    def do_turn(self):
        "Eat a goat if one is present and boat is not."
        if not self.location:
            return True
        goats_here = self.game.xs_at(Goat, self.location)
        boats_here = self.game.xs_at(Boat, self.location)
        if goats_here and not boats_here:
            self.game.remove_entity(goats_here[0].name)


class Goat(Entity):
    def __init__(self, name='goat'):
        super().__init__(name=name)
        
    def do_turn(self):
        "Eat a cabbage if one is present and boat is not."
        if not self.location:
            return True
        cabbages_here = self.game.xs_at(Cabbage, self.location)
        boats_here = self.game.xs_at(Boat, self.location)
        if cabbages_here and not boats_here:
            self.game.remove_entity(cabbages_here[0].name)


class Cabbage(Entity):
    def __init__(self, name='cabbage'):
        super().__init__(name=name)
