
// Mushroom simulator

window.onload = ()=> {
    console.log("document loaded");
    setup();
    main();
}


let board, 
    canvas, 
    ctx, 
    w, 
    h, 
    l, 
    X, 
    Y, 
    D0, 
    D, 
    mutation,
    _count;

let updating = false;

let setup = ()=> {
    // setup buttons
    document.getElementById('start').onclick = onClickStart;
    document.getElementById('restart').onclick = onClickRestart;
    
    // setup canvas
    canvas = document.getElementById('board')
    ctx = canvas.getContext("2d")

    w = 1000
    h = 750
    l = 5

    X = parseInt(w/l)
    Y = parseInt(h/l)
    D0 = 30
    D = 60
    mutation = 0.1

    _count = 0

    canvas.width = w
    canvas.height = h

    // setup board
    board = new Object()
    board.data = [] // data is a 2d matrix in which each cell is a color vector [hue, sat, lum, isWall]

    let hue_init = Math.random()*360
    for (let x = 0; x < X; x++) {
        let row = []
        for (let y = 0; y < Y; y++) {
    
            // random wall
            // let isWall = Math.random()< 0.01; // 1% of cells are walls
            // let hue = Math.random()*360;

            let isWall = x%parseInt(X/3)==0 || y%parseInt(Y/3)==0;
            isWall = y%30==0 ? false : isWall;
            let hue = x> X/3 ? Math.random()*360 : hue_init;


            row.push([hue, 1, 0.79, isWall]) // [hue, sat, lum, isWall?]
        }

        board.data.push(row)
    }
}






let main = ()=>{
    draw();
}


let draw = ()=> {
    for (let y=0; y<Y; y++) {
        for (let x=0; x<X; x++) {
            let fillStyle = "hsl("+board.data[x][y][0]+", 100%, ";
            fillStyle += board.data[x][y][3] ? "0%)" : "79%)";

            ctx.fillStyle = fillStyle;
            ctx.fillRect( x*l, y*l, l, l );
        }
    }
}


let update = ()=>{
    if (!updating) return;
    _count += 1
    let next = [] // next board state

    for (let x=0; x<X; x++) {
        next.push([])
        for (let y=0; y<Y; y++) {
            next[x].push([board.data[x][y][0]])
    }}

    for (let x=0; x<X; x++) {
        let endX = (x==X-1)

        for (let y=0; y<Y; y++) {
            let endY = (y==Y-1)

            let f = board.data[x][y] // field 1
            if (f[3]) continue; // skip cell if it's a wall

            if (!endX) {
                let f2 = board.data[x+1][y] // field 2
                let result = f2[3] ? 0 : checkEat(f, f2); // check if f2 is wall
                switch( result){
                    case 1 : 
                        next[x+1][y][0] = f[0]
                        break;
                    case -1:
                        next[x][y][0] = f2[0]
                        break;
                }

            }

            if (!endY) {
                let f2 = board.data[x][y+1] // field 2
                let result = f2[3] ? 0 : checkEat(f, f2); // check if f2 is wall
                switch( result){
                    case 1 : 
                        next[x][y+1][0] = f[0]
                        break;
                    case -1:
                        next[x][y][0] = f2[0]
                        break;
                }
            }

    }}

    for (let x=0; x<X; x++) {
        for (let y=0; y<Y; y++) {
            board.data[x][y][0] = next[x][y][0]
            if (Math.random() < mutation) { board.data[x][y][0] = (board.data[x][y][0]+Math.random()*5)%360 }
            if (Math.random() < mutation) { board.data[x][y][0] = (board.data[x][y][0]-Math.random()*5)%360 }
    }}
}

let rule = ['simple','minDifference'][1]; 

let checkEat = (f1, f2)=>{
    let d = (f2[0] - f1[0])%360

    switch (rule) {
        case 'minDifference':
            if ((d > D0 && d <= D) || (d > -360+D0 && d <= -360+D)) return 1;
            else if ((d < -D0 && d >= -D) || (d < 360-D0 && d >= 360-D)) return -1;
            else return 0;
            break;
        
        case 'simple':
            return d >0 ? 1 : -1;
            break
    }
    // if ((d > D0 && d <= D) || (d > -360+D0 && d <= -360+D)) { return 1 }
    // if ((d < -D0 && d >= -D) || (d < 360-D0 && d >= 360-D)) { return -1 }
    // return 0
    // if (d == 0 || ) { return 0}
    let result = d > 0 ? 1: -1
    let r = Math.random() <0.5 ? result : 0

    
    // if (Math.abs(d) < D0) {
    //     if (Math.random() < 0.1) { return r}
    // }

    if (Math.abs(d) > D) { 
       
        if (Math.random() < 0.1) { return r}
    }
    else {
        if (Math.random() > Math.abs(d)/D ) { return result}
        else { return r}
    }

    
}

let onClickStart = (e)=> {
    updating = !updating;
    e.target.innerText = updating ? 'Pause' : 'Start';
}

let onClickRestart = ()=>{
    location.reload();
}

var intervalId = window.setInterval(function(){
    // console.log('test')
    update()
    main()
  }, 100);