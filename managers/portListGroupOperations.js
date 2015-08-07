// portListGroupOperations.js
//

function PortListGroupOperations(fs, knownListOperations, serviceNamesMgr) {

    var that = this;

    var OUTPUT_FILE = "outputs/port_list_group.txt";

    var _sentences = [];
    var _operations = [];

    var _serviceGroupNames = {};

    this.extract = function(rawArray) {

        var _sentence;

        for (var i = 0; i < rawArray.length; i++) {
            _sentence = rawArray[i].split(" ");
            if ((rawArray[i].indexOf("set group service") >= 0) && (_sentence.length > 4)) {
                serviceNamesMgr.add(_sentence[2]);
                _sentences.push(rawArray[i]);
            }
        }
    }

    this.createOperations = function() {

        var _sentenceAsArray;

        for (var i = 0; i < _sentences.length; i++) {
            _sentenceAsArray = _sentences[i].split(" ");
            /*Each Sentence can be like one of this:
            set group service "Acceso_Remoto"
            set group service "Acceso_Remoto" add "SSH"
            set group service "Acceso_Remoto" add "tcp-3389"
            set group service "Acceso_Remoto" add "TELNET" */
            that.addOperation(_sentenceAsArray[3], _sentenceAsArray[5]);
        }

    };

    this.addOperation = function(serviceGroupName, serviceName) {

        var _tempOperation = [];
        var _operation;

        
        if(!_serviceGroupNames[serviceGroupName]){
            _serviceGroupNames[serviceGroupName] = true;
            _operation = "create";
        }else{
            _operation = "modify";
        }

        if (!serviceNamesMgr.exist(serviceName)) {
            serviceNamesMgr.add(serviceName);
            knownListOperations.addOperation(serviceName);
        }

        _tempOperation.push("tmsh " + _operation + " security firewall port-list");
        _tempOperation.push("\"" + serviceGroupName + "\"");
        _tempOperation.push("{ port-lists add { " + serviceName + " { } }}");        
        _tempOperation = _tempOperation.join(" ");

        _operations.push(_tempOperation);

    };

    this.save = function() {
        var _stringToSave = _operations.join('\n').toString().replace(/,/g, '');
        fs.writeFile(OUTPUT_FILE, _stringToSave, function(err) {
            if (err) throw err;
        });
    };

}

module.exports.PortListGroupOperations = PortListGroupOperations;
