
const sharp = require("sharp");
const path = require("node:path");

const imageDirectory = path.join(__dirname, "public", "images");

const images = [
  {
    name: "feature-goal-builder",
    widths: [400, 800, 1200],
  },
  {
    name: "feature-growth-plan",
    widths: [400, 800, 1200],
  },
  {
    name: "feature-monday-checkin",
    widths: [400, 800, 1200],
  },
  {
    name: "playbook-rebooking",
    widths: [400, 800, 1200],
  },
  {
    name: "playbook-referrals",
    widths: [400, 800, 1200],
  },
  {
    name: "playbook-reviews",
    widths: [400, 800, 1200],
  },
  {
    name: "team-workshop",
    widths: [480, 960, 1440],
  },
];

async function optimizeImages() {
  for (const image of images) {
    const input = path.join(imageDirectory, `${image.name}.jpg`);

    for (const width of image.widths) {
      const output = path.join(
        imageDirectory,
        `${image.name}-${width}.webp`
      );

      await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(output);

      const metadata = await sharp(output).metadata();

      console.log(
        `${path.basename(output)}: ${metadata.width}x${metadata.height}`
      );
    }
  }

  console.log("All images optimized!");
}

optimizeImages().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
