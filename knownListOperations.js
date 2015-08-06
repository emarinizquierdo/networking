// portListOperations.js
//

function KnowListOperations( fs, portsMapper, serviceNamesMgr){
    
    var that = this;
    
    var OUTPUT_FILE = "known_list.txt";
    
    var _sentences = [];
    var _operations = [];
    var _serviceNames = {};

    this.extract = function( rawArray ){
        
        for (var i = 0; i < rawArray.length; i++) {
            if (rawArray[i].indexOf("set service") >= 0) {
                _sentences.push(rawArray[i]);
            }
        }
    }
    
    this.createOperations = function(){
        
        var _sentenceAsArray;
        
        for (var i = 0; i < _sentences.length; i++) {
            _sentenceAsArray = _sentences[i].split(" ");
            //Each Sentence is like this:  set service "tcp-8080" protocol tcp src-port 1-65535 dst-port 8080-8080
            if(!((_sentenceAsArray.length > 3) && ((_sentenceAsArray[4] == "tcp") || (_sentenceAsArray[4] == "udp"))) && !serviceNamesMgr.exist(_sentenceAsArray[2])){
                that.addOperation(_sentenceAsArray[2]);
            }
        }

    };
    
    this.addOperation = function( serviceName ){

        var _tempOperation = [];
        
        serviceNamesMgr.add(serviceName);

        _tempOperation.push("tmsh create security firewall port-list");
        _tempOperation.push("\"" + serviceName + "\"");
        _tempOperation.push("{}");
        _tempOperation = _tempOperation.join(" ");

        _operations.push(_tempOperation);
        
    };
    
    this.save = function(){
        var _stringToSave = _operations.join('\n').toString().replace(/,/g, '');
        fs.writeFile(OUTPUT_FILE, _stringToSave, function(err) {
            if (err) throw err;
        });
    };

}

module.exports.KnowListOperations = KnowListOperations;