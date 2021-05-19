#! /usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");

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
  return `<template>
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

(async () => {
  absolutePath = "svg";
  //   absolutePath = await getMsg("请输入svg所在目录的绝对路径:");
  //     console.log("输入的绝对路径：", absolutePath);

  // TODO: 对文件路径进行校验
  console.log("=========");
  /**
   * string[]
   */
  const files = await fs.readdirSync(absolutePath);

  files.forEach(async (filename) => {
    const fileContent = await fs.readFileSync(`${absolutePath}/${filename}`, {
      encoding: "utf-8",
    });
      const newSvg = replaceTextInSvg(fileContent, [
          { RegRule: /width="(\d)*[a-z]*"/, newStr: `:width="width"` },
          { RegRule: /height="(\d)*\.(\d)*[a-z]*"/, newStr: `:height="height"` },
          { RegRule: /fill="#(\d)*"/g, newStr: `:fill="fill"` }
      ])
      const vueContent = getVuecomponent(newSvg);
      fs.writeFileSync(`./components/${filename.replace(/\.svg/, ".vue")}`, vueContent);
  });
})();
