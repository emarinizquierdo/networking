// portListGroupOperations.js
//

function PortListGroupOperations(fs, portsMapper, serviceNamesMgr) {

    var that = this;

    var OUTPUT_FILE = "outputs/port_list_group.txt";

    var _sentences = [];
    var _operations = [];

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

    this.addOperation = function(serviceName, portName) {

        var _tempOperation = [];
        var _operation;

        if (!serviceNamesMgr.exist(serviceName)) {
            serviceNamesMgr.add(serviceName);
            _operation = "create";
        }else{
            _operation = "modify";
        }

        _tempOperation.push("tmsh " + _operation + " security firewall port-list");
        _tempOperation.push("\"" + serviceName + "\"");
        _tempOperation.push("{ port-lists add { " + portName + " { } }}");        
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
