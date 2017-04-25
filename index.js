const fs = require('fs');
const watch = require("node-watch");


function init(config) {
    const files = [];
    let stopWatch = false;
    let stopWatchTimeout;
    fs.readFileAsync = function (filename) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filename, function (err, data) {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    };


    config.files.forEach(function (file) {
        files.push(fs.readFileAsync(file.path));
        watch(file.path, function (evt, filename) {
            if (stopWatch) {
                return;
            }
            console.log(file.path, "changed");
            fs.readFileAsync(filename).then(function (file) {
                const content = file.toString();
                const {
                    snippet
                } = getSnippet(content, filename);

                config.files.forEach(function (file) {
                    if (file.path !== filename) {
                        setSnippet(snippet, file.path);
                    }
                });
            });

        });
    });

    function getIndex(content, path) {
        let startIndex0;
        let startIndex;
        let endIndex;
        let exec;
        while (exec = config.regexp.exec(content)) {
            if (exec[1] === config.name) {
                if (exec[2] === "start") {
                    startIndex0 = exec.index;
                    startIndex = exec.index + exec[0].length + 1;
                } else if (exec[2] === "end") {
                    endIndex = exec.index;
                }
            }
        }
        config.regexp.lastIndex = 0;
        if (startIndex && !endIndex) {
            console.warn("Can't find \"end\" in " + path);
            return;
        }
        if (!startIndex && endIndex) {
            console.warn("Can't find \"start\" in " + path);
            return;
        }
        return {
            startIndex0,
            startIndex,
            endIndex,
        }
    }

    function getIndent(content, startIndex0) {
        let indent = 0;
        let ch;
        let findIndentIndex = startIndex0;
        while (findIndentIndex > 0 && content[findIndentIndex] !== '\n') {
            findIndentIndex--;
            indent++;
        }
        indent--;
        return indent;
    }

    function setIndent(snippet, indent) {
        return snippet.replace(/\n/g, '\n' + " ".repeat(indent)).replace(/^/, " ".repeat(indent));
    }

    function setSnippet(snippet, path) {

        fs.readFileAsync(path).then(function (file) {
            const content = file.toString();
            const {
                startIndex0,
                startIndex,
                endIndex
            } = getIndex(content, path);
            const indent = getIndent(content, startIndex0);
            snippet = setIndent(snippet, indent);
            const code = content.slice(0, startIndex) + snippet + content.slice(endIndex);
            if (code.length < 20) { //prevent loosing code
                console.log("error!!!");
                return;
            }
            fs.writeFile(path, code, function (err) {
                stopWatch = true;
                if (stopWatchTimeout) {
                    clearTimeout(stopWatchTimeout);
                }
                stopWatchTimeout = setTimeout(function () {
                    stopWatch = false;
                }, 1000);
            });

        });
    }

    function getSnippet(content, path) {
        const {
            startIndex0,
            startIndex,
            endIndex
        } = getIndex(content, path);
        const indent = getIndent(content, startIndex0);

        let snippet = content.slice(startIndex, endIndex);
        if (snippet.match(/\S/)) {
            const reg = new RegExp('[\\n]' + ' '.repeat(indent), "g");
            snippet = snippet.replace(reg, "\n").replace(new RegExp(`^` + ' '.repeat(indent)), "");
        }
        return {
            snippet
        }
    }


    Promise.all(files).then(function (results) {
        const snippets = [];
        results.forEach(function (result, i) {
            const content = result.toString();
            const {
                snippet
            } = getSnippet(content, config.files[i].path);
            snippets.push(snippet);
        });
        let solidCnt = 0;
        let allSame = false;
        let lastSnippet;
        snippets.forEach(function (snippet) {
            if (snippet.match(/\S/)) {
                solidCnt++;
            }
        });
        allSame = snippets.every(function (snippet) {
            if (lastSnippet === undefined) {
                lastSnippet = snippet;
                return true;
            } else {
                const ret = lastSnippet === snippet;
                lastSnippet = snippet;
                return ret;
            }
        });
        console.log('allSame', allSame);
        console.log('solidCnt', solidCnt);

        if (!solidCnt) {
            console.log("nothing to sync");
        } else if (solidCnt === 1 || allSame) {
            console.log("start synchronizing...");
            snippets.forEach(function (snippet, i) {
                if (!snippet.match(/\S/)) {
                    setSnippet(lastSnippet, config.files[i].path);
                }
            });
        } else {
            console.warn("can't start");
        }


    });
}


module.exports = init;
