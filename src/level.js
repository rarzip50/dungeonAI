import Dungeon from "./dungeon";
import keys from "./keys";
import tiles from "./tiles";

const { floor, abs } = Math;

const tileSize = 16;

export default class Level {
  constructor() {
    // create a dungeon
    this.dungeon = new Dungeon(100, 100);
    this.dungeon.generate();
    this.counter = 1;

    // the current collision map for the dungeon
    this.collisionMap = this.dungeon.getCollisionMap();

    // the tiles in the map
    this.tiles = this.dungeon.getFlattenedTiles();

    // basic player object
    
    this.player = {
      pos: { x: 0, y: 0 },
      size: { x: 12, y: 12 },
      speed: 175,
      color: "#0CED13",
      onStairs: true,
      health: 100,
      ammo: 20,
      id: 1
    };

    this.players = [
      {
        pos: { x: 0, y: 0 },
        size: { x: 12, y: 12 },
        speed: 175,
        color: "#0CED13",
        onStairs: true,
        health: 100,
        ammo: 20,
        id: 1,
        team: "A",
        target:{x: "", y: ""},
        pathToTarget: null
      },
      {
        pos: { x: 0, y: 0 },
        size: { x: 12, y: 12 },
        speed: 175,
        color: "#0CED13",
        onStairs: true,
        health: 100,
        ammo: 20,
        id: 2,
        team: "A",
        target:{x: "", y: ""},
        pathToTarget: null
      },
      {
        pos: { x: 0, y: 0 },
        size: { x: 12, y: 12 },
        speed: 175,
        color: "#1488C5",
        onStairs: true,
        health: 100,
        ammo: 20,
        id: 1,
        team: "B",
        target:{x: "", y: ""},
        pathToTarget: null
      },
      {
        pos: { x: 0, y: 0 },
        size: { x: 12, y: 12 },
        speed: 175,
        color: "#1488C5",
        onStairs: true,
        health: 100,
        ammo: 20,
        id: 2,
        team: "B",
        target:{x: "", y: ""},
        pathToTarget: null
      }
    ];

    this.playersB = [
      {
        pos: { x: 0, y: 0 },
        size: { x: 12, y: 12 },
        speed: 175,
        color: "#1488C5",
        onStairs: true,
        health: 100,
        ammo: 20,
        id: 1,
        team: "B",
        target:{x: "", y: ""},
        pathToTarget: null
      },
      {
        pos: { x: 0, y: 0 },
        size: { x: 44, y: 12 },
        speed: 175,
        color: "#1488C5",
        onStairs: true,
        health: 100,
        ammo: 20,
        id: 2,
        team: "B",
        target:{x: "", y: ""},
        pathToTarget: null
      }
    ];

    //place each team in different room at start
    this.setPlayersPosition();
    //set a fight room for each couple of players from different teams
    this.setFightRoom();
    //calculate the path to the fight room
    for(let i=0; i<this.players.length; i++){
      this.updatePlayerPathToTarget(this.players[i], this.players[i].target)
    }
    //this.updatePlayerPathToTarget(this.players[2], this.players[2].target)
   
  }

  setFightRoom(){
    let taken = [];
    let teamA = this.players.filter(element => element.team === 'A');
    let teamB = this.players.filter(element => element.team === 'B');
    let roomNum;
    for(let i=0; i<teamA.length; i++){
      do{
        roomNum = Math.floor(Math.random() * this.dungeon.maxNumRooms);
      }while(taken.includes(roomNum));
      teamA[i].target = this.dungeon.getRoomPos(this.dungeon.rooms[roomNum], teamA[i]);
      teamB[i].target = this.dungeon.getRoomPos(this.dungeon.rooms[roomNum], teamB[i]);
      taken.push(roomNum);
      
    }
  }

  updatePlayerPathToTarget(player, targetPos){
    player.pathToTarget = this.aStar2(player.pos, targetPos);
  }

  setPlayersPosition(){
    for(let i=0; i<this.players.length; i++){
      let stairs = this.dungeon.getStairs(this.players[i].team);
      console.log(stairs)
      //console.log(stairs)
      this.players[i].pos.x =
        stairs.up.x * tileSize + tileSize / 2 - this.players[i].size.x / 2;
      this.players[i].pos.y =
        stairs.up.y * tileSize + tileSize / 2 - this.players[i].size.y / 2;
    }
  }

  width() {
    return this.dungeon.size.x * tileSize;
  }

  height() {
    return this.dungeon.size.y * tileSize;
  }

  //update player health
  updateHealth(healthVal){
    let playerHealth = parseInt((document.getElementById("player1Health").textContent));
    player1Health.textContent = playerHealth + healthVal;
  }

  update() {
    //get the next move from global path to target of relevnt player
    //this.players[0].pos = this.moveEntity(this.players[0].pos, this.players[0].size, move);
    
    if(this.counter % 2 === 0 || this.counter === 1){
      for(let i=0; i<this.players.length; i++){
        if(this.players[i].pathToTarget !== null && this.players[i].pathToTarget.length !== 0)
          this.players[i].pos = this.players[i].pathToTarget.shift();
      }
    }
    this.counter ++;
    //console.log(this.players[0].pos)
    // compute the player's center
    let cx = floor((this.players[0].pos.x + this.players[0].size.x / 2) / tileSize);
    let cy = floor((this.players[0].pos.y + this.players[0].size.y / 2) / tileSize);

    // the return value for the destination. -1 means go up a floor, 1 means go down a floor
    let dest = 0;

    // tracks if the player is on stairs this frame
    let onStairs = false;

    // grab the new current list of rooms
    let rooms = this.dungeon.roomGrid[cy][cx];
    for (let i = 0; i < rooms.length; i++) {
      let r = rooms[i];

      // get the player's center in room coordinates
      let lx = cx - r.pos.x;
      let ly = cy - r.pos.y;

      // if we're on the up stairs, return -1 to indicate we want to move up
      if (r.tiles[ly][lx] === tiles.ammo) {
        onStairs = true;

        if (!this.player.onStairs) {
          dest = -1;
          break;
        }
      }

      // if we're on the down stairs, return 1 to indicate we want to move down
      if (r.tiles[ly][lx] === tiles.medic) {
        onStairs = true;

        if (!this.players[0].onStairs) {
          dest = 1;
          break;
        }
      }
    }

    // update the player's "onStairs" property
    this.players[0].onStairs = onStairs;

    // return our destination
    return dest;
  }

  isInSet(jsonObject, jsonSet){
    if(jsonSet.find((element)=>element.x === jsonObject.x && element.y === jsonObject.y) !== undefined)
      return true;
    return false;
  }
  //updates the path of the requested player
  aStar2(playerPos, targetPos){
    let closedSet = [];
    let startNodeH = Math.sqrt(Math.pow((playerPos.x - targetPos.x),2) + Math.pow((playerPos.y - targetPos.y),2));
    let startNode = {
      gScore:0,
      fScore:startNodeH,
      x: playerPos.x,
      y: playerPos.y,
      cameFrom: "START"
    }
    let openSet = [];//prioritized
    openSet.push(startNode);
    let current;
    //console.log("before"+Date.now())
    while(openSet.length !== 0){
      current = openSet.shift();//current has lowest fScore and removes from openSet
      //got to target - packMan
      //console.log(current.x +" "+current.y)
      if(current.x === targetPos.x && current.y === targetPos.y){
        //console.log("after"+Date.now())
        return this.reconstructPath(current);
      
      }
      var speed = this.players[0].speed * 0.002;
      closedSet.push(current);
      let neighbor;
      //going thorugh all neigbohrs
      for(let i=1; i<=4; i++){//check all my neighbors
        
        //if(canMoveGhost(ghost, i, current.x, current.y) === false)
         // continue;
        if(i===1)//check right
          neighbor = {
            "x": current.x+4,
            "y": current.y,
            "direction": 1,
            gScore:Infinity,
            fScore:Infinity,
            cameFrom:null,
            move:{
              x: speed,
              y:0
            }
          }
        else if(i===2)//up
          neighbor = {
            "x": current.x,
            "y": current.y+4,
            "direction": 2,
            gScore:Infinity,
            fScore:Infinity,
            cameFrom:null,
            move:{
              x: 0,
              y: speed
            }
          }
  
        else if(i===3)//left
          neighbor = {
            "x": current.x-4,
            "y": current.y,
            "direction": 3,
            gScore:Infinity,
            fScore:Infinity,
            cameFrom:null,
            move:{
              x: -speed,
              y:0
            }
          }
  
        else if(i===4)//down
          neighbor = {
            "x": current.x,
            "y": current.y-4,
            "direction": 4,
            gScore:Infinity,
            fScore:Infinity,
            cameFrom:null,
            move:{
              x: 0,
              y:-speed
            }
          }

        if(this.moveEntity(current, this.players[0].size, {x: neighbor.move.x, y: neighbor.move.y}) === false)
          continue;
        

        let tentGScore = current.gScore + 2;
        if(this.isInSet(neighbor, closedSet) === true || tentGScore >= neighbor.gScore)
          continue;
        if(this.isInSet(neighbor, openSet) === false || tentGScore < neighbor.gScore){
          neighbor.cameFrom = current;
          neighbor.gScore = tentGScore;
          neighbor.fScore = neighbor.gScore + Math.sqrt(Math.pow((neighbor.x - targetPos.x),2) + Math.pow((neighbor.y - targetPos.y),2));
          if(this.isInSet(neighbor, openSet) === false)
            openSet.push(neighbor)
          else{//new gScore < old and neighbor already in openSet. so just update
            let index = openSet.findIndex((element)=>element.x === neighbor.x && element.y === neighbor.y);
            openSet[index] = neighbor;
          }
          openSet = openSet.sort(this.compareNums);
          
        }
      
      }
  
    }
  }

  reconstructPath(currentNode){
    //console.log("before"+Date.now())
    let pathToPacMan = [];
    //pathToPacMan.push(currentNode.cameFrom);
    
    let parent = currentNode.cameFrom;
    while(parent.cameFrom !== "START"){
      pathToPacMan.push({"direction": parent.direction, x: parent.x, y: parent.y});
      parent = parent.cameFrom;
    }
    
    pathToPacMan = pathToPacMan.reverse();
    //console.log("after "+Date.now())
  
    return pathToPacMan;
  }

  

  compareNums(a, b){
    if(a.fScore > b.fScore)
      return 1;
    else if(a.fScore < b.fScore)
      return -1;
    else
      return 0;
  }

  // x0/y0 === the player
  // x1/y1 === the tile
  isTileVisible(visibility, x0, y0, x1, y1) {
    // all tiles are visible if we're not doing visibility checks
    if (visibility === "none") {
      return true;
    }

    // for room mode, just check that we're in the same room as the tile
    if (visibility === "room") {
      let rooms = this.dungeon.roomGrid[y0][x0];
      if (rooms !== null) {
        for (let i = 0; i < rooms.length; i++) {
          let r = rooms[i];
          if (
            x1 >= r.pos.x &&
            x1 < r.pos.x + r.size.x &&
            y1 >= r.pos.y &&
            y1 < r.pos.y + r.size.y
          ) {
            return true;
          }
        }
      }
    }

    // if we're using los visibility, we want to do a basic line of sight algorithm
    if (visibility === "los") {
      // if one or both points are outside of this map, we discount it from the checks
      if (
        x0 < 0 ||
        x0 >= this.dungeon.size.x ||
        x1 < 0 ||
        x1 >= this.dungeon.size.x ||
        y0 < 0 ||
        y0 >= this.dungeon.size.y ||
        y1 < 0 ||
        y1 >= this.dungeon.size.y
      ) {
        return true;
      }

      // get the deltas and steps for both axis
      let dx = abs(x1 - x0);
      let dy = abs(y1 - y0);
      let sx = x0 < x1 ? 1 : -1;
      let sy = y0 < y1 ? 1 : -1;

      // stores an error factor we use to change the axis coordinates
      let err = dx - dy;

      while (x0 !== x1 || y0 !== y1) {
        // check our collision map to see if this tile blocks visibility
        if (this.collisionMap[y0][x0] === 1) {
          return false;
        }

        // check our error value against our deltas to see if
        // we need to move to a new point on either axis
        let e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x0 += sx;
        }
        if (e2 < dx) {
          err += dx;
          y0 += sy;
        }
      }

      // if we're here we hit no occluders and therefore can see this tile
      return true;
    }

    // if nothing else hit, then this tile isn't visible
    return false;
  }

  draw(canvas, context, camera, visibility) {
    // compute the player's center in tile space for the tile visibility checks
    let cx = floor((this.player.pos.x + this.player.size.x / 2) / tileSize);
    let cy = floor((this.player.pos.y + this.player.size.y / 2) / tileSize);

    // calculate the base tile coordinates using the camera
    let baseTileX = floor(camera.x / tileSize) - 1;
    let baseTileY = floor(camera.y / tileSize) - 1;

    // calculating the pixel offset based on the camera
    // following http://javascript.about.com/od/problemsolving/a/modulobug.htm to fix negative camera values
    let pixelOffsetX = ((camera.x % tileSize) + tileSize) % tileSize;
    let pixelOffsetY = ((camera.y % tileSize) + tileSize) % tileSize;

    // calculate the min and max X/Y values
    let pixelMinX = -pixelOffsetX - tileSize;
    let pixelMinY = -pixelOffsetY - tileSize;
    let pixelMaxX = canvas.width + tileSize - pixelOffsetX;
    let pixelMaxY = canvas.height + tileSize - pixelOffsetY;

    // loop over each row, using both tile coordinates and pixel coordinates
    for (
      let tileY = baseTileY, y = pixelMinY;
      y < pixelMaxY;
      tileY++, y += tileSize
    ) {
      // verify this row is actually inside the dungeon
      if (tileY < 0 || tileY >= this.dungeon.size.y) {
        continue;
      }

      // loop over each column, using both tile coordinates and pixel coordinates
      for (
        let tileX = baseTileX, x = pixelMinX;
        x < pixelMaxX;
        tileX++, x += tileSize
      ) {
        // verify this column is actually inside the dungeon
        if (tileX < 0 || tileX >= this.dungeon.size.x) {
          continue;
        }

        // get the current tile and make sure it's valid
        let tile = this.tiles[tileY][tileX];
        if (tile !== null) {
          // test if the tile is visible
          let canBeSeen = this.isTileVisible(visibility, cx, cy, tileX, tileY);

          // make sure the tile stores a record if it's ever been seen
          if (canBeSeen) {
            tile.HasBeenSeen = true;
          }

          // if we have ever seen this tile, we need to draw it
          if (tile.HasBeenSeen) {
            // choose the color by the type and whether the tile is currently visible
            switch (tile.type) {
              case tiles.floor:
              case tiles.door:
                context.fillStyle = canBeSeen ? "#B8860B" : "#705104";
                break;
              case tiles.wall:
                context.fillStyle = canBeSeen ? "#8B4513" : "#61300D";
                break;
              case tiles.medic:
                context.fillStyle = "#f1f1f1";
                break;
              case tiles.ammo:
                context.fillStyle = "#4b5320";
                break;
            }

            // draw the tile
            context.fillRect(x, y, tileSize, tileSize);
          }
        }
      }
    }

    // draw the players
    for(let i=0; i<this.players.length; i++){
      context.fillStyle = this.players[i].color;
      context.fillRect(
        floor(this.players[i].pos.x - camera.x),
        floor(this.players[i].pos.y - camera.y),
        floor(this.players[i].size.x),
        floor(this.players[i].size.y)
      );
    }
  }

  moveEntity(pos, size, move) {
    // start with the end goal position
    let endPos = {
      x: pos.x + move.x,
      y: pos.y + move.y,
    };

    const contEndPos = {
      x: pos.x + move.x,
      y: pos.y + move.y,
    };

    // check X axis motion for collisions
    if (move.x) {
      // calculate the X tile coordinate where we'd like to be
      let offset = move.x > 0 ? size.x : 0;
      let x = floor((pos.x + move.x + offset) / tileSize);

      // figure out the range of Y tile coordinates that we can collide with
      let start = floor(pos.y / tileSize);
      let end = Math.ceil((pos.y + size.y) / tileSize);

      // determine whether these tiles are all inside the map
      if (
        end >= 0 &&
        start < this.dungeon.size.y &&
        x >= 0 &&
        x < this.dungeon.size.x
      ) {
        // go down each of the tiles along the Y axis
        for (let y = start; y < end; y++) {
          // if there is a wall in the tile
          if (this.collisionMap[y][x] === tiles.wall) {
            // we adjust our end position accordingly
            endPos.x = x * tileSize - offset + (move.x < 0 ? tileSize : 0);
            break;
          }
        }
      }
    }

    // then check Y axis motion for collisions
    if (move.y) {
      // calculate the X tile coordinate where we'd like to be
      let offset = move.y > 0 ? size.y : 0;
      let y = floor((pos.y + move.y + offset) / tileSize);

      // figure out the range of X tile coordinates that we can collide with
      let start = floor(endPos.x / tileSize);
      let end = Math.ceil((endPos.x + size.x) / tileSize);

      // determine whether these tiles are all inside the map
      if (
        end >= 0 &&
        start < this.dungeon.size.x &&
        y >= 0 &&
        y < this.dungeon.size.y
      ) {
        // go across each of the tiles along the X axis
        for (let x = start; x < end; x++) {
          // if there is a wall in the tile
          if (this.collisionMap[y][x] === tiles.wall) {
            // we adjust our end position accordingly
            endPos.y = y * tileSize - offset + (move.y < 0 ? tileSize : 0);
            break;
          }
        }
      }
    }

    if((contEndPos.x === endPos.x) && (contEndPos.y === endPos.y))
      return true;
    else
      return false;
    // give back the new position for the object
    return endPos;
  }

  canMoveEntity(pos, size, move) {
    // start with the end goal position
    let endPos = {
      x: move.x,
      y: move.y,
    };
    if(this.collisionMap[endPos.y][endPos.x] === tiles.wall)
      return false;
    else
      return true;

      let offset = move.x > 0 ? size.x : 0;
      let x = floor((pos.x + move.x + offset) / tileSize);

      // figure out the range of Y tile coordinates that we can collide with
      let start = floor(pos.y / tileSize);
      let end = Math.ceil((pos.y + size.y) / tileSize);

      let offsety = move.y > 0 ? size.y : 0;
      let y = floor((pos.y + move.y + offset) / tileSize);

      // figure out the range of X tile coordinates that we can collide with
      let starty = floor(endPos.x / tileSize);
      let endy = Math.ceil((endPos.x + size.x) / tileSize);

      if (
        (end >= 0 &&
        start < this.dungeon.size.y &&
        x >= 0 &&
        x < this.dungeon.size.x) && (
          end >= 0 &&
          start < this.dungeon.size.x &&
          y >= 0 &&
          y < this.dungeon.size.y
        )
      ){
        if(this.collisionMap[endPos.y][endPos.x] === tiles.wall)
          return false;
        else
          return true;
      }else
        return true;

    // check X axis motion for collisions
    if (move.x) {
      // calculate the X tile coordinate where we'd like to be
      let offset = move.x > 0 ? size.x : 0;
      let x = floor((pos.x + move.x + offset) / tileSize);

      // figure out the range of Y tile coordinates that we can collide with
      let start = floor(pos.y / tileSize);
      let end = Math.ceil((pos.y + size.y) / tileSize);

      // determine whether these tiles are all inside the map
      if (
        end >= 0 &&
        start < this.dungeon.size.y &&
        x >= 0 &&
        x < this.dungeon.size.x
      ) {
        // go down each of the tiles along the Y axis
        for (let y = start; y < end; y++) {
          // if there is a wall in the tile
          if (this.collisionMap[y][x] === tiles.wall) {
            // we adjust our end position accordingly
            endPos.x = x * tileSize - offset + (move.x < 0 ? tileSize : 0);
            break;
          }
        }
      }
    }

    // then check Y axis motion for collisions
    if (move.y) {
      // calculate the X tile coordinate where we'd like to be
      let offset = move.y > 0 ? size.y : 0;
      let y = floor((pos.y + move.y + offset) / tileSize);

      // figure out the range of X tile coordinates that we can collide with
      let start = floor(endPos.x / tileSize);
      let end = Math.ceil((endPos.x + size.x) / tileSize);

      // determine whether these tiles are all inside the map
      if (
        end >= 0 &&
        start < this.dungeon.size.x &&
        y >= 0 &&
        y < this.dungeon.size.y
      ) {
        // go across each of the tiles along the X axis
        for (let x = start; x < end; x++) {
          // if there is a wall in the tile
          if (this.collisionMap[y][x] === tiles.wall) {
            // we adjust our end position accordingly
            endPos.y = y * tileSize - offset + (move.y < 0 ? tileSize : 0);
            break;
          }
        }
      }
    }

    // give back the new position for the object
    return endPos;
  }
}
