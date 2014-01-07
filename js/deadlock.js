Function.prototype.inherit = function( parentClassOrObject ){ 
	if ( parentClassOrObject.constructor == Function ) 
	{ 
		//Normal Inheritance 
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} 
	else 
	{ 
		//Pure Virtual Inheritance 
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	} 
	return this;
}
OS.resources =  new MemoryManager();
OS.processes = new MemoryManager();
var commands = new OS();

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
			$(this).attr('disabled', 'disabled');            
        }else if(bn.hasClass('kill')){
            var id = prompt('Enter the name of the '+type);
            if(type == 'process'){	
				var exists = commands.processExists(id);					
                if(exists.bool){
                    commands.kill_process(id, exists.location);
                }
            }else{
				var exists = commands.resourceExists(id);
                if(exists.bool){
                    commands.kill_resource(id, exists.location);
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
			$(this).attr('disabled', 'disabled');
        }
    }
});
$('#os_play').click(function(e){
   	console.log('start');
	var scheduler = new Scheduler(commands.get_processes(false), commands.get_resources(false));
	scheduler.ready_queue();
	scheduler.run('self', 0);
});
$('#os_save_session').click(function(e) {
    commands.save_session();
});
$('#os_restore_session').click(function(e) {
    commands.restore_session();
});
$('#prodis').submit(function(e){
    var su = $(this);
    var pid = this['process'].value;
    var rid = this['resource'].value;
	var process = commands.getProcess(pid);
    if(commands.resourceExists(rid).bool && process != false){
        process.removeResource(rid);
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
    if(commands.resourceExists(rid).bool && commands.processExists(pid).bool){
        commands.release_resource(rid, pid, true);
    }
    this['process'].value = '';
    this['resource'].value = '';
    su.hide();
    return false;
});
function MemoryManager(){
	this.stack = [];
	var str_addr = 0;
	this.nextAvailabeLocation = function(location){
		if(this.stack.length == 0){
			return -1;	
		}
		if(this.stack.indexOf(null) == -1){
			return -1;	
		}
		if(stack[location] != null && location < this.stack.length){
			return location;	
		}else if(location == this.stack.length){
			return this.nextAvailabeLocation(0)
		}
		return this.nextAvailabeLocation(current_location + 1);
	}	
	this.LIFO = function(value){
		var last = this.stack.pop();
		this.stack.push(value);
		return last;
	}	
	this.addToMemory = function(obj, placement_policy){
		switch(placement_policy){
			case 'first':
				this.firstFit(obj);
				break;
			default:
				console.log('No vaild placement policy stated, thus the default was used');
				this.firstFit(obj);
				break;	
		}
	}	
	this.firstFit = function(obj){
		var location = this.nextAvailabeLocation(str_addr);
		if(location != -1){
			this.stack[location] = obj;
		}else{
			this.stack.push(obj);	
		}		
	}
}

function OS(){
	var cmdp = 0;
	var processes = OS.processes;
	var resources = OS.resources;	
    var arrows = [];
    
    this.create = function(type, name){
        if(type === 'process'){
            processes.addToMemory((new Process(name, processes.stack.length)), 'first');	
        }else{
			var units = prompt('Enter Number of units');
			if(isNaN(units)){
				units = 1;
			}
            resources.addToMemory((new Resource(name, resources.stack.length, units)), 'first');
        }
    }    
	
	this.save_session = function(){
		if(typeof(Storage)!=="undefined") {
		  localStorage.processes = JSON.stringify(processes);
		  localStorage.resources = JSON.stringify(resources);
		  localStorage.process_num = Process.number;
		  localStorage.resource_num = Resource.number;
		  localStorage.pcords = Process.cords;
		  localStorage.rtop = Resource.top;
		 // document.getElementById("result").innerHTML="Last name: " + localStorage.lastname;
		}else{
		 // document.getElementById("result").innerHTML="Sorry, your browser does not support web storage...";
		}
	}
	
	this.get_processes = function(format){
		return processes;
	}
	
	this.get_resources = function(format){
		return resources;
	}
	
	this.restore_session = function(){
		if(typeof(Storage)!=="undefined") {
			Process.number = localStorage.process_num;
			Resource.number = localStorage.resource_num;
			var pobj = JSON.parse(localStorage.processes);
			this.restore_processes(pobj);
			var robj = JSON.parse(localStorage.resources);	
			console.log(robj.stack[0].id);
			this.restore_resources(robj);
			Process.cords = localStorage.pcords;
			Resource.top = localStorage.rtop;
			this.redraw_processes();
			this.redraw_resources();
		}			
	}
	
	this.restore_processes = function(obj){
		for(x in obj.stack){
			processes.addToMemory(((new Process(obj.stack[x].id, obj.stack[x].location)).restore_state(obj.stack[x])), 'first');
		}
	}
	
	this.restore_resources = function(obj){
		for(x in obj.stack){
            resources.addToMemory((new Resource(obj.stack[x].id, obj.stack[x].location, obj.stack[x].units).restore_state(obj.stack[x])), 'first');
		}
	}		
    
	this.error = function(where, message){
        $(where).prepend('<div class="err">'+message+'</div>');
        setTimeout(function(e){
            $('.err').remove();
        }, 5000);
    }
    
     this.resourceExists = function(resource_id){ 
        for(var x in resources.stack){
            if(resources.stack[x] != null && resources.stack[x].id === resource_id){
                return {bool : true, location : x};   
            }
        }
        console.log('Resource '+resource_id+' does not exist\nYou can create a process by using resource -c [resource_name]');
        return {bool : false};
    }
    
    this.processExists = function(process_id){
		for(var x in processes.stack){
            if(processes.stack[x] != null && processes.stack[x].id === process_id){
                return {bool : true, location : x};   
            }
        }
        console.log('Process '+process_id+' does not exist');
        return {bool : false};
    }    
    
    this.getItemByCords = function(x, y){
        for(var i in processes.stack){
			if(processes.stack[i] != null){
				var item = processes.stack[i];
				console.log('o: '+item.cords.x+' | '+item.cords.y+' m: '+x+' | '+y);
				if((item.cords.x + item.dimensions.width) > x && (item.cords.x - item.dimensions.width) < x && (item.cords.y + item.dimensions.width) > y && (item.cords.y - item.dimensions.width) < y){
					return {type : 'process', id : item.id};
				}
			}
        }
        for(var i in resources.stack){
			if(resources.stack[i] != null){
				var item = resources.stack[i];
				console.log('o: '+item.cords.x+' | '+item.cords.y+' m: '+x+' | '+y);
				if(item.cords.x <= x && (item.cords.x + item.dimensions.width) > x && item.cords.y <= y && (item.cords.y + item.dimensions.height) > y){
					return {type : 'resource', id : item.id};
				}
			}
        }
        return false;
    }   
    
    this.getResource = function(resource_id){
		var exists = this.resourceExists(resource_id);
		if(exists.bool){
			return resources.stack[exists.location]; 	
		}
        console.log('Resource '+resource_id+' does not exist\nYou can create a process by using resource -c [resource_name]');
        return exists.bool;
    }
    
    this.getProcess = function(process_id){
		var exists = this.processExists(process_id);
		if(exists.bool){
			return processes.stack[exists.location];  
        }
        console.log('Process '+process_id+' does not exist\nYou can create a process by using process -c [process_name]');
        return false;
    }
	
	this.giveResource = function(process, resource){
		process.useResource(resource.id, resource.location);
		process.stopRequesting(resource.id);
		resource.dequeue(process.id);
		resource.assignProcess(process.id, process.location);	
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
        if(resource != false && process != false){
            var r_cords = resource.cords;   
            var r_dimensions = resource.dimensions; 
            var p_cords = process.cords;   
            var p_dimensions = process.dimensions;
            ctx.beginPath();
            ctx.lineWidth = 3; 
            if(from.type == 'process' && !resource.reachMaxRequestLimit(process.id)){
                if(r_cords.x > p_cords.x ){
                    arrow = new Arrow((p_cords.x + p_dimensions.width), (p_cords.y + (p_dimensions.height * 0.5)), r_cords.x, (r_cords.y + (r_dimensions.height * resource.toSpot.left)), 5);
                    resource.toSpot.left += (resource.toSpot.left == 0.9)? (-0.75): 0.15;
                }else{
                    arrow = new Arrow((p_cords.x), (p_cords.y + (p_dimensions.height * 0.5)), (r_cords.x + r_dimensions.width), (r_cords.y + (r_dimensions.height * resource.toSpot.right)), 5);
                    resource.toSpot.right += (resource.toSpot.right == 0.9)? (-0.75)  : 0.15;
                }
                arrow.draw();
                process.requestResource(resource.id, resource.location, arrow);  
				resource.queueProcess(process.id, process.location);
            }else if(!resource.reachLimit() && from.type == 'resource'){   
                if(r_cords.x < p_cords.x){
                    arrow = new Arrow((r_cords.x + r_dimensions.width * 0.75), (r_cords.y + (r_dimensions.height * resource.fromSpot.right)), (p_cords.x), (p_cords.y + (p_dimensions.height * 0.6)), 5);
                    resource.fromSpot.right += (resource.fromSpot.right == 0.75)? (-0.5): 0.5;
                }else{                    
                    arrow = new Arrow((r_cords.x + r_dimensions.width * 0.25), (r_cords.y + (r_dimensions.height * resource.fromSpot.left)), (p_cords.x + p_dimensions.width * 0.5), (p_cords.y + (p_dimensions.height * 0.5)), 5);
                    resource.fromSpot.left += (resource.fromSpot.left == 0.75)? (-0.5): 0.5;
                }
                arrow.draw();
                resource.assignProcess(process.id, process.location, arrow);  
				process.useResource(resource.id, resource.location);
            }
        }
    }
    
    this.release_resource = function(resource_id, process_id, do_pointer){
        var resource = this.getResource(resource_id);
        resource.removeProcess(process_id);
        var process = this.getProcess(process_id);
		if(do_pointer == true){
        this.map({type : 'process', id: process_id}, {type : 'resource', id: resource_id});
		}
        Canvas.clear();
        this.redraw_processes();
        this.redraw_resources();
    }
    
    this.kill_process = function(process_id, memory_location){
		console.log(processes.stack);
		console.log(memory_location);
		if(processes.stack[memory_location].id === process_id){
			Canvas.clear();
			processes.stack[memory_location].die();
			processes.stack[memory_location] = null;	
			this.remove_process(process_id);
			this.redraw_processes();
			this.redraw_resources();
		}	
        console.log('Process '+process_id+' removed');
	}	
	
	this.remove_process = function(process_id){
		for(var x in resources.stack){
			if(resources.stack[x] != null){
            	resources.stack[x].removeProcess(process_id);
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
		for(var x in processes.stack){
			if(processes.stack[x] != null){
				processes.stack[x].removeResource(resource_id);
				processes.stack[x].stopRequesting(resource_id);
			}
		}       
	}
	
	this.kill_resource = function(resource_id, memory_location){
		if(resources.stack[memory_location].id === resource_id){
			Canvas.clear();
			resources.stack[memory_location].die();
			resources.stack[memory_location] = null;	
			this.remove_resource(resource_id);
			this.redraw_processes();
			this.redraw_resources();
		}
        console.log('Resource '+resource_id+' removed');
	}
        
    this.redraw_processes = function(){
        for(x in processes.stack){
			if(processes.stack[x] != null){
				processes.stack[x].die();
				processes.stack[x].draw();
				for(var i = 0; i < processes.stack[x].resources.requesting.length; i++){
						processes.stack[x].resources.requesting[i].pointer.draw();
					
				}
			}
        }
    }
    
    this.redraw_resources = function(){
        for(var x = 0; x < resources.stack.length; x++){
			if(resources.stack[x] != null){
				resources.stack[x].die();
				resources.stack[x].draw();
				for(var i = 0; i < resources.stack[x].processes.assign.length; i++){
						resources.stack[x].processes.assign[i].pointer.draw();
					
				}
			}
        }
    }
}

function Scheduler(){
	var state = {blocked : [], ready : [], complete : [], running : null};
	var resources = OS.resources;
	var processes = OS.processes;
	this.ready_queue = function(){
		var stack = OS.processes.stack;
		for(x in stack){
			if(stack[x] != null){
				state.ready.push(stack[x]);	
			}
		}
	}	
	this.execute = function(obj){
		obj.changeState(1);
		state.running = obj;
		console.log('exe');
		console.log(state);
		this.exit_queue()
	}	
	this.exit_queue = function(){
		var obj = state.running;
		var res;		
		while(obj.resources.has.length != 0){
			var id = obj.resources.has[0].id;
			console.log('removing resource '+id);
			console.log(id);
			res = this.getResource(id);
			res.changeState(1);
			this.draw_path(obj, res);
			res.removeProcess(obj.id);
			obj.removeResource(id);
			res.changeState(0);
			state.complete.push(res);
		}		
		obj.changeState(3);	
		state.complete.push(obj);
		console.log('exi');
		console.log(state);
		state.running = null;
	}	
	this.draw_path = function(process, resource){		
		for(var i = 0; i < resource.processes.assign.length; i++){
			if(resource.processes.assign[i].id == process.id){
				console.log(resource.processes);
				//resource.processes.assign[i].pointer.draw();		
				break;
			}
		}	
	}	
	this.block = function(obj){
		obj.changeState(2);
		state.blocked.push(obj);	
		console.log('blo');
		console.log(state);
	}	
	this.isWaiting = function(){
		return state.blocked.length != 0;
	}
	
	this.isBlocked = function(process_id){
		for(x in state.blocked){
			if(state.blocked[x].id == process_id){
				return true;	
			}
		}
		return false;
	}
	
	this.isReady = function(){
		return state.ready.length != 0;
	}
	
	this.nextReady = function(){
		return state.ready.shift();		
	}
	
	this.addToReady = function(value){
		state.ready.push(value);
	}
	
	this.unblock = function(){
		var pr = state.blocked.pop();
		pr.changeState(0);
		this.addToReady(pr);
		return pr;
	}
	
	this.hold = function(resource){
		resource.changeState(2);	
	}
	
	
	
	 this.getProcessFromReadyQueue = function(process_id){
		for(x in state.ready){
			if(state.ready[x].id == process_id){
				return state.ready.splice(x, 1);  
			}
		}
		return false;
    }
	
	this.run = function(obj, calling){
		if(!this.isReady() && !this.isWaiting()){
			return;	
		}
		if(obj == 'self'){
			obj = this.nextReady();
		}
		console.log(obj);
		if(obj.constructor == Process){
				console.log('decide');	
			if(obj.hasAllResources()){
				console.log('run');	
				this.execute(obj);				
				if(this.isWaiting()){ return this.run(this.unblock(), 0); }
				console.log('check qq');
				if(!this.isReady()){ return;}
				console.log(state.ready.length);
				return this.run('self', 0);
			}else{
				console.log('check q23');
				this.block(obj);
				var resid = obj.resources.requesting[calling].id;
				console.log(resid);
				var resource = this.getResource(resid);
				return this.run(resource, calling + 1);	
			}
			
		}
		
		if(obj.constructor == Resource){
			var process;
			obj.changeState(2);
			if(!obj.reachLimit()){
				process = this.unblock();
				console.log('ready '+obj.id);	
				console.log(' before ready '+obj.id);	
				console.log(process);	
				//this.giveResource(process, obj);
				process.stopRequesting(obj.id);
				process.useResource(obj.id, obj.location);
				obj.dequeue(process.id);
				obj.assignProcess(process.id, process.location);	
				console.log('after ready '+obj.id);	
				console.log(process);
				return this.run(process, calling - 1);	
			}
			var proc = obj.processes.assign;
			for(var x = 0; x < proc.length; x++){
				if(!this.isBlocked(proc[x].id)){
					console.log(proc[x]);
					process = this.getProcessFromReadyQueue(proc[x].id);
					console.log(process);
					console.log('resource process');
					if(process != false){
						return this.run(process[0], 0);
					}
					if(this.isWaiting()){
						process = this.unblock();
						return this.run(process, calling);	
					}
					return ;
				}
			}	
		}				
	}		
}

function Process(process_id, memory_location){
	this.elem;
    this.id = process_id;
	this.state = {id : 0, indicator : 'blue', abbr : 'RE'};
    this.resources = {has : [], requesting : []};
	this.cords = {x : Process.cords[0][0], y : Process.cords[0][1]};
    this.dimensions = {width: 30, height: 0};
	this.location = memory_location;
    
	console.log('Process '+this.id+' was created');
    
    this.requestResource = function(resource_id, memory_location, pointer){
        if(!this.isRequesting(resource_id).bool){
            this.resources.requesting.push({id: resource_id, type: 'resource', location: memory_location, pointer: pointer});
            console.log('Process '+this.id+' has requested resource '+resource_id);
        }
    }
	
	this.hasAllResources = function(){
		return (this.resources.requesting == 0)? true : false;
	}
	
	
	
	this.restore_state = function(state){
		this.elem = state.elem;
		this.units = state.units;
		this.resources = state.processes;
		this.location = state.location;	
		this.state = state.state;	
		this.id = state.id;	
	}
	
	this.useResource = function(resource_id, memory_location){
		this.resources.has.push({id : resource_id, type: 'resource', location: memory_location});
		console.log(this.resources.has);
	}
	
	this.changeState = function(state){
		switch(state){
			case 0:
				this.state.id = 0;
				this.state.indicator = 'blue';
				this.state.abbr = 'RE';
				break;
			case 1:
				this.state.id = 1;
				this.state.indicator = 'green';
				this.state.abbr = 'RN';
				break;
			case 2:
				this.state.id = 2;
				this.state.indicator = 'orange';
				this.state.abbr = 'HW';
				break;
			case 3:
				this.state.id = 3;
				this.state.indicator = 'gray';
				this.state.abbr = 'FN';
				break;
			default:
				this.state.id = 0;
				this.state.indicator = 'blue';
				this.state.abbr = 'RE';
				break;				
		}
		console.log(this.elem.color);
		this.draw();
	}
	
	this.removeResource = function(resource_id){        
        var hexists = this.hasResource(resource_id);   
        if(hexists.bool){      
            this.resources.has.splice(hexists.position, 1);
            console.log('Resource '+resource_id+' was removed from process '+this.id);
        }	
	}
	
	this.stopRequesting = function(resource_id){
		console.log(this.resources.requesting);
        var rexists = this.isRequesting(resource_id);		
        if(rexists.bool){      
            this.resources.requesting.splice(rexists.position, 1);
            console.log('Resource '+resource_id+' was removed from process '+this.id);
        }	
	}
    
	this.hasResource = function(resource_id){
        for(x in this.resources.has){
            if(this.resources.has[x].id == resource_id){
				console.log(this.resources.has);
                return {bool: true, position : x, memory_location : this.resources.has[x].location};
            }
        }
        return {bool : false};		
	}
	
    this.isRequesting = function(resource_id){
        for(x in this.resources.requesting){
            if(this.resources.requesting[x].id == resource_id){
                return {bool: true, position : x, memory_location : this.resources.requesting[x].location};
            }
        }
        return {bool : false};
    } 
	
    this.die = function(){
        this.elem.clear_circle();
        Process.cords.unshift([this.cords.x, this.cords.y]);
        console.log('P'+this.id+' was destroyed');        
    }
	
	this.draw = function(){
        this.elem = new Arc(this.cords.x, this.cords.y, this.dimensions.width);
        this.elem.start;
        this.elem.draw_circle(this.state.indicator);
        this.elem.add_text(this.id, 18, 'white');
		this.elem.offset.y = this.dimensions.width * 0.8;
		this.elem.add_text(this.state.abbr, 12, 'white'); 
        this.elem.end;
		Process.cords.shift();
        console.log('create process diagram');
        
	}
	this.draw();	
}
function Resource(resource_id, memory_location, units){
	this.backup_state = [];
	this.elem;
	this.units = units;
	this.state = {id : 0, indicator : 'red', abbr : 'RE'};
	this.id = resource_id;
	this.processes = {queue : [], assign : []};	
	this.cords = {x: 400, y: Resource.top[0]};
    this.dimensions = {width: 80, height: 80};
    this.fromSpot = {left : 0.25, right : 0.25};
    this.toSpot = {left : 0.15, right : 0.15};
	this.location = memory_location;
	console.log('Resource '+this.id+' was created');
		
    this.assignProcess = function(process_id, memory_location, pointer){
        if(!this.reachLimit().bool){        
            this.processes.assign.push({id : process_id, type : 'process', location : memory_location, pointer : pointer});
            console.log(this.processes);
        }
	}
	
	this.backup_state = function(){
		this.backup_state.push({elem : this.elem, units : this.units, prcoesses : this.processes, location : this.location});
	}
	
	this.restore_state = function(state){
		if(state == 'self'){
			var state = this.backup_state.pop();
		}
		this.elem = state.elem;
		this.units = state.units;
		this.processes = state.processes;
		this.location = state.location;			
	}
	
	this.queueProcess = function(process_id, memory_location){
		console.log('dok');
		if(!this.reachMaxRequestLimit(process_id)){
		console.log('dok');
			this.processes.queue.push({id : process_id, type: 'process', location : memory_location});
		}
	}
	
	this.isAssignedTo = function(process_id){
        for(var x = 0; x < this.processes.assign.length; x++){
            if(this.processes.assign[x].id == process_id){
                return {bool: true, position : x, memory_location : this.processes.assign[x].location};				
            }
        }
        return {bool : false};		
	}
	
	this.isRequestedBy = function(process_id){
        for(var x = 0; x < this.processes.queue.length; x++){
            if(this.processes.queue[x].id == process_id){
                return {bool: true, position : x, memory_location : this.processes.queue[x].location};
            }
        }
        return {bool : false};				
	}
		
	this.removeProcess = function(process_id){
        var exists = this.isAssignedTo(process_id);
        if(exists.bool){      
            this.processes.assign.splice(exists.position, 1);
        }
	}
	
	this.dequeue = function(process_id){
		var exists = this.isRequestedBy(process_id);
		if(exists.bool){
			this.processes.queue.splice(exists.position, 1);
		}
	}
	
    this.reachLimit = function(){
        console.log('units : '+this.units+' processes: a '+this.processes.assign.length);
        return this.units == this.processes.assign.length;
    }
	
	this.reachMaxRequestLimit = function(process_id){
		return (this.units == (this.processOccurrence(this.processes.queue, process_id) + this.processOccurrence(this.processes.assign, process_id)));
	}
	
	this.processOccurrence = function(stack, process_id){
		var count = 0;
		for(x in stack){
			if(stack[x].id == process_id){
				count ++;
			}
		}
        console.log('occurrence for c '+process_id+' : '+count);
		return count;
	}
	
	this.changeState = function(state){
		switch(state){
			case 0:
				this.state.id = 0;
				this.state.indicator = 'red';
				this.state.abbr = 'RE';
				break;
			case 1:
				this.state.id = 1;
				this.state.indicator = 'green';
				this.state.abbr = 'RN';
				break;
			case 2:
				this.state.id = 2;
				this.state.indicator = 'orange';
				this.state.abbr = 'HW';
				break;
			default:
				this.state.id = 0;
				this.state.indicator = 'red';
				this.state.abbr = 'RE';
				break;				
		}
		console.log(this.elem.color);
		this.draw();
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
        this.elem.draw_rect(this.state.indicator);
        this.elem.add_text(this.id, 18, 'white');
		this.elem.offset.y = this.dimensions.height * 0.9;
		this.elem.add_text(this.state.abbr, 12, 'white');
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
	this.color;
    
    this.draw_rect = function(color){
        if(this.fill){
			this.color = color;
            ctx.fillStyle = this.color;
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
	this.color;
    
    this.draw_circle = function(color){        
        ctx.beginPath();
		this.color = color;
        ctx.fillStyle = this.color;
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
Scheduler.inherit(OS);

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