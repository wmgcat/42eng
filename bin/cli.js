#!/usr/bin/env node

const args = process.argv.slice(2),
      dir = process.cwd(),
      { exec, execSync } = require('child_process'),
      path = require('path'),
      nwbuild = require('nw-builder').default;

const packageRoot = path.resolve(__dirname, '..');
process.chdir(packageRoot);

async function funcCompile(desc, type='osx', params={}) {
  process.chdir(packageRoot);
  console.log(`rm ${dir}/${desc}, ${dir}/dist`)
  execSync(`rm -rf ${dir}/${desc} && rm -rf ${dir}/dist`);
  console.log(`[start] ${desc} building!`);
  console.log(`rspack build to ${dir}/dist...`);
  execSync(`NODE_DIR=${dir} npx rspack build --config game.config.js`);
  console.log(`rspack build is done!`);
  console.log(`delete trash filtes ${dir}/dist`);
  execSync(`rm ${dir}/dist/{*.js,*.js.map}`);
  execSync(`cp ${dir}/package.json ${dir}/dist/package.json`)
  process.chdir(path.resolve(dir, 'dist'));
  console.log(`move to ${process.cwd()} and start building...`);
  try {
    await nwbuild({
      mode: 'build',
      version: 'stable',
      flavor: 'normal',
      srcDir: `./index.html ./package.json`,
      platform: type,
      arch: "x64",
      outDir: `./${desc}`,
      cacheDir: path.resolve(packageRoot, 'cache'),
      manifestUrl: 'https://nwjs.io/versions.json',
      cache: true,
      zip: false,
      app: {
        name: params.title,
        title: params.title,
        icon: path.resolve(dir, 'icon.png'),
        company: params.author,
        fileDescription: params.description,
        productName: params.author,
        legalCopyright: params.copyright,
        LSApplicationCategoryType: "public.app-category.games",
        NSHumanReadableCopyright: `© ${params.copyright} ${params.author}`,
        NSLocalNetworkUsageDescription: ""
      }
    });
    console.log(`[finish] macos build is done`);
  }
  catch(err) {
    console.log('[ERROR]', err);
  }
  finally {
    console.log(`[META]\ntitle: ${params.title}\ndescription: ${params.description}\nauthor: ${params.author} (${params.copyright})`);
  }
}

switch(args[0]) {
  default: {
    console.log('42eng\n');
    console.log('help\tПомощь по командам');
    console.log('app\tЗапуск сервера');
    console.log('window\tЗапуск графического интерфейса');
    console.log('build\tСборка проекта')
  } break;
  case 'app': {
    console.log('server is run :80');
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
    const package = require(path.resolve(dir, 'package.json'));

    if (args[1]) {
      console.log(`building:${args[1]} to ./${args[1]}`);
      funcCompile(args[1], (args[1] == 'macos') ? 'osx' : args[1], {
        title: package.name,
        author: package.author,
        copyright: package.copyright || ((new Date()).getFullYear() + ''),
        description: package.description
      });
    } else {
      console.log('building:web to ./dist/');
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
      });
    }
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