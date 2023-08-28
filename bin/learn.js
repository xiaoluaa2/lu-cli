#!/usr/bin/env node
const program = require("commander");
const minimist = require("minimist");
const inquirer = require("inquirer");
const chalk = require("chalk");
const path = require("path")
// const templates = require('./templates.js')
const { getGitReposList } = require('./api.js') // 新增
const downloadGitRepo = require('download-git-repo')
const ora = require('ora') // 引入ora
const fs = require('fs-extra') // 引入fs-extra
program.version("0.0.1")


// program
//   .command("setup")
//   .description("run remote setup commands")
//   .action(function () {
//     console.log("setup");
//   });

// program
//   .command("create <app-name>")
//   .description("Create a new pri project.")
//   .alias("c")
//     .action((name) => {
//    if (minimist(process.argv.slice(3))._.length > 1) {
//       const info = `Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored. `;
//       console.log(chalk.yellow(info));
//     }
//   });2
// 定义loading
const loading = ora('正在下载模版...')

let proName = undefined
let proTemplate = undefined
program
  .command("create [projectName]")
  .description("创建模版")
  .option('-t, --template <template>', '模版名称')
  .action(async (projectName, options) => {
    // 添加获取模版列表接口和loading
    const getRepoLoading = ora('获取模版列表...')
    getRepoLoading.start()
    const templates = await getGitReposList('xiaoluaa2')
    getRepoLoading.succeed('获取模版列表成功!')
    // 1. 从模版列表中找到对应的模版
    let project = templates.find(template => template.name === options.template)
    // 2. 如果匹配到模版就赋值，没有匹配到就是undefined
    proName = projectName ? projectName : undefined
    proTemplate = project ? project.value : undefined

    if (!proName) {
      const { name } = await inquirer.prompt({
        type: "input",
        name: "name",
        message: "请输入项目名称：",
      });
      proName = name
      console.log("项目名称：", name);
    }


    // 新增选择模版代码
    if (!proTemplate) {
      const { template } = await inquirer.prompt({
        type: 'list',
        name: 'template',
        message: '请选择模版：',
        choices: templates // 模版列表
      })
      proTemplate = template
    }

    // 获取目标文件夹
    const dest = path.join(process.cwd(), proName)
    console.log('dest' + dest)
    if (fs.existsSync(dest)) {
      const { force } = await inquirer.prompt({
        type: 'confirm',
        name: 'force',
        message: '目录已存在，是否覆盖？',
      })
      // 如果覆盖就删除文件夹继续往下执行，否的话就退出进程
      force ? fs.removeSync(dest) : process.exit(1)
    }

    // 开始下载模版npm i fs-extra -S
    console.log('proTemplate' + proTemplate)
    // 开始loading
    loading.start()
    downloadGitRepo(proTemplate, dest, (err) => {
      if (err) {
        // console.log('创建模版失败', err)
        loading.fail('创建模版失败：' + err.message) // 失败loading
      } else {
        // console.log('创建模版成功')
        loading.succeed('创建模版成功!') // 成功loading
        console.log(`\ncd ${proName}`)
        console.log('npm i')
        console.log('npm start\n')
      }
    })

  });
program.on('--help', () => { }) // 添加--help
// program
// .command('exec <cmd>')
// .description('run the given remote command')
// .action(function(cmd) {
//   console.log('exec "%s"', cmd);
// });

// program
// .command('teardown <dir> [otherDirs...]')
// .description('run teardown commands')
// .action(function(dir, otherDirs) {
//   console.log('dir "%s"', dir);
//   if (otherDirs) {
//     otherDirs.forEach(function (oDir) {
//       console.log('dir "%s"', oDir);
//     });
//   }
// });

// program
// .command('*')
// .description('deploy the given env')
// .action(function(script, options) {
//   console.log('deploying "%s"', options.args);
// });



program.parse(process.argv);

// const options = program.opts();

