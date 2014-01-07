// JavaScript Document

function Process(process_id, memory_location){
	this.elem;
    this.id = process_id;
	this.state = 0;
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
	}
	
	this.changeState = function(state){
		switch(state){
			case 0:
				this.state = 0;
				this.elem.color = 'blue';
				break;
			case 1:
				this.state = 1;
				this.elem.color = 'green';
				break;
			case 2:
				this.state = 2;
				this.elem.color = 'orange';
				break;
			case 3:
				this.state = 3;
				this.elem.color = 'gray';
				break;
			default:
				this.state = 0;
				this.elem.color = 'blue';
				break;				
		}
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
        this.elem.draw_circle('blue');
        this.elem.add_text(this.id, 18, 'white');
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