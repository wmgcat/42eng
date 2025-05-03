#!/usr/bin/env node

const args = process.argv.slice(2),
      dir = process.cwd(),
      { exec } = require('child_process'),
      path = require('path');

const packageRoot = path.resolve(__dirname, '..');
process.chdir(packageRoot);

switch(args[0]) {
  default: {
    console.log('42eng\n');
    console.log('help\tПомощь по командам');
    console.log('app\tЗапуск сервера');
    console.log('window\tЗапуск графического интерфейса');
    console.log('build\tСборка проекта')
  } break;
  case 'app': {
    console.log('server is run :81');
    exec(`NODE_DIR=${dir} npx rspack serve --config game.config.js`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`Результат:\n${stdout}`);
    })
  } break;
  case 'build': {
    console.log('building to ./dist');
    exec(`NODE_DIR=${dir} npx rspack build --config game.config.js`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`Результат:\n${stdout}`);
    })
  } break;
  case 'window': {
    exec(`cd app && NODE_DIR=${dir} node app.js`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`Результат:\n${stdout}`);
    });
  } break;
}