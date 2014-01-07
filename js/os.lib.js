
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
	var processes = new MemoryManager();
	var resources = new MemoryManager();	
    var arrows = [];
    
    this.create = function(type, name){
        if(type === 'process'){
            processes.addToMemory((new Process(name, processes.stack.length)), 'first');	
        }else{
			var units = prompt('Enter Number of units');
			if(units == null){
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
	 console.log(resources);      
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

function Scheduler(processes, resources){
	var state = {blocked : [], ready : [], complete : [], running : null};
	var processes = processes;
	var resources = resources;	
	this.ready_queue = function(){
		state.ready = processes.stack;	
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
		obj.changeState(3);	
		state.complete.push(obj);
		console.log(resources);
		for(x in obj.resources.has){
			var id = obj.resources.has[x].id;
			console.log(this.getResource(id));
			state.complete.push(this.getResource(id));
			this.release_resource(id, obj.id, false);
		}
		console.log('exi');
		console.log(state);
		state.running = null;
	}
	
	this.block = function(obj){
		state.blocked.push(obj);	
		console.log('blo');
		console.log(state);
	}
	
	this.isWaiting = function(){
		if(state.blocked.length == 0){
			return true;
		}
		return false;
	}
	
	this.isBlocked = function(process_id){
		for(x in blocked){
			if(blocked[x].id == process_id){
				return true;	
			}
		}
		return false;
	}
	
	this.unblock = function(){
		return state.blocked.pop();
	}
	
	 this.getProcessFromReadyQueue = function(process_id){
		for(x in state.ready){
			if(state.ready[x].id = process_id){
				return state.ready[x];  
			}
		}
		return false;
    }
	
	this.run = function(obj, calling){
		if(obj == 'self'){
			obj = state.ready.pop();
		}
		console.log(obj);
		if(obj.constructor == Process){
			if(obj.state == 1){
				obj.changeState(3);
				return;	
			}
			if(obj.state == 3){
				return;	
			}
			if(obj.hasAllResources()){	
				this.execute(obj);				
				if(calling != false || !this.isWaiting()){
					return this.run(this.unblock(), 0); 	
				}
				var objn = state.ready.pop();
				return this.run(objn, 0);
			}else{
				this.block(obj);
				var resource = this.getResource(obj.resources.requesting[calling].id);
				return this.discover(resource, calling + 1);	
			}
			
		}
		
		if(obj.constructor == Resource){
			var process;
			if(!obj.reachLimit()){
				process = this.unblock();
				console.log('ready '+obj.id);	
				this.giveResource(process, obj);
				return this.discover(process, calling);	
			}
			var proc = obj.processes.assign;
			for(var x = 0; x < proc.length; x++){
				if(!this.isBlocked(proc[x].id)){
					process = this.getProcessFromReadyQueue(proc[x].id);
					if(prcoess != false){
						return this.discover(this.getProcess(proc[x].id), 0);
					}
					if(this.isWaiting()){
						process = this.unblock();
						return this.discover(process, calling);	
					}
				}
			}	
		}				
	}		
}

Scheduler.inherit(OS);