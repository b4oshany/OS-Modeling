var commands = new Command();
var canvas = document.getElementById('canvas');
$('.bn').click(function(e){
    var bn =  $(this);
    var type = (bn.hasClass('bn_process'))? 'process': (bn.hasClass('bn_resource'))? 'resource': false;
    $('#proreq').hide();
    $('#resass').hide();
    if(type != false){
        if(bn.hasClass('create')){
            var name = prompt('Enter the name of the '+type);
            commands.create(type,name);
        }else if(bn.hasClass('request')){
            $('#proreq').toggle().addClass('request');       
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
            $('#resass').toggle().addClass('assign');    
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
            if(resources[x].rid === resource_id){
                return true;   
            }
        }
        console.log('Resource '+resource_id+' does not exist\nYou can create a process by using resource -c [resource_name]');
        return false;
    }
    
    this.processExists = function(process_id){
		for(var x in processes){
            if(processes[x].pid === process_id){
                return true;   
            }
        }
        console.log('Process '+process_id+' does not exist');
        return false;
    }
    
    this.getResource = function(resource_id){
        for(var x in resources){
            if(resources[x].rid === resource_id){
                return resources[x];   
            }
        }
        console.log('Resource '+resource_id+' does not exist\nYou can create a process by using resource -c [resource_name]');
        return false;
    }
    
    this.getProcess = function(process_id){
		for(var x in processes){
            if(processes[x].pid === process_id){
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
    
    this.mapProcessToResource = function(process_id, resource_id){        
		var resource = this.getResource(resource_id);
		var process = this.getProcess(process_id);
        console.log(arrows);
        if(resource != false && process != false){
            var rtop = resource.div.offsetTop;   
            var rleft = resource.div.offsetLeft;
            var rheight = resource.div.offsetHeight;
            var rwidth = resource.div.offsetWidth;
            var ptop = process.div.offsetTop;   
            var pleft = process.div.offsetLeft;
            var pheight = process.div.offsetHeight;
            var pwidth = process.div.offsetWidth;
            var arrow = document.createElement('div');
            arrow.setAttribute('id', process_id+'->'+resource_id);
			arrow.setAttribute('class', 'arrow');
            arrow.style.top = (ptop)+'px';
			arrow.style.left = (pleft+pwidth)+'px'
			arrow.style.width = (rleft-(pleft+pwidth))+'px';
			arrow.style.backgroundColor = 'blue';
            var effect = new Animation();
            var x = rleft - (pleft + pwidth);
            var y = rtop - ptop;
            var thea = Math.atan2(y,x)*(180/Math.PI);  
            effect.rotate(arrow, thea);
            console.log(this.arrowExists(process_id+'->'+resource_id));
            if(this.arrowExists(process_id+'->'+resource_id) == false){
                canvas.appendChild(arrow);
                arrow.style.top = (ptop + (pheight/2))+'px';
                arrows.push(arrow);
            }
        }
    }
    
    this.kill_process = function(process_id){
		for(var x = 0; x < processes.length; x++){
			if(processes[x].pid === process_id){
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
			if(resources[x].rid === resource_id){
                canvas.removeChild(resources[x].div);
				resources.splice(x,1);	
				this.remove_resource(resource_id);
			}
		}
        console.log('Resource '+process_id+' removed');
	}
    
}

function Process(process_id){
	this.div = false;
    this.pid = process_id;
    this.running = false;
    this.resources = [];
	this.cords = [];
	console.log('Process '+this.pid+' was created');
    this.addResource = function(resource_id){
        this.resources.push(resource_id);
		console.log('Process '+this.pid+' has requested resource '+resource_id);
    }
	
	this.removeResource = function(resource_id){
		var index = resources.indexOf(resource_id);
		this.resources.splice(index, 1);
		console.log('Resource '+resource_id+' was removed from process '+this.pid);
	}
	
	this.removeLastResource = function(){
		var rid = this.resource.pop();
		console.log('Resource '+rid+' was removed from process '+this.pid);
	}       
	
	this.draw = function(){
		var pr = document.createElement('div');
		pr.setAttribute('id', this.pid);
		pr.setAttribute('class', 'process');
		pr.innerHTML = 'Process<br>'+this.pid;
		this.cords[0] = Process.cords[0][0];
		this.cords[1] = Process.cords[0][1];
		pr.style.top = this.cords[1]+'px';
		pr.style.left = this.cords[0]+'%';		
		Process.cords.splice(0,1);
		canvas.appendChild(pr);
		this.div = pr;
		console.log('create process diagram');
	}
	this.draw();	
}

function Resource(resource_id){
	this.div = false;
	this.unit = null;
	this.rid = resource_id;
	this.processes = [];	
	this.cords = [];
	console.log('Resource '+this.rid+' was created');
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
		var re = document.createElement('div');
		re.setAttribute('id', this.rid);
		re.setAttribute('class', 'resource');
		re.innerHTML = 'Reource<br>'+this.rid;
		this.cords[0] = 45;
		this.cords[1] = Resource.top[0];
		re.style.left = this.cords[0]+'%';
		re.style.top = this.cords[1]+'px';
		Resource.top.splice(0,1);
		canvas.appendChild(re);
		this.div = re;
		console.log('create resource diagram for '+this.rid);
	}
	this.draw();	
}

Resource.top = [50, 140, 230, 320, 410];
Process.cords = [[15, 10], [15, 100], [15,190], [15,280], [15,370], [70, 10], [70, 100], [70,190], [70,280], [70,370]];


function Animation(){    
    var looper;
    this.degrees = 0;
    this.rotate = function(elem, degrees){
        this.degrees = degrees;
        if(navigator.userAgent.match("Chrome")){
            elem.style.WebkitTransform = "rotate("+this.degrees+"deg)";
        } else if(navigator.userAgent.match("Firefox")){
            elem.style.MozTransform = "rotate("+this.degrees+"deg)";
        } else if(navigator.userAgent.match("MSIE")){
            elem.style.msTransform = "rotate("+this.degrees+"deg)";
        } else if(navigator.userAgent.match("Opera")){
            elem.style.OTransform = "rotate("+this.degrees+"deg)";
        } else {
            elem.style.transform = "rotate("+this.degrees+"deg)";
        }
    }   
    
    this.rotateAnimation = function(elem,speed){
        this.rotate(elem, this.degrees);
        looper = setTimeout('rotateAnimation(\''+elem+'\','+speed+')',speed);
        degrees++;
        if(degrees > 359){
            degrees = 1;
        }
    }
}