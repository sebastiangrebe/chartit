import {join} from 'path'

const include = join(__dirname,'src');

export default {
    entry: './src/index',
    ouput: {
        path: join(__dirname, 'dist'),
        libraryTarget: 'umd',
        library: 'chartit'
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {test: /\.js$/,loader: 'babel', include}
        ]
    }
}