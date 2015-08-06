// rulesListOperations.js
//

function RulesListOperations(fs, portsMapper, serviceNamesMgr) {

    var that = this;

    var OUTPUT_FILE = "outputs/address_list_group.txt";

    var _sentences = [];
    var _operations = [];
    var _addressName = {};

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

        var _sentenceAsArray;

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

    };

    this.addOperation = function(rule) {

        var p_sentence = rule[0].replace(/\s+/g, ' ').split(' ');

        var _netScreenRule = {
            "origin_zone": p_sentence[5],
            "destination_zone": p_sentence[7],
            "src-address": [p_sentence[8]],
            "dst-address": [p_sentence[9]],
            "service": [p_sentence[10]]
        };

        _fillNetScreenRuleProperties(p_sentence, "service", _netScreenRule);
        _fillNetScreenRuleProperties(p_sentence, "src-address", _netScreenRule);
        _fillNetScreenRuleProperties(p_sentence, "dst-address", _netScreenRule);

        _netScreenRule.service = _transformServices(_netScreenRule.service);

        console.log(_netScreenRule);
    };

    this.save = function() {
        var _stringToSave = _operations.join('\n').toString().replace(/,/g, '');
        fs.writeFile(OUTPUT_FILE, _stringToSave, function(err) {
            if (err) throw err;
        });
    };

    function _fillNetScreenRuleProperties(p_sentenceArray, p_property, p_netScreenRule) {

        if (p_sentenceArray.length === 0) {
            return;
        }
        for (var i = 1; i < p_sentenceArray.length; i++) {
            if (p_sentenceArray[i].indexOf("set " + p_property) >= 0) {
                var _sentence = p_sentenceArray[i].split(" ");
                p_netScreenRule[p_property].push(_sentence[2]);
            }
        }

    }

    function _transformServices(p_services) {

        var _services = [];
        var _filteredKey;

        for (var i = 0; i < p_services.length; i++) {
            _filteredKey = p_services[i];
            if (portsMapper.getPortMap(_filteredKey)) {
                //si en la variable global de puertos es tcp o udp se pone tcp, oud  icpm.
                for (var key in portsMapper.getPortMap(_filteredKey)) {
                    if (portsMapper.getPortMap(_filteredKey).hasOwnProperty(key) && portsMapper.getPortMap(_filteredKey)[key]) {
                        var _object = {};
                        _object[key] = _filteredKey;
                        _services.push(_object);
                    }
                }
            }
        }

        return _services;
    }

    function _composeRuleList(p_netScreenRule) {

        var _ruleList = [];

        var _ruleName = "RL_" + (p_netScreenRule.origin_zone + "_" + p_netScreenRule.destination_zone).replace(/'/g, '').replace(/"/g, '');

        _ruleList.push("tmsh create security firewall rule-list");
        _ruleList.push(_ruleName);
        _ruleList.push("{rules add");

        _addRules(p_netScreenRule, _ruleList);

        _ruleList.push("}");



        return _ruleList;

    }

}

module.exports.RulesListOperations = RulesListOperations;