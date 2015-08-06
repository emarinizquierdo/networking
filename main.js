
/* Import javascript utils */
var fs = require('fs'),
    Netmask = require('netmask').Netmask,
    pm = require('./portsMapper'),
    portsMapper = new pm.PortsMapper();
    snm = require('./serviceNamesManager'),
    serviceNamesMgr = new snm.ServiceNamesManager(),
    plo = require('./portListOperations'),
    portListOperations = new plo.PortListOperations(fs, portsMapper, serviceNamesMgr),
    klo = require('./knownListOperations'),
    knownListOperations = new klo.KnowListOperations(fs, portsMapper, serviceNamesMgr);


var inputFile = process.argv[2];

/*Refactor*/
var RAWSentencesArray;

/* End Global Variables */


/*
 * Main Logic
 */
 
function init(){
    
    //Check if we are passing file input name
    if (process.argv.length !== 3) {
        console.error('Exactly one argument required');
        process.exit(1);
    }

    // Read the entire file asynchronously, with a callback to process the file
    // with w's then write the result to the new file.
    fs.readFile(inputFile, 'utf-8', function(err, text) {
    
        //Posibles errores
        if (err) throw err;
    
        RAWSentencesArray = text.replace(/'/g, '').replace(/"/g, '').split('\n');

        portListOperations.extract(RAWSentencesArray);
        portListOperations.createOperations();
        portListOperations.save();
        

        knownListOperations.extract(RAWSentencesArray);
        knownListOperations.createOperations();
        knownListOperations.save();
    
    });
    
}





init();
