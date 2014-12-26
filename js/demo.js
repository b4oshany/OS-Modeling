var c=document.getElementById("myCanvas");
var ctx=c.getContext("2d");

var ga = ctx.createLinearGradient(5, 5, 100, 0);
ga.addColorStop(0, 'magenta');
ga.addColorStop(0.5, 'yellow');
ga.addColorStop(1, 'black');
ctx.fillStyle = ga;
ctx.strokeStyle = 'red';
ctx.fillRect(5,5,100,100);
ctx.lineWidth = 5;
ctx.strokeRect(5,5,100,100);

var gb = ctx.createRadialGradient(150, 50, 5, 150, 50, 50);
gb.addColorStop(0, 'magenta');
gb.addColorStop(1, 'black');
ctx.fillStyle = gb;
ctx.strokeStyle = 'red';
ctx.fillRect(100,5,100,100);
ctx.strokeRect(100,5,100,100);