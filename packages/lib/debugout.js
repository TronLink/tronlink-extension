/**
 * Created by tron on 2019/6/17.
 */
export default class debugout {
    constructor() {

        // OPTIONS
        this.realTimeLoggingOn = true; // log in real time (forwards to console.log)
        this.useTimestamps = false; // insert a timestamp in front of each log
        this.useLocalStorage = false; // store the output using window.localStorage() and continuously add to the same log each session
        this.recordLogs = true; // set to false after you're done debugging to avoid the log eating up memory
        this.autoTrim = true; // to avoid the log eating up potentially endless memory
        this.maxLines = 2500; // if autoTrim is true, this many most recent lines are saved
        this.tailNumLines = 100; // how many lines tail() will retrieve
        this.logFilename = 'debugout.txt'; // filename of log downloaded with downloadLog()

        // vars
        this.depth = 0;
        this.parentSizes = [0];
        this.currentResult = '';
        this.startTime = new Date();
        this.output = '';

        this.version = function () {
            return '0.5.0'
        };

        /*
         START/RESUME LOG
         */
        if (this.useLocalStorage) {
            var saved = window.localStorage.getItem('debugout.js');
            if (saved) {
                saved = JSON.parse(saved);
                this.output = saved.log;
                var start = new Date(saved.startTime);
                var end = new Date(saved.lastLog);
                this.output += '\n---- Session end: '+saved.lastLog+' ----\n';
                this.output += this.formatSessionDuration(start, end);
                this.output += '\n\n';
            }
        }
        this.output += '---- Session started: '+this.startTime+' ----\n\n';
    }

    /*
     USER METHODS
     */
     getLog(){
        var retrievalTime = new Date();
        // if recording is off, so dev knows why they don't have any logs
        if (!this.recordLogs) {
            this.log('[debugout.js] log recording is off.');
        }
        // if using local storage, get values
        if (this.useLocalStorage) {
            var saved = window.localStorage.getItem('debugout.js');
            if (saved) {
                saved = JSON.parse(saved);
                this.startTime = new Date(saved.startTime);
                this.output = saved.log;
                retrievalTime = new Date(saved.lastLog);
            }
        }
        return this.output
            + '\n---- Log retrieved: '+retrievalTime+' ----\n'
            + this.formatSessionDuration(this.startTime, retrievalTime);
    }
    // accepts optional number or uses the default for number of lines
    tail(numLines) {
        var numLines = numLines || this.tailLines;
        return this.trimLog(this.getLog(), numLines);
    }
    // accepts a string to search for
    search(string){
        var lines = this.output.split('\n');
        var rgx = new RegExp(string);
        var matched = [];
        // can't use a simple Array.prototype.filter() here
        // because we need to add the line number
        for (var i = 0; i < lines.length; i++) {
            var addr = '['+i+'] ';
            if (lines[i].match(rgx)) {
                matched.push(addr + lines[i]);
            }
        }
        var result = matched.join('\n');
        if (result.length == 0) result = 'Nothing found for "'+string+'".';
        return result
    }
    // accepts the starting line and how many lines after the starting line you want
    getSlice(lineNumber, numLines) {
        var lines = this.output.split('\n');
        var segment = lines.slice(lineNumber, lineNumber + numLines);
        return segment.join('\n');
    }
    // immediately downloads the log - for desktop browser use
    downloadLog() {
        var file = "data:text/plain;charset=utf-8,";
        var logFile = this.getLog();
        var encoded = encodeURIComponent(logFile);
        file += encoded;
        var a = document.createElement('a');
        a.href = file;
        a.target   = '_blank';
        a.download = this.logFilename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    // clears the log
    clear(){
        var clearTime = new Date();
        this.output = '---- Log cleared: '+clearTime+' ----\n';
        if (this.useLocalStorage) {
            // local storage
            var saveObject = {
                startTime: this.startTime,
                log: this.output,
                lastLog: clearTime
            }
            saveObject = JSON.stringify(saveObject);
            window.localStorage.setItem('debugout.js', saveObject);
        }
        if (this.realTimeLoggingOn) console.log('[debugout.js] clear()');
    }
    // records a log
    log(obj) {
        // log in real time
        // if (this.realTimeLoggingOn) console.log(obj);
        // record log
        var type = this.determineType(obj);
        if (type != null && this.recordLogs) {
            var addition = this.formatType(type, obj);
            // timestamp, formatted for brevity
            if (this.useTimestamps) {
                var logTime = new Date();
                this.output += this.formatTimestamp(logTime);
            }
            this.output += addition+'\n';
            if (this.autoTrim) this.output = this.trimLog(this.output, this.maxLines);
            // local storage
            if (this.useLocalStorage) {
                var last = new Date();
                var saveObject = {
                    startTime: this.startTime,
                    log: this.output,
                    lastLog: last
                }
                saveObject = JSON.stringify(saveObject);
                window.localStorage.setItem('debugout.js', saveObject);
            }
        }
        this.depth = 0;
        this.parentSizes = [0];
        this.currentResult = '';
    }
    /*
     METHODS FOR CONSTRUCTING THE LOG
     */

    // like typeof but classifies objects of type 'object'
    // kept separate from formatType() so you can use at your convenience!
    determineType(object) {
        if (object != null) {
            var typeResult;
            var type = typeof object;
            if (type == 'object') {
                var len = object.length;
                if (len == null) {
                    if (typeof object.getTime == 'function') {
                        typeResult = 'Date';
                    }
                    else if (typeof object.test == 'function') {
                        typeResult = 'RegExp';
                    }
                    else {
                        typeResult = 'Object';
                    }
                } else {
                    typeResult = 'Array';
                }
            } else {
                typeResult = type;
            }
            return typeResult;
        } else {
            return null;
        }
    }
    // format type accordingly, recursively if necessary
    formatType(type, obj) {
        switch(type) {
            case 'Object' :
                this.currentResult += '{\n';
                this.depth++;
                this.parentSizes.push(this.objectSize(obj));
                var i = 0;
                for (var prop in obj) {
                    this.currentResult += this.indentsForDepth(this.depth);
                    this.currentResult += prop + ': ';
                    var subtype = this.determineType(obj[prop]);
                    var subresult = this.formatType(subtype, obj[prop]);
                    if (subresult) {
                        this.currentResult += subresult;
                        if (i != this.parentSizes[this.depth]-1) this.currentResult += ',';
                        this.currentResult += '\n';
                    } else {
                        if (i != this.parentSizes[this.depth]-1) this.currentResult += ',';
                        this.currentResult += '\n';
                    }
                    i++;
                }
                this.depth--;
                this.parentSizes.pop();
                this.currentResult += this.indentsForDepth(this.depth);
                this.currentResult += '}';
                if (this.depth == 0) return this.currentResult;
                break;
            case 'Array' :
                this.currentResult += '[';
                this.depth++;
                this.parentSizes.push(obj.length);
                for (let i = 0; i < obj.length; i++) {
                    var subtype = this.determineType(obj[i]);
                    if (subtype == 'Object' || subtype == 'Array') this.currentResult += '\n' + this.indentsForDepth(this.depth);
                    var subresult = this.formatType(subtype, obj[i]);
                    if (subresult) {
                        this.currentResult += subresult;
                        if (i != this.parentSizes[this.depth]-1) this.currentResult += ', ';
                        if (subtype == 'Array') this.currentResult += '\n';
                    } else {
                        if (i != this.parentSizes[this.depth]-1) this.currentResult += ', ';
                        if (subtype != 'Object') this.currentResult += '\n';
                        else if (i == this.parentSizes[this.depth]-1) this.currentResult += '\n';
                    }
                }
                this.depth--;
                this.parentSizes.pop();
                this.currentResult += ']';
                if (this.depth == 0) return this.currentResult;
                break;
            case 'function' :
                obj += '';
                var lines = obj.split('\n');
                for (var i = 0; i < lines.length; i++) {
                    if (lines[i].match(/\}/)) this.depth--;
                    this.currentResult += this.indentsForDepth(this.depth);
                    if (lines[i].match(/\{/)) this.depth++;
                    this.currentResult += lines[i] + '\n';
                }
                return this.currentResult;
                break;
            case 'RegExp' :
                return '/'+obj.source+'/';
                break;
            case 'Date' :
            case 'string' :
                if (this.depth > 0 || obj.length == 0) {
                    return '"'+obj+'"';
                } else {
                    return obj;
                }
            case 'boolean' :
                if (obj) return 'true';
                else return 'false';
            case 'number' :
                return obj+'';
                break;
        }
    }
    indentsForDepth(depth) {
        var str = '';
        for (var i = 0; i < depth; i++) {
            str += '\t';
        }
        return str;
    }
    trimLog(log, maxLines) {
        var lines = log.split('\n');
        if (lines.length > maxLines) {
            lines = lines.slice(lines.length - maxLines);
        }
        return lines.join('\n');
    }
    lines() {
        return this.output.split('\n').length;
    }
    // calculate testing time
    formatSessionDuration(startTime, endTime) {
        var msec = endTime - startTime;
        var hh = Math.floor(msec / 1000 / 60 / 60);
        var hrs = ('0' + hh).slice(-2);
        msec -= hh * 1000 * 60 * 60;
        var mm = Math.floor(msec / 1000 / 60);
        var mins = ('0' + mm).slice(-2);
        msec -= mm * 1000 * 60;
        var ss = Math.floor(msec / 1000);
        var secs = ('0' + ss).slice(-2);
        msec -= ss * 1000;
        return '---- Session duration: '+hrs+':'+mins+':'+secs+' ----'
    }
    formatTimestamp(timestamp) {
        var year = timestamp.getFullYear();
        var date = timestamp.getDate();
        var month = ('0' + (timestamp.getMonth() +1)).slice(-2);
        var hrs = Number(timestamp.getHours());
        var mins = ('0' + timestamp.getMinutes()).slice(-2);
        var secs = ('0' + timestamp.getSeconds()).slice(-2);
        return '['+ year + '-' + month + '-' + date + ' ' + hrs + ':' + mins + ':'+secs + ']: ';
    }
    objectSize(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }
};
