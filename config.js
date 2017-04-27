module.exports = {
    name: "ws", //should be unique in this pc
    regexp: /\/\/\/\/sync-code-snippet:(\w+):(\w+) */g, ////sync-code-snippet:ws:end
    files: [
        {
            path: "./test/a.js"
        },
        {
            path: "./test/b.js"
        },
        {
            path: "./test/c.js"
        },
    ]
}
