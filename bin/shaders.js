#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var glslunit = require('./glsl-compiler-min');

var name;
var shaders = {};

var shaderFiles = fs.readdirSync('shaders');

for (var i = 0; i < shaderFiles.length; i++) {
    var parts = shaderFiles[i].match(/^(.+)\.(vertex|fragment)\.glsl$/);
    if (parts) {
        name = parts[1];
        var type = parts[2];
        if (!(name in shaders)) {
            shaders[name] = {};
        }
        shaders[name][type] = fs.readFileSync(path.join('shaders', shaderFiles[i]), 'utf8');
    }
}

for (name in shaders) {
    var compiler = new glslunit.compiler.DemoCompiler(shaders[name].vertex, shaders[name].fragment);
    var result = compiler.compileProgram();
    shaders[name].vertex = glslunit.Generator.getSourceCode(result.vertexAst);
    shaders[name].fragment = glslunit.Generator.getSourceCode(result.fragmentAst);
}

var code = 'module.exports = ' + JSON.stringify(shaders, null, 4) + ';\n';

fs.writeFileSync('dist/shaders.js', code);
