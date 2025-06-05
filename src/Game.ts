import { GameObject } from './objects/GameObject';
import { Dino } from './objects/Dino';
import { Floor } from './objects/Floor';
import { Cloud } from './objects/Cloud';
import { Obstacles } from './objects/Obstacles';

export class Game {
  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.draw = this.draw.bind(this);
  }

  private readonly ctx: CanvasRenderingContext2D;
  private updateTimer?: number;
  private lastUpdate = 0;

  private objects: GameObject[] = [];
  private dino?: Dino;
  private obstacles?: Obstacles;
  private calledGameOver = false;
  public gameTime = 0;
  public onGameOver?: (score: number) => void;
  private active = false;
  private gameStartTime = 0;

  public start(): void {
    console.log('🎮 Starting game - Tracking enabled for:');
    console.log('  🦕 Dino steps (walking animation frames)');
    console.log('  🦘 Dino jumps (when space/click/touch is pressed)');
    console.log('  🚧 Obstacle spawns (cacti and birds)');
    console.log('════════════════════════════════════════');

    this.calledGameOver = false;
    this.gameTime = 0;
    this.gameStartTime = Date.now();
    const floor = new Floor();
    this.dino = new Dino(floor);
    this.obstacles = new Obstacles(this.dino, floor);

    this.objects = [new Cloud(30, 10), new Cloud(100, 400), new Cloud(80, 600), floor, this.obstacles, this.dino];

    this.objects.forEach((o) => o.start());

    this.lastUpdate = Date.now();
    this.updateTimer = window.setInterval(() => this.update(), 1000 / 120);
    this.active = true;
    this.draw();
  }

  public destroy(): void {
    console.log('🎮 Game ended!');
    console.log('════════════════════════════════════════');
    console.log('📊 Game Summary:');
    console.log(`  ⏱️  Total game time: ${this.gameTime}ms`);
    console.log(`  ⏱️  Total game duration: ${Date.now() - this.gameStartTime}ms`);
    console.log('  📝 Check the logs above for detailed step, jump, and obstacle data');
    console.log('════════════════════════════════════════');

    clearInterval(this.updateTimer);
    this.active = false;
    this.objects.forEach((o) => o.destroy());
  }

  private update(): void {
    if (!this.dino?.dead) {
      const delta = Date.now() - this.lastUpdate;
      this.gameTime += delta;
      this.objects.forEach((o) => o.update(delta));
      this.lastUpdate = Date.now();
    } else if (!this.calledGameOver) {
      this.calledGameOver = true;

      // Log all collected data when dino dies
      this.logGameOverData();

      if (this.onGameOver) {
        this.onGameOver(this.gameTime);
      }
    }
  }

  private logGameOverData(): void {
    const dinoData = this.dino?.getGameData();
    const obstacleData = this.obstacles?.getGameData();

    console.log("💀 DINO DIED! Here's the complete game data:");
    console.log('═══════════════════════════════════════════════════');

    // Dino Steps
    console.log(`🦕 DINO STEPS: ${dinoData?.totalSteps || 0} total steps walked`);

    // Dino Jumps
    console.log(`🦘 DINO JUMPS: ${dinoData?.totalJumps || 0} total jumps`);
    if (dinoData?.jumps && dinoData.jumps.length > 0) {
      console.log('   Jump details:');
      dinoData.jumps.forEach((jump, index) => {
        console.log(`   Jump #${index + 1}: time=${jump.time}ms, position=(${jump.x}, ${jump.y})`);
      });
    }

    // Obstacles
    console.log(`🚧 OBSTACLES: ${obstacleData?.totalObstacles || 0} total obstacles spawned`);
    if (obstacleData?.obstacles && obstacleData.obstacles.length > 0) {
      console.log(`   - ${obstacleData.cacti.length} cacti`);
      console.log(`   - ${obstacleData.birds.length} birds`);
      console.log('   Obstacle details:');
      obstacleData.obstacles.forEach((obstacle) => {
        console.log(
          `   ${obstacle.type.toUpperCase()} #${obstacle.id}: time=${obstacle.spawnTime}ms, position=(${obstacle.x}, ${
            obstacle.y
          })`,
        );
      });
    }

    console.log('═══════════════════════════════════════════════════');
    console.log(`⏱️  Game Duration: ${Date.now() - this.gameStartTime}ms`);
    console.log(`🏆 Final Score: ${this.gameTime}ms`);
    console.log('═══════════════════════════════════════════════════');
  }

  private draw(): void {
    if (!this.active) {
      return;
    }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.objects.forEach((o) => o.draw(this.ctx));

    window.requestAnimationFrame(this.draw);
  }
}
