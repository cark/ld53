export class Walls {
    constructor(level) {
        this.level = level;
        this.grid = [];
        this.width = 0;
        this.height = 0;
    }
    init(tiles) {
        this.grid = [];
        this.width = tiles.width;
        this.height = tiles.height;
        tiles.tiles.forEach(element => {
            this.grid[element.pos.x + element.pos.y * tiles.width] = true;
        });
    }
    isPassable(gridPos) {
        return gridPos.x >= 0 && gridPos.x < this.width
            && gridPos.y >= 0 && gridPos.y < this.height
            && this.grid[gridPos.x + gridPos.y * this.width] !== true;
    }
}