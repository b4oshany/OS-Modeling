var commands = new Command();
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
$('.bn').click(function(e){
    var bn =  $(this);
    var type = (bn.hasClass('bn_process'))? 'process': (bn.hasClass('bn_resource'))? 'resource': false;
    $('#prodis').hide();
    $('#resrel').hide();
    if(type != false){
        if(bn.hasClass('create')){
            if(type == 'process' && Process.cords.length != 0){
                commands.create(type, 'P'+Process.number);
                Process.number++;    
            }else if(type == 'resource' && Resource.top.length != 0){
                commands.create(type, 'R'+Resource.number);
                Resource.number++;
            }
        }else if(bn.hasClass('request')){
            Canvas.mouseMoveEvent(commands, 'process','resource');
            
        }else if(bn.hasClass('kill')){
            var name = prompt('Enter the name of the '+type);
            if(type == 'process'){						
                if(commands.processExists(name)){
                    commands.kill_process(name);
                }
            }else{
                if(commands.resourceExists(name)){
                    commands.kill_resource(name);
                }
            }
            
        }else if(bn.hasClass('release')){
            if(type == 'process'){
                 $('#prodis').toggle();
            }else{
                 $('#resrel').toggle();                
            }            
        }else if(bn.hasClass('assign')){  
            Canvas.mouseMoveEvent(commands, 'resource', 'process');
        }
    }
});


$('#prodis').submit(function(e){
    var su = $(this);
    var pid = this['process'].value;
    var rid = this['resource'].value;
    if(commands.resourceExists(rid) && commands.processExists(pid)){
        commands.getProcess(pid).removeResource(rid);
        Canvas.clear();
        commands.redraw_processes();
        commands.redraw_resources();
    }
    this['process'].value = '';
    this['resource'].value = '';
    su.hide();
    return false;
});

$('#resrel').submit(function(e){
    var su = $(this);
    var pid = this['process'].value;
    var rid = this['resource'].value;
    if(commands.resourceExists(rid) && commands.processExists(pid)){
        commands.release_resource(rid, pid);
    }
    this['process'].value = '';
    this['resource'].value = '';
    su.hide();
    return false;
});

function Command(){
    var cmduser = [];
	var cmdp = 0;
	var processes = [];
	var resources = [];	
    var arrows = [];
    
    this.create = function(type, name){
        if(type === 'process'){
            processes.push((new Process(name)));	
        }else{
            resources.push((new Resource(name)));	
        console.log(resources);
        }
    }    
    
    this.error = function(where, message){
        $(where).prepend('<div class="err">'+message+'</div>');
        setTimeout(function(e){
            $('.err').remove();
        }, 5000);
    }
    
     this.resourceExists = function(resource_id){       
        for(var x in resources){
            if(resources[x].id === resource_id){
                return true;   
            }
        }
        console.log('Resource '+resource_id+' does not exist\nYou can create a process by using resource -c [resource_name]');
        return false;
    }
    
    this.processExists = function(process_id){
		for(var x in processes){
            if(processes[x].id === process_id){
                return true;   
            }
        }
        console.log('Process '+process_id+' does not exist');
        return false;
    }    
    
    this.getItemByCords = function(x, y){
        for(var i in processes){
            var item = processes[i];
            console.log('o: '+item.cords.x+' | '+item.cords.y+' m: '+x+' | '+y);
            if((item.cords.x + item.dimensions.width) > x && (item.cords.x - item.dimensions.width) < x && (item.cords.y + item.dimensions.width) > y && (item.cords.y - item.dimensions.width) < y){
                return {type : 'process', id : item.id};
            }
        }
        for(var i in resources){
            var item = resources[i];
            console.log('o: '+item.cords.x+' | '+item.cords.y+' m: '+x+' | '+y);
            if(item.cords.x <= x && (item.cords.x + item.dimensions.width) > x && item.cords.y <= y && (item.cords.y + item.dimensions.height) > y){
                return {type : 'resource', id : item.id};
            }
        }
        return false;
    }   
    
    this.getResource = function(resource_id){
        for(var x in resources){
            if(resources[x].id === resource_id){
                return resources[x];   
            }
        }
        console.log('Resource '+resource_id+' does not exist\nYou can create a process by using resource -c [resource_name]');
        return false;
    }
    
    this.getProcess = function(process_id){
		for(var x in processes){
            if(processes[x].id === process_id){
                return processes[x];   
            }
        }
        console.log('Process '+process_id+' does not exist\nYou can create a process by using process -c [process_name]');
        return false;
    }
    
    this.map = function(from, to){
        if(from.type == 'process'){
            var resource = this.getResource(to.id);
            var process = this.getProcess(from.id);      
        }else{
            var resource = this.getResource(from.id);
            var process = this.getProcess(to.id);             
        }
        console.log('mapping '+from.id+' to '+to.id);
        var arrow;
        console.log(resource);
        if(resource != false && process != false && !resource.processExists(process.id).bool){
            var r_cords = resource.cords;   
            var r_dimensions = resource.dimensions; 
            var p_cords = process.cords;   
            var p_dimensions = process.dimensions;
        console.log('resource.processExists(process.id).bool');
            ctx.beginPath();
            ctx.lineWidth = 3; 
            if(from.type == 'process' && !process.resourceExists(resource.id).bool){
                if(r_cords.x > p_cords.x){
                    arrow = new Arrow((p_cords.x + p_dimensions.width), (p_cords.y + (p_dimensions.height * 0.5)), r_cords.x, (r_cords.y + (r_dimensions.height * resource.toSpot.left)), 5);
                    resource.toSpot.left += (resource.toSpot.left == 0.9)? (-0.75): 0.15;
                }else{
                    arrow = new Arrow((p_cords.x), (p_cords.y + (p_dimensions.height * 0.5)), (r_cords.x + r_dimensions.width), (r_cords.y + (r_dimensions.height * resource.toSpot.right)), 5);
                    resource.toSpot.right += (resource.toSpot.right == 0.9)? (-0.75)  : 0.15;
                }
                arrow.draw();
                process.addResource(resource.id, arrow);  
            }else if(!resource.reachLimit() && from.type == 'resource'){   
                if(r_cords.x < p_cords.x){
                    arrow = new Arrow((r_cords.x + r_dimensions.width * 0.75), (r_cords.y + (r_dimensions.height * resource.fromSpot.right)), (p_cords.x), (p_cords.y + (p_dimensions.height * 0.6)), 5);
                    resource.fromSpot.right += (resource.fromSpot.right == 0.75)? (-0.5): 0.5;
                }else{                    
                    arrow = new Arrow((r_cords.x + r_dimensions.width * 0.25), (r_cords.y + (r_dimensions.height * resource.fromSpot.left)), (p_cords.x + p_dimensions.width * 0.5), (p_cords.y + (p_dimensions.height * 0.5)), 5);
                    resource.fromSpot.left += (resource.fromSpot.left == 0.75)? (-0.5): 0.5;
                }
                arrow.draw();
                resource.addProcess(process.id, arrow);  
            }
        }
    }
    
    this.release_resource = function(resource_id, process_id){
        var resource = this.getResource(resource_id);
        resource.removeProcess(process_id);
        var process = this.getProcess(process_id);
        this.map({type : 'process', id: process_id}, {type : 'resource', id: resource_id});
        Canvas.clear();
        this.redraw_processes();
        this.redraw_resources();
    }
    
    this.kill_process = function(process_id){
		for(var x = 0; x < processes.length; x++){
			if(processes[x].id === process_id){
                Canvas.clear();
                processes[x].die();
				processes.splice(x,1);	
				this.remove_process(process_id);
                this.redraw_processes();
                this.redraw_resources();
                break;
            }
		}
        console.log('Process '+process_id+' removed');
	}	
	
	this.remove_process = function(process_id){
		for(var x in resources){
            resources[x].removeProcess(process_id);
		}    
	}
    
    this.arrowExists = function(arrow){
        for(var x in arrows){
            if((arrows[x].getAttribute('id')).indexOf(arrow) != -1){ 
                return x;
            }
        }
        return false;
    }
	
	this.remove_resource = function(resource_id){
		for(var x in processes){
            processes[x].removeResource(resource_id);
		}       
	}
	
	this.kill_resource = function(resource_id){
		for(var x = 0; x < resources.length; x++){
			if(resources[x].id === resource_id){
                Canvas.clear();
                resources[x].die();
                resources.splice(x,1);	
				this.remove_resource(resource_id);
                this.redraw_processes();
                this.redraw_resources();
			}
		}
        console.log('Resource '+resource_id+' removed');
	}
        
    this.redraw_processes = function(){
        for(x in processes){
            processes[x].die();
            processes[x].draw();
            for(var i = 0; i < processes[x].resources.length; i++){
                    processes[x].resources[i].pointer.draw();
                
            }
        }
    }
    
    this.redraw_resources = function(){
        for(var x = 0; x < resources.length; x++){
            resources[x].die();
            resources[x].draw();
            for(var i = 0; i < resources[x].processes.length; i++){
                    resources[x].processes[i].pointer.draw();
                
            }
        }
    }
}

function Process(process_id){
	this.elem;
    this.id = process_id;
    this.running = false;
    this.resources = [];
	this.cords = {x : Process.cords[0][0], y : Process.cords[0][1]};
    this.dimensions = {width: 30, height: 0};
    
	console.log('Process '+this.id+' was created');
    
    this.addResource = function(resource_id, pointer){
        if(!this.resourceExists(resource_id).bool){
            this.resources.push({id: resource_id, pointer: pointer});
            console.log('Process '+this.id+' has requested resource '+resource_id);
        }
    }
	
	this.removeResource = function(resource_id){        
        var exists = this.resourceExists(resource_id);
        if(exists.bool){      
            this.resources.splice(exists.position, 1);
            console.log('Resource '+resource_id+' was removed from process '+this.id);
        }
	}
    
    this.resourceExists = function(resource_id){
        for(x in this.resources){
            if(this.resources[x].id == resource_id){
                return {bool: true, position : x};
            }
        }
        return {bool : false};
    }
	
	this.removeLastResource = function(){
		var rid = this.resources.pop();
		console.log('Resource '+rid+' was removed from process '+this.id);
	}       
    
    this.die = function(){
        this.elem.clear_circle();
        Process.cords.unshift([this.cords.x, this.cords.y]);
        console.log('P'+this.id+' was destroyed');        
    }
	
	this.draw = function(){
        this.elem = new Arc(this.cords.x, this.cords.y, this.dimensions.width);
        this.elem.start;
        this.elem.draw_circle('blue');
        this.elem.add_text(this.id, 18, 'white');
        this.elem.end;
		Process.cords.shift();
        console.log('create process diagram');
        
	}
	this.draw();	
}

function Resource(resource_id){
	this.elem;
	var unit = 1;
	this.id = resource_id;
	this.processes = [];	
	this.cords = {x: 400, y: Resource.top[0]};
    this.dimensions = {width: 80, height: 80};
    this.fromSpot = {left : 0.25, right : 0.25};
    this.toSpot = {left : 0.15, right : 0.15};
	console.log('Resource '+this.id+' was created');
	
    this.addProcess = function(process_id, pointer){
        if(!this.processExists(process_id).bool && !this.reachLimit().bool){        
            this.processes.push({id : process_id, pointer : pointer});
            console.log(this.processes);
        }
	}
    
	this.removeProcess = function(process_id){
        var exists = this.processExists(process_id);
        if(exists.bool){      
            this.processes.splice(exists.position, 1);
        }
	}
	this.removeLastProces = function(){
		this.processes.pop();
	}
    this.reachLimit = function(){
        console.log('units : '+unit+' processes: '+this.processes.length);
        return (unit == this.processes.length)? true : false;
    }
    
    this.processExists = function(process_id){
        for(x in this.processes){
            if(this.processes[x].id == process_id){
                return {bool: true, position : x};
            }
        }
        return {bool : false};
    }
	
	this.die = function(){
        this.elem.clear_rect();
        console.log(this.cords.y);
        console.log(Resource.top);
		Resource.top.unshift(this.cords.y);
        console.log(Resource.top);
        console.log('R'+this.id+' was destroyed');
	}
	
	this.draw = function(){
        this.elem = new Rectangle(this.cords.x, this.cords.y, this.dimensions.width,  this.dimensions.height);
        this.elem.start;
        this.elem.draw_rect('red');
        this.elem.add_text(this.id, 18, 'white');
        this.elem.end;
        console.log(Resource.top);
		Resource.top.shift();
        console.log(Resource.top);
        console.log('create resource diagram');
	}
	this.draw();	
}

Resource.number = 1;
Resource.top = [0, 90, 180, 270, 360, 450];
Process.number = 1;
Process.cords = [[150, 100], [150, 180], [150,260], [150, 340], [150,420], [700, 100], [700, 180], [700,260], [700,340], [700,420]];


function Canvas(){    
    var looper;
    this.degrees = 0;
    this.text;
    this.dimensions = {};
    this.cords = {};
    this.offset = {x: 0, y: 0};
    this.fill = true;

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
Rectangle.prototype = new Canvas();

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
Arc.prototype = new Canvas();

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
Line.prototype = new Canvas();

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
Arrow.prototype = new Line();

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
        console.log(mouse.x);
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
        console.log(mouse.x);
        destination = obj.getItemByCords(mouse.x, mouse.y);
        console.log(destination);
        if(destination.type == to && enable){
            obj.map(source, destination);
        }
    });
}
