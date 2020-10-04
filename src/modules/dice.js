import seedrandom from "seedrandom";

const prng = new seedrandom();

const randomInteger = function (min, max) {
    return Math.floor(min + prng() * (max - min + 1));
};

export default () => {
    return randomInteger(1, 6);
};