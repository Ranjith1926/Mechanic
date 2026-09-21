const sharp = require("sharp");
const path = require("path");

const src = (name) => path.join(__dirname, name);
const out = (name) => path.join(__dirname, "..", "assets", name);

async function run() {
  await sharp(src("icon-full.svg")).resize(1024, 1024).png().toFile(out("icon.png"));

  await sharp(src("icon-glyph-foreground.svg"))
    .resize(1024, 1024)
    .png()
    .toFile(out("android-icon-foreground.png"));

  await sharp(src("icon-background.svg")).resize(1024, 1024).png().toFile(out("android-icon-background.png"));

  await sharp(src("icon-glyph-foreground.svg"))
    .resize(1024, 1024)
    .png()
    .toFile(out("android-icon-monochrome.png"));

  await sharp(src("icon-glyph-foreground.svg")).resize(1024, 1024).png().toFile(out("splash-icon.png"));

  await sharp(src("icon-full.svg")).resize(196, 196).png().toFile(out("favicon.png"));

  console.log("done");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
