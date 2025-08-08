import sharp from "sharp";
import { promises as fsPromises } from "fs";
const insertWaterMark = async (req, res) => {
  const waterMarkText = req.body?.waterMarkText || "";
  try {
    if (!req.files || !req.files.inputImage) {
      return res
        .status(400)
        .json({ result: false, message: "Image is not defined..!" });
    }
    const inputImage = req.files.inputImage;
    const inputImageName = Date.now() + "_" + inputImage.name;
    const inputImagePath = "./public/upload/" + inputImageName;
    const logoImage = req.files.logoImage;

    const hasText = waterMarkText && waterMarkText.trim().length > 0;
    const hasLogo = !!logoImage;
    if ((hasText && hasLogo) || (!hasText && !hasLogo)) {
      return res.status(400).json({
        result: false,
        message: "Please provide exacly one input: Text or Logo image..!",
      });
    }
    await inputImage.mv(inputImagePath);
    const image = sharp(inputImagePath);
    const metadata = await image.metadata();
    const width = metadata.width;
    const height = metadata.height;
    let watermarkTileBuffer;
    const tileSize = 200;
    if (hasText) {
      const fontSize = 30;
      const svgTile = `
        <svg width="${tileSize}" height="${tileSize}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .watermark {
              fill: white;
              font-size: ${fontSize}px;
              font-weight: bold;
              opacity: 0.50;
              font-family: Arial, sans-serif;
            }
          </style>
          <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" class="watermark" transform="rotate(-45, ${
            tileSize / 2
          }, ${tileSize / 2})">
            ${waterMarkText}
          </text>
        </svg>
      `;
      watermarkTileBuffer = Buffer.from(svgTile);
    } else if (hasLogo) {
      const logoImageName = Date.now() + "_" + logoImage.name;
      const logoImagePath = "./public/upload/" + logoImageName;
      await logoImage.mv(logoImagePath);
      watermarkTileBuffer = await sharp(logoImagePath)
        .resize(tileSize, tileSize, { fit: "inside" })
        .png()
        .toBuffer();
      try {
        await fsPromises.unlink(logoImagePath);
      } catch (unlinkError) {
        console.warn(
          `Failed to delete logo image ${logoImagePath}: ${unlinkError.message}`
        );
      }
    }

    const tilesX = Math.ceil(width / tileSize) + 1;
    const tilesY = Math.ceil(height / tileSize) + 1;

    let watermarkPattern = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    });
    let composites = [];

    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        composites.push({
          input: watermarkTileBuffer,
          top: y * tileSize,
          left: x * tileSize,
        });
      }
    }

    watermarkPattern = watermarkPattern.composite(composites);

    const tiledWatermarkBuffer = await watermarkPattern.png().toBuffer();
    const outputPath = "public/output.jpg";

    await image
      .composite([{ input: tiledWatermarkBuffer, blend: "over" }])
      .jpeg({ quality: 90 })
      .toFile(outputPath);
    res.status(200).json({
      result: true,
      message: "Generate watermark for image successfully..",
      outputImageUrl: "/output.jpg",
    });
  } catch (error) {
    res.status(500).json({ result: false, message: error.message });
    console.log(error.message);
  }
};
export default insertWaterMark;
