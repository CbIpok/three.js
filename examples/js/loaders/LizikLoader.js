import {
	FileLoader,
	Loader,
	Matrix4,
	Vector3
} from 'three';
import * as fflate from '../libs/fflate.module.js';
import { Volume } from '../misc/Volume.js';

class LizikLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( data ) {

			try {

				onLoad( scope.parse( data ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( data ) {

		// this parser is largely inspired from the XTK NRRD parser : https://github.com/xtk/X

		const volume = new Volume();

		//todo volume.data, volume.xLength, volume.yLength, volume.zLength


		return volume;

	}

	parseChars( array, start, end ) {

		// without borders, use the whole array
		if ( start === undefined ) {

			start = 0;

		}

		if ( end === undefined ) {

			end = array.length;

		}

		let output = '';
		// create and append the chars
		let i = 0;
		for ( i = start; i < end; ++ i ) {

			output += String.fromCharCode( array[ i ] );

		}

		return output;

	}

}

const _fieldFunctions = {

	type: function ( data ) {

		switch ( data ) {

			case 'uchar':
			case 'unsigned char':
			case 'uint8':
			case 'uint8_t':
				this.__array = Uint8Array;
				break;
			case 'signed char':
			case 'int8':
			case 'int8_t':
				this.__array = Int8Array;
				break;
			case 'short':
			case 'short int':
			case 'signed short':
			case 'signed short int':
			case 'int16':
			case 'int16_t':
				this.__array = Int16Array;
				break;
			case 'ushort':
			case 'unsigned short':
			case 'unsigned short int':
			case 'uint16':
			case 'uint16_t':
				this.__array = Uint16Array;
				break;
			case 'int':
			case 'signed int':
			case 'int32':
			case 'int32_t':
				this.__array = Int32Array;
				break;
			case 'uint':
			case 'unsigned int':
			case 'uint32':
			case 'uint32_t':
				this.__array = Uint32Array;
				break;
			case 'float':
				this.__array = Float32Array;
				break;
			case 'double':
				this.__array = Float64Array;
				break;
			default:
				throw new Error( 'Unsupported NRRD data type: ' + data );

		}

		return this.type = data;

	},

	endian: function ( data ) {

		return this.endian = data;

	},

	encoding: function ( data ) {

		return this.encoding = data;

	},

	dimension: function ( data ) {

		return this.dim = parseInt( data, 10 );

	},

	sizes: function ( data ) {

		let i;
		return this.sizes = ( function () {

			const _ref = data.split( /\s+/ );
			const _results = [];

			for ( let _i = 0, _len = _ref.length; _i < _len; _i ++ ) {

				i = _ref[ _i ];
				_results.push( parseInt( i, 10 ) );

			}

			return _results;

		} )();

	},

	space: function ( data ) {

		return this.space = data;

	},

	'space origin': function ( data ) {

		return this.space_origin = data.split( '(' )[ 1 ].split( ')' )[ 0 ].split( ',' );

	},

	'space directions': function ( data ) {

		let f, v;
		const parts = data.match( /\(.*?\)/g );
		return this.vectors = ( function () {

			const _results = [];

			for ( let _i = 0, _len = parts.length; _i < _len; _i ++ ) {

				v = parts[ _i ];
				_results.push( ( function () {

					const _ref = v.slice( 1, - 1 ).split( /,/ );
					const _results2 = [];

					for ( let _j = 0, _len2 = _ref.length; _j < _len2; _j ++ ) {

						f = _ref[ _j ];
						_results2.push( parseFloat( f ) );

					}

					return _results2;

				} )() );

			}

			return _results;

		} )();

	},

	spacings: function ( data ) {

		let f;
		const parts = data.split( /\s+/ );
		return this.spacings = ( function () {

			const _results = [];

			for ( let _i = 0, _len = parts.length; _i < _len; _i ++ ) {

				f = parts[ _i ];
				_results.push( parseFloat( f ) );

			}

			return _results;

		} )();

	}

};

export { LizikLoader };
