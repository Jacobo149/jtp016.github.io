import PerlinNoise from '../Math/Noises.js'

export default class FogData{
    cosntructor(){
        this._dims = [64, 64, 64]; // Dimensions of the fog data
        this._sizes = [2, 2, 2]; // Sizes of the fog data
    }
    async init(){
        this._perlinNoise = new PerlinNoise();
        this._data = Array(this._dims[0] * this._dims[1] * this._dims[2]).fill(0);
        for (let z = 0; z < this._dims[2]; z++) {
            for (let y = 0; y < this._dims[1]; y++) {
                for (let x = 0; x < this._dims[0]; x++) {
                    let noise = (this._perlineNoise.noise3d(x, y, z) + 2) / 4;
                    this._data[z *(this._dims[0] * this._dims[1]) + y * this._dims[0] + x] = noise
                }
            }
        }
    }
}