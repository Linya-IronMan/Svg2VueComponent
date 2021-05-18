#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let absolutePath = ""

rl.question(`请输入svg所在目录的绝对路径:`, function(path) {
    absolutePath = path;
    rl.close()
});


