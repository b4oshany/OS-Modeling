// JavaScript Document

function Canvas(){    
    var looper;
    this.degrees = 0;
    this.text;
    this.dimensions = {};
    this.cords = {};
    this.offset = {x: 0, y: 0};
    this.fill = true;
	var ctx = Canvas.context;

    this.start = ctx.beginPath();
    this.end = ctx.closePath();
    
    this.add_text = function(text, size, color){
        ctx.fillStyle = color;
        ctx.font= size+"px Arial";  
        ctx.textAlign = 'center';
        ctx.fillText(text, this.cords.x + this.offset.x,  this.cords.y + this.offset.y);
    } 
    
    this.save_state = function(){
        ctx.save();
    }
    
    this.restore_state = function(){
        ctx.restore();
    }
    
}



Canvas.clear = function(){
    ctx.clearRect(0,0, ctx.canvas.width, ctx.canvas.height);
}

function Rectangle(x, y, width, height){
    this.cords = {x: x, y: y};
    this.dimensions = {width: width, height: height};
    this.offset = {x: 40, y: 50};
    
    this.draw_rect = function(color){
        if(this.fill){
            ctx.fillStyle = color;
            ctx.fillRect(this.cords.x, this.cords.y, this.dimensions.width, this.dimensions.height);
        }else{
            ctx.strokeRect(this.cords.x, this.cords.y, this.dimensions.width, this.dimensions.height);
        }         
    }
    
    this.clear_rect = function(){
        ctx.clearRect(this.cords.x, this.cords.y, this.dimensions.width, this.dimensions.height);
    }
}

function Arc(x, y, radius){
    this.radius = radius;
    this.cords = {x: x, y: y};
    var begin = 0;
    var stop = 2*Math.PI;
    this.clockwise = false;
    this.offset = {x :0, y: 0};
    
    this.draw_circle = function(color){        
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.cords.x, this.cords.y, this.radius, begin, stop);
        if(this.fill){
            ctx.fill();
        }
        ctx.closePath();
    }
    
    this.clear_circle = function(){
        ctx.clearRect(this.cords.x - this.radius, this.cords.y - this.radius, this.radius * 2, this.radius * 2);
    }
    
    this.draw_arc = function(stat, end, color){
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, this.radius, start, end, this.clockwise);
        if(this.fill){
            ctx.fill();
        }
    }   
}

function Line(){
    this.size = 1;
    this.cords = {start : {}, middle : [], end : {}};
    this.color = 'black';
    
    this.line_start = function(x, y){
        this.cords.start = {x : x, y : y};
        ctx.fillStyle = this.color;
        ctx.size = this.size;
        ctx.moveTo(x, y);
    }
    
    this.next_line = function(x, y){
        this.cords.middle.push({x : x, y : y});
        ctx.lineTo(x, y);
    }
    
    this.line_end = function(x, y){
        this.cords.end = {x : x, y : y};
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function Arrow(x1, y1, x2, y2, size){
    this.angle;    
    this.cords = {start : {x : x1, y : y1}, end : {x : x2, y : y2}};
    this.size = size;
    this.draw = function () {
        var angle = Math.atan2(this.cords.end.y-this.cords.start.y,this.cords.end.x-this.cords.start.x);
        angle = (angle / (2 * Math.PI)) * 360;
        ctx.beginPath();
        this.line_start(this.cords.start.x, this.cords.start.y);
        this.line_end(this.cords.end.x, this.cords.end.y);
        (new Arc(this.cords.end.x, this.cords.end.y, this.size)).draw_circle('black');   
        ctx.closePath();
     }
}


Rectangle.inherit(Canvas);
Arc.inherit(Canvas);
Line.inherit(Canvas);
Arrow.inherit(Line);

Canvas.mouseClickEvent = function(obj, fn){
    var mouse = {x : 0, y : 0};
    ctx.canvas.addEventListener('click', function(e){
        mouse.x = e.clientX - ctx.canvas.offsetLeft; 
        mouse.y = e.clientY - ctx.canvas.offsetTop;  
        fn;        
    });
}

Canvas.mouseMoveEvent = function (obj, from, to) {
    var mouse = {x : 0, y : 0};
    var last_mouse = {x : 0, y : 0};
    var source, destination;
    var enable = false;
    
    ctx.canvas.addEventListener('mousedown', function(e){
        last_mouse.x = mouse.x; 
        last_mouse.y = mouse.y;     
        source = obj.getItemByCords(last_mouse.x, last_mouse.y);
        console.log(source);
        if(source.type == from){
            enable = true;
        }            
    });                
    
    ctx.canvas.addEventListener('mousemove', function(e){
        mouse.x = e.clientX - ctx.canvas.offsetLeft; 
        mouse.y = e.clientY - ctx.canvas.offsetTop;  
    });
    
    ctx.canvas.addEventListener('mouseup', function(e){
        mouse.x = e.clientX - ctx.canvas.offsetLeft; 
        mouse.y = e.clientY - ctx.canvas.offsetTop; 
        destination = obj.getItemByCords(mouse.x, mouse.y);
        console.log(destination);
        if(destination.type == to && enable){
            obj.map(source, destination);
        }
    });
}