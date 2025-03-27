
const EASY_CONFIG = {
    BASE_HEALTH: 50,
    BASE_ATTACK: 10,
    BASE_SPEED: 50,
    BASE_ATTACK_RANGE: 50,
    BASE_STOP_DISTANCE: 50,
    BASE_ATTACK_INTERVAL: 3,
    BASE_TOWER_HEALTH: 500,

    BASE_HEALTH_TEXT_Y: -50,
    BASE_HEALTH_TEXT_SIZE: 12,
    BASE_HEALTH_TEXT_COLOR: '#ffffff',

    RABBIT_ANIMATION_FPS: 2,
}

const ASSETS_PATH = './static/assets/';

// ユニットの種類を定義する定数
// ※tmp_rabbit は画像用のキーとして 'rabbit' を利用し、他は画像がない前提
const UNIT_TYPES = {
    tmp_rabbit: { 
        health: EASY_CONFIG.BASE_HEALTH, 
        attack: EASY_CONFIG.BASE_ATTACK, 
        speed: EASY_CONFIG.BASE_SPEED, 
        imageKey: 'rabbit', 
        attackRange: EASY_CONFIG.BASE_ATTACK_RANGE, 
        stopDistance: EASY_CONFIG.BASE_STOP_DISTANCE, 
        attackInterval: EASY_CONFIG.BASE_ATTACK_INTERVAL 
    }, 
    archer: { 
        health: 20,  
        attack: 15, 
        speed: 30,  
        imageKey: 'archer',    
        attackRange: 90, 
        stopDistance: 85, 
        attackInterval: 5 
    },
    //cavalry: { ... },
    //mage:    { ... },
    //tank:    { ... }
};

// --- 基底クラス ---
class Entity {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
    }
    update(deltaTime) {
        // 各クラスでオーバーライド
    }
}

// --- ユニットクラス ---
class Unit extends Entity {
    /**
     * @param {Phaser.Scene} scene - シーン
     * @param {number} x - 初期X座標
     * @param {number} y - 初期Y座標
     * @param {number} health - 体力
     * @param {number} attack - 攻撃力
     * @param {number} speed - 移動速度（正なら右方向、負なら左方向）
     * @param {string} imageKey - ユニット画像のキー（画像がない場合はテクスチャが存在しない）
     * @param {string} faction - "ally" または "enemy" などの陣営識別子
     * @param {any} specialAbility - 特殊能力（任意）
     * @param {number} attackRange - 攻撃範囲
     * @param {number} stopDistance - 移動停止距離
     * @param {number} attackInterval - 攻撃間隔（秒）
     */
    constructor(scene, x, y, health, attack, speed, imageKey, faction, specialAbility = null, attackRange = 50, stopDistance = 20, attackInterval = 1) {
        super(scene, x, y);
        this.health = health;
        // 体力テキストの基本Y座標（以降、ここからオフセットを加算）
        this.healthTextY = y - EASY_CONFIG.BASE_HEALTH_TEXT_Y;
        this.attack = attack;
        this.speed = speed;
        this.specialAbility = specialAbility;
        this.faction = faction;
        this.attackRange = attackRange;
        this.stopDistance = stopDistance;
        this.attackInterval = attackInterval;
        this.timeSinceLastAttack = 0;
        this.active = true;
        this.imageKey = imageKey;
        
        // tmp_rabbitの場合、画像が存在すればアニメーション用スプライトを作成
        if (imageKey === 'rabbit' && 
            scene.textures.exists('frame1') && scene.textures.exists('frame2')) {
            this.sprite = scene.add.sprite(x, y, 'frame1').setScale(0.1);
            if (this.faction === "ally") {
                this.sprite.setFlipX(true);
            }
        } else {
            // 画像が無い場合は、代替として四角形を生成
            const fallbackColor = (faction === "ally") ? 0x00ff00 : 0xff0000;
            this.sprite = scene.add.rectangle(x, y, 20, 20, fallbackColor);
        }
        
        // ユニット上部に体力表示テキストを作成
        this.healthText = scene.add.text(x, this.healthTextY, `${this.health}`, { 
            fontSize: EASY_CONFIG.BASE_HEALTH_TEXT_SIZE, 
            fill: EASY_CONFIG.BASE_HEALTH_TEXT_COLOR 
        }).setOrigin(0.5, 0.5);
    }

    update(deltaTime) {
        if (!this.active) return;
        
        let enemyInStopRange = false;
        let attackTargets = [];
        
        // 敵ユニットのチェック
        for (const other of this.scene.entities) {
            if (other !== this && other instanceof Unit && other.active && other.faction !== this.faction) {
                const distance = Phaser.Math.Distance.Between(this.x, this.y, other.x, other.y);
                if (distance < this.stopDistance) {
                    enemyInStopRange = true;
                }
                if (distance < this.attackRange) {
                    attackTargets.push(other);
                }
            }
        }
        
        // 進行方向の敵タワーのチェック
        let enemyTower = null;
        if (this.faction === "ally") {
            enemyTower = this.scene.rightTower;
        } else if (this.faction === "enemy") {
            enemyTower = this.scene.leftTower;
        }
        if (enemyTower && enemyTower.active) {
            const dTower = Phaser.Math.Distance.Between(this.x, this.y, enemyTower.x, enemyTower.y);
            if (dTower < this.stopDistance) {
                enemyInStopRange = true;
                attackTargets.push(enemyTower);
            }
        }
        
        // アニメーションの切り替え（this.spriteがSpriteの場合のみ実施）
        if (this.sprite instanceof Phaser.GameObjects.Sprite) {
            if (enemyInStopRange) {
                if (this.scene.anims.exists('rabbit_attack_anim') &&
                    (!this.sprite.anims.currentAnim || this.sprite.anims.currentAnim.key !== 'rabbit_attack_anim')) {
                    this.sprite.play('rabbit_attack_anim');
                }
            } else {
                if (this.scene.anims.exists('rabbit_walk_anim') &&
                    (!this.sprite.anims.currentAnim || this.sprite.anims.currentAnim.key !== 'rabbit_walk_anim')) {
                    this.sprite.play('rabbit_walk_anim');
                }
            }
        }
        
        // 同じ種類の味方ユニットが重なった場合、体力テキストの位置をずらす処理
        if(this.faction === 'ally') {
            const sameTypeAllies = this.scene.entities.filter(u => 
                u instanceof Unit && 
                u.faction === 'ally' && 
                u.imageKey === this.imageKey &&
                Math.abs(u.x - this.x) < 10  // x軸上で重なっていると判断する閾値（調整可）
            );
            sameTypeAllies.sort((a, b) => a.x - b.x);
            const index = sameTypeAllies.indexOf(this);
            const offsetY = index * 15; // 15pxずつ下にずらす例
            this.healthText.y = this.healthTextY + offsetY;
        } else {
            this.healthText.y = this.healthTextY;
        }
        
        // 味方ユニットで異なる種類との重なりを防ぐ（移動停止）
        let collisionWithDifferentAlly = false;
        if(this.faction === 'ally') {
            for(const other of this.scene.entities) {
                if(other instanceof Unit && other !== this && other.faction === 'ally' && other.imageKey !== this.imageKey) {
                    if(Math.abs(this.x - other.x) < 20) { // 20px以下なら重なっているとみなす（調整可）
                        collisionWithDifferentAlly = true;
                        break;
                    }
                }
            }
        }
        
        // 敵が近い場合は攻撃、そうでなければ移動（ただし異なる種類の味方と衝突している場合は移動しない）
        if (enemyInStopRange) {
            this.timeSinceLastAttack += deltaTime;
            if (this.timeSinceLastAttack >= this.attackInterval) {
                attackTargets.forEach(target => {
                    this.attackTarget(target);
                });
                this.timeSinceLastAttack = 0;
            }
        } else {
            if(!collisionWithDifferentAlly) {
                this.x += this.speed * deltaTime;
                if(this.sprite) {
                    this.sprite.x = this.x;
                }
                this.timeSinceLastAttack = 0;
            } else {
                // 異なる種類の味方ユニットと重なっている場合は移動を停止
                this.timeSinceLastAttack = 0;
            }
        }
        
        // 体力表示テキストのx座標更新
        this.healthText.x = this.x;
        this.updateHealthText();
    }
    
    updateHealthText() {
        this.healthText.setText(`${this.health}`);
    }
    
    attackTarget(target) {
        if (!target.active) return;
        target.health -= this.attack;
        if (target.health <= 0) {
            target.destroy();
        } else {
            if (target instanceof Tower || target instanceof Unit) {
                target.updateHealthText();
            }
        }
    }
    
    destroy() {
        console.log(`${this.faction} unit destroyed!`);
        if(this.sprite) this.sprite.destroy();
        if(this.healthText) this.healthText.destroy();
        this.active = false;
    }
}

// --- タワークラス ---
class Tower extends Entity {
    /**
     * @param {Phaser.Scene} scene - シーン
     * @param {number} x - 初期X座標
     * @param {number} y - 初期Y座標
     * @param {number} health - 拠点の体力
     * @param {number} color - タワーの色
     */
    constructor(scene, x, y, health, color) {
        super(scene, x, y);
        this.health = health;
        this.active = true;
        this.sprite = scene.add.rectangle(x, y, 40, 40, color);
        this.healthText = scene.add.text(x, y - 30, `${this.health}`, { fontSize: '16px', fill: '#ffffff' }).setOrigin(0.5, 0.5);
    }
    
    update(deltaTime) {
        this.sprite.x = this.x;
        this.sprite.y = this.y;
        this.healthText.x = this.x;
        this.healthText.y = this.y - 30;
    }
    
    updateHealthText() {
        this.healthText.setText(`${this.health}`);
    }
    
    takeDamage(damage) {
        this.health -= damage;
        console.log(`Tower takes ${damage} damage, remaining health: ${this.health}`);
        this.updateHealthText();
        if (this.health <= 0) {
            this.destroy();
        }
    }
    
    destroy() {
        console.log("Tower destroyed! Game Over.");
        this.sprite.destroy();
        this.healthText.destroy();
        this.active = false;
    }
}

// --- Phaser シーン ---
class MyScene extends Phaser.Scene {
    constructor() {
        super({ key: "MyScene" });
        this.entities = [];
    }
    
    preload() {
        // tmp_rabbit 用のアニメーションフレームをプリロード
        this.load.image('frame1', `${ASSETS_PATH}rabbit_unit/rabbit_walk1.png`);
        this.load.image('frame2', `${ASSETS_PATH}rabbit_unit/rabbit_walk2.png`);
        this.load.image('frame3', `${ASSETS_PATH}rabbit_unit/rabbit_attack1.png`);
        this.load.image('frame4', `${ASSETS_PATH}rabbit_unit/rabbit_attack2.png`);
        this.load.image('frame5', `${ASSETS_PATH}rabbit_unit/rabbit_attack3.png`);
    }
    
    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        // 左右のタワーを作成
        this.leftTower = new Tower(this, 50, height / 2, 500, 0xffffff);
        this.rightTower = new Tower(this, width - 50, height / 2, 500, 0xff0000);
        this.entities.push(this.leftTower, this.rightTower);
        
        // tmp_rabbit 用アニメーション "rabbit_walk_anim" と "rabbit_attack_anim" を作成
        if (!this.anims.exists('rabbit_walk_anim')) {
            this.anims.create({
                key: 'rabbit_walk_anim',
                frames: [
                    { key: 'frame1' },
                    { key: 'frame2' }
                ],
                frameRate: EASY_CONFIG.RABBIT_ANIMATION_FPS,
                repeat: -1
            });
            this.anims.create({
                key: 'rabbit_attack_anim',
                frames: [
                    { key: 'frame3' },
                    { key: 'frame4' },
                    { key: 'frame5' }
                ],
                frameRate: EASY_CONFIG.RABBIT_ANIMATION_FPS,
                repeat: -1
            });
        }
        
        // enemy 側のユニット出現イベント（4000msごと）
        this.time.addEvent({
            delay: 4000,
            callback: this.spawnEnemyUnit,
            callbackScope: this,
            loop: true
        });
        this.createUnitButtons();
    }
    
    spawnEnemyUnit() {
        const unitTypes = Object.keys(UNIT_TYPES);
        const randomType = unitTypes[Math.floor(Math.random() * unitTypes.length)];
        const typeConfig = UNIT_TYPES[randomType];
        const unit = new Unit(
            this,
            this.rightTower.x - 20,
            this.rightTower.y,
            typeConfig.health,
            typeConfig.attack,
            -typeConfig.speed, // 左方向へ移動
            typeConfig.imageKey,
            "enemy",
            null,
            typeConfig.attackRange,
            typeConfig.stopDistance,
            typeConfig.attackInterval
        );
        this.entities.push(unit);
    }
    
    createUnitButtons() {
        const unitTypes = Object.keys(UNIT_TYPES);
        const startX = 100;
        const startY = this.cameras.main.height - 40;
        const spacing = 80;
        unitTypes.forEach((typeKey, index) => {
            const buttonX = startX + index * spacing;
            this.createUnitButton(typeKey, buttonX, startY);
        });
    }
    
    createUnitButton(typeKey, x, y) {
        const buttonWidth = 70, buttonHeight = 30;
        let button = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x666666).setInteractive();
        let text = this.add.text(x, y, typeKey, { fontSize: '14px', fill: '#ffffff' }).setOrigin(0.5, 0.5);
        button.on('pointerdown', () => {
            // ボタン押下で ally 側ユニットを出現させる（左タワー側）
            const typeConfig = UNIT_TYPES[typeKey];
            const unit = new Unit(
                this,
                this.leftTower.x + 20,
                this.leftTower.y,
                typeConfig.health,
                typeConfig.attack,
                typeConfig.speed,
                typeConfig.imageKey,
                "ally",
                null,
                typeConfig.attackRange,
                typeConfig.stopDistance,
                typeConfig.attackInterval
            );
            this.entities.push(unit);
        });
    }
    
    update(time, delta) {
        const deltaTime = delta / 500;
        this.entities.forEach(entity => {
            entity.update(deltaTime);
        });
        // inactive なエンティティは除去
        this.entities = this.entities.filter(entity => !("active" in entity && entity.active === false));
    }
}

// --- Phaser ゲーム設定 ---
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    backgroundColor: "#333333",
    scene: MyScene
};

const game = new Phaser.Game(config);



