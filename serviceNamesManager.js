// serviceNamesManager.js
//

var ServiceNamesManager = function(knownPorts){
    
    var that = this;
    
    var _serviceNames = {};
    
    this.add = function( name ){
        
       _serviceNames[name] = true;
        
    };
    
    this.exist = function(name){
        
        return (typeof _serviceNames[name] != "undefined" );
        
    };
    
}

module.exports.ServiceNamesManager = ServiceNamesManager;