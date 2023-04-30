import { Sprite } from "./sprite.js"
import { Vec } from "./vec.js"

export class SpriteSheet {
    constructor(image, metadataParser) {
        if (image == null) throw new Error("Missing image parameter.");
        if (image.nodeName !== "IMG") throw Error("The image parameter must be an Image.");
        if (metadataParser == null) throw new Error("Missing metaDataParser parameter");
        this.loaded = false;
        this.sprites = null;
        metadataParser(this, image);
        this.currentSprite = null;
    }
}

export function kennyParser(metadataUrl) {
    return (spriteSheet, image) => {
        fetch(metadataUrl)
            .then(response => response.text())
            .then(xmlString => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(xmlString, "text/xml");
                const textureAtlas = doc.getElementsByTagName("TextureAtlas")[0];
                const subTextures = textureAtlas.getElementsByTagName("SubTexture");
                const sprites = new Map();
                for (let i = 0; i < subTextures.length; i++) {
                    const subTexture = subTextures[i];
                    const name = subTexture.getAttribute("name");
                    const x = subTexture.getAttribute("x");
                    const y = subTexture.getAttribute("y");
                    const width = subTexture.getAttribute("width");
                    const height = subTexture.getAttribute("height");
                    const sprite = new Sprite(image);
                    sprite.imageRect = { left: x, top: y, width: width, height: height };
                    sprite.center.x = width / 2;
                    sprite.center.y = height / 2;
                    sprites.set(name, sprite);
                }
                spriteSheet.sprites = sprites;
                spriteSheet.loaded = true;
            })
            .catch((reason) => console.error(`Error loading ${metadataUrl}: ${reason}`));
    }
}

export function gridParser(width, height, imgWidth, imgHeight) {
    return (spriteSheet, image) => {
        const countX = imgWidth / width;
        const countY = imgHeight / height;
        let sprites = new Map();
        for (let x = 0; x < countX; x++) {
            for (let y = 0; y < countY; y++) {
                const sprite = new Sprite(image);
                sprite.imageRect = { left: x * width, top: y * height, width: width, height: height };
                sprite.center.x = width / 2;
                sprite.center.y = height / 2;
                sprites.set(x + y * countX, sprite);
            }
        }
        spriteSheet.sprites = sprites;
        spriteSheet.loaded = true;
    }
}