const {senseHat} = require("./sensehat-simu/sense-hat");

const leds = senseHat.Leds;

leds.clear();

leds.showMessage("Server Ready!", 0.05);

setTimeout(leds.clear, 5000);

exports.setLed = (pos, color) => {
    try {
        leds.setPixel(pos[0], pos[1], (color.r, color.g, color.b));
    } catch (error) {
        console.error("setLed():", error.message);
        process.exit(1);
    }
}

exports.setScreen = (screen) => {
    try {
        leds.setPixels(screen);
    } catch (error) {
        console.error("setScreen():", error.message);
        process.exit(1);
    }
}


exports.hexToRgb = (hex) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}