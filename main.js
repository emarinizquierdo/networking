
/* Import javascript utils */
var fs = require('fs'),
    Netmask = require('netmask').Netmask,
    pm = require('./managers/portsMapper'),
    portsMapper = new pm.PortsMapper();
    snm = require('./managers/serviceNamesManager'),
    serviceNamesMgr = new snm.ServiceNamesManager(),
    plo = require('./managers/portListOperations'),
    portListOperations = new plo.PortListOperations(fs, portsMapper, serviceNamesMgr),
    klo = require('./managers/knownListOperations'),
    knownListOperations = new klo.KnowListOperations(fs, portsMapper, serviceNamesMgr),
    plgo = require('./managers/portListGroupOperations'),
    portListGroupOperations = new plgo.PortListGroupOperations(fs, portsMapper, serviceNamesMgr),
    alo = require('./managers/addressListOperations'),
    addressListOperations = new alo.AddressListOperations(fs, portsMapper, serviceNamesMgr, Netmask),
    algo = require('./managers/addressListGroupOperations'),
    addressListGroupOperations = new algo.AddressListGroupOperations(fs, portsMapper, serviceNamesMgr),
    rlo = require('./managers/rulesListOperations'),
    rulesListOperations = new rlo.RulesListOperations(fs, portsMapper, serviceNamesMgr);


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

        //Generate Port List Operations
        portListOperations.extract(RAWSentencesArray);
        portListOperations.createOperations();
        portListOperations.save();
        

        //Generate Known List Operations
        knownListOperations.extract(RAWSentencesArray);
        knownListOperations.createOperations();
        knownListOperations.save();

        //Generate Port List Group Operations
        portListGroupOperations.extract(RAWSentencesArray);
        portListGroupOperations.createOperations();
        portListGroupOperations.save();

        //Generate Address List Operations
        addressListOperations.extract(RAWSentencesArray);
        addressListOperations.createOperations();
        addressListOperations.save();

        //Generate Address List Group Operations
        addressListGroupOperations.extract(RAWSentencesArray);
        addressListGroupOperations.createOperations();
        addressListGroupOperations.save();

        //Generate Rules List Operations
        rulesListOperations.extract(RAWSentencesArray);
        rulesListOperations.createOperations();
        //addressListGroupOperations.save();
    
    });
    
}





init();
