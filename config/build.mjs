import nwbuild from "nw-builder";

async function run() {
  const nw = await nwbuild({
    mode: 'build',
    version: 'latest',
    flavor: 'normal',
    srcDir: "./*",
    platform: "osx",
    arch: "x64",
    outDir: "./build",
    cache: false,
    app: {
      name: "Game",
      icon: "../icon.png",
      company: "wmgcat",
      fileDescription: "Game Description",
      productName: "Game",
      legalCopyright: "Copyright 2025",
      LSApplicationCategoryType: "public.app-category.productivity",
      NSHumanReadableCopyright: "© 2025 wmgcat",
      NSLocalNetworkUsageDescription: ""
    }
  });
}
run();
