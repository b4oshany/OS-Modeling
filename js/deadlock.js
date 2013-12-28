var commands = new Command();
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
$('.bn').click(function(e){
    var bn =  $(this);
    var type = (bn.hasClass('bn_process'))? 'process': (bn.hasClass('bn_resource'))? 'resource': false;
    $('#proreq').hide();
    $('#resass').hide();
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
            Canvas.draw_arrow(commands, 'process','resource');
            
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
                 $('#proreq').toggle().addClass('release');
            }else{
                 $('#resass').toggle().addClass('release');                
            }            
        }else if(bn.hasClass('assign')){  
            Canvas.draw_arrow(commands, 'resource', 'process');
        }
    }
});


$('#proreq').submit(function(e){
    var su = $(this);
    var pid = this['process'].value;
    var rid = this['resource'].value;
    console.log(pid);
    if(su.hasClass('request')){
        if(commands.processExists(pid) && commands.resourceExists(rid)){
            commands.addProcessToResourcce(pid, rid);
            commands.addResourceToProcess(rid, pid);
            commands.mapProcessToResource(pid, rid);
        }
        su.removeClass('request');
    }else if(su.hasClass('release')){
        
        su.removeClass('release');
    }
    this['process'].value = '';
    this['resource'].value = '';
    su.hide();
    return false;
});

$('#resass').submit(function(e){
    var su = $(this);
    if(su.hasClass('assign')){
        
    }else if(su.hasClass('release')){
        
    }
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
    
    this.getResource = function(resource_id){
        for(var x in resources){
            if(resources[x].id === resource_id){
                return resources[x];   
            }
        }
        console.log('Resource '+resource_id+' does not exist\nYou can create a process by using resource -c [resource_name]');
        return false;
    }
    
    
    this.getItemByCords = function(x, y){
        for(var i in processes){
            var item = processes[i];
            console.log('o: '+item.cords[0]+' | '+item.cords[1]+' m: '+x+' | '+y);
            if((item.cords[0] + item.dimension[0]) > x && (item.cords[0] - item.dimension[0]) < x && (item.cords[1] + item.dimension[0]) > y && (item.cords[1] - item.dimension[0]) < y){
                return {type : 'process', id : item.id};
            }
        }
        for(var i in resources){
            var item = resources[i];
            console.log('o: '+item.cords[0]+' | '+item.cords[1]+' m: '+x+' | '+y);
            if(item.cords[0] <= x && (item.cords[0] + item.dimension[0]) > x && item.cords[1] <= y && (item.cords[1] + item.dimension[1]) > y){
                return {type : 'resource', id : item.id};
            }
        }
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
    
    
    this.addProcessToResourcce = function(process_id, resource_id){		
        var resource = this.getResource(resource_id);
        if(resource != false){
            resource.addProcess(process_id);	
        }else{
            console.log("\nAfterwards you can link them together by doing process -r {process_id]->[resource_id]");				
        }
	}
	
	this.addResourceToProcess = function(resource_id, process_id){	
        var process = this.getProcess(process_id);
        if(process != false){
            process.addResource(resource_id);	
        }else{
            console.log("\nAfterwards you can link them together by doing process -r {process_id]->[resource_id]");				
        }
	}
    
    this.mapProcessToResource = function(process, resource){   
        resource.addProcess(process.id);
        process.addResource(resource.id);
        console.log(arrows);
        if(resource != false && process != false){
            var r_cords = resource.cords;   
            var r_dimension = resource.dimension; 
            var p_cords = process.cords;   
            var p_dimension = process.dimension;
            ctx.beginPath();
            ctx.lineWidth = 3;
            //ctx.moveTo((p_cords[0] + p_dimension[0]), (p_cords[1] + (p_dimension[1] * 0.5)));
            //ctx.lineTo((r_cords[0] + r_dimension[0]*0.5), (r_cords[1] + (r_dimension[1] * 0.5)));
            Canvas.arrow((p_cords[0] + p_dimension[0]), (p_cords[1] + (p_dimension[1] * 0.5)), (r_cords[0] + r_dimension[0]*0.5), (r_cords[1] + (r_dimension[1] * 0.5)), 10);
            ctx.stroke();
            
            //console.log(this.arrowExists(process_id+'->'+resource_id));
            //if(this.arrowExists(process_id+'->'+resource_id) == false){
                arrows.push(process_id+'->'+resource_id);
            //}
        }
    }
    
    this.kill_process = function(process_id){
		for(var x = 0; x < processes.length; x++){
			if(processes[x].id === process_id){
                canvas.removeChild(processes[x].div);
				processes.splice(x,1);	
				this.remove_process(process_id);
			}
		}
        console.log('Process '+process_id+' removed');
	}	
	
	this.remove_process = function(process_id){
		for(var x in resources){
			if(resources[x].processes.indexOf(process_id) != -1){
				resources[x].processes.splice(resources[x].processes.indexOf(process_id), 1);
			}
		}    
        //console.log('removal attempt');
        //console.log(arrows);
        for(var x in arrows){
            //console.log(arrows[x]);
            if((arrows[x].getAttribute('id')).indexOf(process_id+'->') != -1 || (arrows[x].getAttribute('id')).indexOf(process_id+'<-') != -1){ 
                //console.log(arrows[x])
                canvas.removeChild(arrows[x]);   
                arrows.splice(x,1);
            }
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
			if(processes[x].resources.indexOf(resource_id) != -1){
				processes[x].resources.splice(processes[x].resources.indexOf(resource_id), 1);
			}
		}       
        for(var x in arrows){
            if(arrows[x].indexOf(resource_id+'->') != -1 || arrows[x].indexOf('->'+resource_id)){
               //e console.log(arrows[x]);
                canvas.removeChild(arrows[x]);
                arrows.splice(x,1);   
            }
        }
	}
	
	this.kill_resource = function(resource_id){
		for(var x = 0; x < resources.length; x++){
			if(resources[x].id === resource_id){
                canvas.removeChild(resources[x].div);
				resources.splice(x,1);	
				this.remove_resource(resource_id);
			}
		}
        console.log('Resource '+process_id+' removed');
	}
    
}

function Process(process_id){
	this.elem;
    this.id = process_id;
    this.running = false;
    this.resources = [];
	this.cords = [Process.cords[0][0], Process.cords[0][1]];
    this.dimension = [30, 0];
	console.log('Process '+this.id+' was created');
    this.addResource = function(resource_id){
        this.resources.push(resource_id);
		console.log('Process '+this.id+' has requested resource '+resource_id);
    }
	
	this.removeResource = function(resource_id){
		var index = resources.indexOf(resource_id);
		this.resources.splice(index, 1);
		console.log('Resource '+resource_id+' was removed from process '+this.id);
	}
	
	this.removeLastResource = function(){
		var rid = this.resource.pop();
		console.log('Resource '+rid+' was removed from process '+this.id);
	}       
	
	this.draw = function(){
        this.elem = new Arc(this.cords[0], this.cords[1], this.dimension[0]);
        this.elem.start;
        this.elem.draw_circle('blue');
        this.elem.add_text(this.id, 18, 'white');
        this.elem.end;
		Process.cords.splice(0,1);
        console.log('create process diagram');
        
	}
	this.draw();	
}

function Resource(resource_id){
	this.elem;
	this.unit = 1;
	this.id = resource_id;
	this.processes = [];	
	this.cords = [400, Resource.top[0]];
    this.dimension = [80, 80];
	console.log('Resource '+this.id+' was created');
	this.addProcess = function(process_id){
		this.processes.push(process_id);
	}
	this.removeProcess = function(process_id){
		var index = this.processes.indexOf(process_id);
		this.processes.splice(index, 1);
	}
	this.removeLastProces = function(){
		this.processes.pop();
	}
	
	this.draw = function(){
        this.elem = new Rectangle(this.cords[0], this.cords[1], this.dimension[0], this.dimension[1]);
        this.elem.start;
        this.elem.draw_rect('red');
        this.elem.add_text(this.id, 18, 'white');
        this.elem.end;
		Resource.top.splice(0,1);
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
    this.dimension = [];
    this.cords = [];
    this.offset = [0,0];
    this.fill = true;

    this.start = ctx.beginPath();
    this.end = ctx.closePath();
    
    this.add_text = function(text, size, color){
        ctx.fillStyle = color;
        ctx.font= size+"px Arial";  
        ctx.textAlign = 'center';
        ctx.fillText(text, this.cords[0] + this.offset[0], this.cords[1] + this.offset[1]);
    } 
}

function Rectangle(x, y, width, height){
    this.cords = [x, y];
    this.dimension = [width, height];
    this.offset = [40, 50];
    
    this.draw_rect = function(color){
        this.cords = [x, y];
        this.dimension = [width, height];
        if(this.fill){
            ctx.fillStyle = color;
            ctx.fillRect(x, y, width, height);
        }else{
            ctx.strokeRect(this.cords[0], this.cords[1], this.dimension[0], this.dimension[1]);
        }         
    }
}
Rectangle.prototype = new Canvas();

function Arc(x, y, radius){
    this.radius = radius;
    this.cords = [x, y];
    var begin = 0;
    var stop = 2*Math.PI;
    this.clockwise = false;
    this.offset = [0,0];
    
    this.draw_circle = function(color){        
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(this.cords[0], this.cords[1], this.radius, begin, stop);
        ctx.stroke();
        if(this.fill){
            ctx.fill();
        }
        ctx.closePath();
    }     
    
    this.draw_arc = function(stat, end, color){
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, this.radius, start, end, this.clockwise);
        ctx.stroke();
        if(this.fill){
            ctx.fill();
        }
    }   
}
Arc.prototype = new Canvas();

function Line(){
    this.size = 1;
    this.cords;
    this.destination;
    this.color = 'black';
    
    this.line_start = function(x, y){
        this.cords = {x : x, y : y};
        ctx.fillStyle = this.color;
        ctx.size = this.size;
        ctx.moveTo(x, y);
    }
    
    this.line_end = function(x, y){
        this.destination = {x : x, y : y};
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}
Line.prototype = new Canvas();

Canvas.arrow = function (x1, y1, x2, y2, size) {
    var angle = Math.atan2(x1-x2,y2-y1);
    //angle = (angle / (2 * Math.PI)) * 360;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    ctx.moveTo(x2, y2 - size*0.5);
    ctx.lineTo(x2, y2 + size*0.5);
    ctx.lineTo(x2+size, y2);
    ctx.fill();
    ctx.closePath();    
 }


Canvas.draw_arrow = function (obj, from, to) {
    var mouse = {x : 0, y : 0};
    var last_mouse = {x : 0, y : 0};
    var arrow = new Line();
    var source, destination;
    var enable = false;
    ctx.canvas.addEventListener('mousedown', function(e){
        last_mouse.x = mouse.x; 
        last_mouse.y = mouse.y;      
        console.log(mouse.x);
        source = commands.getItemByCords(last_mouse.x, last_mouse.y);
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
        destination = commands.getItemByCords(mouse.x, mouse.y);
        console.log(destination);
        if(destination.type == to && enable){
            commands.mapProcessToResource(source.id, destination.id);
        }
    });
}
