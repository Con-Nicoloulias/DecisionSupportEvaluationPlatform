import requests

print('Starting game')
new_game_request = requests.post('http://localhost:5000/game',
                                 json={"command": "new", "max_moves": 17})

print(new_game_request.text)
game_id = new_game_request.json()['new_game_id']
print(f'Game {game_id} started.')

def load(cargo):
    return {'verb': 'load', 'object': cargo}

unload = {'verb': 'unload'}
cross = {'verb': 'cross'}

def do(move, verbose=True):
    if verbose:
        print(move)
    r = requests.post(f'http://localhost:5000/game/{game_id}', json=move)
    if verbose:
        print(r.text)

do({'verb': 'observe'})
        
do(load('goat'))
do(cross)
do(unload)
do(cross)
do(load('wolf'))
do(cross)
do(unload)
do(load('goat'))
do(cross)

do({'verb': 'observe'})
list_game_request = requests.post('http://localhost:5000/game',
                                  json={"command": "list"})
print(list_game_request.text)


do(unload)
do(load('cabbage'))
do(cross)
do(unload)
do(cross)
do(load('goat'))
do(cross)
do(unload)

do({'verb': 'observe'})
