"""
Wolf Goat Cabbage, Web Service 

Greg O'Keefe, September 2020
"""

from core.game import WolfGoatCabbageGame
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


class GameManager(object):
    def __init__(self):
        self.game_id = -1
        self.games = {}

    def new(self, game_parms=None):
        self.game_id += 1
        self.games[self.game_id] = WolfGoatCabbageGame(game_parms)
        return self.game_id

    def list_games(self):
        return({id: self.games[id].game_state() for id in self.games.keys()})

    def cull_games(self):
        ids = list(self.games.keys())
        for id in ids:
            if self.games[id].status() != 'continue':
                del self.games[id]

    def move(self, game_id, verb, obj=None):
        assert game_id in self.games
        game = self.games[game_id]
        if verb == 'load':
            if obj not in game.entities:
                raise ValueError(
                    f'Entity {obj} does not exist in game {game_id}.')
            result = game.load(obj)
        elif verb == 'unload':
            result = game.unload()
        elif verb == 'cross':
            result = game.cross()
        elif verb == 'observe':
            result = game.game_state()
        else:
            raise ValueError(f'Bogus move {verb}({obj}) in game {game_id}.')
        return result


games = GameManager()


@app.route('/new_game', methods=['GET'])
def new_game():
    game_id = games.new()
    return jsonify(new_game_id=game_id)


@app.route('/game', methods=['POST'])
def game_control():
    req = request.json
    command = req['command']
    if command == 'new':
        game_id = games.new(req)
        return jsonify(new_game_id=game_id)
    elif command == 'list':
        return jsonify(games.list_games())
    elif command == 'cull':
        games.cull_games()
        return jsonify(games.list_games())


@app.route('/game/<int:game_id>', methods=['POST'])
def move(game_id):
    if game_id not in games.games:
        return jsonify(nfg=True, msg=f'game {game_id} not active'), 404
    move = request.json
    obj = move['object'] if 'object' in move else None
    result = games.move(game_id, move['verb'], obj=obj)
    return jsonify(result)

# this is just for debugging
@app.route('/echo', methods=['POST'])
def echo_post():
    content = request.json
    print(content)
    happy_msg = {'all-good': 'yep'}
    print(happy_msg)
    return jsonify(happy_msg)


if __name__ == '__main__':
    app.run()
