const packager = require("electron-packager");
// 毎回オプションを書き直すのは面倒くさいのでpackage.jsonから引っ張ってくる
const package = require("./package.json");

packager({
    name: package["name"],
    dir: "./",// ソースフォルダのパス
    out: "./dist",// 出力先フォルダのパス
    icon: "./img/favicon.ico",// アイコンのパス
    platform: "win32",
    arch: "x64",
    version: "1.8.4",// Electronのバージョン
    overwrite: true,// 上書き
    asar: true,// asarパッケージ化
    download: {
        mirror: "https://npm.taobao.org/mirrors/electron/"
    },
    ignore: ['/node_modules($|/)'],
    "app-version": package["version"],// アプリバージョン
    "app-copyright": "Copyright (C) 2018 " + package["author"] + ".",// コピーライト
    "version-string": {// Windowsのみのオプション
        CompanyName: "unnuo.com",
        FileDescription: package["name"],
        OriginalFilename: package["name"] + ".exe",
        ProductName: package["name"],
        InternalName: package["name"]
    },
}, function (err, appPaths) {// 完了時のコールバック
    if (err) console.log(err);
    console.log("Done: " + appPaths);
});