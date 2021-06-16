#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const _string = require("lodash/string");
const ProgressBar = require("./progress");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let absolutePath = "";

function getMsg(text) {
  return new Promise((resolve, reject) => {
    rl.question(text, function (path) {
      resolve(path);
    });
  });
}

function getFilesInDir(path) {
  return new Promise((resolve, reject) => {
    fs.readdir(path, function (err, files) {
      console.log(err, files);
    });
  });
}

function getVuecomponent(svgText) {
  return `
<template>
  ${svgText}
</template>

<script lang="ts">
  import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  name: "IconDrink",
})
export default class extends Vue {
  @Prop({ default: "20" }) readonly width!: string;

  @Prop({ default: "20" }) readonly height!: string;

  @Prop({ default: "#000000" }) readonly fill!: string;
}
</script>`;
}

/**
 * 将 text 替换成 target
 * @param {string} text
 * @param { {RegRule: string; newStr: string} []} rules
 */
function replaceTextInSvg(text, rules) {
  rules.forEach((item) => {
    const { RegRule, newStr } = item;
    text = text.replace(RegRule, newStr);
  });

  return text;
}

let progress = new ProgressBar();

(async () => {
  absolutePath = "svg";
  // TODO: 对文件路径进行校验
  const files = await fs.readdirSync(absolutePath);
  let count_total = files.length;
  let count_completed = 0;

  files.forEach(async (filename) => {
    const fileContent = await fs.readFileSync(`${absolutePath}/${filename}`, {
      encoding: "utf-8",
    });
    const newSvg = replaceTextInSvg(fileContent, [
      { RegRule: /width="(\d)*[a-z]*"/, newStr: `:width="width"` },
      { RegRule: /height="(\d)*\.(\d)*[a-z]*"/, newStr: `:height="height"` },
      { RegRule: /fill="#(\d)*"/g, newStr: `:fill="fill"` },
      { RegRule: /<\?xml.+><svg/, newStr: `<svg` },
    ]);
    let vueContent = getVuecomponent(newSvg);
    vueContent = replaceTextInSvg(vueContent, [
      {
        RegRule: /name: ".*"/g,
        newStr: `name: "Icon${_string.upperFirst(
          _string.camelCase(filename.replace(/\.svg/, ""))
        )}"`,
      },
    ]);

    fs.writeFileSync(
      `./components/Icon${_string.upperFirst(
        _string.camelCase(filename.replace(/\.svg/, ""))
      )}.vue`,
      vueContent
    );
    progress.render({
      completed: ++count_completed,
      total: count_total,
    });
  });
})();
