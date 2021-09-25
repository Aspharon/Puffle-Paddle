var config = {
    type: Phaser.WEBGL,
    width: 1520,
    height: 960,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var paddle;
var gamestate; //0 = start screen, 1 = playing, 2 = end screen. 0 and 2 are functionally identical.

var score;
var count;
var scorecount;
var tickets;
var bounces;
var bonus;

var goal;
var defaultgoal;
var gravity;
var wind;
var windcountdown;

var puffles;
var mostpuffles;
var droppedpuffles;
var lowestn;

var speed;
var balance;
var puffleN;
var puffleList;

var handposy2;
var handposy1;
var handposy;
var handposx2;
var handposx1;
var handposx;
var strength;

var frameTime;

var scene;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('foreground', 'assets/foreground.png');
    this.load.image('overlay', 'assets/overlay.png');
    this.load.image('buttonHover', 'assets/buttonHover.png');
    this.load.image('buttonPressed', 'assets/buttonPressed.png');
    this.load.image('buttonUnpressed', 'assets/buttonUnpressed.png');
    this.load.image('closeHover', 'assets/closeHover.png');
    this.load.image('closePressed', 'assets/closePressed.png');
    this.load.image('closeUnpressed', 'assets/closeUnpressed.png');
    this.load.image('postit', 'assets/postit.png');

    this.load.spritesheet('paddle', 'assets/paddle.png', { frameWidth: 230, frameHeight: 508 } );
    this.load.spritesheet('background', 'assets/bg.png', { frameWidth: 1520, frameHeight: 960 } );
    this.load.spritesheet('1', 'assets/1.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('2', 'assets/2.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('3', 'assets/3.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('4', 'assets/4.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('5', 'assets/5.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('6', 'assets/6.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('7', 'assets/7.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('8', 'assets/8.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('9', 'assets/9.png', { frameWidth: 194, frameHeight: 194 } );
    this.load.spritesheet('10', 'assets/10.png', { frameWidth: 194, frameHeight: 194 } );
    //this.load.spritesheet('11', 'assets/11.png', { frameWidth: 194, frameHeight: 194 } ); //Uncomment this for gray puffle support. There's another line in attachpuffle() that needs tweaking, see comment over there.
    this.load.spritesheet('pop', 'assets/pop.png', { frameWidth: 230, frameHeight: 170 } );

    this.load.audio('squeak1', ['assets/squeak1.ogg', 'assets/squeak1.mp3']);
    this.load.audio('squeak2', ['assets/squeak2.ogg', 'assets/squeak2.mp3']);
    this.load.audio('squeak3', ['assets/squeak3.ogg', 'assets/squeak3.mp3']);
    this.load.audio('drip', ['assets/drip.ogg', 'assets/drip.mp3']);
    this.load.audio('switch', ['assets/switch.ogg', 'assets/switch.mp3']);
    this.load.audio('music', ['assets/music.ogg', 'assets/music.mp3']);

    loadFont("CCFaceFront", "assets/CCFaceFront.ttf");
    loadFont("CCFaceFrontItalic", "assets/CCFaceFrontItalic.ttf");
}

function create ()
{
    frameTime = 0;

    gamestate = 0

    score = 0;
    count = 0;
    tickets = 0;
    bounces = 0;
    bonus = 0;
    goal = 20;
    defaultgoal = 20;
    gravity = 0.5;
    wind = true;
    windcountdown = 480;
    puffles = 1;
    mostpuffles = 1;
    droppedpuffles = 0;
    role = 0;
    pufflecolor = 0;
    speed = 10;
    balance = 4;
    puffleN = 1;
    puffleList = [];

    this.squeaks = [this.sound.add("squeak1"), this.sound.add("squeak2"), this.sound.add("squeak3")];

    this.drip = this.sound.add("drip");
    this.switch = this.sound.add("switch");

    scene = this;

    background = this.add.sprite(760, 480, 'background');
    paddle = this.add.sprite(-500, -500, 'paddle');
    pop = this.add.sprite(-500, -500, 'pop');
    
    foreground = this.add.image(760, 480, 'foreground');
    foreground.setDepth(1);
    scorecount = this.add.text(1337, 137, '0', { fontFamily: 'CCFaceFront', fontSize: 32, color: '#ffffff', align: 'center' });
    scorecount.setStroke('#000000', 5);
    scorecount.setOrigin(0.5)
    scorecount.setDepth(2);
    pop.setDepth(1);
    overlay = this.add.image(760, 480, 'overlay');
    overlay.setDepth(3);
    description = "- USE YOUR MOUSE TO BOUNCE THE\n  PUFFLES AND KEEP THEM IN THE AIR\n\n- EVERY TIME YOU BOUNCE A PUFFLE\n  YOU INCREASE YOUR SCORE\n\n- JUGGLE MORE AT ONCE TO WIN MORE\n\n- THE LONGER YOU CAN KEEP BOUNCING\n  THE SAME PUFFLE, THE MORE YOU WIN";
    howtoplay = this.add.text(330, 299, description, { fontFamily: 'CCFaceFrontItalic', fontSize: 32, color: '#000000', align: 'left' });
    howtoplay.setLineSpacing(-6);
    howtoplay.setPadding(10,10,10,10);
    howtoplay.setDepth(3);

    overlayObjects = [overlay, howtoplay];
    var playbutton = makeButton(761, 764, 'buttonUnpressed', 'buttonPressed', 'buttonHover', function () {gamestate++; scene.drip.play(); for (const item of overlayObjects) {item.destroy()};} )
    playtext = this.add.text(761, 764, 'PLAY', { fontFamily: 'CCFaceFrontItalic', fontSize: 48, color: '#ffffff', align: 'center' });
    playtext.setStroke('#000000', 10);
    playtext.setPadding(10,10,10,10);
    playtext.setOrigin(0.5)
    playtext.setDepth(4);
    overlayObjects.push(playtext);
    overlayObjects.push(playbutton);

    makeButton(1468, 44, 'closeUnpressed', 'closePressed', 'closeHover', function () {scene.switch.play(); quitGame();} )

    music = this.sound.add('music');
    music.setLoop(true);
    music.play();
    
    this.anims.create({
        key: 'idle',
        frames: [ { key: 'paddle', frame: 3 } ],
        frameRate: 30,
    });
    
    this.anims.create({
        key: 'pad',
        frames: this.anims.generateFrameNumbers('paddle', { start: 0, end: 3 }),
        frameRate: 30,
        repeat: 0
    });		

    this.anims.create({
        key: 'more',
        frames: this.anims.generateFrameNumbers('background', { start: 0, end: 4 }),
        frameRate: 30,
        repeat: 0
    });	

    this.anims.create({
        key: 'miss',
        frames: this.anims.generateFrameNumbers('background', { start: 5, end: 9 }),
        frameRate: 30,
        repeat: 0
    });	

    this.anims.create({
        key: 'bubble',
        frames: this.anims.generateFrameNumbers('pop', { start: 0, end: 7 }),
        frameRate: 30,
        repeat: 0
    });	

    this.anims.create({
        key: 'bgnormal',
        frames: [ { key: 'background', frame: 4 } ],
        frameRate: 30,
    });
    
    /*this.input.on('pointerdown', function (pointer) {

        attachpuffle();
        //paddle.anims.play('pad', true);

    }, this);
    
    Debug stuff, felt good to keep around just in case.*/

    paddle.anims.play('idle');
    background.anims.play('bgnormal');

    attachpuffle();
}

/*
* Runs every frame (60 fps)
* Should be identical to Flash
* in every way that matters. 
*/
function update (time, delta)
{
    frameTime += delta
        if (frameTime > 16.5) {
            frameTime -= 16.5;

            if (gamestate == 1)
            {
                if(count >= goal)
                {
                    count = 0;
                    puffles += 1;
                    if(puffles <= 4)
                    {
                        if(puffles < mostpuffles)
                        {
                            goal = puffles * 10;
                        }
                        else
                        {
                            goal = puffles * 20;
                        }
                    }
                    else
                    {
                        goal = defaultgoal;
                        if(defaultgoal > 5)
                        {
                            defaultgoal -= 1;
                        }
                        if(droppedpuffles > 49)
                        {
                            defaultgoal += 20;
                            droppedpuffles = 0;
                        }
                    }
                    if(mostpuffles < puffles)
                    {
                        mostpuffles = puffles;
                    }
                    attachpuffle();
                }
        
                handposy2 = handposy1;
                handposy1 = handposy;
                handposy = game.input.mousePointer.y;
                handposx2 = handposx1;
                handposx1 = handposx;
                handposx = game.input.mousePointer.x;
                strength = handposy2 - handposy;
        
                if(strength <= 0)
                {
                    power = 0;
                }
                else
                {
                    power = strength / 6;
                }
                strengthx = handposx2 - handposx;
        
                var removeList = []
                for (const puffle of puffleList)
                {
                    // There's another if statement here in Flash that
                    // set puffles to only be visible below 100 pixels
                    // above the playable area?? I left it out because
                    // I honestly don't see the use.
        
                    if (puffle.y > 1000)
                    {
                        //remove the puffle
                        removeList.push(puffle);
        
                        puffles -= 1;
                        if(puffles <= 4)
                        {
                            if(puffles < mostpuffles)
                            {
                            goal = puffles * 10;
                            }
                            else
                            {
                            goal = puffles * 20;
                            }
                        }
                        else
                        {
                            goal = defaultgoal;
                        }
                        droppedpuffles += 1;
                        background.anims.play('miss');
                    }
                }
        
                // You can't delete something from a list if you're
                // iterating through that list. At least I assume,
                // it's like that in C#. In any way, this works.
                for (const trash of removeList)
                {
                    const index = puffleList.indexOf(trash);
                    if (index > -1) {
                        puffleList.splice(index, 1);
                    }
                    trash.sprite.destroy();
                    delete trash;
                }
        
                scorecount.setText(tickets.toString());
        
                if(puffles <= 0)
                {
                    tickets = bounces + mostpuffles * role;
                    gamestate++;
                    gameover();
                }
        
                paddle.setPosition(handposx, handposy);
        
                for (const puffle of puffleList)
                {
                    puffle.x += puffle.xv;
                    puffle.y += puffle.yv;
                    if(!(puffle.x >= 1440 && puffle.xv >= 0)) // Coordinates here are modified to the new resolution
                    {
                        if(puffle.x <= 80 && puffle.xv < 0) // Here as well
                        {
                            puffle.xv *= -1;
                        }
                    }
                    else
                    {
                        puffle.xv *= -1;
                    }
        
                    if(puffle.yv >= -10)
                    {
                        puffle.yv += gravity;
                    }
                    else
                    {
                        puffle.yv *= 0.9;
                    }
        
                    if(puffle.xv <= 30)
                    {
                        if(puffle.xv < -30)
                        {
                            puffle.xv *= 0.95;
                        }
                    }
                    else
                    {
                        puffle.xv *= 0.95;
                    }
        
                    if(score >= 50)
                    {
                        if(wind != true)
                        {
                            puffle.xv -= 0.1;
                        }
                        else
                        {
                            puffle.xv += 0.1;
                        }
                        if(windcountdown > 0)
                        {
                            windcountdown -= 1;
                        }
                    }
        
                    if(windcountdown == 0)
                    {
                        if(wind != true)
                        {
                            wind = true;
                        }
                        else
                        {
                            wind = false;
                        }
                        windcountdown = 480; // Doubled because of doubled framerate.
                    }
                    if(puffle.y > -198) // Doubled because of doubled resolution, as well as all the numbers down here.
                    {
                        if(puffle.x > handposx - 140 && puffle.x < handposx + 140 && puffle.y + 60 > handposy && puffle.y + 60 < handposy + 200 && puffle.yv >= 0)
                        {
                            bouncethepuffle(puffle);
                        }
                        if(puffle.x > handposx - 140 && puffle.x < handposx + 140 && puffle.y > handposy && puffle.y < handposy2 && puffle.yv >= 0)
                        {
                            bouncethepuffle(puffle);
                        }
                        if(puffle.y + 60 > handposy && puffle.y + 60 < handposy + 200 && puffle.x > handposx && puffle.x < handposx2 && puffle.yv >= 0)
                        {
                            bouncethepuffle(puffle);
                        }
                        if(puffle.y + 60 > handposy && puffle.y + 60 < handposy + 200 && puffle.x < handposx && puffle.x > handposx2 && puffle.yv >= 0)
                        {
                            bouncethepuffle(puffle);
                        }
                    }
                    
                    if(puffle.yv > 6 && (puffle.sprite.anims.currentAnim.key == puffle.color + 'i' || (puffle.sprite.anims.currentAnim.key == puffle.color + 'b' && puffle.sprite.anims.currentFrame.index == 7 )))
                    {        
                        puffle.sprite.anims.play( puffle.color + 'd');
                        puffle.sprite.once('animationcomplete', function (sprite)
                        {
                        if (sprite.key === puffle.color + 'd')
                        {
                            puffle.sprite.anims.play( puffle.color + 'f');
                        }
                        }, this);
                    }
                }
        
                for (const puffle of puffleList)
                {
                    puffle.sprite.setPosition(puffle.x, puffle.y);
                }
            }
        
        }
}

/*
* Spawns a new puffle.
* Taken straight from Flash.
* Can be modified to support gray puffle,
* see the comment below.
*/
function attachpuffle()
{
    puffleN += 1;
    pufflecolor += 1;
    if(pufflecolor > 10) // Change to 11 for gray puffle support. There's another line that needs to be uncommented up top.
    {
        pufflecolor = 1;
    }

    var puffle = {};
    puffle.color = pufflecolor;
    puffle.xv = 0;
    puffle.yv = 0;
    puffle.x = getRandomInt(1400) + 80; // Moved this slightly inwards to compensate for the fact that puffles are now behind the foreground layer (the curtains) and could be hidden behind them if they spawn at the very sides
    puffle.y = -80;
    puffle.poptxt = 0;
    
    puffle.sprite = scene.add.sprite(puffle.x, puffle.y, puffle.color);

    game.anims.create({
        key: puffle.color + 'b',
        frames: game.anims.generateFrameNumbers(puffle.color, { start: 0, end: 6 }),
        frameRate: 30,
        repeat: 0
    });
    
    game.anims.create({
        key: puffle.color + 'i',
        frames: [ { key: puffle.color, frame: 6 } ],
        frameRate: 30,
    });

    game.anims.create({
        key: puffle.color + 'd',
        frames: [ { key: puffle.color, frame: 7 } ],
        frameRate: 10,
    });

    game.anims.create({
        key: puffle.color + 'f',
        frames: game.anims.generateFrameNumbers(puffle.color, { start: 8, end: 9 }),
        frameRate: 10,
        repeat: -1
    });

    puffle.sprite.anims.play( puffle.color + 'i');

    puffleList.push(puffle);
    
    background.anims.play('more');
}

/*
* Causes the given puffle to bounce.
* All logic here is taken straight from the flash version, 
* albeit with a tiny tweak to make up for the higher resolution
* and higher framerate. See comment below.
*/
function bouncethepuffle(puffle)
{
    snd = getRandomInt(2);
    if(strengthx > 300)
    {
        snd = 2;
    }
    if(strengthx < -300)
    {
        snd = 2;
    }
    if(power > 30)
    {
        snd = 2;
    }
    scene.squeaks[snd].play();
    puffle.xv = ((puffle.x - (handposx + strengthx)) * 1) / balance;
    puffle.yv = -2 * (speed + power); // This was -1 in Flash. I have doubled this and halved gravity, which results in identical physics at double the framerate.
    score += 1;
    count += 1;
    bounces += 1;
    if(speed >= 40)
    {
        if(balance > 2)
        {
            balance -= 0.2;
        }
    }
    else
    {
        speed += 0.2;
    }
    puffle.poptxt += 1;
    if(puffle.poptxt > role)
    {
        role = puffle.poptxt;
    }
    popuptxt = puffle.poptxt;

    var scorepopup = scene.add.text(puffle.x, puffle.y + 50, popuptxt, { fontFamily: 'CCFaceFront', fontSize: 32, color: '#ffffff', align: 'center' });
    scorepopup.setStroke('#000000', 5);
    scorepopup.setOrigin(0.5)
    scorepopup.setDepth(2);
    scene.time.delayedCall(300, ()=> scorepopup.destroy());

    pop.x = puffle.x;
    pop.y = puffle.y + 50;
    pop.anims.play('bubble', true);
    paddle.anims.play('pad', true);
    puffle.sprite.anims.play(puffle.color + 'b', true);
    tickets = bounces + mostpuffles * role;
}

function gameover()
{    
    paddle.destroy();

    overlay = scene.add.image(760, 480, 'overlay');
    overlay.setDepth(3);
    description = `BOUNCE POINTS: ${bounces}\nMOST BOUNCED PUFFLE: ${role}\nPUFFLES JUGGLED: ${mostpuffles}`;
    results = scene.add.text(1035, 340, description, { fontFamily: 'CCFaceFrontItalic', fontSize: 32, color: '#000000', align: 'right' });
    results.setLineSpacing(13);
    results.setPadding(10,10,10,10);
    results.setOrigin(1,0)
    results.setDepth(3);

    totaltext = `TOTAL TICKETS: ${tickets}`;
    finaltotal = scene.add.text(1050, 563, totaltext, { fontFamily: 'CCFaceFrontItalic', fontSize: 51, color: '#000000', align: 'right' });
    finaltotal.setLineSpacing(13);
    finaltotal.setPadding(10,10,10,10);
    finaltotal.setOrigin(1,0)
    finaltotal.setDepth(3);

    makeButton(661, 764, 'buttonUnpressed', 'buttonPressed', 'buttonHover', function () {scene.drip.play(); quitGame();})
    donetext = scene.add.text(661, 764, 'DONE', { fontFamily: 'CCFaceFrontItalic', fontSize: 48, color: '#ffffff', align: 'center' });
    donetext.setStroke('#000000', 10);
    donetext.setPadding(10,10,10,10);
    donetext.setOrigin(0.5)
    donetext.setDepth(4);

    postit = scene.add.image(978, 794, 'postit');
    postit.setDepth(3);
}

function makeButton(x, y, unpressedSprite, pressedSprite, hoverSprite, clickFunction)
{
    let button = scene.add.sprite(x, y, unpressedSprite)
    .setInteractive({ useHandCursor: true })
    .on('pointerover', () => enterButtonHoverState(hoverSprite) )
    .on('pointerout', () => enterButtonRestState(unpressedSprite) )
    .on('pointerdown', () => enterButtonActiveState(pressedSprite) )
    .on('pointerup', () => {
        clickFunction();
    });

    button.setDepth(4);

    function enterButtonHoverState(hoverSprite)
    {
        button.setTexture(hoverSprite);
    }

    function enterButtonRestState(unpressedSprite)
    {
        button.setTexture(unpressedSprite);
    }

    function enterButtonActiveState(pressedSprite)
    {
        button.setTexture(pressedSprite);
    }

    
    return button;
}

function quitGame()
{
    //Put whatever code you guys have for quitting games here.
}

function loadFont(name, url)
{
    var newFont = new FontFace(name, `url(${url})`);
    newFont.load().then(function (loaded) {
        document.fonts.add(loaded);
    }).catch(function (error) {
        return error;
    });
}

function getRandomInt(max)
{
    return Math.floor(Math.random() * max);
}