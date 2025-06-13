import { GameObject } from './GameObject';
import { Obstacle } from './Obstacle';
import { Dino } from './Dino';
import { Floor } from './Floor';
import cactus1 from '../sprites/cactus-1.png';
import cactus2 from '../sprites/cactus-2.png';
import cactus3 from '../sprites/cactus-3.png';
import cactus4 from '../sprites/cactus-4.png';
import bird1 from '../sprites/enemy1.png';
import bird2 from '../sprites/enemy2.png';
import { Animation } from './Animation';

const cacti = [cactus1, cactus2, cactus3, cactus4];

export class Obstacles implements GameObject {
  constructor(private readonly dino: Dino, private readonly floor: Floor) {
    this.reviveObstacle = this.reviveObstacle.bind(this);
  }

  private obstacles: Obstacle[] = [];
  private spawner = 0;
  private gameTime = 0;
  private obstacleCount = 0;
  private gameStartTime = 0;
  private obstacleData: Array<{ id: number; type: string; spawnTime: number; x: number; y: number }> = [];

  start(): void {
    this.obstacles = [];
    this.gameTime = 0;
    this.obstacleCount = 0;
    this.obstacleData = [];
    this.gameStartTime = Date.now();

    this.spawner = window.setTimeout(this.reviveObstacle, 1000);
  }

  destroy(): void {
    this.obstacles.forEach((o) => o.destroy());
    this.obstacles = [];
    clearTimeout(this.spawner);
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.obstacles.forEach((o) => o.draw(ctx));
  }

  update(deltaT: number): void {
    this.gameTime += deltaT;
    this.obstacles.forEach((o) => o.update(deltaT));
  }

  private reviveObstacle(): void {
    let deadObstacles = this.obstacles.filter((o) => !o.spawned);
    if (deadObstacles.length === 0) {
      deadObstacles = [this.spawnNewObstacle()];
    }
    const obstacle = deadObstacles[Math.floor(Math.random() * deadObstacles.length)];
    obstacle.x = 1500;
    obstacle.spawned = true;

    this.obstacleCount++;
    const spawnTime = Date.now() - this.gameStartTime;

    // Store obstacle data silently
    const obstacleType = obstacle.y === 50 ? 'bird' : 'cactus';
    this.obstacleData.push({
      id: this.obstacleCount,
      type: obstacleType,
      spawnTime: spawnTime,
      x: obstacle.x,
      y: obstacle.y,
    });

    // spawn the next one
    const diff = (1 / (1 + this.gameTime / 100000)) * 3000;
    this.spawner = window.setTimeout(this.reviveObstacle, 500 + diff * Math.random());
  }

  private spawnNewObstacle(): Obstacle {
    if (Math.random() >= 0.8) {
      return this.spawnNewBird();
    } else {
      return this.spawnNewCactus();
    }
  }

  private spawnNewCactus(): Obstacle {
    const animation = new Animation([cacti[Math.floor(Math.random() * cacti.length)]], 1, 25, 50);
    const cactus = new Obstacle(this.dino, animation, () => this.floor.vX);
    cactus.y = this.floor.y - animation.height;
    cactus.start();
    this.obstacles.push(cactus);
    return cactus;
  }

  private spawnNewBird(): Obstacle {
    const animation = new Animation([bird1, bird2], 3, 44, 33);
    const bird = new Obstacle(this.dino, animation, () => this.floor.vX + 0.1);
    bird.y = 50;
    bird.start();
    this.obstacles.push(bird);
    return bird;
  }

  // Method to get collected data for game over summary
  public getGameData() {
    return {
      totalObstacles: this.obstacleCount,
      obstacles: this.obstacleData,
      cacti: this.obstacleData.filter((o) => o.type === 'cactus'),
      birds: this.obstacleData.filter((o) => o.type === 'bird'),
    };
  }
}
