// rulesListOperations.js
//

function RulesListOperations(fs, portsMapper, serviceNamesMgr, ruleListManager) {

    var that = this;

    var OUTPUT_FILE = "outputs/rules_list.txt";

    var _sentences = [];
    var _operations = [];
    var _addressName = {};
    var _ruleNames = {};
    var _currentRuleName;
    var _currentRuleId;

    this.extract = function(rawArray) {

        var _tempSentences = [];
        var _setPolicyFound = false;
        var _setPolicyIndex = -1;
        var _lastExitFound = false;
        var _lastExitIndex = -1;
        var i = 0;

        while ((i < rawArray.length) && !_setPolicyFound) {
            if (rawArray[i].indexOf("set policy") >= 0) {
                _setPolicyIndex = i;
                _setPolicyFound = true;
            }
            i++;
        }

        i = _setPolicyIndex;
        while ((i < rawArray.length) && !_lastExitFound) {
            if ((rawArray[i].indexOf("exit") >= 0) && (rawArray[i + 1].indexOf("set policy") < 0)) {
                _lastExitIndex = i;
                _lastExitFound = true;
            }
            i++;
        }

        _tempSentences = rawArray.slice(_setPolicyIndex, _lastExitIndex).join("\n").split("exit");

        for (i = 0; i < _tempSentences.length; i++) {
            _tempSentences[i] = _tempSentences[i].split("\n").filter(function(n) {
                return n !== ''
            });
        }

        _sentences = _tempSentences;
    }

    this.createOperations = function() {

        for (var i = 0; i < _sentences.length; i++) {
            /*Each Sentence can be like one of this:
            set policy id 2381 from "WIFI-DISTRIBUCION" to "Administracion"  "n-re-portal" "s-si-DNS_admon" "DNS" permit 
            set policy id 2381 application "DNS"
            set policy id 2381
            set service https
            set service http
            set src-address "n-re-portal2"
            set dst-address*/
            that.addOperation(_sentences[i]);
        }

        _operations = ruleListManager.generateRules();

    };

    this.addOperation = function(rule) {
        var _operation;
        for (var i = 0; i < rule.length; i++) {
            _operation = rule[i].replace(/\s+/g, ' ').split(' ');
            switch (_operation[1]) {
                case "policy":
                    if (_operation.length > 6) {
                        _currentRuleName = "RL_" + (_operation[5] + "_" + _operation[7]);
                        _currentRuleId = _operation[3];
                        //name, srcAddress, dstAddress, service, permissions
                        ruleListManager.add(_currentRuleName, _currentRuleId, _operation[8], _operation[9], _operation[10], _operation[11])
                    }
                    break;
                case "service":
                    ruleListManager.setService(_currentRuleName, _currentRuleId, _operation[2]);
                    break;
                case "src-address":
                    ruleListManager.setSrcAddress(_currentRuleName, _currentRuleId, _operation[2]);
                    break;
                case "dst-address":
                    ruleListManager.setDstAddress(_currentRuleName, _currentRuleId, _operation[2]);
                    break;
            }


        }

    };

    this.save = function() {
        var _stringToSave = _operations.join('\n').toString().replace(/,/g, '');
        fs.writeFile(OUTPUT_FILE, _stringToSave, function(err) {
            if (err) throw err;
        });
    };

    /*
        function _transformServices(p_services) {

            var _services = [];
            var _filteredKey;

            for (var i = 0; i < p_services.length; i++) {
                _filteredKey = p_services[i];
                if (portsMapper.exist(_filteredKey)) {
                    //si en la variable global de puertos es tcp o udp se pone tcp, oud  icpm.
                    for (var key in portsMapper.getPortMap(_filteredKey)) {
                        if (portsMapper.getPortMap(_filteredKey).hasOwnProperty(key) && portsMapper.getPortMap(_filteredKey)[key]) {
                            _services.push(portsMapper.getPortMap(_filteredKey)[key]);
                        }
                    }
                }
            }

            return _services;
        }
    */


}

module.exports.RulesListOperations = RulesListOperations;
