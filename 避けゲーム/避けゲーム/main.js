"use strict";

const WIDTH = 720;
const HEIGHT = 540;
const MAG = 6; //移動速度
const MESH = 24;
const TIMER_INTERVAL = 33;

let gStyle = "#00ffff";
let gX = WIDTH / 2;
let gY = HEIGHT - MESH * 3;
let gScore = 0;
let gLife = 3;
let gKey = new Uint8Array( 0x100 );
let gTimer;

let gBall = [];
let gColor = ["#ff0000", "#ff00ff", "#00ff00", "#ffff00"];


//敵
class Ball
{
    constructor( c )
    {
        this.mX = WIDTH / 2;
        this.mY = MESH;
        let a = Math.random() * 2.5 + (Math.PI - 2.5) / 2;　//移動をランダムに
        this.mDX = Math.cos( a );
        this.mDY = Math.sin( a );
        this.mStyle = gColor[ c ];
    }

    draw( g )
    {
        g.fillStyle = this.mStyle;
        g.fillRect( this.mX - MAG, this.mY - MAG, MAG * 2, MAG * 2 );
    }

    tick()
    {   
        // 簡単な当たり判定
        if(IsInRect( this.mX, this.mY, gX, gY, MESH, MESH)) {
            return(true);
        }

        this.mX += this.mDX;
        this.mY += this.mDY;

        //敵壁当たり判定
        if(this.mX < MESH || this.mX > WIDTH - MESH ) {
            this.mDX = -this.mDX;
            this.mX += this.mDX;
            gScore++;
        }
        if(this.mY < MESH || this.mY > HEIGHT - MESH ) {
            this.mDY = -this.mDY;
            this.mY += this.mDY;
            gScore++;
        }
        return(false);
    }
}

// 当たり判定
function IsInRect( x, y, rx, ry, rw, rh )
{
    return(rx < x && x < rx + rw &&
           ry < y && y < ry + rh );
}

//画面描画の基礎
function draw(){
    let g = document.getElementById("main").getContext("2d");

    //field UI
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, WIDTH, HEIGHT);
    g.fillStyle = "#000000";
    g.fillRect(MESH, MESH, WIDTH-MESH*2, HEIGHT-MESH*2);

    //player UI
    g.fillStyle = gStyle;
    g.fillRect(gX, gY, MESH, MESH);
    //player移動
    for( let b of gBall ) {
        b.draw( g );
    }

    //text UI
    g.font = "36px monospace";　//＝MSゴシック
    g.fillStyle = "#ffffff";
    g.fillText( "SCORE:" + gScore, MESH * 2, MESH * 2.5 );
    g.fillText( "LIFE:" + gLife, MESH * 23, MESH * 2.5 );

    if( gLife <= 0 ) {
        g.fillText( "GAME OVER", WIDTH / 2 - MESH * 3, HEIGHT / 2 );
    }

}

function start() {
    //敵を8体に増やす
    for( let i = 0; i < 8; i++) {
    gBall.push( 
    new Ball(i % 4) );
    }
}

//キー入力関連
function tick() {

    // ゲームオーバー処理
    if( gLife <= 0 ) {
        return;
    }

    //player壁当たり判定
    gX = Math.max( MESH            , gX - gKey[ 37 ] * MAG );
    gX = Math.min( WIDTH - MESH * 2, gX + gKey[ 39 ] * MAG );
    gY = Math.max( MESH            , gY - gKey[ 38 ] * MAG );
    gY = Math.min( HEIGHT - MESH *2, gY + gKey[ 40 ] * MAG );

    //敵の速度
    for(let i = 0; i < 4 + gScore / 10; i++) {
        for( let i = gBall.length -1; i >= 0; i-- ) {

        　//当たったら色の変更
          if( gBall[ i ].tick() ) {
          gLife--;
          gStyle = gBall[ i ].mStyle;
          gBall.splice( i,1 );　//当たったら消す
          }
       }
    }
}

function onPaint()
{   
    //マシーンによってのゲームバランスの制御
    if( !gTimer ) {
        gTimer = performance.now();
    }

    if( gTimer + TIMER_INTERVAL < performance.now() ) {
        gTimer += TIMER_INTERVAL;
        tick();
        draw();
    }

    //少し遅れて呼び出される関数、そのアニメーションに相応しいフレーム数に抑えてくれる
    requestAnimationFrame( onPaint );
}

//ゲームアニメーションらしい動きにする
window.onkeydown = function( ev )
{
    gKey[ ev.keyCode ] = 1;
}

//ゲームアニメーションらしい動きにする
window.onkeyup = function( ev )
{
    gKey[ ev.keyCode ] = 0;
}    

window.onload = function()
{
  start();

  requestAnimationFrame( onPaint );
}
