Ofir Assulin 312299647
Roi Gazit 308575133

This is a final project for ai course. the assignment was written in js instead of c++, as you approved it.
The maze generator and the design of the maze were taken from gitHub and the project is based of that. it is also approved(like taking your code of rooms generator).
How the game works: very simple. there are 8 players. 4 in each team. there is a blue team and a green team.
every player has an enemy from the other team which he, and only he, will fight in the game.
every player has a health and an ammo meters. health 0-100 and ammo 0 - infinity. function to look: level.js file "setPlayersInfo".
every player starting health and ammo are: 100 health and 10 ammo.

the maze is restarted with ammo(brown) and health(white) tiles placed randomly in the rooms. function: in dungeon.js file "addAmmoOrMedic".
white tile gives 2 health points to the player and brown gives 5 ammo bullets.

the dungeon is also restarted with objects placed randomly for hiding. the initiate rooms are chosen by the ones which has objects to hide in(as requested). functions to look: 
level.js "setFightRoom" and dungen.js "addAmmoOrMedic".

every couple of players(1 from green and 1 from blue) will have a random room to fight in. function to look: level.js file "setFightRoom".
both of them will go to that room in the beginning of the game and start fighting. function to look: level.js file "updatePlayerPathToTarget".
this function uses an astar algorithm to get to a given point in the dungeon. function to look: level.js "astar2".

each player has a different behavior depends on the type of the player: function to look at level.js "performMission".
the types are selected randomly. function to look: level.js "setTypes".

"FIGHT": will try to shoot the enemy no matter what. it will try to fill the ammo after having less than 2 bulltes.
"HEALTHKEEPER": fill health if health under 70. otherwise shoot.
"AMMOKEEPER": fill AMMO if AMMO under 8. otherwise shoot.
"SURVIVE": run away if health < 70. doesn't go any where special. goes to a random place on the board.

after a player is dead(0 health) it will vanish from the map and the enemy will find another player to fight. after all players from team are dead the game is over.
functions to look: level.js "updateEnemy"

shooting: shooting is possible only if the players are close to each other(less than 70 and in the same room). the shot damage depends on the distance. function to look: level.js "shoot". highest damage possible is 6. when a player shoots, its color changes to red.

**known bugs**
sometimes the dungeom wont load - just refresh.
sometimes the dungeon will refresh few seconds after loading. it's ok, the game will begin.