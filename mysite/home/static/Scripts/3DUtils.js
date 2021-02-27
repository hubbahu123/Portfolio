/*--------------------------Important Values--------------------------*/
//Declared here because they can't be accessed by other scripts otherwise
let showBackground = true;
let background = null;
let support3D = false;
let toggle3D;

/*--------------------------Noise and Random--------------------------*/
var noise = {};

function Grad(x, y) {
    this.x = x; this.y = y;
    this.dot = function(x, y) {
        return this.x*x + this.y*y;
    };
}

const grads = [
    new Grad(1, 0), 
    new Grad(-1, 0),
    new Grad(0, 1),
    new Grad(0, -1)
];
const hash = [
    151,160,137, 91, 90, 15,131, 13,201, 95, 96, 53,194,233,  7,225,
    140, 36,103, 30, 69,142,  8, 99, 37,240, 21, 10, 23,190,  6,148,
    247,120,234, 75,  0, 26,197, 62, 94,252,219,203,117, 35, 11, 32,
     57,177, 33, 88,237,149, 56, 87,174, 20,125,136,171,168, 68,175,
     74,165, 71,134,139, 48, 27,166, 77,146,158,231, 83,111,229,122,
     60,211,133,230,220,105, 92, 41, 55, 46,245, 40,244,102,143, 54,
     65, 25, 63,161,  1,216, 80, 73,209, 76,132,187,208, 89, 18,169,
    200,196,135,130,116,188,159, 86,164,100,109,198,173,186,  3, 64,
     52,217,226,250,124,123,  5,202, 38,147,118,126,255, 82, 85,212,
    207,206, 59,227, 47, 16, 58, 17,182,189, 28, 42,223,183,170,213,
    119,248,152,  2, 44,154,163, 70,221,153,101,155,167, 43,172,  9,
    129, 22, 39,253, 19, 98,108,110, 79,113,224,232,178,185,112,104,
    218,246, 97,228,251, 34,242,193,238,210,144, 12,191,179,162,241,
     81, 51,145,235,249, 14,239,107, 49,192,214, 31,181,199,106,157,
    184, 84,204,176,115,121, 50, 45,127,  4,150,254,138,236,205, 93,
    222,114, 67, 29, 24, 72,243,141,128,195, 78, 66,215, 61,156,180
];
const hashPerm = new Array(512);
const gradPerm = new Array(512);

noise.seed = function(seed) {
    // Scale the seed out
    if (seed > 0 && seed < 1)
        seed *= 65536;

    seed = Math.floor(seed);
    if (seed < 256)
        seed |= seed << 8;

    for (let i = 0; i < 256; i++) {
        const v = i & 1 ? hash[i] ^ (seed & 255) : hash[i] ^ ((seed>>8) & 255);

        hashPerm[i] = hashPerm[i + 256] = v;
        gradPerm[i] = gradPerm[i + 256] = grads[v % 4];
    }
};

function smooth(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}
noise.normalize = function(value) {
    return value * 2 + 1;
}

noise.perlin = function(x, y) {
    // Find unit grid cell containing point
    var X = Math.floor(x), Y = Math.floor(y);
    // Get relative xy coordinates of point within that cell
    x -= X; y -= Y;
    // Wrap the integer cells at 255 (smaller integer period can be introduced here)
    X &= 255; Y &= 255;

    // Calculate noise contributions from each of the four corners
    const yMinus1 = y - 1;
    const xMinus1 = x - 1;
    const XPlus1 = X + 1;
    const YPlus1 = Y + 1;
    const n00 = gradPerm[X + hashPerm[Y]].dot(x, y);
    const n01 = gradPerm[X + hashPerm[YPlus1]].dot(x, yMinus1);
    const n10 = gradPerm[XPlus1 + hashPerm[Y]].dot(xMinus1, y);
    const n11 = gradPerm[XPlus1 + hashPerm[YPlus1]].dot(xMinus1, yMinus1);

    // Compute the smooth curve value for x
    const u = smooth(x);

    // Interpolate the four results
    return gsap.utils.interpolate(gsap.utils.interpolate(n00, n10, u), gsap.utils.interpolate(n01, n11, u), smooth(y));
};