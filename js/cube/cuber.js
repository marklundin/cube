(function(){

/** @preserve

	CUBER
	-----

	
	Cuber is a programmable Rubiks cube of sorts. 


	Made with love by:
	@author Mark Lundin - http://mark-lundin.com / @mark_lundin
	@author Stewart Smith - stewd.io
	@author Google Creative Lab



	NOTATION

	UPPERCASE = Clockwise to next 90 degree peg
	lowercase = Anticlockwise to next 90 degree peg



	FACE & SLICE ROTATION COMMANDS

	F	Front
	S 	Standing (rotate according to Front Face's orientation)
	B 	Back
	
	L 	Left
	M 	Middle (rotate according to Left Face's orientation)
	R 	Right
	
	U 	Up
	E 	Equator (rotate according to Up Face's orientation)
	D 	Down



	ENTIRE CUBE ROTATION COMMANDS
	
	X   Rotate entire cube according to Right Face's orientation
	Y   Rotate entire cube according to Up Face's orientation
	Z   Rotate entire cube according to Front Face's orientation



	NOTATION REFERENCES

	http://en.wikipedia.org/wiki/Rubik's_Cube#Move_notation
	http://en.wikibooks.org/wiki/Template:Rubik's_cube_notation


**/





var ERNO = {};

(function () {

	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	};

	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
	
})();



// based on https://github.com/documentcloud/underscore/blob/bf657be243a075b5e72acc8a83e6f12a564d8f55/underscore.js#L767
ERNO.extend = function ( obj, source ) {

	// ECMAScript5 compatibility based on: http://www.nczonline.net/blog/2012/12/11/are-your-mixins-ecmascript-5-compatible/
	if ( Object.keys ) {

		var keys = Object.keys( source );

		for (var i = 0, il = keys.length; i < il; i++) {

			var prop = keys[i];
			Object.defineProperty( obj, prop, Object.getOwnPropertyDescriptor( source, prop ) );

		}

	} else {

		var safeHasOwnProperty = {}.hasOwnProperty;

		for ( var prop in source ) {

			if ( safeHasOwnProperty.call( source, prop ) ) {

				obj[prop] = source[prop];

			}

		}

	}

	return obj;

};
/**
 * @author sole / http://soledadpenades.com
 * @author mrdoob / http://mrdoob.com
 * @author Robert Eisele / http://www.xarg.org
 * @author Philippe / http://philippe.elsass.me
 * @author Robert Penner / http://www.robertpenner.com/easing_terms_of_use.html
 * @author Paul Lewis / http://www.aerotwist.com/
 * @author lechecacharro
 * @author Josh Faul / http://jocafa.com/
 * @author egraether / http://egraether.com/
 * @author endel / http://endel.me
 * @author Ben Delarre / http://delarre.net
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '12',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;
		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

                // Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
                if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
						_reversed = !_reversed;
					}
					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};
/**
 * @author mrdoob / http://mrdoob.com/
 * @author Larry Battle / http://bateru.com/news
 * @author bhouston / http://exocortex.com
 */

var THREE = { REVISION: '66' };

self.console = self.console || {

	info: function () {},
	log: function () {},
	debug: function () {},
	warn: function () {},
	error: function () {}

};

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
// using 'self' instead of 'window' for compatibility with both NodeJS and IE10.
( function () {

	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

	for ( var x = 0; x < vendors.length && !self.requestAnimationFrame; ++ x ) {

		self.requestAnimationFrame = self[ vendors[ x ] + 'RequestAnimationFrame' ];
		self.cancelAnimationFrame = self[ vendors[ x ] + 'CancelAnimationFrame' ] || self[ vendors[ x ] + 'CancelRequestAnimationFrame' ];

	}

	if ( self.requestAnimationFrame === undefined && self['setTimeout'] !== undefined ) {

		self.requestAnimationFrame = function ( callback ) {

			var currTime = Date.now(), timeToCall = Math.max( 0, 16 - ( currTime - lastTime ) );
			var id = self.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
			lastTime = currTime + timeToCall;
			return id;

		};

	}

	if( self.cancelAnimationFrame === undefined && self['clearTimeout'] !== undefined ) {

		self.cancelAnimationFrame = function ( id ) { self.clearTimeout( id ) };

	}

}() );

// GL STATE CONSTANTS

THREE.CullFaceNone = 0;
THREE.CullFaceBack = 1;
THREE.CullFaceFront = 2;
THREE.CullFaceFrontBack = 3;

THREE.FrontFaceDirectionCW = 0;
THREE.FrontFaceDirectionCCW = 1;

// SHADOWING TYPES

THREE.BasicShadowMap = 0;
THREE.PCFShadowMap = 1;
THREE.PCFSoftShadowMap = 2;

// MATERIAL CONSTANTS

// side

THREE.FrontSide = 0;
THREE.BackSide = 1;
THREE.DoubleSide = 2;

// shading

THREE.NoShading = 0;
THREE.FlatShading = 1;
THREE.SmoothShading = 2;

// colors

THREE.NoColors = 0;
THREE.FaceColors = 1;
THREE.VertexColors = 2;

// blending modes

THREE.NoBlending = 0;
THREE.NormalBlending = 1;
THREE.AdditiveBlending = 2;
THREE.SubtractiveBlending = 3;
THREE.MultiplyBlending = 4;
THREE.CustomBlending = 5;

// custom blending equations
// (numbers start from 100 not to clash with other
//  mappings to OpenGL constants defined in Texture.js)

THREE.AddEquation = 100;
THREE.SubtractEquation = 101;
THREE.ReverseSubtractEquation = 102;

// custom blending destination factors

THREE.ZeroFactor = 200;
THREE.OneFactor = 201;
THREE.SrcColorFactor = 202;
THREE.OneMinusSrcColorFactor = 203;
THREE.SrcAlphaFactor = 204;
THREE.OneMinusSrcAlphaFactor = 205;
THREE.DstAlphaFactor = 206;
THREE.OneMinusDstAlphaFactor = 207;

// custom blending source factors

//THREE.ZeroFactor = 200;
//THREE.OneFactor = 201;
//THREE.SrcAlphaFactor = 204;
//THREE.OneMinusSrcAlphaFactor = 205;
//THREE.DstAlphaFactor = 206;
//THREE.OneMinusDstAlphaFactor = 207;
THREE.DstColorFactor = 208;
THREE.OneMinusDstColorFactor = 209;
THREE.SrcAlphaSaturateFactor = 210;


// TEXTURE CONSTANTS

THREE.MultiplyOperation = 0;
THREE.MixOperation = 1;
THREE.AddOperation = 2;

// Mapping modes

THREE.UVMapping = function () {};

THREE.CubeReflectionMapping = function () {};
THREE.CubeRefractionMapping = function () {};

THREE.SphericalReflectionMapping = function () {};
THREE.SphericalRefractionMapping = function () {};

// Wrapping modes

THREE.RepeatWrapping = 1000;
THREE.ClampToEdgeWrapping = 1001;
THREE.MirroredRepeatWrapping = 1002;

// Filters

THREE.NearestFilter = 1003;
THREE.NearestMipMapNearestFilter = 1004;
THREE.NearestMipMapLinearFilter = 1005;
THREE.LinearFilter = 1006;
THREE.LinearMipMapNearestFilter = 1007;
THREE.LinearMipMapLinearFilter = 1008;

// Data types

THREE.UnsignedByteType = 1009;
THREE.ByteType = 1010;
THREE.ShortType = 1011;
THREE.UnsignedShortType = 1012;
THREE.IntType = 1013;
THREE.UnsignedIntType = 1014;
THREE.FloatType = 1015;

// Pixel types

//THREE.UnsignedByteType = 1009;
THREE.UnsignedShort4444Type = 1016;
THREE.UnsignedShort5551Type = 1017;
THREE.UnsignedShort565Type = 1018;

// Pixel formats

THREE.AlphaFormat = 1019;
THREE.RGBFormat = 1020;
THREE.RGBAFormat = 1021;
THREE.LuminanceFormat = 1022;
THREE.LuminanceAlphaFormat = 1023;

// Compressed texture formats

THREE.RGB_S3TC_DXT1_Format = 2001;
THREE.RGBA_S3TC_DXT1_Format = 2002;
THREE.RGBA_S3TC_DXT3_Format = 2003;
THREE.RGBA_S3TC_DXT5_Format = 2004;

/*
// Potential future PVRTC compressed texture formats
THREE.RGB_PVRTC_4BPPV1_Format = 2100;
THREE.RGB_PVRTC_2BPPV1_Format = 2101;
THREE.RGBA_PVRTC_4BPPV1_Format = 2102;
THREE.RGBA_PVRTC_2BPPV1_Format = 2103;
*/

/**
 * https://github.com/mrdoob/eventdispatcher.js/
 */

THREE.EventDispatcher = function () {}

THREE.EventDispatcher.prototype = {

	constructor: THREE.EventDispatcher,

	apply: function ( object ) {

		object.addEventListener = THREE.EventDispatcher.prototype.addEventListener;
		object.hasEventListener = THREE.EventDispatcher.prototype.hasEventListener;
		object.removeEventListener = THREE.EventDispatcher.prototype.removeEventListener;
		object.dispatchEvent = THREE.EventDispatcher.prototype.dispatchEvent;

	},

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	},

	dispatchEvent: function () {

		var array = [];

		return function ( event ) {

			if ( this._listeners === undefined ) return;

			var listeners = this._listeners;
			var listenerArray = listeners[ event.type ];

			if ( listenerArray !== undefined ) {

				event.target = this;

				var length = listenerArray.length;

				for ( var i = 0; i < length; i ++ ) {

					array[ i ] = listenerArray[ i ];

				}

				for ( var i = 0; i < length; i ++ ) {

					array[ i ].call( this, event );

				}

			}

		};

	}()

};

/**
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Math = {

	PI2: Math.PI * 2,

	generateUUID: function () {

		// http://www.broofa.com/Tools/Math.uuid.htm
		
		var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		var uuid = new Array(36);
		var rnd = 0, r;

		return function () {

			for ( var i = 0; i < 36; i ++ ) {

				if ( i == 8 || i == 13 || i == 18 || i == 23 ) {
			
					uuid[ i ] = '-';
			
				} else if ( i == 14 ) {
			
					uuid[ i ] = '4';
			
				} else {
			
					if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
					r = rnd & 0xf;
					rnd = rnd >> 4;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];

				}
			}
			
			return uuid.join('');

		};

	}(),

	// Clamp value to range <a, b>

	clamp: function ( x, a, b ) {

		return ( x < a ) ? a : ( ( x > b ) ? b : x );

	},

	// Clamp value to range <a, inf)

	clampBottom: function ( x, a ) {

		return x < a ? a : x;

	},

	// Linear mapping from range <a1, a2> to range <b1, b2>

	mapLinear: function ( x, a1, a2, b1, b2 ) {

		return b1 + ( x - a1 ) * ( b2 - b1 ) / ( a2 - a1 );

	},

	// http://en.wikipedia.org/wiki/Smoothstep

	smoothstep: function ( x, min, max ) {

		if ( x <= min ) return 0;
		if ( x >= max ) return 1;

		x = ( x - min )/( max - min );

		return x*x*(3 - 2*x);

	},

	smootherstep: function ( x, min, max ) {

		if ( x <= min ) return 0;
		if ( x >= max ) return 1;

		x = ( x - min )/( max - min );

		return x*x*x*(x*(x*6 - 15) + 10);

	},

	// Random float from <0, 1> with 16 bits of randomness
	// (standard Math.random() creates repetitive patterns when applied over larger space)

	random16: function () {

		return ( 65280 * Math.random() + 255 * Math.random() ) / 65535;

	},

	// Random integer from <low, high> interval

	randInt: function ( low, high ) {

		return low + Math.floor( Math.random() * ( high - low + 1 ) );

	},

	// Random float from <low, high> interval

	randFloat: function ( low, high ) {

		return low + Math.random() * ( high - low );

	},

	// Random float from <-range/2, range/2> interval

	randFloatSpread: function ( range ) {

		return range * ( 0.5 - Math.random() );

	},

	sign: function ( x ) {

		return ( x < 0 ) ? - 1 : ( x > 0 ) ? 1 : 0;

	},

	degToRad: function() {

		var degreeToRadiansFactor = Math.PI / 180;

		return function ( degrees ) {

			return degrees * degreeToRadiansFactor;

		};

	}(),

	radToDeg: function() {

		var radianToDegreesFactor = 180 / Math.PI;

		return function ( radians ) {

			return radians * radianToDegreesFactor;

		};

	}(),

	isPowerOfTwo: function ( value ) {
		return ( value & ( value - 1 ) ) === 0 && value !== 0;
	}

};

/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */

THREE.Quaternion = function ( x, y, z, w ) {

	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._w = ( w !== undefined ) ? w : 1;

};

THREE.Quaternion.prototype = {

	constructor: THREE.Quaternion,

	_x: 0,_y: 0, _z: 0, _w: 0,

	_euler: undefined,

	_updateEuler: function ( callback ) {

		if ( this._euler !== undefined ) {

			this._euler.setFromQuaternion( this, undefined, false );

		}

	},

	get x () {

		return this._x;

	},

	set x ( value ) {

		this._x = value;
		this._updateEuler();

	},

	get y () {

		return this._y;

	},

	set y ( value ) {

		this._y = value;
		this._updateEuler();

	},

	get z () {

		return this._z;

	},

	set z ( value ) {

		this._z = value;
		this._updateEuler();

	},

	get w () {

		return this._w;

	},

	set w ( value ) {

		this._w = value;
		this._updateEuler();

	},

	set: function ( x, y, z, w ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this._updateEuler();

		return this;

	},

	copy: function ( quaternion ) {

		this._x = quaternion._x;
		this._y = quaternion._y;
		this._z = quaternion._z;
		this._w = quaternion._w;

		this._updateEuler();

		return this;

	},

	setFromEuler: function ( euler, update ) {

		if ( euler instanceof THREE.Euler === false ) {

			throw new Error( 'ERROR: Quaternion\'s .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.  Please update your code.' );
		}

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		var c1 = Math.cos( euler._x / 2 );
		var c2 = Math.cos( euler._y / 2 );
		var c3 = Math.cos( euler._z / 2 );
		var s1 = Math.sin( euler._x / 2 );
		var s2 = Math.sin( euler._y / 2 );
		var s3 = Math.sin( euler._z / 2 );

		if ( euler.order === 'XYZ' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'YXZ' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		} else if ( euler.order === 'ZXY' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'ZYX' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		} else if ( euler.order === 'YZX' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'XZY' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		}

		if ( update !== false ) this._updateEuler();

		return this;

	},

	setFromAxisAngle: function ( axis, angle ) {

		// from http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm
		// axis have to be normalized

		var halfAngle = angle / 2, s = Math.sin( halfAngle );

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );

		this._updateEuler();

		return this;

	},

	setFromRotationMatrix: function ( m ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		var te = m.elements,

			m11 = te[0], m12 = te[4], m13 = te[8],
			m21 = te[1], m22 = te[5], m23 = te[9],
			m31 = te[2], m32 = te[6], m33 = te[10],

			trace = m11 + m22 + m33,
			s;

		if ( trace > 0 ) {

			s = 0.5 / Math.sqrt( trace + 1.0 );

			this._w = 0.25 / s;
			this._x = ( m32 - m23 ) * s;
			this._y = ( m13 - m31 ) * s;
			this._z = ( m21 - m12 ) * s;

		} else if ( m11 > m22 && m11 > m33 ) {

			s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this._w = (m32 - m23 ) / s;
			this._x = 0.25 * s;
			this._y = (m12 + m21 ) / s;
			this._z = (m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this._w = (m13 - m31 ) / s;
			this._x = (m12 + m21 ) / s;
			this._y = 0.25 * s;
			this._z = (m23 + m32 ) / s;

		} else {

			s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this._w = ( m21 - m12 ) / s;
			this._x = ( m13 + m31 ) / s;
			this._y = ( m23 + m32 ) / s;
			this._z = 0.25 * s;

		}

		this._updateEuler();

		return this;

	},

	inverse: function () {

		this.conjugate().normalize();

		return this;

	},

	conjugate: function () {

		this._x *= -1;
		this._y *= -1;
		this._z *= -1;

		this._updateEuler();

		return this;

	},

	lengthSq: function () {

		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

	},

	length: function () {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

	},

	normalize: function () {

		var l = this.length();

		if ( l === 0 ) {

			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;

		} else {

			l = 1 / l;

			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;

		}

		return this;

	},

	multiply: function ( q, p ) {

		if ( p !== undefined ) {

			console.warn( 'DEPRECATED: Quaternion\'s .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.' );
			return this.multiplyQuaternions( q, p );

		}

		return this.multiplyQuaternions( this, q );

	},

	multiplyQuaternions: function ( a, b ) {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		this._updateEuler();

		return this;

	},

	multiplyVector3: function ( vector ) {

		console.warn( 'DEPRECATED: Quaternion\'s .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
		return vector.applyQuaternion( this );

	},

	slerp: function ( qb, t ) {

		var x = this._x, y = this._y, z = this._z, w = this._w;

		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

		var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

		if ( cosHalfTheta < 0 ) {

			this._w = -qb._w;
			this._x = -qb._x;
			this._y = -qb._y;
			this._z = -qb._z;

			cosHalfTheta = -cosHalfTheta;

		} else {

			this.copy( qb );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this._w = w;
			this._x = x;
			this._y = y;
			this._z = z;

			return this;

		}

		var halfTheta = Math.acos( cosHalfTheta );
		var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

		if ( Math.abs( sinHalfTheta ) < 0.001 ) {

			this._w = 0.5 * ( w + this._w );
			this._x = 0.5 * ( x + this._x );
			this._y = 0.5 * ( y + this._y );
			this._z = 0.5 * ( z + this._z );

			return this;

		}

		var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
		ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this._w = ( w * ratioA + this._w * ratioB );
		this._x = ( x * ratioA + this._x * ratioB );
		this._y = ( y * ratioA + this._y * ratioB );
		this._z = ( z * ratioA + this._z * ratioB );

		this._updateEuler();

		return this;

	},

	equals: function ( quaternion ) {

		return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

	},

	fromArray: function ( array ) {

		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		this._w = array[ 3 ];

		this._updateEuler();

		return this;

	},

	toArray: function () {

		return [ this._x, this._y, this._z, this._w ];

	},

	clone: function () {

		return new THREE.Quaternion( this._x, this._y, this._z, this._w );

	}

};

THREE.Quaternion.slerp = function ( qa, qb, qm, t ) {

	return qm.copy( qa ).slerp( qb, t );

}

/**
 * @author mrdoob / http://mrdoob.com/
 * @author philogb / http://blog.thejit.org/
 * @author egraether / http://egraether.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

THREE.Vector2 = function ( x, y ) {

	this.x = x || 0;
	this.y = y || 0;

};

THREE.Vector2.prototype = {

	constructor: THREE.Vector2,

	set: function ( x, y ) {

		this.x = x;
		this.y = y;

		return this;

	},

	setX: function ( x ) {

		this.x = x;

		return this;

	},

	setY: function ( y ) {

		this.y = y;

		return this;

	},


	setComponent: function ( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			default: throw new Error( "index is out of range: " + index );

		}

	},

	getComponent: function ( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			default: throw new Error( "index is out of range: " + index );

		}

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;

		return this;

	},

	add: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'DEPRECATED: Vector2\'s .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		this.x += v.x;
		this.y += v.y;

		return this;

	},

	addVectors: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;

		return this;

	},

	sub: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'DEPRECATED: Vector2\'s .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		this.x -= v.x;
		this.y -= v.y;

		return this;

	},

	subVectors: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;

		return this;

	},

	multiplyScalar: function ( s ) {

		this.x *= s;
		this.y *= s;

		return this;

	},

	divideScalar: function ( scalar ) {

		if ( scalar !== 0 ) {

			var invScalar = 1 / scalar;

			this.x *= invScalar;
			this.y *= invScalar;

		} else {

			this.x = 0;
			this.y = 0;

		}

		return this;

	},

	min: function ( v ) {

		if ( this.x > v.x ) {

			this.x = v.x;

		}

		if ( this.y > v.y ) {

			this.y = v.y;

		}

		return this;

	},

	max: function ( v ) {

		if ( this.x < v.x ) {

			this.x = v.x;

		}

		if ( this.y < v.y ) {

			this.y = v.y;

		}

		return this;

	},

	clamp: function ( min, max ) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		if ( this.x < min.x ) {

			this.x = min.x;

		} else if ( this.x > max.x ) {

			this.x = max.x;

		}

		if ( this.y < min.y ) {

			this.y = min.y;

		} else if ( this.y > max.y ) {

			this.y = max.y;

		}

		return this;
	},

	clampScalar: ( function () {

		var min, max;

		return function ( minVal, maxVal ) {

			if ( min === undefined ) {

				min = new THREE.Vector2();
				max = new THREE.Vector2();

			}

			min.set( minVal, minVal );
			max.set( maxVal, maxVal );

			return this.clamp( min, max );

		};
		
	} )(),

	floor: function () {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );

		return this;

	},

	ceil: function () {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );

		return this;

	},

	round: function () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );

		return this;

	},

	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );

		return this;

	},

	negate: function () {

		return this.multiplyScalar( - 1 );

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		var dx = this.x - v.x, dy = this.y - v.y;
		return dx * dx + dy * dy;

	},

	setLength: function ( l ) {

		var oldLength = this.length();

		if ( oldLength !== 0 && l !== oldLength ) {

			this.multiplyScalar( l / oldLength );
		}

		return this;

	},

	lerp: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;

		return this;

	},

	equals: function( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) );

	},

	fromArray: function ( array ) {

		this.x = array[ 0 ];
		this.y = array[ 1 ];

		return this;

	},

	toArray: function () {

		return [ this.x, this.y ];

	},

	clone: function () {

		return new THREE.Vector2( this.x, this.y );

	}

};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.Vector3 = function ( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

};

THREE.Vector3.prototype = {

	constructor: THREE.Vector3,

	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	setX: function ( x ) {

		this.x = x;

		return this;

	},

	setY: function ( y ) {

		this.y = y;

		return this;

	},

	setZ: function ( z ) {

		this.z = z;

		return this;

	},

	setComponent: function ( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( "index is out of range: " + index );

		}

	},

	getComponent: function ( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( "index is out of range: " + index );

		}

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	add: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'DEPRECATED: Vector3\'s .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	addVectors: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	},

	sub: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'DEPRECATED: Vector3\'s .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},

	subVectors: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	},

	multiply: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'DEPRECATED: Vector3\'s .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	},

	multiplyScalar: function ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	},

	multiplyVectors: function ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	},

	applyEuler: function () {

		var quaternion;

		return function ( euler ) {

			if ( euler instanceof THREE.Euler === false ) {

				console.error( 'ERROR: Vector3\'s .applyEuler() now expects a Euler rotation rather than a Vector3 and order.  Please update your code.' );

			}

			if ( quaternion === undefined ) quaternion = new THREE.Quaternion();

			this.applyQuaternion( quaternion.setFromEuler( euler ) );

			return this;

		};

	}(),

	applyAxisAngle: function () {

		var quaternion;

		return function ( axis, angle ) {

			if ( quaternion === undefined ) quaternion = new THREE.Quaternion();

			this.applyQuaternion( quaternion.setFromAxisAngle( axis, angle ) );

			return this;

		};

	}(),

	applyMatrix3: function ( m ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var e = m.elements;

		this.x = e[0] * x + e[3] * y + e[6] * z;
		this.y = e[1] * x + e[4] * y + e[7] * z;
		this.z = e[2] * x + e[5] * y + e[8] * z;

		return this;

	},

	applyMatrix4: function ( m ) {

		// input: THREE.Matrix4 affine matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[0] * x + e[4] * y + e[8]  * z + e[12];
		this.y = e[1] * x + e[5] * y + e[9]  * z + e[13];
		this.z = e[2] * x + e[6] * y + e[10] * z + e[14];

		return this;

	},

	applyProjection: function ( m ) {

		// input: THREE.Matrix4 projection matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;
		var d = 1 / ( e[3] * x + e[7] * y + e[11] * z + e[15] ); // perspective divide

		this.x = ( e[0] * x + e[4] * y + e[8]  * z + e[12] ) * d;
		this.y = ( e[1] * x + e[5] * y + e[9]  * z + e[13] ) * d;
		this.z = ( e[2] * x + e[6] * y + e[10] * z + e[14] ) * d;

		return this;

	},

	applyQuaternion: function ( q ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var qx = q.x;
		var qy = q.y;
		var qz = q.z;
		var qw = q.w;

		// calculate quat * vector

		var ix =  qw * x + qy * z - qz * y;
		var iy =  qw * y + qz * x - qx * z;
		var iz =  qw * z + qx * y - qy * x;
		var iw = -qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
		this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
		this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

		return this;

	},

	transformDirection: function ( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[0] * x + e[4] * y + e[8]  * z;
		this.y = e[1] * x + e[5] * y + e[9]  * z;
		this.z = e[2] * x + e[6] * y + e[10] * z;

		this.normalize();

		return this;

	},

	divide: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	},

	divideScalar: function ( scalar ) {

		if ( scalar !== 0 ) {

			var invScalar = 1 / scalar;

			this.x *= invScalar;
			this.y *= invScalar;
			this.z *= invScalar;

		} else {

			this.x = 0;
			this.y = 0;
			this.z = 0;

		}

		return this;

	},

	min: function ( v ) {

		if ( this.x > v.x ) {

			this.x = v.x;

		}

		if ( this.y > v.y ) {

			this.y = v.y;

		}

		if ( this.z > v.z ) {

			this.z = v.z;

		}

		return this;

	},

	max: function ( v ) {

		if ( this.x < v.x ) {

			this.x = v.x;

		}

		if ( this.y < v.y ) {

			this.y = v.y;

		}

		if ( this.z < v.z ) {

			this.z = v.z;

		}

		return this;

	},

	clamp: function ( min, max ) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		if ( this.x < min.x ) {

			this.x = min.x;

		} else if ( this.x > max.x ) {

			this.x = max.x;

		}

		if ( this.y < min.y ) {

			this.y = min.y;

		} else if ( this.y > max.y ) {

			this.y = max.y;

		}

		if ( this.z < min.z ) {

			this.z = min.z;

		} else if ( this.z > max.z ) {

			this.z = max.z;

		}

		return this;

	},

	clampScalar: ( function () {

		var min, max;

		return function ( minVal, maxVal ) {

			if ( min === undefined ) {

				min = new THREE.Vector3();
				max = new THREE.Vector3();

			}

			min.set( minVal, minVal, minVal );
			max.set( maxVal, maxVal, maxVal );

			return this.clamp( min, max );

		};

	} )(),

	floor: function () {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	},

	ceil: function () {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	},

	round: function () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	},

	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	},

	negate: function () {

		return this.multiplyScalar( - 1 );

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	},

	lengthManhattan: function () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( l ) {

		var oldLength = this.length();

		if ( oldLength !== 0 && l !== oldLength  ) {

			this.multiplyScalar( l / oldLength );
		}

		return this;

	},

	lerp: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	},

	cross: function ( v, w ) {

		if ( w !== undefined ) {

			console.warn( 'DEPRECATED: Vector3\'s .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		var x = this.x, y = this.y, z = this.z;

		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;

		return this;

	},

	crossVectors: function ( a, b ) {

		var ax = a.x, ay = a.y, az = a.z;
		var bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	},

	projectOnVector: function () {

		var v1, dot;

		return function ( vector ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			v1.copy( vector ).normalize();

			dot = this.dot( v1 );

			return this.copy( v1 ).multiplyScalar( dot );

		};

	}(),

	projectOnPlane: function () {

		var v1;

		return function ( planeNormal ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			v1.copy( this ).projectOnVector( planeNormal );

			return this.sub( v1 );

		}

	}(),

	reflect: function () {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		var v1;

		return function ( normal ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			return this.sub( v1.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

		}

	}(),

	angleTo: function ( v ) {

		var theta = this.dot( v ) / ( this.length() * v.length() );

		// clamp, to handle numerical problems

		return Math.acos( THREE.Math.clamp( theta, -1, 1 ) );

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		var dx = this.x - v.x;
		var dy = this.y - v.y;
		var dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	},

	setEulerFromRotationMatrix: function ( m, order ) {

		console.error( "REMOVED: Vector3\'s setEulerFromRotationMatrix has been removed in favor of Euler.setFromRotationMatrix(), please update your code.");

	},

	setEulerFromQuaternion: function ( q, order ) {

		console.error( "REMOVED: Vector3\'s setEulerFromQuaternion: has been removed in favor of Euler.setFromQuaternion(), please update your code.");

	},

	getPositionFromMatrix: function ( m ) {

		console.warn( "DEPRECATED: Vector3\'s .getPositionFromMatrix() has been renamed to .setFromMatrixPosition(). Please update your code." );

		return this.setFromMatrixPosition( m );

	},

	getScaleFromMatrix: function ( m ) {

		console.warn( "DEPRECATED: Vector3\'s .getScaleFromMatrix() has been renamed to .setFromMatrixScale(). Please update your code." );

		return this.setFromMatrixScale( m );
	},

	getColumnFromMatrix: function ( index, matrix ) {

		console.warn( "DEPRECATED: Vector3\'s .getColumnFromMatrix() has been renamed to .setFromMatrixColumn(). Please update your code." );

		return this.setFromMatrixColumn( index, matrix );

	},

	setFromMatrixPosition: function ( m ) {

		this.x = m.elements[ 12 ];
		this.y = m.elements[ 13 ];
		this.z = m.elements[ 14 ];

		return this;

	},

	setFromMatrixScale: function ( m ) {

		var sx = this.set( m.elements[ 0 ], m.elements[ 1 ], m.elements[  2 ] ).length();
		var sy = this.set( m.elements[ 4 ], m.elements[ 5 ], m.elements[  6 ] ).length();
		var sz = this.set( m.elements[ 8 ], m.elements[ 9 ], m.elements[ 10 ] ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;
	},

	setFromMatrixColumn: function ( index, matrix ) {

		var offset = index * 4;

		var me = matrix.elements;

		this.x = me[ offset ];
		this.y = me[ offset + 1 ];
		this.z = me[ offset + 2 ];

		return this;

	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	},

	fromArray: function ( array ) {

		this.x = array[ 0 ];
		this.y = array[ 1 ];
		this.z = array[ 2 ];

		return this;

	},

	toArray: function () {

		return [ this.x, this.y, this.z ];

	},

	clone: function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	}

};
/**
 * @author bhouston / http://exocortex.com
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.Box3 = function ( min, max ) {

	this.min = ( min !== undefined ) ? min : new THREE.Vector3( Infinity, Infinity, Infinity );
	this.max = ( max !== undefined ) ? max : new THREE.Vector3( -Infinity, -Infinity, -Infinity );

};

THREE.Box3.prototype = {

	constructor: THREE.Box3,

	set: function ( min, max ) {

		this.min.copy( min );
		this.max.copy( max );

		return this;

	},

	addPoint: function ( point ) {

		if ( point.x < this.min.x ) {

			this.min.x = point.x;

		} else if ( point.x > this.max.x ) {

			this.max.x = point.x;

		}

		if ( point.y < this.min.y ) {

			this.min.y = point.y;

		} else if ( point.y > this.max.y ) {

			this.max.y = point.y;

		}

		if ( point.z < this.min.z ) {

			this.min.z = point.z;

		} else if ( point.z > this.max.z ) {

			this.max.z = point.z;

		}

	},

	setFromPoints: function ( points ) {

		if ( points.length > 0 ) {

			var point = points[ 0 ];

			this.min.copy( point );
			this.max.copy( point );

			for ( var i = 1, il = points.length; i < il; i ++ ) {

				this.addPoint( points[ i ] )

			}

		} else {

			this.makeEmpty();

		}

		return this;

	},

	setFromCenterAndSize: function() {

		var v1 = new THREE.Vector3();

		return function ( center, size ) {

			var halfSize = v1.copy( size ).multiplyScalar( 0.5 );

			this.min.copy( center ).sub( halfSize );
			this.max.copy( center ).add( halfSize );

			return this;

		};

	}(),

	setFromObject: function() {

		// Computes the world-axis-aligned bounding box of an object (including its children),
		// accounting for both the object's, and childrens', world transforms

		var v1 = new THREE.Vector3();

		return function( object ) {

			var scope = this;

			object.updateMatrixWorld( true );

			this.makeEmpty();

			object.traverse( function ( node ) {

				if ( node.geometry !== undefined && node.geometry.vertices !== undefined ) {

					var vertices = node.geometry.vertices;

					for ( var i = 0, il = vertices.length; i < il; i++ ) {

						v1.copy( vertices[ i ] );

						v1.applyMatrix4( node.matrixWorld );

						scope.expandByPoint( v1 );

					}

				}

			} );

			return this;

		};

	}(),

	copy: function ( box ) {

		this.min.copy( box.min );
		this.max.copy( box.max );

		return this;

	},

	makeEmpty: function () {

		this.min.x = this.min.y = this.min.z = Infinity;
		this.max.x = this.max.y = this.max.z = -Infinity;

		return this;

	},

	empty: function () {

		// this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

		return ( this.max.x < this.min.x ) || ( this.max.y < this.min.y ) || ( this.max.z < this.min.z );

	},

	center: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.addVectors( this.min, this.max ).multiplyScalar( 0.5 );

	},

	size: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.subVectors( this.max, this.min );

	},

	expandByPoint: function ( point ) {

		this.min.min( point );
		this.max.max( point );

		return this;

	},

	expandByVector: function ( vector ) {

		this.min.sub( vector );
		this.max.add( vector );

		return this;

	},

	expandByScalar: function ( scalar ) {

		this.min.addScalar( -scalar );
		this.max.addScalar( scalar );

		return this;

	},

	containsPoint: function ( point ) {

		if ( point.x < this.min.x || point.x > this.max.x ||
		     point.y < this.min.y || point.y > this.max.y ||
		     point.z < this.min.z || point.z > this.max.z ) {

			return false;

		}

		return true;

	},

	containsBox: function ( box ) {

		if ( ( this.min.x <= box.min.x ) && ( box.max.x <= this.max.x ) &&
			 ( this.min.y <= box.min.y ) && ( box.max.y <= this.max.y ) &&
			 ( this.min.z <= box.min.z ) && ( box.max.z <= this.max.z ) ) {

			return true;

		}

		return false;

	},

	getParameter: function ( point, optionalTarget ) {

		// This can potentially have a divide by zero if the box
		// has a size dimension of 0.

		var result = optionalTarget || new THREE.Vector3();

		return result.set(
			( point.x - this.min.x ) / ( this.max.x - this.min.x ),
			( point.y - this.min.y ) / ( this.max.y - this.min.y ),
			( point.z - this.min.z ) / ( this.max.z - this.min.z )
		);

	},

	isIntersectionBox: function ( box ) {

		// using 6 splitting planes to rule out intersections.

		if ( box.max.x < this.min.x || box.min.x > this.max.x ||
		     box.max.y < this.min.y || box.min.y > this.max.y ||
		     box.max.z < this.min.z || box.min.z > this.max.z ) {

			return false;

		}

		return true;

	},

	clampPoint: function ( point, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.copy( point ).clamp( this.min, this.max );

	},

	distanceToPoint: function() {

		var v1 = new THREE.Vector3();

		return function ( point ) {

			var clampedPoint = v1.copy( point ).clamp( this.min, this.max );
			return clampedPoint.sub( point ).length();

		};

	}(),

	getBoundingSphere: function() {

		var v1 = new THREE.Vector3();

		return function ( optionalTarget ) {

			var result = optionalTarget || new THREE.Sphere();

			result.center = this.center();
			result.radius = this.size( v1 ).length() * 0.5;

			return result;

		};

	}(),

	intersect: function ( box ) {

		this.min.max( box.min );
		this.max.min( box.max );

		return this;

	},

	union: function ( box ) {

		this.min.min( box.min );
		this.max.max( box.max );

		return this;

	},

	applyMatrix4: function() {

		var points = [
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3(),
			new THREE.Vector3()
		];

		return function ( matrix ) {

			// NOTE: I am using a binary pattern to specify all 2^3 combinations below
			points[0].set( this.min.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 000
			points[1].set( this.min.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 001
			points[2].set( this.min.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 010
			points[3].set( this.min.x, this.max.y, this.max.z ).applyMatrix4( matrix ); // 011
			points[4].set( this.max.x, this.min.y, this.min.z ).applyMatrix4( matrix ); // 100
			points[5].set( this.max.x, this.min.y, this.max.z ).applyMatrix4( matrix ); // 101
			points[6].set( this.max.x, this.max.y, this.min.z ).applyMatrix4( matrix ); // 110
			points[7].set( this.max.x, this.max.y, this.max.z ).applyMatrix4( matrix );  // 111

			this.makeEmpty();
			this.setFromPoints( points );

			return this;

		};

	}(),

	translate: function ( offset ) {

		this.min.add( offset );
		this.max.add( offset );

		return this;

	},

	equals: function ( box ) {

		return box.min.equals( this.min ) && box.max.equals( this.max );

	},

	clone: function () {

		return new THREE.Box3().copy( this );

	}

};

/**
 * @author bhouston / http://exocortex.com
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Sphere = function ( center, radius ) {

	this.center = ( center !== undefined ) ? center : new THREE.Vector3();
	this.radius = ( radius !== undefined ) ? radius : 0;

};

THREE.Sphere.prototype = {

	constructor: THREE.Sphere,

	set: function ( center, radius ) {

		this.center.copy( center );
		this.radius = radius;

		return this;
	},


	setFromPoints: function () {

		var box = new THREE.Box3();

		return function ( points, optionalCenter )  {

			var center = this.center;

			if ( optionalCenter !== undefined ) {

				center.copy( optionalCenter );

			} else {

				box.setFromPoints( points ).center( center );

			}

			var maxRadiusSq = 0;

			for ( var i = 0, il = points.length; i < il; i ++ ) {

				maxRadiusSq = Math.max( maxRadiusSq, center.distanceToSquared( points[ i ] ) );

			}

			this.radius = Math.sqrt( maxRadiusSq );

			return this;			
 		
 		};

	}(),

	copy: function ( sphere ) {

		this.center.copy( sphere.center );
		this.radius = sphere.radius;

		return this;

	},

	empty: function () {

		return ( this.radius <= 0 );

	},

	containsPoint: function ( point ) {

		return ( point.distanceToSquared( this.center ) <= ( this.radius * this.radius ) );

	},

	distanceToPoint: function ( point ) {

		return ( point.distanceTo( this.center ) - this.radius );

	},

	intersectsSphere: function ( sphere ) {

		var radiusSum = this.radius + sphere.radius;

		return sphere.center.distanceToSquared( this.center ) <= ( radiusSum * radiusSum );

	},

	clampPoint: function ( point, optionalTarget ) {

		var deltaLengthSq = this.center.distanceToSquared( point );

		var result = optionalTarget || new THREE.Vector3();
		result.copy( point );

		if ( deltaLengthSq > ( this.radius * this.radius ) ) {

			result.sub( this.center ).normalize();
			result.multiplyScalar( this.radius ).add( this.center );

		}

		return result;

	},

	getBoundingBox: function ( optionalTarget ) {

		var box = optionalTarget || new THREE.Box3();

		box.set( this.center, this.center );
		box.expandByScalar( this.radius );

		return box;

	},

	applyMatrix4: function ( matrix ) {

		this.center.applyMatrix4( matrix );
		this.radius = this.radius * matrix.getMaxScaleOnAxis();

		return this;

	},

	translate: function ( offset ) {

		this.center.add( offset );

		return this;

	},

	equals: function ( sphere ) {

		return sphere.center.equals( this.center ) && ( sphere.radius === this.radius );

	},

	clone: function () {

		return new THREE.Sphere().copy( this );

	}

};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */

THREE.Euler = function ( x, y, z, order ) {

	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._order = order || THREE.Euler.DefaultOrder;

};

THREE.Euler.RotationOrders = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ];

THREE.Euler.DefaultOrder = 'XYZ';

THREE.Euler.prototype = {

	constructor: THREE.Euler,

	_x: 0, _y: 0, _z: 0, _order: THREE.Euler.DefaultOrder,

	_quaternion: undefined,

	_updateQuaternion: function () {

		if ( this._quaternion !== undefined ) {

			this._quaternion.setFromEuler( this, false );

		}

	},

	get x () {

		return this._x;

	},

	set x ( value ) {

		this._x = value;
		this._updateQuaternion();

	},

	get y () {

		return this._y;

	},

	set y ( value ) {

		this._y = value;
		this._updateQuaternion();

	},

	get z () {

		return this._z;

	},

	set z ( value ) {

		this._z = value;
		this._updateQuaternion();

	},

	get order () {

		return this._order;

	},

	set order ( value ) {

		this._order = value;
		this._updateQuaternion();

	},

	set: function ( x, y, z, order ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order || this._order;

		this._updateQuaternion();

		return this;

	},

	copy: function ( euler ) {

		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;

		this._updateQuaternion();

		return this;

	},

	setFromRotationMatrix: function ( m, order ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		// clamp, to handle numerical problems

		function clamp( x ) {

			return Math.min( Math.max( x, -1 ), 1 );

		}

		var te = m.elements;
		var m11 = te[0], m12 = te[4], m13 = te[8];
		var m21 = te[1], m22 = te[5], m23 = te[9];
		var m31 = te[2], m32 = te[6], m33 = te[10];

		order = order || this._order;

		if ( order === 'XYZ' ) {

			this._y = Math.asin( clamp( m13 ) );

			if ( Math.abs( m13 ) < 0.99999 ) {

				this._x = Math.atan2( - m23, m33 );
				this._z = Math.atan2( - m12, m11 );

			} else {

				this._x = Math.atan2( m32, m22 );
				this._z = 0;

			}

		} else if ( order === 'YXZ' ) {

			this._x = Math.asin( - clamp( m23 ) );

			if ( Math.abs( m23 ) < 0.99999 ) {

				this._y = Math.atan2( m13, m33 );
				this._z = Math.atan2( m21, m22 );

			} else {

				this._y = Math.atan2( - m31, m11 );
				this._z = 0;

			}

		} else if ( order === 'ZXY' ) {

			this._x = Math.asin( clamp( m32 ) );

			if ( Math.abs( m32 ) < 0.99999 ) {

				this._y = Math.atan2( - m31, m33 );
				this._z = Math.atan2( - m12, m22 );

			} else {

				this._y = 0;
				this._z = Math.atan2( m21, m11 );

			}

		} else if ( order === 'ZYX' ) {

			this._y = Math.asin( - clamp( m31 ) );

			if ( Math.abs( m31 ) < 0.99999 ) {

				this._x = Math.atan2( m32, m33 );
				this._z = Math.atan2( m21, m11 );

			} else {

				this._x = 0;
				this._z = Math.atan2( - m12, m22 );

			}

		} else if ( order === 'YZX' ) {

			this._z = Math.asin( clamp( m21 ) );

			if ( Math.abs( m21 ) < 0.99999 ) {

				this._x = Math.atan2( - m23, m22 );
				this._y = Math.atan2( - m31, m11 );

			} else {

				this._x = 0;
				this._y = Math.atan2( m13, m33 );

			}

		} else if ( order === 'XZY' ) {

			this._z = Math.asin( - clamp( m12 ) );

			if ( Math.abs( m12 ) < 0.99999 ) {

				this._x = Math.atan2( m32, m22 );
				this._y = Math.atan2( m13, m11 );

			} else {

				this._x = Math.atan2( - m23, m33 );
				this._y = 0;

			}

		} else {

			console.warn( 'WARNING: Euler.setFromRotationMatrix() given unsupported order: ' + order )

		}

		this._order = order;

		this._updateQuaternion();

		return this;

	},

	setFromQuaternion: function ( q, order, update ) {

		// q is assumed to be normalized

		// clamp, to handle numerical problems

		function clamp( x ) {

			return Math.min( Math.max( x, -1 ), 1 );

		}

		// http://www.mathworks.com/matlabcentral/fileexchange/20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/content/SpinCalc.m

		var sqx = q.x * q.x;
		var sqy = q.y * q.y;
		var sqz = q.z * q.z;
		var sqw = q.w * q.w;

		order = order || this._order;

		if ( order === 'XYZ' ) {

			this._x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( sqw - sqx - sqy + sqz ) );
			this._y = Math.asin(  clamp( 2 * ( q.x * q.z + q.y * q.w ) ) );
			this._z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw + sqx - sqy - sqz ) );

		} else if ( order ===  'YXZ' ) {

			this._x = Math.asin(  clamp( 2 * ( q.x * q.w - q.y * q.z ) ) );
			this._y = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw - sqx - sqy + sqz ) );
			this._z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw - sqx + sqy - sqz ) );

		} else if ( order === 'ZXY' ) {

			this._x = Math.asin(  clamp( 2 * ( q.x * q.w + q.y * q.z ) ) );
			this._y = Math.atan2( 2 * ( q.y * q.w - q.z * q.x ), ( sqw - sqx - sqy + sqz ) );
			this._z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw - sqx + sqy - sqz ) );

		} else if ( order === 'ZYX' ) {

			this._x = Math.atan2( 2 * ( q.x * q.w + q.z * q.y ), ( sqw - sqx - sqy + sqz ) );
			this._y = Math.asin(  clamp( 2 * ( q.y * q.w - q.x * q.z ) ) );
			this._z = Math.atan2( 2 * ( q.x * q.y + q.z * q.w ), ( sqw + sqx - sqy - sqz ) );

		} else if ( order === 'YZX' ) {

			this._x = Math.atan2( 2 * ( q.x * q.w - q.z * q.y ), ( sqw - sqx + sqy - sqz ) );
			this._y = Math.atan2( 2 * ( q.y * q.w - q.x * q.z ), ( sqw + sqx - sqy - sqz ) );
			this._z = Math.asin(  clamp( 2 * ( q.x * q.y + q.z * q.w ) ) );

		} else if ( order === 'XZY' ) {

			this._x = Math.atan2( 2 * ( q.x * q.w + q.y * q.z ), ( sqw - sqx + sqy - sqz ) );
			this._y = Math.atan2( 2 * ( q.x * q.z + q.y * q.w ), ( sqw + sqx - sqy - sqz ) );
			this._z = Math.asin(  clamp( 2 * ( q.z * q.w - q.x * q.y ) ) );

		} else {

			console.warn( 'WARNING: Euler.setFromQuaternion() given unsupported order: ' + order )

		}

		this._order = order;

		if ( update !== false ) this._updateQuaternion();

		return this;

	},

	reorder: function () {

		// WARNING: this discards revolution information -bhouston

		var q = new THREE.Quaternion();

		return function ( newOrder ) {

			q.setFromEuler( this );
			this.setFromQuaternion( q, newOrder );

		};


	}(),

	fromArray: function ( array ) {

		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

		this._updateQuaternion();

		return this;

	},

	toArray: function () {

		return [ this._x, this._y, this._z, this._order ];

	},

	equals: function ( euler ) {

		return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );

	},

	clone: function () {

		return new THREE.Euler( this._x, this._y, this._z, this._order );

	}

};

/**
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */

THREE.Matrix3 = function ( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

	this.elements = new Float32Array(9);

	this.set(

		( n11 !== undefined ) ? n11 : 1, n12 || 0, n13 || 0,
		n21 || 0, ( n22 !== undefined ) ? n22 : 1, n23 || 0,
		n31 || 0, n32 || 0, ( n33 !== undefined ) ? n33 : 1

	);
};

THREE.Matrix3.prototype = {

	constructor: THREE.Matrix3,

	set: function ( n11, n12, n13, n21, n22, n23, n31, n32, n33 ) {

		var te = this.elements;

		te[0] = n11; te[3] = n12; te[6] = n13;
		te[1] = n21; te[4] = n22; te[7] = n23;
		te[2] = n31; te[5] = n32; te[8] = n33;

		return this;

	},

	identity: function () {

		this.set(

			1, 0, 0,
			0, 1, 0,
			0, 0, 1

		);

		return this;

	},

	copy: function ( m ) {

		var me = m.elements;

		this.set(

			me[0], me[3], me[6],
			me[1], me[4], me[7],
			me[2], me[5], me[8]

		);

		return this;

	},

	multiplyVector3: function ( vector ) {

		console.warn( 'DEPRECATED: Matrix3\'s .multiplyVector3() has been removed. Use vector.applyMatrix3( matrix ) instead.' );
		return vector.applyMatrix3( this );

	},

	multiplyVector3Array: function() {

		var v1 = new THREE.Vector3();

		return function ( a ) {

			for ( var i = 0, il = a.length; i < il; i += 3 ) {

				v1.x = a[ i ];
				v1.y = a[ i + 1 ];
				v1.z = a[ i + 2 ];

				v1.applyMatrix3(this);

				a[ i ]     = v1.x;
				a[ i + 1 ] = v1.y;
				a[ i + 2 ] = v1.z;

			}

			return a;

		};

	}(),

	multiplyScalar: function ( s ) {

		var te = this.elements;

		te[0] *= s; te[3] *= s; te[6] *= s;
		te[1] *= s; te[4] *= s; te[7] *= s;
		te[2] *= s; te[5] *= s; te[8] *= s;

		return this;

	},

	determinant: function () {

		var te = this.elements;

		var a = te[0], b = te[1], c = te[2],
			d = te[3], e = te[4], f = te[5],
			g = te[6], h = te[7], i = te[8];

		return a*e*i - a*f*h - b*d*i + b*f*g + c*d*h - c*e*g;

	},

	getInverse: function ( matrix, throwOnInvertible ) {

		// input: THREE.Matrix4
		// ( based on http://code.google.com/p/webgl-mjs/ )

		var me = matrix.elements;
		var te = this.elements;

		te[ 0 ] =   me[10] * me[5] - me[6] * me[9];
		te[ 1 ] = - me[10] * me[1] + me[2] * me[9];
		te[ 2 ] =   me[6] * me[1] - me[2] * me[5];
		te[ 3 ] = - me[10] * me[4] + me[6] * me[8];
		te[ 4 ] =   me[10] * me[0] - me[2] * me[8];
		te[ 5 ] = - me[6] * me[0] + me[2] * me[4];
		te[ 6 ] =   me[9] * me[4] - me[5] * me[8];
		te[ 7 ] = - me[9] * me[0] + me[1] * me[8];
		te[ 8 ] =   me[5] * me[0] - me[1] * me[4];

		var det = me[ 0 ] * te[ 0 ] + me[ 1 ] * te[ 3 ] + me[ 2 ] * te[ 6 ];

		// no inverse

		if ( det === 0 ) {

			var msg = "Matrix3.getInverse(): can't invert matrix, determinant is 0";

			if ( throwOnInvertible || false ) {

				throw new Error( msg );

			} else {

				console.warn( msg );

			}

			this.identity();

			return this;

		}

		this.multiplyScalar( 1.0 / det );

		return this;

	},

	transpose: function () {

		var tmp, m = this.elements;

		tmp = m[1]; m[1] = m[3]; m[3] = tmp;
		tmp = m[2]; m[2] = m[6]; m[6] = tmp;
		tmp = m[5]; m[5] = m[7]; m[7] = tmp;

		return this;

	},

	getNormalMatrix: function ( m ) {

		// input: THREE.Matrix4

		this.getInverse( m ).transpose();

		return this;

	},

	transposeIntoArray: function ( r ) {

		var m = this.elements;

		r[ 0 ] = m[ 0 ];
		r[ 1 ] = m[ 3 ];
		r[ 2 ] = m[ 6 ];
		r[ 3 ] = m[ 1 ];
		r[ 4 ] = m[ 4 ];
		r[ 5 ] = m[ 7 ];
		r[ 6 ] = m[ 2 ];
		r[ 7 ] = m[ 5 ];
		r[ 8 ] = m[ 8 ];

		return this;

	},

	fromArray: function ( array ) {

		this.elements.set( array );

		return this;

	},

	toArray: function () {

		var te = this.elements;

		return [
			te[ 0 ], te[ 1 ], te[ 2 ],
			te[ 3 ], te[ 4 ], te[ 5 ],
			te[ 6 ], te[ 7 ], te[ 8 ]
		];

	},

	clone: function () {

		var te = this.elements;

		return new THREE.Matrix3(

			te[0], te[3], te[6],
			te[1], te[4], te[7],
			te[2], te[5], te[8]

		);

	}

};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://exocortex.com
 * @author WestLangley / http://github.com/WestLangley
 */


THREE.Matrix4 = function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

	this.elements = new Float32Array( 16 );

	// TODO: if n11 is undefined, then just set to identity, otherwise copy all other values into matrix
	//   we should not support semi specification of Matrix4, it is just weird.

	var te = this.elements;

	te[0] = ( n11 !== undefined ) ? n11 : 1; te[4] = n12 || 0; te[8] = n13 || 0; te[12] = n14 || 0;
	te[1] = n21 || 0; te[5] = ( n22 !== undefined ) ? n22 : 1; te[9] = n23 || 0; te[13] = n24 || 0;
	te[2] = n31 || 0; te[6] = n32 || 0; te[10] = ( n33 !== undefined ) ? n33 : 1; te[14] = n34 || 0;
	te[3] = n41 || 0; te[7] = n42 || 0; te[11] = n43 || 0; te[15] = ( n44 !== undefined ) ? n44 : 1;

};

THREE.Matrix4.prototype = {

	constructor: THREE.Matrix4,

	set: function ( n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44 ) {

		var te = this.elements;

		te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
		te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
		te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
		te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;

		return this;

	},

	identity: function () {

		this.set(

			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			0, 0, 0, 1

		);

		return this;

	},

	copy: function ( m ) {

		this.elements.set( m.elements );

		return this;

	},

	extractPosition: function ( m ) {

		console.warn( 'DEPRECATED: Matrix4\'s .extractPosition() has been renamed to .copyPosition().' );
		return this.copyPosition( m );

	},

	copyPosition: function ( m ) {

		var te = this.elements;
		var me = m.elements;

		te[12] = me[12];
		te[13] = me[13];
		te[14] = me[14];

		return this;

	},

	extractRotation: function () {

		var v1 = new THREE.Vector3();

		return function ( m ) {

			var te = this.elements;
			var me = m.elements;

			var scaleX = 1 / v1.set( me[0], me[1], me[2] ).length();
			var scaleY = 1 / v1.set( me[4], me[5], me[6] ).length();
			var scaleZ = 1 / v1.set( me[8], me[9], me[10] ).length();

			te[0] = me[0] * scaleX;
			te[1] = me[1] * scaleX;
			te[2] = me[2] * scaleX;

			te[4] = me[4] * scaleY;
			te[5] = me[5] * scaleY;
			te[6] = me[6] * scaleY;

			te[8] = me[8] * scaleZ;
			te[9] = me[9] * scaleZ;
			te[10] = me[10] * scaleZ;

			return this;

		};

	}(),

	makeRotationFromEuler: function ( euler ) {

		if ( euler instanceof THREE.Euler === false ) {

			console.error( 'ERROR: Matrix\'s .makeRotationFromEuler() now expects a Euler rotation rather than a Vector3 and order.  Please update your code.' );

		}

		var te = this.elements;

		var x = euler.x, y = euler.y, z = euler.z;
		var a = Math.cos( x ), b = Math.sin( x );
		var c = Math.cos( y ), d = Math.sin( y );
		var e = Math.cos( z ), f = Math.sin( z );

		if ( euler.order === 'XYZ' ) {

			var ae = a * e, af = a * f, be = b * e, bf = b * f;

			te[0] = c * e;
			te[4] = - c * f;
			te[8] = d;

			te[1] = af + be * d;
			te[5] = ae - bf * d;
			te[9] = - b * c;

			te[2] = bf - ae * d;
			te[6] = be + af * d;
			te[10] = a * c;

		} else if ( euler.order === 'YXZ' ) {

			var ce = c * e, cf = c * f, de = d * e, df = d * f;

			te[0] = ce + df * b;
			te[4] = de * b - cf;
			te[8] = a * d;

			te[1] = a * f;
			te[5] = a * e;
			te[9] = - b;

			te[2] = cf * b - de;
			te[6] = df + ce * b;
			te[10] = a * c;

		} else if ( euler.order === 'ZXY' ) {

			var ce = c * e, cf = c * f, de = d * e, df = d * f;

			te[0] = ce - df * b;
			te[4] = - a * f;
			te[8] = de + cf * b;

			te[1] = cf + de * b;
			te[5] = a * e;
			te[9] = df - ce * b;

			te[2] = - a * d;
			te[6] = b;
			te[10] = a * c;

		} else if ( euler.order === 'ZYX' ) {

			var ae = a * e, af = a * f, be = b * e, bf = b * f;

			te[0] = c * e;
			te[4] = be * d - af;
			te[8] = ae * d + bf;

			te[1] = c * f;
			te[5] = bf * d + ae;
			te[9] = af * d - be;

			te[2] = - d;
			te[6] = b * c;
			te[10] = a * c;

		} else if ( euler.order === 'YZX' ) {

			var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			te[0] = c * e;
			te[4] = bd - ac * f;
			te[8] = bc * f + ad;

			te[1] = f;
			te[5] = a * e;
			te[9] = - b * e;

			te[2] = - d * e;
			te[6] = ad * f + bc;
			te[10] = ac - bd * f;

		} else if ( euler.order === 'XZY' ) {

			var ac = a * c, ad = a * d, bc = b * c, bd = b * d;

			te[0] = c * e;
			te[4] = - f;
			te[8] = d * e;

			te[1] = ac * f + bd;
			te[5] = a * e;
			te[9] = ad * f - bc;

			te[2] = bc * f - ad;
			te[6] = b * e;
			te[10] = bd * f + ac;

		}

		// last column
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;

		// bottom row
		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;

		return this;

	},

	setRotationFromQuaternion: function ( q ) {

		console.warn( 'DEPRECATED: Matrix4\'s .setRotationFromQuaternion() has been deprecated in favor of makeRotationFromQuaternion.  Please update your code.' );

		return this.makeRotationFromQuaternion( q );

	},

	makeRotationFromQuaternion: function ( q ) {

		var te = this.elements;

		var x = q.x, y = q.y, z = q.z, w = q.w;
		var x2 = x + x, y2 = y + y, z2 = z + z;
		var xx = x * x2, xy = x * y2, xz = x * z2;
		var yy = y * y2, yz = y * z2, zz = z * z2;
		var wx = w * x2, wy = w * y2, wz = w * z2;

		te[0] = 1 - ( yy + zz );
		te[4] = xy - wz;
		te[8] = xz + wy;

		te[1] = xy + wz;
		te[5] = 1 - ( xx + zz );
		te[9] = yz - wx;

		te[2] = xz - wy;
		te[6] = yz + wx;
		te[10] = 1 - ( xx + yy );

		// last column
		te[3] = 0;
		te[7] = 0;
		te[11] = 0;

		// bottom row
		te[12] = 0;
		te[13] = 0;
		te[14] = 0;
		te[15] = 1;

		return this;

	},

	lookAt: function() {

		var x = new THREE.Vector3();
		var y = new THREE.Vector3();
		var z = new THREE.Vector3();

		return function ( eye, target, up ) {

			var te = this.elements;

			z.subVectors( eye, target ).normalize();

			if ( z.length() === 0 ) {

				z.z = 1;

			}

			x.crossVectors( up, z ).normalize();

			if ( x.length() === 0 ) {

				z.x += 0.0001;
				x.crossVectors( up, z ).normalize();

			}

			y.crossVectors( z, x );


			te[0] = x.x; te[4] = y.x; te[8] = z.x;
			te[1] = x.y; te[5] = y.y; te[9] = z.y;
			te[2] = x.z; te[6] = y.z; te[10] = z.z;

			return this;

		};

	}(),

	multiply: function ( m, n ) {

		if ( n !== undefined ) {

			console.warn( 'DEPRECATED: Matrix4\'s .multiply() now only accepts one argument. Use .multiplyMatrices( a, b ) instead.' );
			return this.multiplyMatrices( m, n );

		}

		return this.multiplyMatrices( this, m );

	},

	multiplyMatrices: function ( a, b ) {

		var ae = a.elements;
		var be = b.elements;
		var te = this.elements;

		var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
		var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
		var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
		var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

		var b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
		var b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
		var b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
		var b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

		te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

		return this;

	},

	multiplyToArray: function ( a, b, r ) {

		var te = this.elements;

		this.multiplyMatrices( a, b );

		r[ 0 ] = te[0]; r[ 1 ] = te[1]; r[ 2 ] = te[2]; r[ 3 ] = te[3];
		r[ 4 ] = te[4]; r[ 5 ] = te[5]; r[ 6 ] = te[6]; r[ 7 ] = te[7];
		r[ 8 ]  = te[8]; r[ 9 ]  = te[9]; r[ 10 ] = te[10]; r[ 11 ] = te[11];
		r[ 12 ] = te[12]; r[ 13 ] = te[13]; r[ 14 ] = te[14]; r[ 15 ] = te[15];

		return this;

	},

	multiplyScalar: function ( s ) {

		var te = this.elements;

		te[0] *= s; te[4] *= s; te[8] *= s; te[12] *= s;
		te[1] *= s; te[5] *= s; te[9] *= s; te[13] *= s;
		te[2] *= s; te[6] *= s; te[10] *= s; te[14] *= s;
		te[3] *= s; te[7] *= s; te[11] *= s; te[15] *= s;

		return this;

	},

	multiplyVector3: function ( vector ) {

		console.warn( 'DEPRECATED: Matrix4\'s .multiplyVector3() has been removed. Use vector.applyMatrix4( matrix ) or vector.applyProjection( matrix ) instead.' );
		return vector.applyProjection( this );

	},

	multiplyVector4: function ( vector ) {

		console.warn( 'DEPRECATED: Matrix4\'s .multiplyVector4() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
		return vector.applyMatrix4( this );

	},

	multiplyVector3Array: function() {

		var v1 = new THREE.Vector3();

		return function ( a ) {

			for ( var i = 0, il = a.length; i < il; i += 3 ) {

				v1.x = a[ i ];
				v1.y = a[ i + 1 ];
				v1.z = a[ i + 2 ];

				v1.applyProjection( this );

				a[ i ]     = v1.x;
				a[ i + 1 ] = v1.y;
				a[ i + 2 ] = v1.z;

			}

			return a;

		};

	}(),

	rotateAxis: function ( v ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateAxis() has been removed. Use Vector3.transformDirection( matrix ) instead.' );

		v.transformDirection( this );

	},

	crossVector: function ( vector ) {

		console.warn( 'DEPRECATED: Matrix4\'s .crossVector() has been removed. Use vector.applyMatrix4( matrix ) instead.' );
		return vector.applyMatrix4( this );

	},

	determinant: function () {

		var te = this.elements;

		var n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
		var n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
		var n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
		var n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

		//TODO: make this more efficient
		//( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

		return (
			n41 * (
				+n14 * n23 * n32
				-n13 * n24 * n32
				-n14 * n22 * n33
				+n12 * n24 * n33
				+n13 * n22 * n34
				-n12 * n23 * n34
			) +
			n42 * (
				+n11 * n23 * n34
				-n11 * n24 * n33
				+n14 * n21 * n33
				-n13 * n21 * n34
				+n13 * n24 * n31
				-n14 * n23 * n31
			) +
			n43 * (
				+n11 * n24 * n32
				-n11 * n22 * n34
				-n14 * n21 * n32
				+n12 * n21 * n34
				+n14 * n22 * n31
				-n12 * n24 * n31
			) +
			n44 * (
				-n13 * n22 * n31
				-n11 * n23 * n32
				+n11 * n22 * n33
				+n13 * n21 * n32
				-n12 * n21 * n33
				+n12 * n23 * n31
			)

		);

	},

	transpose: function () {

		var te = this.elements;
		var tmp;

		tmp = te[1]; te[1] = te[4]; te[4] = tmp;
		tmp = te[2]; te[2] = te[8]; te[8] = tmp;
		tmp = te[6]; te[6] = te[9]; te[9] = tmp;

		tmp = te[3]; te[3] = te[12]; te[12] = tmp;
		tmp = te[7]; te[7] = te[13]; te[13] = tmp;
		tmp = te[11]; te[11] = te[14]; te[14] = tmp;

		return this;

	},

	flattenToArray: function ( flat ) {

		var te = this.elements;
		flat[ 0 ] = te[0]; flat[ 1 ] = te[1]; flat[ 2 ] = te[2]; flat[ 3 ] = te[3];
		flat[ 4 ] = te[4]; flat[ 5 ] = te[5]; flat[ 6 ] = te[6]; flat[ 7 ] = te[7];
		flat[ 8 ] = te[8]; flat[ 9 ] = te[9]; flat[ 10 ] = te[10]; flat[ 11 ] = te[11];
		flat[ 12 ] = te[12]; flat[ 13 ] = te[13]; flat[ 14 ] = te[14]; flat[ 15 ] = te[15];

		return flat;

	},

	flattenToArrayOffset: function( flat, offset ) {

		var te = this.elements;
		flat[ offset ] = te[0];
		flat[ offset + 1 ] = te[1];
		flat[ offset + 2 ] = te[2];
		flat[ offset + 3 ] = te[3];

		flat[ offset + 4 ] = te[4];
		flat[ offset + 5 ] = te[5];
		flat[ offset + 6 ] = te[6];
		flat[ offset + 7 ] = te[7];

		flat[ offset + 8 ]  = te[8];
		flat[ offset + 9 ]  = te[9];
		flat[ offset + 10 ] = te[10];
		flat[ offset + 11 ] = te[11];

		flat[ offset + 12 ] = te[12];
		flat[ offset + 13 ] = te[13];
		flat[ offset + 14 ] = te[14];
		flat[ offset + 15 ] = te[15];

		return flat;

	},

	getPosition: function() {

		var v1 = new THREE.Vector3();

		return function () {

			console.warn( 'DEPRECATED: Matrix4\'s .getPosition() has been removed. Use Vector3.setFromMatrixPosition( matrix ) instead.' );

			var te = this.elements;
			return v1.set( te[12], te[13], te[14] );

		};

	}(),

	setPosition: function ( v ) {

		var te = this.elements;

		te[12] = v.x;
		te[13] = v.y;
		te[14] = v.z;

		return this;

	},

	getInverse: function ( m, throwOnInvertible ) {

		// based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
		var te = this.elements;
		var me = m.elements;

		var n11 = me[0], n12 = me[4], n13 = me[8], n14 = me[12];
		var n21 = me[1], n22 = me[5], n23 = me[9], n24 = me[13];
		var n31 = me[2], n32 = me[6], n33 = me[10], n34 = me[14];
		var n41 = me[3], n42 = me[7], n43 = me[11], n44 = me[15];

		te[0] = n23*n34*n42 - n24*n33*n42 + n24*n32*n43 - n22*n34*n43 - n23*n32*n44 + n22*n33*n44;
		te[4] = n14*n33*n42 - n13*n34*n42 - n14*n32*n43 + n12*n34*n43 + n13*n32*n44 - n12*n33*n44;
		te[8] = n13*n24*n42 - n14*n23*n42 + n14*n22*n43 - n12*n24*n43 - n13*n22*n44 + n12*n23*n44;
		te[12] = n14*n23*n32 - n13*n24*n32 - n14*n22*n33 + n12*n24*n33 + n13*n22*n34 - n12*n23*n34;
		te[1] = n24*n33*n41 - n23*n34*n41 - n24*n31*n43 + n21*n34*n43 + n23*n31*n44 - n21*n33*n44;
		te[5] = n13*n34*n41 - n14*n33*n41 + n14*n31*n43 - n11*n34*n43 - n13*n31*n44 + n11*n33*n44;
		te[9] = n14*n23*n41 - n13*n24*n41 - n14*n21*n43 + n11*n24*n43 + n13*n21*n44 - n11*n23*n44;
		te[13] = n13*n24*n31 - n14*n23*n31 + n14*n21*n33 - n11*n24*n33 - n13*n21*n34 + n11*n23*n34;
		te[2] = n22*n34*n41 - n24*n32*n41 + n24*n31*n42 - n21*n34*n42 - n22*n31*n44 + n21*n32*n44;
		te[6] = n14*n32*n41 - n12*n34*n41 - n14*n31*n42 + n11*n34*n42 + n12*n31*n44 - n11*n32*n44;
		te[10] = n12*n24*n41 - n14*n22*n41 + n14*n21*n42 - n11*n24*n42 - n12*n21*n44 + n11*n22*n44;
		te[14] = n14*n22*n31 - n12*n24*n31 - n14*n21*n32 + n11*n24*n32 + n12*n21*n34 - n11*n22*n34;
		te[3] = n23*n32*n41 - n22*n33*n41 - n23*n31*n42 + n21*n33*n42 + n22*n31*n43 - n21*n32*n43;
		te[7] = n12*n33*n41 - n13*n32*n41 + n13*n31*n42 - n11*n33*n42 - n12*n31*n43 + n11*n32*n43;
		te[11] = n13*n22*n41 - n12*n23*n41 - n13*n21*n42 + n11*n23*n42 + n12*n21*n43 - n11*n22*n43;
		te[15] = n12*n23*n31 - n13*n22*n31 + n13*n21*n32 - n11*n23*n32 - n12*n21*n33 + n11*n22*n33;

		var det = n11 * te[ 0 ] + n21 * te[ 4 ] + n31 * te[ 8 ] + n41 * te[ 12 ];

		if ( det == 0 ) {

			var msg = "Matrix4.getInverse(): can't invert matrix, determinant is 0";

			if ( throwOnInvertible || false ) {

				throw new Error( msg ); 

			} else {

				console.warn( msg );

			}

			this.identity();

			return this;
		}

		this.multiplyScalar( 1 / det );

		return this;

	},

	translate: function ( v ) {

		console.warn( 'DEPRECATED: Matrix4\'s .translate() has been removed.');

	},

	rotateX: function ( angle ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateX() has been removed.');

	},

	rotateY: function ( angle ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateY() has been removed.');

	},

	rotateZ: function ( angle ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateZ() has been removed.');

	},

	rotateByAxis: function ( axis, angle ) {

		console.warn( 'DEPRECATED: Matrix4\'s .rotateByAxis() has been removed.');

	},

	scale: function ( v ) {

		var te = this.elements;
		var x = v.x, y = v.y, z = v.z;

		te[0] *= x; te[4] *= y; te[8] *= z;
		te[1] *= x; te[5] *= y; te[9] *= z;
		te[2] *= x; te[6] *= y; te[10] *= z;
		te[3] *= x; te[7] *= y; te[11] *= z;

		return this;

	},

	getMaxScaleOnAxis: function () {

		var te = this.elements;

		var scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
		var scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
		var scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

		return Math.sqrt( Math.max( scaleXSq, Math.max( scaleYSq, scaleZSq ) ) );

	},

	makeTranslation: function ( x, y, z ) {

		this.set(

			1, 0, 0, x,
			0, 1, 0, y,
			0, 0, 1, z,
			0, 0, 0, 1

		);

		return this;

	},

	makeRotationX: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			1, 0,  0, 0,
			0, c, -s, 0,
			0, s,  c, 0,
			0, 0,  0, 1

		);

		return this;

	},

	makeRotationY: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			 c, 0, s, 0,
			 0, 1, 0, 0,
			-s, 0, c, 0,
			 0, 0, 0, 1

		);

		return this;

	},

	makeRotationZ: function ( theta ) {

		var c = Math.cos( theta ), s = Math.sin( theta );

		this.set(

			c, -s, 0, 0,
			s,  c, 0, 0,
			0,  0, 1, 0,
			0,  0, 0, 1

		);

		return this;

	},

	makeRotationAxis: function ( axis, angle ) {

		// Based on http://www.gamedev.net/reference/articles/article1199.asp

		var c = Math.cos( angle );
		var s = Math.sin( angle );
		var t = 1 - c;
		var x = axis.x, y = axis.y, z = axis.z;
		var tx = t * x, ty = t * y;

		this.set(

			tx * x + c, tx * y - s * z, tx * z + s * y, 0,
			tx * y + s * z, ty * y + c, ty * z - s * x, 0,
			tx * z - s * y, ty * z + s * x, t * z * z + c, 0,
			0, 0, 0, 1

		);

		 return this;

	},

	makeScale: function ( x, y, z ) {

		this.set(

			x, 0, 0, 0,
			0, y, 0, 0,
			0, 0, z, 0,
			0, 0, 0, 1

		);

		return this;

	},

	compose: function ( position, quaternion, scale ) {

		this.makeRotationFromQuaternion( quaternion );
		this.scale( scale );
		this.setPosition( position );

		return this;

	},

	decompose: function () {

		var vector = new THREE.Vector3();
		var matrix = new THREE.Matrix4();

		return function ( position, quaternion, scale ) {

			var te = this.elements;

			var sx = vector.set( te[0], te[1], te[2] ).length();
			var sy = vector.set( te[4], te[5], te[6] ).length();
			var sz = vector.set( te[8], te[9], te[10] ).length();

			// if determine is negative, we need to invert one scale
			var det = this.determinant();
			if( det < 0 ) {
				sx = -sx;
			}

			position.x = te[12];
			position.y = te[13];
			position.z = te[14];

			// scale the rotation part

			matrix.elements.set( this.elements ); // at this point matrix is incomplete so we can't use .copy()

			var invSX = 1 / sx;
			var invSY = 1 / sy;
			var invSZ = 1 / sz;

			matrix.elements[0] *= invSX;
			matrix.elements[1] *= invSX;
			matrix.elements[2] *= invSX;

			matrix.elements[4] *= invSY;
			matrix.elements[5] *= invSY;
			matrix.elements[6] *= invSY;

			matrix.elements[8] *= invSZ;
			matrix.elements[9] *= invSZ;
			matrix.elements[10] *= invSZ;

			quaternion.setFromRotationMatrix( matrix );

			scale.x = sx;
			scale.y = sy;
			scale.z = sz;

			return this;

		};

	}(),

	makeFrustum: function ( left, right, bottom, top, near, far ) {

		var te = this.elements;
		var x = 2 * near / ( right - left );
		var y = 2 * near / ( top - bottom );

		var a = ( right + left ) / ( right - left );
		var b = ( top + bottom ) / ( top - bottom );
		var c = - ( far + near ) / ( far - near );
		var d = - 2 * far * near / ( far - near );

		te[0] = x;	te[4] = 0;	te[8] = a;	te[12] = 0;
		te[1] = 0;	te[5] = y;	te[9] = b;	te[13] = 0;
		te[2] = 0;	te[6] = 0;	te[10] = c;	te[14] = d;
		te[3] = 0;	te[7] = 0;	te[11] = - 1;	te[15] = 0;

		return this;

	},

	makePerspective: function ( fov, aspect, near, far ) {

		var ymax = near * Math.tan( THREE.Math.degToRad( fov * 0.5 ) );
		var ymin = - ymax;
		var xmin = ymin * aspect;
		var xmax = ymax * aspect;

		return this.makeFrustum( xmin, xmax, ymin, ymax, near, far );

	},

	makeOrthographic: function ( left, right, top, bottom, near, far ) {

		var te = this.elements;
		var w = right - left;
		var h = top - bottom;
		var p = far - near;

		var x = ( right + left ) / w;
		var y = ( top + bottom ) / h;
		var z = ( far + near ) / p;

		te[0] = 2 / w;	te[4] = 0;	te[8] = 0;	te[12] = -x;
		te[1] = 0;	te[5] = 2 / h;	te[9] = 0;	te[13] = -y;
		te[2] = 0;	te[6] = 0;	te[10] = -2/p;	te[14] = -z;
		te[3] = 0;	te[7] = 0;	te[11] = 0;	te[15] = 1;

		return this;

	},

	fromArray: function ( array ) {

		this.elements.set( array );

		return this;

	},

	toArray: function () {

		var te = this.elements;

		return [
			te[ 0 ], te[ 1 ], te[ 2 ], te[ 3 ],
			te[ 4 ], te[ 5 ], te[ 6 ], te[ 7 ],
			te[ 8 ], te[ 9 ], te[ 10 ], te[ 11 ],
			te[ 12 ], te[ 13 ], te[ 14 ], te[ 15 ]
		];

	},

	clone: function () {

		var te = this.elements;

		return new THREE.Matrix4(

			te[0], te[4], te[8], te[12],
			te[1], te[5], te[9], te[13],
			te[2], te[6], te[10], te[14],
			te[3], te[7], te[11], te[15]

		);

	}

};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.Object3D = function () {

	this.id = THREE.Object3DIdCount ++;
	this.uuid = THREE.Math.generateUUID();

	this.name = '';

	this.parent = undefined;
	this.children = [];

	this.up = new THREE.Vector3( 0, 1, 0 );

	this.position = new THREE.Vector3();
	this._rotation = new THREE.Euler();
	this._quaternion = new THREE.Quaternion();
	this.scale = new THREE.Vector3( 1, 1, 1 );

	// keep rotation and quaternion in sync

	this._rotation._quaternion = this.quaternion;
	this._quaternion._euler = this.rotation;

	this.renderDepth = null;

	this.rotationAutoUpdate = true;

	this.matrix = new THREE.Matrix4();
	this.matrixWorld = new THREE.Matrix4();

	this.matrixAutoUpdate = true;
	this.matrixWorldNeedsUpdate = true;

	this.visible = true;

	this.castShadow = false;
	this.receiveShadow = false;

	this.frustumCulled = true;

	this.userData = {};

};


THREE.Object3D.prototype = {

	constructor: THREE.Object3D,
	
	get rotation () { 
		return this._rotation; 
	},

	set rotation ( value ) {
		
		this._rotation = value;
		this._rotation._quaternion = this._quaternion;
		this._quaternion._euler = this._rotation;
		this._rotation._updateQuaternion();
		
	},

	get quaternion () { 
		return this._quaternion; 
	},
	
	set quaternion ( value ) {
		
		this._quaternion = value;
		this._quaternion._euler = this._rotation;
		this._rotation._quaternion = this._quaternion;
		this._quaternion._updateEuler();
		
	},

	get eulerOrder () {

		console.warn( 'DEPRECATED: Object3D\'s .eulerOrder has been moved to Object3D\'s .rotation.order.' );

		return this.rotation.order;

	},

	set eulerOrder ( value ) {

		console.warn( 'DEPRECATED: Object3D\'s .eulerOrder has been moved to Object3D\'s .rotation.order.' );

		this.rotation.order = value;

	},

	get useQuaternion () {

		console.warn( 'DEPRECATED: Object3D\'s .useQuaternion has been removed. The library now uses quaternions by default.' );

	},

	set useQuaternion ( value ) {

		console.warn( 'DEPRECATED: Object3D\'s .useQuaternion has been removed. The library now uses quaternions by default.' );

	},

	applyMatrix: function ( matrix ) {

		this.matrix.multiplyMatrices( matrix, this.matrix );

		this.matrix.decompose( this.position, this.quaternion, this.scale );

	},

	setRotationFromAxisAngle: function ( axis, angle ) {

		// assumes axis is normalized

		this.quaternion.setFromAxisAngle( axis, angle );

	},

	setRotationFromEuler: function ( euler ) {

		this.quaternion.setFromEuler( euler, true );

	},

	setRotationFromMatrix: function ( m ) {

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		this.quaternion.setFromRotationMatrix( m );

	},

	setRotationFromQuaternion: function ( q ) {

		// assumes q is normalized

		this.quaternion.copy( q );

	},

	rotateOnAxis: function() {

		// rotate object on axis in object space
		// axis is assumed to be normalized

		var q1 = new THREE.Quaternion();

		return function ( axis, angle ) {

			q1.setFromAxisAngle( axis, angle );

			this.quaternion.multiply( q1 );

			return this;

		}

	}(),

	rotateX: function () {

		var v1 = new THREE.Vector3( 1, 0, 0 );

		return function ( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	rotateY: function () {

		var v1 = new THREE.Vector3( 0, 1, 0 );

		return function ( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	rotateZ: function () {

		var v1 = new THREE.Vector3( 0, 0, 1 );

		return function ( angle ) {

			return this.rotateOnAxis( v1, angle );

		};

	}(),

	translateOnAxis: function () {

		// translate object by distance along axis in object space
		// axis is assumed to be normalized

		var v1 = new THREE.Vector3();

		return function ( axis, distance ) {

			v1.copy( axis );

			v1.applyQuaternion( this.quaternion );

			this.position.add( v1.multiplyScalar( distance ) );

			return this;

		}

	}(),

	translate: function ( distance, axis ) {

		console.warn( 'DEPRECATED: Object3D\'s .translate() has been removed. Use .translateOnAxis( axis, distance ) instead. Note args have been changed.' );
		return this.translateOnAxis( axis, distance );

	},

	translateX: function () {

		var v1 = new THREE.Vector3( 1, 0, 0 );

		return function ( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	translateY: function () {

		var v1 = new THREE.Vector3( 0, 1, 0 );

		return function ( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	translateZ: function () {

		var v1 = new THREE.Vector3( 0, 0, 1 );

		return function ( distance ) {

			return this.translateOnAxis( v1, distance );

		};

	}(),

	localToWorld: function ( vector ) {

		return vector.applyMatrix4( this.matrixWorld );

	},

	worldToLocal: function () {

		var m1 = new THREE.Matrix4();

		return function ( vector ) {

			return vector.applyMatrix4( m1.getInverse( this.matrixWorld ) );

		};

	}(),

	lookAt: function () {

		// This routine does not support objects with rotated and/or translated parent(s)

		var m1 = new THREE.Matrix4();

		return function ( vector ) {

			m1.lookAt( vector, this.position, this.up );

			this.quaternion.setFromRotationMatrix( m1 );

		};

	}(),

	add: function ( object ) {

		if ( object === this ) {

			console.warn( 'THREE.Object3D.add: An object can\'t be added as a child of itself.' );
			return;

		}

		if ( object instanceof THREE.Object3D ) {

			if ( object.parent !== undefined ) {

				object.parent.remove( object );

			}

			object.parent = this;
			object.dispatchEvent( { type: 'added' } );

			this.children.push( object );

			// add to scene

			var scene = this;

			while ( scene.parent !== undefined ) {

				scene = scene.parent;

			}

			if ( scene !== undefined && scene instanceof THREE.Scene )  {

				scene.__addObject( object );

			}

		}

	},

	remove: function ( object ) {

		var index = this.children.indexOf( object );

		if ( index !== - 1 ) {

			object.parent = undefined;
			object.dispatchEvent( { type: 'removed' } );

			this.children.splice( index, 1 );

			// remove from scene

			var scene = this;

			while ( scene.parent !== undefined ) {

				scene = scene.parent;

			}

			if ( scene !== undefined && scene instanceof THREE.Scene ) {

				scene.__removeObject( object );

			}

		}

	},

	traverse: function ( callback ) {

		callback( this );

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].traverse( callback );

		}

	},

	getObjectById: function ( id, recursive ) {

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];

			if ( child.id === id ) {

				return child;

			}

			if ( recursive === true ) {

				child = child.getObjectById( id, recursive );

				if ( child !== undefined ) {

					return child;

				}

			}

		}

		return undefined;

	},

	getObjectByName: function ( name, recursive ) {

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			var child = this.children[ i ];

			if ( child.name === name ) {

				return child;

			}

			if ( recursive === true ) {

				child = child.getObjectByName( name, recursive );

				if ( child !== undefined ) {

					return child;

				}

			}

		}

		return undefined;

	},

	getChildByName: function ( name, recursive ) {

		console.warn( 'DEPRECATED: Object3D\'s .getChildByName() has been renamed to .getObjectByName().' );
		return this.getObjectByName( name, recursive );

	},

	getDescendants: function ( array ) {

		if ( array === undefined ) array = [];

		Array.prototype.push.apply( array, this.children );

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].getDescendants( array );

		}

		return array;

	},

	updateMatrix: function () {

		this.matrix.compose( this.position, this.quaternion, this.scale );

		this.matrixWorldNeedsUpdate = true;

	},

	updateMatrixWorld: function ( force ) {

		if ( this.matrixAutoUpdate === true ) this.updateMatrix();

		if ( this.matrixWorldNeedsUpdate === true || force === true ) {

			if ( this.parent === undefined ) {

				this.matrixWorld.copy( this.matrix );

			} else {

				this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );

			}

			this.matrixWorldNeedsUpdate = false;

			force = true;

		}

		// update children

		for ( var i = 0, l = this.children.length; i < l; i ++ ) {

			this.children[ i ].updateMatrixWorld( force );

		}

	},

	clone: function ( object, recursive ) {

		if ( object === undefined ) object = new THREE.Object3D();
		if ( recursive === undefined ) recursive = true;

		object.name = this.name;

		object.up.copy( this.up );

		object.position.copy( this.position );
		object.quaternion.copy( this.quaternion );
		object.scale.copy( this.scale );

		object.renderDepth = this.renderDepth;

		object.rotationAutoUpdate = this.rotationAutoUpdate;

		object.matrix.copy( this.matrix );
		object.matrixWorld.copy( this.matrixWorld );

		object.matrixAutoUpdate = this.matrixAutoUpdate;
		object.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate;

		object.visible = this.visible;

		object.castShadow = this.castShadow;
		object.receiveShadow = this.receiveShadow;

		object.frustumCulled = this.frustumCulled;

		object.userData = JSON.parse( JSON.stringify( this.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < this.children.length; i ++ ) {

				var child = this.children[ i ];
				object.add( child.clone() );

			}

		}

		return object;

	}

};

THREE.EventDispatcher.prototype.apply( THREE.Object3D.prototype );

THREE.Object3DIdCount = 0;

/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
*/

THREE.Camera = function () {

	THREE.Object3D.call( this );

	this.matrixWorldInverse = new THREE.Matrix4();
	this.projectionMatrix = new THREE.Matrix4();

};

THREE.Camera.prototype = Object.create( THREE.Object3D.prototype );

THREE.Camera.prototype.lookAt = function () {

	// This routine does not support cameras with rotated and/or translated parent(s)

	var m1 = new THREE.Matrix4();

	return function ( vector ) {

		m1.lookAt( this.position, vector, this.up );

		this.quaternion.setFromRotationMatrix( m1 );

	};

}();

THREE.Camera.prototype.clone = function (camera) {

	if ( camera === undefined ) camera = new THREE.Camera();

	THREE.Object3D.prototype.clone.call( this, camera );

	camera.matrixWorldInverse.copy( this.matrixWorldInverse );
	camera.projectionMatrix.copy( this.projectionMatrix );

	return camera;
};

/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 */

THREE.PerspectiveCamera = function ( fov, aspect, near, far ) {

	THREE.Camera.call( this );

	this.fov = fov !== undefined ? fov : 50;
	this.aspect = aspect !== undefined ? aspect : 1;
	this.near = near !== undefined ? near : 0.1;
	this.far = far !== undefined ? far : 2000;

	this.updateProjectionMatrix();

};

THREE.PerspectiveCamera.prototype = Object.create( THREE.Camera.prototype );


/**
 * Uses Focal Length (in mm) to estimate and set FOV
 * 35mm (fullframe) camera is used if frame size is not specified;
 * Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
 */

THREE.PerspectiveCamera.prototype.setLens = function ( focalLength, frameHeight ) {

	if ( frameHeight === undefined ) frameHeight = 24;

	this.fov = 2 * THREE.Math.radToDeg( Math.atan( frameHeight / ( focalLength * 2 ) ) );
	this.updateProjectionMatrix();

}


/**
 * Sets an offset in a larger frustum. This is useful for multi-window or
 * multi-monitor/multi-machine setups.
 *
 * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
 * the monitors are in grid like this
 *
 *   +---+---+---+
 *   | A | B | C |
 *   +---+---+---+
 *   | D | E | F |
 *   +---+---+---+
 *
 * then for each monitor you would call it like this
 *
 *   var w = 1920;
 *   var h = 1080;
 *   var fullWidth = w * 3;
 *   var fullHeight = h * 2;
 *
 *   --A--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
 *   --B--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
 *   --C--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
 *   --D--
 *   camera.setOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
 *   --E--
 *   camera.setOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
 *   --F--
 *   camera.setOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
 *
 *   Note there is no reason monitors have to be the same size or in a grid.
 */

THREE.PerspectiveCamera.prototype.setViewOffset = function ( fullWidth, fullHeight, x, y, width, height ) {

	this.fullWidth = fullWidth;
	this.fullHeight = fullHeight;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;

	this.updateProjectionMatrix();

};


THREE.PerspectiveCamera.prototype.updateProjectionMatrix = function () {

	if ( this.fullWidth ) {

		var aspect = this.fullWidth / this.fullHeight;
		var top = Math.tan( THREE.Math.degToRad( this.fov * 0.5 ) ) * this.near;
		var bottom = -top;
		var left = aspect * bottom;
		var right = aspect * top;
		var width = Math.abs( right - left );
		var height = Math.abs( top - bottom );

		this.projectionMatrix.makeFrustum(
			left + this.x * width / this.fullWidth,
			left + ( this.x + this.width ) * width / this.fullWidth,
			top - ( this.y + this.height ) * height / this.fullHeight,
			top - this.y * height / this.fullHeight,
			this.near,
			this.far
		);

	} else {

		this.projectionMatrix.makePerspective( this.fov, this.aspect, this.near, this.far );

	}

};

THREE.PerspectiveCamera.prototype.clone = function () {

	var camera = new THREE.PerspectiveCamera();

	THREE.Camera.prototype.clone.call( this, camera );

	camera.fov = this.fov;
	camera.aspect = this.aspect;
	camera.near = this.near;
	camera.far = this.far;

	return camera;
};

/**
 * @author bhouston / http://exocortex.com
 */

THREE.Ray = function ( origin, direction ) {

	this.origin = ( origin !== undefined ) ? origin : new THREE.Vector3();
	this.direction = ( direction !== undefined ) ? direction : new THREE.Vector3();

};

THREE.Ray.prototype = {

	constructor: THREE.Ray,

	set: function ( origin, direction ) {

		this.origin.copy( origin );
		this.direction.copy( direction );

		return this;

	},

	copy: function ( ray ) {

		this.origin.copy( ray.origin );
		this.direction.copy( ray.direction );

		return this;

	},

	at: function ( t, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();

		return result.copy( this.direction ).multiplyScalar( t ).add( this.origin );

	},

	recast: function () {

		var v1 = new THREE.Vector3();

		return function ( t ) {

			this.origin.copy( this.at( t, v1 ) );

			return this;

		};

	}(),

	closestPointToPoint: function ( point, optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		result.subVectors( point, this.origin );
		var directionDistance = result.dot( this.direction );

		if ( directionDistance < 0 ) {

			return result.copy( this.origin );

		}

		return result.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

	},

	distanceToPoint: function () {

		var v1 = new THREE.Vector3();

		return function ( point ) {

			var directionDistance = v1.subVectors( point, this.origin ).dot( this.direction );

			// point behind the ray

			if ( directionDistance < 0 ) {

				return this.origin.distanceTo( point );

			}

			v1.copy( this.direction ).multiplyScalar( directionDistance ).add( this.origin );

			return v1.distanceTo( point );

		};

	}(),

	distanceSqToSegment: function( v0, v1, optionalPointOnRay, optionalPointOnSegment ) {

		// from http://www.geometrictools.com/LibMathematics/Distance/Wm5DistRay3Segment3.cpp
		// It returns the min distance between the ray and the segment
		// defined by v0 and v1
		// It can also set two optional targets :
		// - The closest point on the ray
		// - The closest point on the segment

		var segCenter = v0.clone().add( v1 ).multiplyScalar( 0.5 );
		var segDir = v1.clone().sub( v0 ).normalize();
		var segExtent = v0.distanceTo( v1 ) * 0.5;
		var diff = this.origin.clone().sub( segCenter );
		var a01 = - this.direction.dot( segDir );
		var b0 = diff.dot( this.direction );
		var b1 = - diff.dot( segDir );
		var c = diff.lengthSq();
		var det = Math.abs( 1 - a01 * a01 );
		var s0, s1, sqrDist, extDet;

		if ( det >= 0 ) {

			// The ray and segment are not parallel.

			s0 = a01 * b1 - b0;
			s1 = a01 * b0 - b1;
			extDet = segExtent * det;

			if ( s0 >= 0 ) {

				if ( s1 >= - extDet ) {

					if ( s1 <= extDet ) {

						// region 0
						// Minimum at interior points of ray and segment.

						var invDet = 1 / det;
						s0 *= invDet;
						s1 *= invDet;
						sqrDist = s0 * ( s0 + a01 * s1 + 2 * b0 ) + s1 * ( a01 * s0 + s1 + 2 * b1 ) + c;

					} else {

						// region 1

						s1 = segExtent;
						s0 = Math.max( 0, - ( a01 * s1 + b0) );
						sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

					}

				} else {

					// region 5

					s1 = - segExtent;
					s0 = Math.max( 0, - ( a01 * s1 + b0) );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			} else {

				if ( s1 <= - extDet) {

					// region 4

					s0 = Math.max( 0, - ( - a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? - segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				} else if ( s1 <= extDet ) {

					// region 3

					s0 = 0;
					s1 = Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = s1 * ( s1 + 2 * b1 ) + c;

				} else {

					// region 2

					s0 = Math.max( 0, - ( a01 * segExtent + b0 ) );
					s1 = ( s0 > 0 ) ? segExtent : Math.min( Math.max( - segExtent, - b1 ), segExtent );
					sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

				}

			}

		} else {

			// Ray and segment are parallel.

			s1 = ( a01 > 0 ) ? - segExtent : segExtent;
			s0 = Math.max( 0, - ( a01 * s1 + b0 ) );
			sqrDist = - s0 * s0 + s1 * ( s1 + 2 * b1 ) + c;

		}

		if ( optionalPointOnRay ) {

			optionalPointOnRay.copy( this.direction.clone().multiplyScalar( s0 ).add( this.origin ) );

		}

		if ( optionalPointOnSegment ) {

			optionalPointOnSegment.copy( segDir.clone().multiplyScalar( s1 ).add( segCenter ) );

		}

		return sqrDist;

	},

	isIntersectionSphere: function ( sphere ) {

		return this.distanceToPoint( sphere.center ) <= sphere.radius;

	},

	isIntersectionPlane: function ( plane ) {

		// check if the ray lies on the plane first

		var distToPoint = plane.distanceToPoint( this.origin );

		if ( distToPoint === 0 ) {

			return true;

		}

		var denominator = plane.normal.dot( this.direction );

		if ( denominator * distToPoint < 0 ) {

			return true

		}

		// ray origin is behind the plane (and is pointing behind it)

		return false;

	},

	distanceToPlane: function ( plane ) {

		var denominator = plane.normal.dot( this.direction );
		if ( denominator == 0 ) {

			// line is coplanar, return origin
			if( plane.distanceToPoint( this.origin ) == 0 ) {

				return 0;

			}

			// Null is preferable to undefined since undefined means.... it is undefined

			return null;

		}

		var t = - ( this.origin.dot( plane.normal ) + plane.constant ) / denominator;

		// Return if the ray never intersects the plane

		return t >= 0 ? t :  null;

	},

	intersectPlane: function ( plane, optionalTarget ) {

		var t = this.distanceToPlane( plane );

		if ( t === null ) {

			return null;
		}

		return this.at( t, optionalTarget );

	},

	isIntersectionBox: function () {
		
		var v = new THREE.Vector3();

		return function ( box ) {

			return this.intersectBox( box, v ) !== null;

		}

	}(),

	intersectBox: function ( box , optionalTarget ) {

		// http://www.scratchapixel.com/lessons/3d-basic-lessons/lesson-7-intersecting-simple-shapes/ray-box-intersection/

		var tmin,tmax,tymin,tymax,tzmin,tzmax;

		var invdirx = 1/this.direction.x,
			invdiry = 1/this.direction.y,
			invdirz = 1/this.direction.z;

		var origin = this.origin;

		if (invdirx >= 0) {
				
			tmin = (box.min.x - origin.x) * invdirx;
			tmax = (box.max.x - origin.x) * invdirx;

		} else { 

			tmin = (box.max.x - origin.x) * invdirx;
			tmax = (box.min.x - origin.x) * invdirx;
		}			

		if (invdiry >= 0) {
		
			tymin = (box.min.y - origin.y) * invdiry;
			tymax = (box.max.y - origin.y) * invdiry;

		} else {

			tymin = (box.max.y - origin.y) * invdiry;
			tymax = (box.min.y - origin.y) * invdiry;
		}

		if ((tmin > tymax) || (tymin > tmax)) return null;

		// These lines also handle the case where tmin or tmax is NaN
		// (result of 0 * Infinity). x !== x returns true if x is NaN
		
		if (tymin > tmin || tmin !== tmin ) tmin = tymin;

		if (tymax < tmax || tmax !== tmax ) tmax = tymax;

		if (invdirz >= 0) {
		
			tzmin = (box.min.z - origin.z) * invdirz;
			tzmax = (box.max.z - origin.z) * invdirz;

		} else {

			tzmin = (box.max.z - origin.z) * invdirz;
			tzmax = (box.min.z - origin.z) * invdirz;
		}

		if ((tmin > tzmax) || (tzmin > tmax)) return null;

		if (tzmin > tmin || tmin !== tmin ) tmin = tzmin;

		if (tzmax < tmax || tmax !== tmax ) tmax = tzmax;

		//return point closest to the ray (positive side)

		if ( tmax < 0 ) return null;

		return this.at( tmin >= 0 ? tmin : tmax, optionalTarget );

	},

	intersectTriangle: function() {

		// Compute the offset origin, edges, and normal.
		var diff = new THREE.Vector3();
		var edge1 = new THREE.Vector3();
		var edge2 = new THREE.Vector3();
		var normal = new THREE.Vector3();

		return function ( a, b, c, backfaceCulling, optionalTarget ) {

			// from http://www.geometrictools.com/LibMathematics/Intersection/Wm5IntrRay3Triangle3.cpp

			edge1.subVectors( b, a );
			edge2.subVectors( c, a );
			normal.crossVectors( edge1, edge2 );

			// Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
			// E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
			//   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
			//   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
			//   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
			var DdN = this.direction.dot( normal );
			var sign;

			if ( DdN > 0 ) {

				if ( backfaceCulling ) return null;
				sign = 1;

			} else if ( DdN < 0 ) {

				sign = - 1;
				DdN = - DdN;

			} else {

				return null;

			}

			diff.subVectors( this.origin, a );
			var DdQxE2 = sign * this.direction.dot( edge2.crossVectors( diff, edge2 ) );

			// b1 < 0, no intersection
			if ( DdQxE2 < 0 ) {

				return null;

			}

			var DdE1xQ = sign * this.direction.dot( edge1.cross( diff ) );

			// b2 < 0, no intersection
			if ( DdE1xQ < 0 ) {

				return null;

			}

			// b1+b2 > 1, no intersection
			if ( DdQxE2 + DdE1xQ > DdN ) {

				return null;

			}

			// Line intersects triangle, check if ray does.
			var QdN = - sign * diff.dot( normal );

			// t < 0, no intersection
			if ( QdN < 0 ) {

				return null;

			}

			// Ray intersects triangle.
			return this.at( QdN / DdN, optionalTarget );
	
		}
	
	}(),

	applyMatrix4: function ( matrix4 ) {

		this.direction.add( this.origin ).applyMatrix4( matrix4 );
		this.origin.applyMatrix4( matrix4 );
		this.direction.sub( this.origin );
		this.direction.normalize();

		return this;
	},

	equals: function ( ray ) {

		return ray.origin.equals( this.origin ) && ray.direction.equals( this.direction );

	},

	clone: function () {

		return new THREE.Ray().copy( this );

	}

};

/**
 * @author bhouston / http://exocortex.com
 */

THREE.Plane = function ( normal, constant ) {

	this.normal = ( normal !== undefined ) ? normal : new THREE.Vector3( 1, 0, 0 );
	this.constant = ( constant !== undefined ) ? constant : 0;

};

THREE.Plane.prototype = {

	constructor: THREE.Plane,

	set: function ( normal, constant ) {

		this.normal.copy( normal );
		this.constant = constant;

		return this;

	},

	setComponents: function ( x, y, z, w ) {

		this.normal.set( x, y, z );
		this.constant = w;

		return this;

	},

	setFromNormalAndCoplanarPoint: function ( normal, point ) {

		this.normal.copy( normal );
		this.constant = - point.dot( this.normal );	// must be this.normal, not normal, as this.normal is normalized

		return this;

	},

	setFromCoplanarPoints: function() {

		var v1 = new THREE.Vector3();
		var v2 = new THREE.Vector3();

		return function ( a, b, c ) {

			var normal = v1.subVectors( c, b ).cross( v2.subVectors( a, b ) ).normalize();

			// Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

			this.setFromNormalAndCoplanarPoint( normal, a );

			return this;

		};

	}(),


	copy: function ( plane ) {

		this.normal.copy( plane.normal );
		this.constant = plane.constant;

		return this;

	},

	normalize: function () {

		// Note: will lead to a divide by zero if the plane is invalid.

		var inverseNormalLength = 1.0 / this.normal.length();
		this.normal.multiplyScalar( inverseNormalLength );
		this.constant *= inverseNormalLength;

		return this;

	},

	negate: function () {

		this.constant *= -1;
		this.normal.negate();

		return this;

	},

	distanceToPoint: function ( point ) {

		return this.normal.dot( point ) + this.constant;

	},

	distanceToSphere: function ( sphere ) {

		return this.distanceToPoint( sphere.center ) - sphere.radius;

	},

	projectPoint: function ( point, optionalTarget ) {

		return this.orthoPoint( point, optionalTarget ).sub( point ).negate();

	},

	orthoPoint: function ( point, optionalTarget ) {

		var perpendicularMagnitude = this.distanceToPoint( point );

		var result = optionalTarget || new THREE.Vector3();
		return result.copy( this.normal ).multiplyScalar( perpendicularMagnitude );

	},

	isIntersectionLine: function ( line ) {

		// Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.

		var startSign = this.distanceToPoint( line.start );
		var endSign = this.distanceToPoint( line.end );

		return ( startSign < 0 && endSign > 0 ) || ( endSign < 0 && startSign > 0 );

	},

	intersectLine: function() {

		var v1 = new THREE.Vector3();

		return function ( line, optionalTarget ) {

			var result = optionalTarget || new THREE.Vector3();

			var direction = line.delta( v1 );

			var denominator = this.normal.dot( direction );

			if ( denominator == 0 ) {

				// line is coplanar, return origin
				if( this.distanceToPoint( line.start ) == 0 ) {

					return result.copy( line.start );

				}

				// Unsure if this is the correct method to handle this case.
				return undefined;

			}

			var t = - ( line.start.dot( this.normal ) + this.constant ) / denominator;

			if( t < 0 || t > 1 ) {

				return undefined;

			}

			return result.copy( direction ).multiplyScalar( t ).add( line.start );

		};

	}(),


	coplanarPoint: function ( optionalTarget ) {

		var result = optionalTarget || new THREE.Vector3();
		return result.copy( this.normal ).multiplyScalar( - this.constant );

	},

	applyMatrix4: function() {

		var v1 = new THREE.Vector3();
		var v2 = new THREE.Vector3();
		var m1 = new THREE.Matrix3();

		return function ( matrix, optionalNormalMatrix ) {

			// compute new normal based on theory here:
			// http://www.songho.ca/opengl/gl_normaltransform.html
			var normalMatrix = optionalNormalMatrix || m1.getNormalMatrix( matrix );
			var newNormal = v1.copy( this.normal ).applyMatrix3( normalMatrix );
			
			var newCoplanarPoint = this.coplanarPoint( v2 );
			newCoplanarPoint.applyMatrix4( matrix );

			this.setFromNormalAndCoplanarPoint( newNormal, newCoplanarPoint );

			return this;

		};

	}(),

	translate: function ( offset ) {

		this.constant = this.constant - offset.dot( this.normal );

		return this;

	},

	equals: function ( plane ) {

		return plane.normal.equals( this.normal ) && ( plane.constant == this.constant );

	},

	clone: function () {

		return new THREE.Plane().copy( this );

	}

};

/**
 * Based on http://www.emagix.net/academic/mscs-project/item/camera-sync-with-css3-and-webgl-threejs
 * @author mrdoob / http://mrdoob.com/
 * @author mark lundin / http://mark-lundin.com
 *
 *	This is slightly modified CSS Renderer that sets the object transform as individual translate, scale and rotate. 
 * 	The reason for this is that the transformation using matrix3d do not scale correctly under browser zoom.
 */

THREE.CSS3DObject = function ( element ) {

	THREE.Object3D.call( this );

	this.element = element;
	this.done = false;
	this.element.style.position = 'absolute';

	this.addEventListener( 'removed', function ( event ) {

		if ( this.element.parentNode !== null ) {

			this.element.parentNode.removeChild( this.element );

			for ( var i = 0, l = this.children.length; i < l; i ++ ) {

				this.children[ i ].dispatchEvent( event );

			}

		}

	} );

};

THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );

THREE.CSS3DSprite = function ( element ) {

	THREE.CSS3DObject.call( this, element );

};

THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );

//

THREE.CSS3DRenderer = function () {

	// console.log( 'THREE.CSS3DRenderer', THREE.REVISION );

	var _width, _height;
	var _widthHalf, _heightHalf;

	var matrix = new THREE.Matrix4();

	var domElement = document.createElement( 'div' );
	domElement.style.overflow = 'hidden';

	domElement.style.WebkitTransformStyle = 'preserve-3d';
	domElement.style.MozTransformStyle = 'preserve-3d';
	domElement.style.oTransformStyle = 'preserve-3d';
	domElement.style.transformStyle = 'preserve-3d';

	this.domElement = domElement;

	var cameraElement = document.createElement( 'div' );

	cameraElement.style.WebkitTransformStyle = 'preserve-3d';
	cameraElement.style.MozTransformStyle = 'preserve-3d';
	cameraElement.style.oTransformStyle = 'preserve-3d';
	cameraElement.style.transformStyle = 'preserve-3d';

	domElement.appendChild( cameraElement );

	this.setClearColor = function () {

	};

	this.setSize = function ( width, height ) {

		_width = width;
		_height = height;

		_widthHalf = _width / 2;
		_heightHalf = _height / 2;

		domElement.style.width = width + 'px';
		domElement.style.height = height + 'px';;


		cameraElement.style.width = width + 'px';
		cameraElement.style.height = height + 'px';

	};

	var epsilon = function ( value ) {

		return Math.abs( value ) < 0.000001 ? 0 : value;

	};

	var getCameraCSSMatrix = function ( matrix ) {

		var elements = matrix.elements;

		return 'matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( - elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( elements[ 4 ] ) + ',' +
			epsilon( - elements[ 5 ] ) + ',' +
			epsilon( elements[ 6 ] ) + ',' +
			epsilon( elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( - elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( - elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';

	};

	var getObjectCSSMatrix = function ( matrix ) {

		var elements = matrix.elements;

		return 'translate3d(-50%,-50%,0) matrix3d(' +
			epsilon( elements[ 0 ] ) + ',' +
			epsilon( elements[ 1 ] ) + ',' +
			epsilon( elements[ 2 ] ) + ',' +
			epsilon( elements[ 3 ] ) + ',' +
			epsilon( - elements[ 4 ] ) + ',' +
			epsilon( - elements[ 5 ] ) + ',' +
			epsilon( - elements[ 6 ] ) + ',' +
			epsilon( - elements[ 7 ] ) + ',' +
			epsilon( elements[ 8 ] ) + ',' +
			epsilon( elements[ 9 ] ) + ',' +
			epsilon( elements[ 10 ] ) + ',' +
			epsilon( elements[ 11 ] ) + ',' +
			epsilon( elements[ 12 ] ) + ',' +
			epsilon( elements[ 13 ] ) + ',' +
			epsilon( elements[ 14 ] ) + ',' +
			epsilon( elements[ 15 ] ) +
		')';

	};

	var getObjectCSSTransform = function(){

		var position = new THREE.Vector3(),
			scale 	 = new THREE.Vector3(),
			euler 	 = new THREE.Euler(),
			quaternion = new THREE.Quaternion(),
			style;

		euler._quaternion = quaternion;
		quaternion._euler = euler;

		return function ( matrix ) {

			// position.copy( object.position )
			// euler.copy( object.rotation )

			matrix.decompose( position, quaternion, scale );
			// euler.copy( object.rotation )

			return 'translate3d(-50%,-50%,0) translate3d(' + epsilon(position.x) + 'px, ' + epsilon(position.y) + 'px, ' + epsilon(position.z) + 'px) '
					+ 'rotateX(' + epsilon(euler.x) + 'rad) rotateY(' + epsilon(euler.y) + 'rad) rotateZ(' + epsilon(euler.z) + 'rad) '
					+ 'scale3d(' + epsilon(scale.x) + ', ' + epsilon(-scale.y) + ', ' + epsilon(scale.z) + ')';

		};

	}()


	var renderObject = function ( object, camera ) {

		if ( object instanceof THREE.CSS3DObject ) {

			var style;

			if ( object instanceof THREE.CSS3DSprite ) {

				// http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

				matrix.copy( camera.matrixWorldInverse );
				matrix.transpose();
				matrix.copyPosition( object.matrixWorld );
				matrix.scale( object.scale );

				matrix.elements[ 3 ] = 0;
				matrix.elements[ 7 ] = 0;
				matrix.elements[ 11 ] = 0;
				matrix.elements[ 15 ] = 1;

				style = getObjectCSSTransform( matrix );

			} else {

				style = getObjectCSSTransform( object.matrixWorld );

			}

			var element = object.element;

			element.style.WebkitTransformStyle = 'preserve-3d';
			element.style.MozTransformStyle = 'preserve-3d';
			element.style.oTransformStyle = 'preserve-3d';
			element.style.transformStyle = 'preserve-3d';

			element.style.WebkitTransform = style;
			element.style.MozTransform = style;
			element.style.oTransform = style;
			element.style.transform = style;


			if ( element.parentNode !== cameraElement ) {

				cameraElement.appendChild( element );

			}

		}

		for ( var i = 0, l = object.children.length; i < l; i ++ ) {

			renderObject( object.children[ i ], camera );

		}

	};


	this.render = function ( scene, camera ) {
		// if( !this.done ){
		// 	this.done = true;

			var fov = 0.5 / Math.tan( THREE.Math.degToRad( camera.fov * 0.5 ) ) * _height;

			domElement.style.WebkitPerspective = fov + "px";
			domElement.style.MozPerspective = fov + "px";
			domElement.style.oPerspective = fov + "px";
			domElement.style.perspective = fov + "px";

			scene.updateMatrixWorld();

			if ( camera.parent === undefined ) camera.updateMatrixWorld();

			camera.matrixWorldInverse.getInverse( camera.matrixWorld );

			var style = "translate3d(0,0," + fov + "px)" + getCameraCSSMatrix( camera.matrixWorldInverse ) +
				" translate3d(" + _widthHalf + "px," + _heightHalf + "px, 0)";

			cameraElement.style.WebkitTransform = style;
			cameraElement.style.MozTransform = style;
			cameraElement.style.oTransform = style;
			cameraElement.style.transform = style;

			renderObject( scene, camera );
		// }

	};

};

var _ = {
	
	isNumeric: function( n ){
		return !isNaN( parseFloat( n )) && isFinite( n );
	},
	cascade: function(){

		var i, args = Array.prototype.slice.call( arguments );

		for( i = 0; i < args.length; i ++ )
			if( args[ i ] !== undefined ) return args[ i ];
		return false;
	},

  	hexToRgb: function(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
	}


};
ERNO.extend( Number.prototype, {


	absolute : function(){

		return Math.abs( this );
	},
	add : function(){
		
		var sum = this;

		Array.prototype.slice.call( arguments ).forEach( function( n ){

			sum += n;
		});
		return sum;
	},
	arcCosine : function(){

		return Math.acos( this );
	},
	arcSine : function(){

		return Math.asin( this );
	},
	arcTangent : function(){

		return Math.atan( this );
	},
	constrain : function( a, b ){

		var higher, lower, c = this;

		b = b || 0;
		higher = Math.max( a, b );
		lower  = Math.min( a, b );
		c = Math.min( c, higher );
		c = Math.max( c, lower  );
		return c;
	},
	cosine : function(){

		return Math.cos( this );
	},
	degreesToDirection : function(){

		var d = this % 360,

		directions = [ 'N', 'NNE', 'NE', 'NEE', 'E', 'SEE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'SWW', 'W', 'NWW', 'NW', 'NNW', 'N' ];
		return directions[ this.scale( 0, 360, 0, directions.length - 1 ).round() ];
	},
	degreesToRadians : function(){

		return this * Math.PI / 180;
	},
	divide : function(){
		
		var sum = this;

		Array.prototype.slice.call( arguments ).forEach( function( n ){

			sum /= n;
		});
		return sum;
	},
	isBetween : function( a, b ){
		
		var 
		min = Math.min( a, b ),
		max = Math.max( a, b );
		
		return ( min <= this && this <= max );
	},
	lerp : function( a, b ){

		return a + (b - a ) * this;
	},
	log : function( base ){
		
		return Math.log( this ) / ( base === undefined ? 1 : Math.log( base ));
	},
	log10 : function(){

		// is this more pragmatic? ---> return ( '' + this.round() ).length;
		return Math.log( this ) / Math.LN10;
	},
	maximum : function( n ){

		return Math.max( this, n );
	},
	minimum : function( n ){

		return Math.min( this, n );
	},
	modulo : function( n ){

		return (( this % n ) + n ) % n;
	},
	multiply : function(){
		
		var sum = this;

		Array.prototype.slice.call( arguments ).forEach( function( n ){

			sum *= n;
		});
		return sum;
	},
	normalize : function( a, b ){

		if( a == b ) return 1.0;
		return ( this - a ) / ( b - a );
	},
	raiseTo : function( exponent ){

		return Math.pow( this, exponent );
	},
	radiansToDegrees : function(){

		return this * 180 / Math.PI;
	},
	rand : function( n ){

		var min, max;

		if( n !== undefined ){

			min = Math.min( this, n );
			max = Math.max( this, n );
			return min + Math.floor( Math.random() * ( max - min ));
		}
		return Math.floor( Math.random() * this );
	},
	random : function( n ){

		var min, max;

		if( n !== undefined ){

			min = Math.min( this, n );
			max = Math.max( this, n );
			return min + Math.random() * ( max - min );
		}
		return Math.random() * this;
	},
	remainder : function( n ){

		return this % n;
	},
	round : function( decimals ){

		var n  = this

		decimals = decimals || 0
		n *= Math.pow( 10, decimals )
		n  = Math.round( n )
		n /= Math.pow( 10, decimals )
		return n
	},
	roundDown : function(){

		return Math.floor( this )
	},
	roundUp : function(){

		return Math.ceil( this )
	},
	scale : function( a0, a1, b0, b1 ){

		var phase = this.normalize( a0, a1 )

		if( b0 == b1 ) return b1
		return b0 + phase * ( b1 - b0 )
	},
	sine : function(){

		return Math.sin( this )
	},
	subtract : function(){
		
		var sum = this

		Array.prototype.slice.call( arguments ).forEach( function( n ){

			sum -= n
		})
		return sum
	},
	tangent : function(){

		return Math.tan( this )
	},
	toArray : function(){

		return [ this.valueOf() ]
	},
	toNumber : function(){

		return this.valueOf()
	},
	toPaddedString : function( padding ){

		return ( '0000000000000' + String( this )).slice( -padding );
	},
	toSignedString : function(){

		var stringed = '' + this
		
		if( this >= 0 ) stringed = '+' + stringed
		return stringed
	},
	toString : function(){

		return ''+ this
	}
})
ERNO.extend( String.prototype, {


	capitalize : function(){

		return this.charAt( 0 ).toUpperCase() + this.slice( 1 )//.toLowerCase();
	},
	invert: function(){

		var
		s = '',
		i;

		for( i = 0; i < this.length; i ++ ){

			if( this.charAt( i ) === this.charAt( i ).toUpperCase()) s += this.charAt( i ).toLowerCase();
			else s += this.charAt( i ).toUpperCase();
		}
		return s;
	},
	justifyCenter : function( n ){

		var
		thisLeftLength  = Math.round( this.length / 2 ),
		thisRightLength = this.length - thisLeftLength,
		containerLeftLength  = Math.round( n / 2 ),
		containerRightLength = n - containerLeftLength,
		padLeftLength  = containerLeftLength  - thisLeftLength,
		padRightLength = containerRightLength - thisRightLength,
		centered = this;

		if( padLeftLength > 0 ){

			while( padLeftLength -- ) centered = ' ' + centered;
		}
		else if( padLeftLength < 0 ){

			centered = centered.substr( padLeftLength * -1 );
		}
		if( padRightLength > 0 ){

			while( padRightLength -- ) centered += ' ';
		}
		else if( padRightLength < 0 ){

			centered = centered.substr( 0, centered.length + padRightLength );
		}
		return centered;
	},
	justifyLeft: function( n ){

		var justified = this;

		while( justified.length < n ) justified = justified + ' ';
		return justified;
	},
	justifyRight: function( n ){

		var justified = this;

		while( justified.length < n ) justified = ' ' + justified;
		return justified;
	},
	multiply : function( n ){

		var i, s = '';

		n = _.cascade( n, 2 );
		for( i = 0; i < n; i ++ ){
			s += this;
		}
		return s;
	},
	reverse : function(){

		var i, s = '';

		for( i = 0; i < this.length; i ++ ){
			s = this[ i ] + s;
		}
		return s;
	},
	size : function(){

		return this.length;
	},
	toEntities : function(){

		var i, entities = '';

		for( i = 0; i < this.length; i ++ ){
			entities += '&#' + this.charCodeAt( i ) + ';';
		}
		return entities;
	},
	toCamelCase : function(){
		
		var
		split  = this.split( /\W+|_+/ ),
		joined = split[ 0 ],
		i;

		for( i = 1; i < split.length; i ++ )
			joined += split[ i ].capitalize();

		return joined;
	},
	directionToDegrees : function(){

		var
		directions = [ 'N', 'NNE', 'NE', 'NEE', 'E', 'SEE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'SWW', 'W', 'NWW', 'NW', 'NNW', 'N' ],
		i = directions.indexOf( this.toUpperCase() );

		return i >= 0 ? i.scale( 0, directions.length - 1, 0, 360 ) : Number.NaN;
	},
	toArray : function(){

		return [ this ];
	},
	toNumber : function(){

		return parseFloat( this );
	},
	toString : function(){

		return this;
	},
	toUnderscoreCase : function(){
		
		var underscored = this.replace( /[A-Z]+/g, function( $0 ){
			
			return '_' + $0;
		});

		if( underscored.charAt( 0 ) === '_' ) underscored = underscored.substr( 1 );
		return underscored.toLowerCase();
	},
	toUnicode : function(){

		var i, u, unicode = '';

		for( i = 0; i < this.length; i ++ ){
			u = this.charCodeAt( i ).toString( 16 ).toUpperCase();
			while( u.length < 4 ){
				u = '0' + u;
			}
			unicode += '\\u' + u;
		}
		return unicode;
	}
});
ERNO.extend( Array.prototype, {
		
	
	distanceTo : function( target ){

		var i, sum = 0;

		if( arguments.length > 0 ) 
			target = Array.prototype.slice.call( arguments );
		if( this.length === target.length ){

			for( i = 0; i < this.length; i ++ )
				sum += Math.pow( target[i] - this[i], 2 );
			return Math.pow( sum, 0.5 );
		}
		else return null;
	},
	first : function(){
		
		return this[ 0 ];
	},
	last : function(){
		
		return this[ this.length - 1 ];
	},
	maximum : function(){

		return Math.max.apply( null, this );
	},
	middle : function(){
	
		return this[ Math.round(( this.length - 1 ) / 2 ) ];
	},
	minimum : function(){

		return Math.min.apply( null, this );
	},
	rand : function(){

		return this[ Math.floor( Math.random() * this.length )];
	},
	random : function(){//  Convenience here. Exactly the same as .rand().

		return this[ Math.floor( Math.random() * this.length )];
	},
	//  Ran into trouble here with Three.js. Will investigate....
	/*remove: function( from, to ){

		var rest = this.slice(( to || from ) + 1 || this.length )
		
		this.length = from < 0 ? this.length + from : from
		return this.push.apply( this, rest )
	},*/
	shuffle : function(){

		var 
		copy = this,
		i = this.length, 
		j,
		tempi,
		tempj;

		if( i == 0 ) return false;
		while( -- i ){

			j = Math.floor( Math.random() * ( i + 1 ));
			tempi = copy[ i ];
			tempj = copy[ j ];
			copy[ i ] = tempj;
			copy[ j ] = tempi;
		}
		return copy;
	},
	toArray : function(){

		return this;
	},
	toHtml : function(){

		var i, html = '<ul>';

		for( i = 0; i < this.length; i ++ ){

			if( this[ i ] instanceof Array )
				html += this[ i ].toHtml();
			else
				html += '<li>' + this[ i ] + '</li>';
		}
		html += '</ul>';
		return html;
	},
	toText : function( depth ){

		var i, indent, text;

		depth = _.cascade( depth, 0 );
		indent = '\n' + '\t'.multiply( depth );
		text = '';
		for( i = 0; i < this.length; i ++ ){

			if( this[ i ] instanceof Array )
				text += indent + this[ i ].toText( depth + 1 );
			else
				text += indent + this[ i ];
		}
		return text;
	}


});
/*


	COLORS

	Here's a little bootstrapping to create our Color constants.
	At first it seemed like overkill, but then as the solvers and inspectors
	moved forward having these objects available became highly desirable.
	Sure, ES5 doesn't really have constants but the all-caps alerts you
	to the fact that them thar variables ought not to be messed with.

	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/









ERNO.Color = function( name, initial, hex, styleF, styleB ){

	this.name    = name;
	this.initial = initial;
	this.hex     = hex;
	this.styleF  = styleF;
	this.styleB  = styleB;
}


//  Global constants to describe sticker colors.

var W,
	O,
	B,
	R,
	G,
	Y,
	COLOURLESS;

W = ERNO.WHITE = new ERNO.Color(

	'white',
	'W',
	'#FFF',
	'font-weight: bold; color: #888',
	'background-color: #F3F3F3; color: rgba( 0, 0, 0, 0.5 )'
),
O = ERNO.ORANGE = new ERNO.Color(

	'orange',
	'O',
	'#F60',
	'font-weight: bold; color: #F60',
	'background-color: #F60; color: rgba( 255, 255, 255, 0.9 )'
),
B = ERNO.BLUE = new ERNO.Color(

	'blue',
	'B',
	'#00D',
	'font-weight: bold; color: #00D',
	'background-color: #00D; color: rgba( 255, 255, 255, 0.9 )'
),
R = ERNO.RED = new ERNO.Color(

	'red',
	'R',
	'#F00',
	'font-weight: bold; color: #F00',
	'background-color: #F00; color: rgba( 255, 255, 255, 0.9 )'
),
G = ERNO.GREEN = new ERNO.Color(

	'green',
	'G',
	'#0A0',
	'font-weight: bold; color: #0A0',
	'background-color: #0A0; color: rgba( 255, 255, 255, 0.9 )'
),
Y = ERNO.YELLOW = new ERNO.Color(

	'yellow',
	'Y',
	'#FE0',
	'font-weight: bold; color: #ED0',
	'background-color: #FE0; color: rgba( 0, 0, 0, 0.5 )'
),
ERNO.COLORLESS = new ERNO.Color(

	'NA',
	'X',
	'#DDD',
	'color: #EEE',
	'color: #DDD'
)

/*


	DIRECTIONS

	We have six Directions which we map in a spiral around a cube: front, up,
	right, down, left, and back. That's nice on its own but what's important 
	is the relationships between faces. For example, What's to the left of the
	Front face? Well that depends on what the Front face considers "up" to 
	be. The ERNO.Controls class handles these relationships and calculates clock-
	wise and anticlockwise relationships.


	                 ------------- 
	                |             |
	                |      0      |   opposite
	                |             |
	                |    getUp()  |
	                |             |
	   ------------- ------------- ------------- 
	  |             |             |             |
	  |      3      |             |      1      |
	  |             |             |             |
	  |  getLeft()  |    this     |  getRight() |
	  |             |             |             |
	   ------------- ------------- ------------- 
	                |             |
	                |      2      |
	                |             |
	                |  getDown()  |
	                |             |
	                 ------------- 


	The following equalities demonstrate how Directions operate:

	  FRONT.getOpposite().name === 'back'
	  FRONT.getUp().name === 'up'
	  FRONT.getUp( LEFT ).name === 'left'
	  FRONT.getRight().name === 'right'
	  FRONT.getRight( DOWN ).name === 'left'
	  FRONT.getClockwise().name === 'right'
	  FRONT.getClockwise( RIGHT ).name === 'down'

	  RIGHT.getOpposite().name === 'left'
	  RIGHT.getUp().name === 'up'
	  RIGHT.getUp( FRONT ).name === 'front'
	  RIGHT.getRight().name === 'back'
	  RIGHT.getRight( DOWN ).name === 'front'
	  RIGHT.getClockwise().name === 'back'
	  RIGHT.getClockwise( FRONT ).name === 'up'


	Keep in mind that a direction cannot use itself or its opposite as the
	normalized up vector when seeking a direction!

	  RIGHT.getUp( RIGHT ) === null
	  RIGHT.getUp( LEFT  ) === null


	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/








ERNO.Direction = function( id, name, normal ){

	this.id        = id;
	this.name      = name.toLowerCase();
	this.normal    = normal;
	this.initial   = name.substr( 0, 1 ).toUpperCase();
	this.neighbors = [];
	this.opposite  = null;
}
ERNO.Direction.prototype.setRelationships = function( up, right, down, left, opposite ){

	this.neighbors = [ up, right, down, left ];
	this.opposite  = opposite;
};




ERNO.Direction.getNameById = function( id ){

	return [

		'front',
		'up',
		'right',
		'down',
		'left',
		'back'

	][ id ];
};
ERNO.Direction.getIdByName = function( name ){

	return {

		front: 0,
		up   : 1,
		right: 2,
		down : 3,
		left : 4,
		back : 5

	}[ name ];
};
ERNO.Direction.getDirectionById = function( id ){

	return [

		ERNO.Direction.FRONT,
		ERNO.Direction.UP,
		ERNO.Direction.RIGHT,
		ERNO.Direction.DOWN,
		ERNO.Direction.LEFT,
		ERNO.Direction.BACK

	][ id ];
};
ERNO.Direction.getDirectionByInitial = function( initial ){

	return {

		F: ERNO.Direction.FRONT,
		U: ERNO.Direction.UP,
		R: ERNO.Direction.RIGHT,
		D: ERNO.Direction.DOWN,
		L: ERNO.Direction.LEFT,
		B: ERNO.Direction.BACK

	}[ initial.toUpperCase() ];
}
ERNO.Direction.getDirectionByName = function( name ){

	return {

		front: ERNO.Direction.FRONT,
		up   : ERNO.Direction.UP,
		right: ERNO.Direction.RIGHT,
		down : ERNO.Direction.DOWN,
		left : ERNO.Direction.LEFT,
		back : ERNO.Direction.BACK

	}[ name.toLowerCase() ]
}
ERNO.Direction.getDirectionByNormal = function(){

	var vector  = new THREE.Vector3();

	return function ( normal ){

		//	Flatten out any floating point rounding errors ...
		vector.x = Math.round( normal.x );
		vector.y = Math.round( normal.y );
		vector.z = Math.round( normal.z );

		return  vector.equals( ERNO.Direction.FRONT.normal 	) ? ERNO.Direction.FRONT :
				vector.equals( ERNO.Direction.BACK.normal  	) ? ERNO.Direction.BACK  :
				vector.equals( ERNO.Direction.UP.normal 	) ? ERNO.Direction.UP    :
				vector.equals( ERNO.Direction.DOWN.normal 	) ? ERNO.Direction.DOWN  :
				vector.equals( ERNO.Direction.LEFT.normal 	) ? ERNO.Direction.LEFT  :
				vector.equals( ERNO.Direction.RIGHT.normal 	) ? ERNO.Direction.RIGHT :
				null;
	}

}()




//  If we're looking at a particular face 
//  and we designate an adjacet side as up
//  then we can calculate what adjacent side would appear to be up
//  if we rotated clockwise or anticlockwise.

ERNO.Direction.prototype.getRotation = function( vector, from, steps ){

	if( from === undefined ) from = this.neighbors[ 0 ]
	if( from === this || from === this.opposite ) return null
	steps = steps === undefined ? 1 : steps.modulo( 4 )
	for( var i = 0; i < 5; i ++ ){

		if( this.neighbors[ i ] === from ) break
	}
	return this.neighbors[ i.add( steps * vector ).modulo( 4 )];
}
ERNO.Direction.prototype.getClockwise = function( from, steps ){

	return this.getRotation( +1, from, steps );
}
ERNO.Direction.prototype.getAnticlockwise = function( from, steps ){

	return this.getRotation( -1, from, steps );
}


//  Similar to above,
//  if we're looking at a particular face 
//  and we designate an adjacet side as up
//  we can state what sides appear to be to the up, right, down, and left
//  of this face.

ERNO.Direction.prototype.getDirection = function( direction, up ){

	return this.getRotation( 1, up, direction.id - 1 );
}
ERNO.Direction.prototype.getUp = function( up ){

	return this.getDirection( ERNO.Direction.UP, up );
}
ERNO.Direction.prototype.getRight = function( up ){

	return this.getDirection( ERNO.Direction.RIGHT, up );
}
ERNO.Direction.prototype.getDown = function( up ){

	return this.getDirection( ERNO.Direction.DOWN, up );
}
ERNO.Direction.prototype.getLeft = function( up ){

	return this.getDirection( ERNO.Direction.LEFT, up );
}



//  An convenience method that mimics the verbiage
//  of the getRotation() and getDirection() methods.

ERNO.Direction.prototype.getOpposite = function(){

	return this.opposite;
}




//  Create facing directions as global constants this way we can access from 
//  anywhere in any scope without big long variables names full of dots and 
//  stuff. Sure, ES5 doesn't really have constants but the all-caps alerts you
//	to the fact that them thar variables ought not to be messed with.


ERNO.Direction.FRONT = new ERNO.Direction( 0, 'front', new THREE.Vector3(  0,  0,  1 ));
ERNO.Direction.UP    = new ERNO.Direction( 1, 'up'   , new THREE.Vector3(  0,  1,  0 ));
ERNO.Direction.RIGHT = new ERNO.Direction( 2, 'right', new THREE.Vector3(  1,  0,  0 ));
ERNO.Direction.DOWN  = new ERNO.Direction( 3, 'down' , new THREE.Vector3(  0, -1,  0 ));
ERNO.Direction.LEFT  = new ERNO.Direction( 4, 'left' , new THREE.Vector3( -1,  0,  0 ));
ERNO.Direction.BACK  = new ERNO.Direction( 5, 'back' , new THREE.Vector3(  0,  0, -1 ));


//  Now that they all exist we can 
//  establish their relationships to one another.

ERNO.Direction.FRONT.setRelationships( ERNO.Direction.UP,    ERNO.Direction.RIGHT, ERNO.Direction.DOWN,  ERNO.Direction.LEFT,  ERNO.Direction.BACK  );
ERNO.Direction.UP.setRelationships(    ERNO.Direction.BACK,  ERNO.Direction.RIGHT, ERNO.Direction.FRONT, ERNO.Direction.LEFT,  ERNO.Direction.DOWN  );
ERNO.Direction.RIGHT.setRelationships( ERNO.Direction.UP,    ERNO.Direction.BACK,  ERNO.Direction.DOWN,  ERNO.Direction.FRONT, ERNO.Direction.LEFT  );
ERNO.Direction.DOWN.setRelationships(  ERNO.Direction.FRONT, ERNO.Direction.RIGHT, ERNO.Direction.BACK,  ERNO.Direction.LEFT,  ERNO.Direction.UP    );
ERNO.Direction.LEFT.setRelationships(  ERNO.Direction.UP,    ERNO.Direction.FRONT, ERNO.Direction.DOWN,  ERNO.Direction.BACK,  ERNO.Direction.RIGHT );
ERNO.Direction.BACK.setRelationships(  ERNO.Direction.UP,    ERNO.Direction.LEFT,  ERNO.Direction.DOWN,  ERNO.Direction.RIGHT, ERNO.Direction.FRONT );




/*


	QUEUES

	Queues are glorified Arrays and rather useful for things like our
	cube.twistQueue, cube.taskQueue, etc. 

	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/








ERNO.Queue = function( validation ){


	//  Do we want to run a validation routine on objects being stored in 
	//  this ERNO.Queue? If so you can send the function as an argument to the 
	//  constructor or create this property later on your own.

	if( validation !== undefined && validation instanceof Function ) this.validate = validation;


	//  The rest is vanilla.

	this.history = [];
	this.useHistory = true;
	this.future  = [];
	this.isReady = true;
	this.isLooping = false;
}




//  The idea here with .add() is that .validate() will always return an Array.
//  The reason for this is that the validator may decide it needs to add more
//  than one element to the ERNO.Queue. This allows it to do so.
ERNO.Queue.prototype.add = function(){

	var elements = Array.prototype.slice.call( arguments );

	if( this.validate !== undefined && this.validate instanceof Function ) elements = this.validate( elements );

	if( elements instanceof Array ){
	
		elements.forEach( function( element ){

			this.future.push( element );

		}.bind( this ));

	}

	return this.future;

}; 
ERNO.Queue.prototype.remove = function(){

	var  elements = Array.prototype.slice.call( arguments );

	if( elements instanceof Array ){
	
		elements.forEach( function( element ){

			this.future = this.future.filter( function( futureElement ){
				return futureElement != element;
			});

		}.bind( this ));

	}

	return this.future;

}; 

ERNO.Queue.prototype.purge = function(){

	var elements = Array.prototype.slice.call( arguments );

	if( elements instanceof Array ){
	
		elements.forEach( function( element ){

			this.history = this.history.filter( function( historyElement ){
				return historyElement != element;
			});

		}.bind( this ));

	}

	return this.history;

}; 

ERNO.Queue.prototype.empty = function( emptyHistory ){

	this.future = [];
	if( emptyHistory ) this.history = [];
}; 
ERNO.Queue.prototype.do = function(){

	if( this.future.length ){

		var element = this.future.shift();
		if( this.useHistory ) this.history.push( element );
		return element;
	}
	else if( this.isLooping ){

		this.future  = this.history.slice();
		this.history = [];
	}
}; 
ERNO.Queue.prototype.undo = function(){

	if( this.history.length ){
		
		var element = this.history.pop();
		this.future.unshift( element );
		return element;
	}
}; 
ERNO.Queue.prototype.redo = function(){

	return this.do();
};




/*



	TWISTS

	Why have twist validation code in multiple places when we can create a
	Twist class here for all?

	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/








ERNO.Twist = function( command, degrees ){

	if( command ) this.set( command, degrees )

}


ERNO.Twist.prototype.set = function( command, degrees ){


	//  What group of Cubelets do we intend to twist?

	var group = {

		X: 'Cube on X',
		L: 'Left face',
		M: 'Middle slice',
		R: 'Right face',

		Y: 'Cube on Y',
		U: 'Up face',
		E: 'Equator slice',
		D: 'Down face',

		Z: 'Cube on Z',
		F: 'Front face',
		S: 'Standing slice',
		B: 'Back face'

	}[ command.toUpperCase() ];


	//  If we've received a valid twist group to operate on
	//  then we can proceed. Otherwise return false!

	if( group !== undefined ){


		//  If our degrees of rotation are negative
		//  then we need to invert the twist direction
		// (ie. change clockwise to anticlockwise)
		//  and take the absolute value of the degrees.
		//  Remember, it's ok to have degrees === undefined
		//  which will peg to the nearest degrees % 90 === 0.

		if( degrees != undefined && degrees < 0 ){

			command = command.invert();
			degrees = degrees.absolute();
		}


		//  Now let's note the absolute direction of the rotation
		//  as both a number and in English.

		var
		vector =  0,
		wise   = 'unwise';

		if( command === command.toUpperCase() ){

			vector =  1;
			wise   = 'clockwise';
		}
		else if( command === command.toLowerCase() ){

			vector = -1;
			wise   = 'anticlockwise';
		}



		//  Finally we're ready to package up all the relevant information
		//  about this particular twist.
		//  The constructor will return it of course.

		this.command 	= command; //  Twist command;
		this.group   	= group;   //  Description in English;
		this.degrees 	= degrees; //  Relative degrees (undefined is ok!);
		this.vector  	= vector;  //  Absolute degree polarity;
		this.wise    	= wise;    //  Absolute clock direction in English;
		this.isShuffle 	= false;
	

		//  Best to leave this as a function rather than a property.
		//  I mean... imagine call this constructor if it tried to call itself!
		//  Infinite loopage mess.

		this.getInverse = function(){

			return new ERNO.Twist( command.invert(), degrees );
		};
	}
	else return false;
}


ERNO.Twist.prototype.equals = function( twist ){

	return ( this.command === twist.command && this.degrees === twist.degrees );

}

ERNO.Twist.prototype.copy = function( twist ){

	this.command 	= twist.command; //  Twist command;
	this.group   	= twist.group;   //  Description in English;
	this.degrees 	= twist.degrees; //  Relative degrees (undefined is ok!);
	this.vector  	= twist.vector;  //  Absolute degree polarity;
	this.wise    	= twist.wise;    //  Absolute clock direction in English;
	this.isShuffle 	= twist.isShuffle;

	return this;

}


ERNO.Twist.validate = function(){

	var 
	elements = Array.prototype.slice.call( arguments ),
	element, i, lookAhead,
	pattern, matches, match, m, head, foot;

	for( i = 0; i < elements.length; i ++ ){

		element = elements[ i ];
		if( i + 1 < elements.length ) lookAhead = elements[ i + 1 ];
		else lookAhead = undefined;


		if( element instanceof ERNO.Twist ){


			//  Example usage: 
			//  cube.twist( new ERNO.Twist( 'U' ))
			//  cube.twist( new ERNO.Twist( 'U', -17 ))
			//  AWESOME. Nothing to do here.
		}
		else if( typeof element === 'string' ){

			if( element.length === 1 ){


				//  Example usage: 
				//  cube.twist( 'U' )
				//  cube.twist( 'U', 45 )

				if( typeof lookAhead === 'number' ){

					 elements[ i ] = new ERNO.Twist( element, lookAhead );
				}
				else elements[ i ] = new ERNO.Twist( element );

			}
			else if( element.length > 1 ){


				//  Example usage: 
				//  cube.twist( 'UdrLf' )
				//  cube.twist( 'Udr10Lf-30b' )
				
				pattern = /(-?\d+|[XLMRYUEDZFSB])/gi;
				matches = element.match( pattern );
				for( m = 0; m < matches.length; m ++ ){

					match = matches[ m ];
					if( _.isNumeric( match )) matches[ m ] = +match;
					else {

						head    = matches.slice( 0, m );
						foot    = matches.slice( m + 1 );
						match   = match.split( '' );
						matches = head.concat( match, foot );
					}
				}
				head = elements.slice( 0, i );
				foot = elements.slice( i + 1 );
				elements = head.concat( matches, foot );
				i --//  Send it through the loop again to avoid duplicating logic.
			}
		}
		else if( element instanceof ERNO.Direction ){


			//  Example usage: 
			//  cube.twist( ERNO.Direction.FRONT )

			elements[ i ] = element.initial;
			i --//  Send it through the loop again to avoid duplicating logic.;
		}
		else if( element instanceof Array ){


			//  Example usage: 
			//  cube.twist([ ? ])

			head = elements.slice( 0, i );
			foot = elements.slice( i + 1 );
			elements = head.concat( element, foot );
			i --//  Send it through the loop again to avoid duplicating logic.;
		}
		else {


			//  Whatever this element is, we don't recognize it.
			//  (Could be a Number that we're discarding on purpose.)

			elements.splice( i, 1 );
			i --//  Send it through the loop again to avoid duplicating logic.;
		}
	}
	return elements;
};




/*


	CUBELETS

	Faces are mapped in a clockwise spiral from Front to Back:


                  Back
                   5
              -----------
            /    Up     /|
           /     1     / |
           -----------  Right
          |           |  2
    Left  |   Front   |  .
     4    |     0     | /
          |           |/
           -----------
               Down
                3

	
	The faces[] Array is mapped to names for convenience:

	  this.faces[ 0 ] === this.front
	  this.faces[ 1 ] === this.up
	  this.faces[ 2 ] === this.right
	  this.faces[ 3 ] === this.down
	  this.faces[ 4 ] === this.left
	  this.faces[ 5 ] === this.back
	
	
	Each Cubelet has an Index which is assigned during Cube creation
	and an Address which changes as the Cubelet changes location.
	Additionally an AddressX, AddressY, and AddressZ are calculated 
	from the Address and represent the Cubelet's location relative
	to the Cube's core with integer values ranging from -1 to +1.
	For an overview of the Cubelet's data from the browser's console:

	  this.inspect()


	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/








ERNO.Cubelet = function( cube, id, colors ){


	THREE.Object3D.call( this );


	//  Our Cube can directly address its Cubelet children,
	//  only fair the Cubelet can address their parent Cube!

	this.cube = cube;
	

	//  Our Cubelet's ID is its unique number on the Cube.
	//  Each Cube has Cubletes numbered 0 through 26.
	//  Even if we're debugging (and not attached to an actual Cube)
	//  we need an ID number for later below
	//  when we derive positions and rotations for the Cubelet faces.

	this.id = id || 0;


	//  Our Cubelet's address is its current location on the Cube.
	//  When the Cubelet is initialized its ID and address are the same.
	//  This method will also set the X, Y, and Z components of the
	//  Cubelet's address on the Cube.

	this.setAddress( this.id );


	//  We're going to build Cubelets that are 140 pixels square.
	//  Yup. This size is hardwired in Cube.
	//  It is also hard-wired into the CSS, but we can't simply
	//  grab the style.getBoundingClientRect() value because 
	//  that's a 2D measurement -- doesn't account for pos and rot.
	
	this.size = cube.cubeletSize || 140;


	//  Now we can find our Cubelet's X, Y, and Z position in space.
	//  We only need this momentarily to create our Object3D so
	//  there's no need to attach these properties to our Cubelet object.

	var epsilon = 0.1,
	x = this.addressX * ( this.size + epsilon ),
	y = this.addressY * ( this.size + epsilon ),
	z = this.addressZ * ( this.size + epsilon );
	
	this.position.set( x, y, z );
	this.matrixSlice = new THREE.Matrix4().makeTranslation( x, y, z );
	this.updateMatrix();
	


	// // Add the cublet to the cube object
	this.cube.object3D.add( this );



	// var domElement = document.createElement( 'div' );
	// domElement.classList.add( 'cubelet' );
	// domElement.classList.add( 'cubeletId-'+ this.id );
	// this.css3DObject = new THREE.CSS3DObject( domElement );

	
	// this.css3DObject.name = 'css3DObject-' + this.id;
	// this.add( this.css3DObject );




	//  We're about to loop through our colors[] Array
	//  to build the six faces of our Cubelet.
	//  Here's our overhead for that:

	var extrovertedFaces = 0;
	if( colors === undefined ) colors = [ W, O,  ,  , G, ];
	this.faces = [];


	//  Now let's map one color per side based on colors[].
	//  Undefined values are allowed (and anticipated).
	//  We need to loop through the colors[] Array "manually"
	//  because Array.forEach() would skip the undefined entries.

	for( var i = 0; i < 6; i ++ ){


		//  Before we create our face's THREE object
		//  we need to know where it should be positioned and rotated.
		// (This is based on our above positions and rotations map.)

		var
		color  = colors[ i ] || ERNO.COLORLESS;
		

		//  Each face is an object and keeps track of its original ID number
		// (which is important because its address will change with each rotation)
		//  its current color, and so on.

		this.faces[ i ] = {};
		this.faces[ i ].id = i;
		this.faces[ i ].color = color;
		

		//  We're going to keep track of what face was what at the moment of initialization,
		//  mostly for solving purposes.
		//  This is particularly useful for Striegel's solver
		//  which requires an UP normal.

		this.faces[ i ].normal = ERNO.Direction.getNameById( i );


	// 	//  FACE CONTAINER.
	// 	//  This face of our Cubelet needs a DOM element for all the
	// 	//  related DOM elements to be attached to.

	// 	var faceElement = document.createElement( 'div' );
	// 	faceElement.classList.add( 'face' );
	// 	faceElement.classList.add( 'face'+ ERNO.Direction.getNameById( i ).capitalize() );
	// 	this.css3DObject.element.appendChild( faceElement );
	// 	this.faces[i].element = faceElement;



	// 	//  WIREFRAME.

	// 	var wireframeElement = document.createElement( 'div' );
	// 	wireframeElement.classList.add( 'wireframe' );
	// 	faceElement.appendChild( wireframeElement );


	// 	//  CUBELET ID.
	// 	//  For debugging we want the ability to display this Cubelet's ID number
	// 	//  with an underline (to make numbers like 6 and 9 legible upside-down).

	// 	var idElement = document.createElement( 'div' );
	// 	idElement.classList.add( 'id' );
	// 	faceElement.appendChild( idElement );
		
	// 	var underlineElement = document.createElement( 'span' );
	// 	underlineElement.classList.add( 'underline' );
	// 	underlineElement.innerText = this.id;
	// 	idElement.appendChild( underlineElement );


		//  INTROVERTED FACES.
		//  If this face has no color sticker then it must be interior to the Cube.
		//  That means in a normal state (no twisting happening) it is entirely hidden.

	this.faces[ i ].isIntrovert = color === ERNO.COLORLESS;

		if( color === ERNO.COLORLESS ){

	// 		faceElement.classList.add( 'faceIntroverted' );

		}


		//  EXTROVERTED FACES.
		//  But if this face does have a color then we need to
		//  create a sticker with that color
		//  and also allow text to be placed on it.

		else {


			//  We're going to use the number of exposed sides
			//  to determine below what 'type' of Cubelet this is:
			//  Core, Center, Edge, or Corner.

			extrovertedFaces ++;


	// 		faceElement.classList.add( 'faceExtroverted' );


	// 		//  STICKER.
	// 		//  You know, the color part that makes the Cube
	// 		//  the most frustrating toy ever.

	// 		var stickerElement = document.createElement( 'div' );
	// 		stickerElement.classList.add( 'sticker' );
	// 		stickerElement.classList.add( color.name );		
	// 		faceElement.appendChild( stickerElement );


	// 		//  TEXT.
	// 		//  One character per face, mostly for our branding.

	// 		var textElement = document.createElement( 'div' );
	// 		textElement.classList.add( 'text' );
	// 		textElement.innerText = i;
	// 		this.faces[ i ].text = textElement;
	// 		faceElement.appendChild( textElement );

		}
	}


	//  Now that we've run through our colors[] Array
	//  and counted the number of extroverted sides
	//  we can determine what 'type' of Cubelet this is.

	this.type = [

		'core',
		'center',
		'edge',
		'corner'

	][ extrovertedFaces ]



	//  Convience accessors for the Cubelet's faces.
	//  What color is the left face? this.left() !!

	this.front  	= this.faces[ 0 ]
		this.up     = this.faces[ 1 ]
		this.right  = this.faces[ 2 ]
		this.down   = this.faces[ 3 ]
		this.left   = this.faces[ 4 ]
		this.back   = this.faces[ 5 ]
		this.colors = 

			( this.faces[ 0 ].color ? this.faces[ 0 ].color.initial : '-' ) +
			( this.faces[ 1 ].color ? this.faces[ 1 ].color.initial : '-' ) +
			( this.faces[ 2 ].color ? this.faces[ 2 ].color.initial : '-' ) +
			( this.faces[ 3 ].color ? this.faces[ 3 ].color.initial : '-' ) +
			( this.faces[ 4 ].color ? this.faces[ 4 ].color.initial : '-' ) +
			( this.faces[ 5 ].color ? this.faces[ 5 ].color.initial : '-' );




	// this.front.element.style.transform =	"rotateX(   0deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )";
	// this.up.element.style.transform = 		"rotateX(  90deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )";
	// this.right.element.style.transform = 	"rotateY(  90deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )";
	// this.down.element.style.transform = 	"rotateX( -90deg ) translateZ( "+faceSpacing+"px ) rotateZ(  90deg )";
	// this.left.element.style.transform = 	"rotateY( -90deg ) translateZ( "+faceSpacing+"px ) rotateZ( -90deg )";
	// this.back.element.style.transform = 	"rotateY( 180deg ) translateZ( "+faceSpacing+"px ) rotateZ( -90deg )";	

	// this.front.element.style.OTransform = this.front.element.style.MozTransform = 	this.front.element.style.WebkitTransform 	= this.front.element.style.transform;
	// this.up.element.style.OTransform 	= this.up.element.style.MozTransform = 		this.up.element.style.WebkitTransform 		= this.up.element.style.transform;
	// this.right.element.style.OTransform = this.right.element.style.MozTransform =	this.right.element.style.WebkitTransform 	= this.right.element.style.transform;
	// this.down.element.style.OTransform 	= this.down.element.style.MozTransform = 	this.down.element.style.WebkitTransform 	= this.down.element.style.transform;
	// this.left.element.style.OTransform 	= this.left.element.style.MozTransform = 	this.left.element.style.WebkitTransform 	= this.left.element.style.transform;
	// this.back.element.style.OTransform 	= this.back.element.style.MozTransform = 	this.back.element.style.WebkitTransform 	= this.back.element.style.transform;


	//  If this happens to be our logo-bearing Cubelet
	//  we had better attach the logo to it!

	this.isStickerCubelet = this.front.color && this.front.color.name === 'white' && this.type === 'center' 



	//  We need to know if we're "engaged" on an axis 
	//  which at first seems indentical to isTweening,
	//  until you consider partial rotations. 

	this.isTweening = true;
	this.isEngagedX = false;
	this.isEngagedY = false;
	this.isEngagedZ = false;


	// //  These will perform their actions, of course,
	// //  but also setup their own boolean toggles.

	// this.show();
	// this.showIntroverts();
	// this.showPlastics();
	// this.showStickers();
	// this.hideIds();
	// this.hideTexts();
	// this.hideWireframes();


	//  During a rotation animation this Cubelet marks itself as 
	//  this.isTweening = true. 
	//  Very useful. Let's try it out.

	this.isTweening = false;


	//  Some fun tweenable properties.

	this.opacity = 1;
	this.radius  = 0;
}






//  Let's add some functionality to Cubelet's prototype
//  By adding to Cubelet's prototype and not the Cubelet constructor
//  we're keeping instances of Cubelet super clean and light.
ERNO.Cubelet.prototype = Object.create( THREE.Object3D.prototype );

ERNO.extend( ERNO.Cubelet.prototype, {


	//  Aside from initialization this function will be called 
	//  by the Cube during remapping.
	//  The raw address is an integer from 0 through 26
	//  mapped to the Cube in the same fashion as this.id.
	//  The X, Y, and Z components each range from -1 through +1
	//  where (0, 0, 0) is the Cube's core.

	setAddress: function( address ){

		this.address  = address || 0
		this.addressX = address.modulo( 3 ).subtract( 1 )
		this.addressY = address.modulo( 9 ).divide( 3 ).roundDown().subtract( 1 ) * -1
		this.addressZ = address.divide( 9 ).roundDown().subtract( 1 ) * -1
	},


	//  Does this Cubelet contain a certain color?
	//  If so, return a String decribing what face that color is on.
	//  Otherwise return false.

	hasColor: function( color ){

		var i, face, faceColorRGB, 
			colorRGB = _.hexToRgb( color.hex );
		
		for( i = 0; i < 6; i ++ ){

			faceColorRGB = _.hexToRgb( this.faces[ i ].color.hex );

			if( faceColorRGB.r === colorRGB.r && faceColorRGB.g === colorRGB.g && faceColorRGB.b === colorRGB.b ){
				
				face = i;
				break
			}
		}
		if( face !== undefined ){

			return [

				'front',
				'up',
				'right',
				'down',
				'left',
				'back'

			][ face ];
		}
		else return false;
	},


	//  Similar to above, but accepts an arbitrary number of colors.
	//  This function implies AND rather than OR, XOR, etc.

	hasColors: function(){

		var 
		cubelet = this,
		result  = true,
		colors  = Array.prototype.slice.call( arguments )
		
		colors.forEach( function( color ){

			result = result && !!cubelet.hasColor( color )
		})
		return result
	},


	getRadius: function(){

		return this.radius
	},
	setRadius: function( radius, onComplete ){


		//  @@
		//  It's a shame that we can't do this whilst tweening
		//  but it's because the current implementation is altering the actual X, Y, Z
		//  rather than the actual radius. Can fix later.

		//  Current may produce unexpected results while shuffling. For example:
		//    cube.corners.setRadius( 90 )
		//  may cause only 4 corners instead of 6 to setRadius()
		//  because one side is probably engaged in a twist tween.

		if( this.isTweening === false ){

			radius = radius || 0
			if( this.radius === undefined ) this.radius = 0
			if( this.radius !== radius ){


				//  Here's some extra cuteness to make the tween's duration
				//  proportional to the distance traveled.

				// var tweenDuration = ( this.radius - radius ).absolute().scale( 0, 100, 0, 1000 )

				this.isTweening = true;

				var tweenDuration = ( this.radius - radius ).absolute(),
					obj = {radius:this.radius};



				new TWEEN.Tween( obj )
				.to( { radius: radius }, tweenDuration )
				.easing( TWEEN.Easing.Quartic.Out )
				.onUpdate( function(){

					this.position.set( this.addressX.multiply( this.size + obj.radius  ) + 0.2, this.addressY.multiply( this.size + obj.radius  ) + 0.2, this.addressZ.multiply( this.size + obj.radius  ) + 0.2 )
					this.updateMatrix();
					this.matrixSlice.copy( this.matrix );

					this.radius = obj.radius;

				}.bind( this ))
				.onComplete( function(){

					this.isTweening = false

					this.position.set( this.addressX.multiply( this.size + obj.radius  ) + 0.2, this.addressY.multiply( this.size + obj.radius  ) + 0.2, this.addressZ.multiply( this.size + obj.radius  ) + 0.2 )
					this.updateMatrix();
					this.matrixSlice.copy( this.matrix );

					this.radius = obj.radius;

					if( onComplete instanceof Function ) onComplete()

				}.bind( this ))
				.start( this.cube.time );

			}
		}
	}
})

/*


	GROUPS

 	ERNO.Groups are collections of an arbitrary number of Cubelets.
	They have no concept of Cubelet location or orientation
	and therefore are not capable of rotation around any axis.

	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/








ERNO.Group = function(){

	this.cubelets = [];

	this.add( Array.prototype.slice.call( arguments ));
}


ERNO.extend( ERNO.Group.prototype, THREE.EventDispatcher.prototype );	

ERNO.extend( ERNO.Group.prototype, {


	add: function(){

		var 
		cubeletsToAdd = Array.prototype.slice.call( arguments ),
		that = this;

		cubeletsToAdd.forEach( function( cubelet ){

			if( cubelet instanceof ERNO.Group ) cubelet = cubelet.cubelets;
			if( cubelet instanceof Array ) that.add.apply( that, cubelet );
			else that.cubelets.push( cubelet );
		});
		return this;
	},
	remove: function( cubeletToRemove ){

		if( cubeletToRemove instanceof ERNO.Group ) cubeletToRemove = cubeletToRemove.cubelets;
		if( cubeletToRemove instanceof Array ){

			var that = this;
			cubeletToRemove.forEach( function( c ){

				that.remove( c );
			});
		}

		var i = this.cubelets.length
		while( i-- > 0 ){

			if( this.cubelets[ i ] === cubeletToRemove )
				this.cubelets.splice( i, 1 );
		}
		return this;
	},




	//  Boolean checker.
	//  Are any Cubelets in this group tweening?
	//  Engaged on the Z axis? Etc.

	isFlagged: function( property ){

		var count = 0;
		this.cubelets.forEach( function( cubelet ){

			count += cubelet[ property ] ? 1 : 0;
		});
		return count;
	},
	isTweening: function(){

		return this.isFlagged( 'isTweening' );
	},
	isEngagedX: function(){

		return this.isFlagged( 'isEngagedX' );
	},
	isEngagedY: function(){

		return this.isFlagged( 'isEngagedY' );
	},
	isEngagedZ: function(){

		return this.isFlagged( 'isEngagedZ' );
	},
	isEngaged: function(){

		return this.isEngagedX() + this.isEngagedY() + this.isEngagedZ();
	},




	//  Search functions.
	//  What Cubelets in this ERNO.Group have a particular color?
	//  How about all of these three colors?
	//  And index? address? Solver uses these a lot.

	hasProperty: function( property, value ){

		var
		results = new ERNO.Group();

		this.cubelets.forEach( function( cubelet ){

			if( cubelet[ property ] === value ) results.add( cubelet );
		});

		return results;
	},
	hasId: function( id ){

		return this.hasProperty( 'id', id );
	},
	hasAddress: function( address ){

		return this.hasProperty( 'address', address );
	},
	hasType: function( type ){

		return this.hasProperty( 'type', type );
	},
	hasColor: function( color ){

		var
		results = new ERNO.Group();

		this.cubelets.forEach( function( cubelet ){

			if( cubelet.hasColor( color )) results.add( cubelet );
		});
		return results;
	},
	hasColors: function(){//  this function implies AND rather than OR, XOR, etc.

		var
		results = new ERNO.Group(),
		colors  = Array.prototype.slice.call( arguments );

		this.cubelets.forEach( function( cubelet ){

			if( cubelet.hasColors.apply( cubelet, colors )) results.add( cubelet );
		});
		return results;
	},


	//  cube.slices.front.isSolved( 'front' )
	//  cube.slices.front.up.isSolved( 'up' )

	isSolved: function( face ){

		if( face ){

			var faceColors = {},
				numberOfColors = 0;

			if( face instanceof ERNO.Direction ) face = face.name;
			this.cubelets.forEach( function( cubelet ){

				var color = cubelet[ face ].color.name;
				if( faceColors[ color ] === undefined ){
					
					faceColors[ color ] = 1;
					numberOfColors ++;
				}
				else faceColors[ color ] ++;
			})
			return numberOfColors === 1 ? true : false;
		}
		else {
		
			console.warn( 'A face [String or ERNO.Controls] argument must be specified when using ERNO.Group.isSolved().' )
			return false
		}
	},




	//  Visual switches.
	//  Take this group and hide all the stickers,
	//  turn on wireframe mode, etc.

	show: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.show() })
		return this
	},
	hide: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.hide() })
		return this
	},
	showPlastics: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.showPlastics() })
		return this
	},
	hidePlastics: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.hidePlastics() })
		return this
	},
	showExtroverts: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.showExtroverts() })
		return this
	},
	hideExtroverts: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.hideExtroverts() })
		return this
	},
	showIntroverts: function( only, soft ){

		this.cubelets.forEach( function( cubelet ){ cubelet.showIntroverts( only, soft ) })
		return this
	},
	hideIntroverts: function( only, soft ){

		this.cubelets.forEach( function( cubelet ){ cubelet.hideIntroverts( only, soft ) })
		return this
	},		
	showStickers: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.showStickers() })
		return this
	},
	hideStickers: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.hideStickers() })
		return this
	},
	showWireframes: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.showWireframes() })
		return this
	},
	hideWireframes: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.hideWireframes() })
		return this
	},
	showIds: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.showIds() })
		return this
	},
	hideIds: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.hideIds() })
		return this
	},
	showTexts: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.showTexts() })
		return this
	},
	hideTexts: function(){

		this.cubelets.forEach( function( cubelet ){ cubelet.hideTexts() })
		return this
	},




	getOpacity: function(){

		var avg = 0

		this.cubelets.forEach( function( cubelet ){ avg += cubelet.getOpacity() })
		return avg / this.cubelets.length
	},
	setOpacity: function( opacity, onComplete ){

		this.cubelets.forEach( function( cubelet ){ cubelet.setOpacity( opacity, onComplete ) })
		return this
	},
	getRadius: function(){

		var avg = 0

		this.cubelets.forEach( function( cubelet ){ avg += cubelet.getRadius() })
		return avg / this.cubelets.length
	},
	setRadius: function( radius, onComplete ){

		this.cubelets.forEach( function( cubelet ){ cubelet.setRadius( radius, onComplete ) })
		return this
	}




})

/*


	SLICES

	Slices are thin layers sliced out of the Cube
	composed of 9 Cubelets (3x3 grid).
	The position of these Cubelets can be mapped as follows:


       ----------- ----------- ----------- 
      |           |           |           |
      | northWest |   north   | northEast |
      |     0     |     1     |     2     |
      |           |           |           |
       ----------- ----------- ----------- 
      |           |           |           |
      |    west   |   origin  |    east   |
      |     3     |     4     |     5     |
      |           |           |           |
       ----------- ----------- ----------- 
      |           |           |           |
      | southWest |   south   | southEast |
      |     6     |     7     |     8     |
      |           |           |           |
       ----------- ----------- ----------- 



	The cubelets[] Array is mapped to names for convenience:

	  0  === this.northWest
	  1  === this.north
	  2  === this.northEast
	  3  === this.west
	  4  === this.origin
	  5  === this.east
	  6  === this.southWest
	  7  === this.south
	  8  === this.southEast	



	Portions of Slices can be Grouped:

	Rows and columns as strips (1x3)
	  this.up
	  this.equator
	  this.down
	  this.left
	  this.middle
	  this.right

	Other combinations
	  this.cross
	  this.edges
	  this.ex
	  this.corners
	  this.ring
	  this.dexter
	  this.sinister



	A Slice may be inspected from the browser's JavaScript console with: 

	  this.inspect() 

	This will reveal the Slice's Cubelets, their Indices, and colors. 
	A compact inspection mode is also available:

	  this.inspect( true )

	This is most useful for Slices that are also Faces. For Slices that are
	not Faces, or for special cases, it may be useful to send a side
	argument which is usually by default the Slice's origin's only visible
	side if it has one. 

	  this.inspect( false, 'up' )
	  this.inspect( true, 'up' )



	CUBE FACES vs CUBE SLICES

	All Cube faces are Slices, but not all Slices are Cube faces. 
	For example, a Cube has 6 faces: front, up, right, down, left, back. 
	But it also has slices that that cut through the center of the Cube 
	itself: equator, middle, and standing. When a Slice maps itself it 
	inspects the faces of the Cubelet in the origin position of the Slice -- 
	the center piece -- which can either have a single visible face or no 
	visible face. If it has a visible face then the Slice's face and the 
	face's direction is in the direction of that Cubelet's visible face. 
	This seems redundant from the Cube's perspective:

	  cube.front.face === 'front'

	However it becomes valuable from inside a Slice or Fold when a 
	relationship to the Cube's orientation is not immediately clear:

	  if( this.face === 'front' )...

	Therefore a Slice (s) is also a face if s.face !== undefined.




*/





ERNO.Slice = function( indices, cube ){


	this.axis = new THREE.Vector3();
	this.invertedAxis = new THREE.Vector3();
	this.matrix = new THREE.Matrix4();
	this.axis.rotation = 0;
	this.indices = indices;
	this.neighbour = null;
	this.ableToHideInternalFaces = true;
	this.cube = cube;

	var self = this;

	this.getCubelet = function( index ){
		return cube.cubelets[ indices[ index ]];
	}


	// var displayInternalFaces = function( value ){
	// 	cubelets
	// }




	//	Once we've performed a physical rotaion of a face or group, we need a way to remap the array of cubelets.
	//	This method does just that. Given a subset of cubelets, an axis to rotate on and
	//	an angle, it will shift the location of all cubelets that need changing.

	this.rotateGroupMappingOnAxis = (function(){

		// 	Here we pre-define a few properties.
		//	We'll reuse the, so it's best to define them up front
		//	to avoid allocating new memeory at runtime

		var absAxis = new THREE.Vector3(),
			max 	= new THREE.Vector3( 1.0, 1.0, 1.0 ),
			point 	= new THREE.Vector3(),
			origin 	= new THREE.Vector3(),
			rotation= new THREE.Matrix4(),
			faceArray;


		return function ( angle ){


			// We can only remap the cube if it's in whole rotation,
			// therefore we should round to the nearest full rotation

			angle = Math.round( angle / ( Math.PI * 0.25 ) ) * Math.PI * 0.25 



			absAxis.copy( max );
			absAxis.sub( this.axis );


			var cubletsCopy = cube.cubelets.slice();
			

			//	Get The rotation as a matrix
			rotation.makeRotationAxis( this.axis, angle * -1 );


			var i = indices.length,
					cubelet;



			while( i-- > 0 ){


				// For every cubelet ...
				cubelet = cube.cubelets[ indices[ i ]];


				//	Get it's position and save it for later ...
				point.set( cubelet.addressX, cubelet.addressY, cubelet.addressZ );
				origin.copy( point );
				

				//	Then rotate it about our axis.
				point.multiply( absAxis )
					 .applyMatrix4( rotation );


				//	Flatten out any floating point rounding errors ...
				point.x = Math.round( point.x );
				point.y = Math.round( point.y );
				point.z = Math.round( point.z );


				//	rotate, and perform a mask-like operation.
				point.add( origin.multiply( this.axis ));
				point.add( max );
				

				//	The cublet array is in a funny order, so invert some of the axes of from our new position
				point.y = 2 - point.y;
				point.z = 2 - point.z;



				//	Use the X,Y,Z to get a 3D index
				var address = point.z * 9 + point.y * 3 + point.x;
				cube.cubelets[cubelet.address] = cubletsCopy[address];


			}



			//  Good to let each Cubelet know where it exists
			for( i = 0; i < cube.cubelets.length; i ++ ){
				cube.cubelets[ i ].setAddress( i )
			}



			// 	Remapping the location of the cubelets is all well and good,
			//	but we also need to reorientate each cubelets face so cubelet.front
			//	is always pointing to the front.


			// Get the slices rotation
			rotation.makeRotationAxis( this.axis, angle );

			// For each cubelet..
			this.cubelets.forEach( function( cubelet ){ 

				faceArray = [];

				//	iterate over it's faces.
				cubelet.faces.forEach( function( face, index ){
						
					//	Get it's normal vector
					point.copy( ERNO.Direction.getDirectionByName( face.normal ).normal );
					
					//	Rotate it
					point.applyMatrix4( rotation );
					// console.log( face.normal, ERNO.Controls.getDirectionByNormal( point ).name );

					// and find the index of the new direction and add it to the new array
					faceArray[ ERNO.Direction.getDirectionByNormal( point ).id ] = face;
					face.normal = ERNO.Direction.getDirectionByNormal( point ).name

				});

				// Remap all the face shortcuts
				cubelet.faces  = faceArray.slice();
				cubelet.front  = cubelet.faces[ 0 ];
				cubelet.up     = cubelet.faces[ 1 ];
				cubelet.right  = cubelet.faces[ 2 ];
				cubelet.down   = cubelet.faces[ 3 ];
				cubelet.left   = cubelet.faces[ 4 ];
				cubelet.back   = cubelet.faces[ 5 ];


			})

		};

	}());


	this.map();



}


//  We want Slice to learn from ERNO.Group
// THREE.extend( ERNO.Slice.prototype, ERNO.Group.prototype );
ERNO.Slice.prototype = Object.create( ERNO.Group.prototype );

ERNO.extend( ERNO.Slice.prototype, {


	get origin(){ 	return this.getCubelet( 4 )},
	get north(){ 	return this.getCubelet( 1 )},
	get northEast(){return this.getCubelet( 2 )},
	get east(){		return this.getCubelet( 5 )},
	get southEast(){return this.getCubelet( 8 )},
	get south(){	return this.getCubelet( 7 )},
	get southWest(){return this.getCubelet( 6 )},
	get west(){		return this.getCubelet( 3 )},
	get northWest(){return this.getCubelet( 0 )},


	get cubelets(){

		var array = [],
			l = this.indices.length;

		while( l-- > 0 ){
			array.push( this.getCubelet( l ))
		}

		return array;

	},


	map: function( indices, cubelets ){


		// this.cubelets = cubelets;
		// this.indices  = indices;



		//  Now that we know what the origin Cubelet is 
		//  we can determine if this is merely a Slice
		//  or if it is also a Face.
		//  If a face we'll know what direction it faces
		//  and what the color of the face *should* be. 

		for( var i = 0; i < 6; i ++ ){

			if( this.origin.faces[ i ].color && this.origin.faces[ i ].color !== ERNO.COLORLESS ){

				this.color = this.origin.faces[ i ].color;
				this.face = ERNO.Direction.getNameById( i )
				break
			}
		}


		// 	We also need to calculate what axis this slice rotates on.
		//	For example, the Right Slice (R) would rotate on the axis pointing to the right represented by the axis ( 1, 0, 0 )
		//	similarly the Equator Slice (E) would rotate on the axis pointing straight up ( 0, 1, 0 )
		
		if( this.axis === undefined || this.axis.lengthSq() === 0 ){

			var pointA = this.northEast.position.clone(),
				pointB = this.southWest.position.clone(),
				pointC = this.northWest.position.clone();

			this.axis = new THREE.Vector3().crossVectors( 

				pointB.sub( pointA ),
				pointC.sub( pointA )

			).normalize();

			this.axis.rotation = 0;

		}



		
		//  Addressing orthagonal strips of Cubelets is more easily done by
		//  cube notation for the X and Y axes.
	
		this.up = new ERNO.Group(

			this.northWest, this.north, this.northEast
		)
		this.equator = new ERNO.Group(

			this.west, this.origin, this.east
		)
		this.down = new ERNO.Group(

			this.southWest, this.south, this.southEast
		)
		this.left = new ERNO.Group(

			this.northWest,
			this.west,
			this.southWest
		)
		this.middle = new ERNO.Group(

			this.north,
			this.origin,
			this.south
		)
		this.right = new ERNO.Group(

			this.northEast,
			this.east,
			this.southEast
		)


		//  If our Slice has only one center piece 
		// (ie. a Cubelet with only ONE single Sticker)
		//  then it is a Face -- a special kind of Slice.

		var hasCenter = this.hasType( 'center' )
		if( hasCenter && hasCenter.cubelets.length === 1 ){

			this.center  = this.hasType( 'center' )//.cubelets[ 0 ]
			this.corners = new ERNO.Group( this.hasType( 'corner' ))
			this.cross   = new ERNO.Group( this.center, this.hasType( 'edge' ))				
			this.ex      = new ERNO.Group( this.center, this.hasType( 'corner' ))
		}


		//  Otherwise our Slice will have multiple center pieces
		// (again, that means Cubelets with only ONE single Sticker)
		//  and this is why a Slice's "origin" is NOT the same as
		//  its "center" or "centers!"

		else {

			this.centers = new ERNO.Group( this.hasType( 'center' ))
		}
		this.edges = new ERNO.Group( this.hasType( 'edge' ))			


		//  I'm still debating whether this should be Sticker-related
		//  or if it's merely a fun grouping. 
		//  Writing the solver should clarify this further...

		this.ring = new ERNO.Group(

			this.northWest, this.north, this.northEast,
			this.west, this.east,
			this.southWest, this.south, this.southEast
		)


		//  And finally for the hell of it let's try diagonals via
		//  Blazon notation:

		this.dexter = new ERNO.Group(//  From top-left to bottom-right.

			this.northWest,
			this.origin,
			this.southEast
		)
		this.sinister = new ERNO.Group(//  From top-right to bottom-left.

			this.northEast,
			this.origin,
			this.southWest
		)

		return this;

	},



	//	Using the rotation we can physically rotate all our cubelets.
	//	This can be used to partially of fully rotate a slice.

	set rotation( radians ){


		if( this.ableToHideInternalFaces && this.cube.isFlagged( 'showingIntroverts' ) !== 0 && this.cube.hideInvisibleFaces ){

			var partialRotation = radians % ( Math.PI * 0.5 ) !== 0;

			this.invertedAxis.copy( this.axis ).negate();

			if( partialRotation  ){
				if( this.neighbour ){

					this.showIntroverts( this.axis, true );
				 	this.neighbour.showIntroverts( this.invertedAxis, true );

				 }else{
				 	this.cube.showIntroverts( this.axis, true );
				 	this.cube.showIntroverts( this.invertedAxis, true );
				 }
			} 
			else{
				if( this.neighbour ){

					this.hideIntroverts( null, true );
				 	this.neighbour.hideIntroverts( null, true );

				 }else{
				 	this.cube.hideIntroverts( null, true );
				 }
			} 
		}


		//	Define a delta rotation matrix from the axis and angle
		this.matrix.makeRotationAxis( this.axis, radians );


		this.axis.rotation = radians;


		//	Iterate over the cubelets and update their relative matrices
		var l = this.indices.length,
			cubelet,
			m1 = new THREE.Matrix4();


		while( l-- ){
			
			cubelet = this.getCubelet( l );

			cubelet.matrix.multiplyMatrices( this.matrix, cubelet.matrixSlice );
			cubelet.position.setFromMatrixPosition( cubelet.matrix );
			cubelet.scale.setFromMatrixScale( cubelet.matrix );
			m1.extractRotation( cubelet.matrix );
			cubelet.quaternion.setFromRotationMatrix( m1 );


		}

	},


	get rotation(){
		return this.axis.rotation;
	},




	//  Given a Cubelet in this Slice,
	//  what is its compass location?

	getLocation: function( cubelet ){

		if( cubelet === this.origin    ) return 'origin';
		if( cubelet === this.north     ) return 'north';
		if( cubelet === this.northEast ) return 'northEast';
		if( cubelet === this.east      ) return 'east';
		if( cubelet === this.southEast ) return 'southEast';
		if( cubelet === this.south     ) return 'south';
		if( cubelet === this.southWest ) return 'southWest';
		if( cubelet === this.west      ) return 'west';
		if( cubelet === this.northWest ) return 'northWest';

		return false;
	},
	

	//  cube.slices.front.isSolved( 'front' )
	//  cube.slices.front.up.isSolved( 'up' )

	isSolved: function( face ){

		if( face ){

			var faceColors = {},
				cubelet, color,
				l = this.indices.length,
				numberOfColors = 0;

			if( face instanceof ERNO.Direction ) face = face.name;

			while( l-- > 0 ){

				cubelet = this.getCubelet( l );
				color = cubelet[ face ].color.name;

				if( faceColors[ color ] === undefined ){
					
					faceColors[ color ] = 1;
					numberOfColors ++;
				}
				else faceColors[ color ] ++;
			}

			return numberOfColors === 1 ? true : false;

		}
		else {
		
			console.warn( 'A face [String or ERNO.Controls] argument must be specified when using ERNO.Group.isSolved().' );
			return false;
		}
	},




})

/*


	FOLDS

	Folds are two adjacent Faces joined together, as if one
	long 6 x 3 strip has been folding down the center and
	three such shapes together wrap the six sides of the Cube.
	Currently this is important for text wrapping. And in the
	future? Who knows. Characters in a String are mapped thus:
	

               LEFT FACE
                                         RIGHT FACE
       -------- -------- -------- 
      |        |        |        |-------- -------- -------- 
      |    0   |    1   |    2   |        |        |        |
      |        |        |        |    3   |    4   |    5   |
       -------- -------- --------         |        |        |
      |        |        |        |-------- -------- -------- 
      |    6   |    7   |    8   |        |        |        |
      |        |        |        |    9   |   10   |   11   |
       -------- -------- --------         |        |        |
      |        |        |        |-------- -------- -------- 
      |   12   |   13   |   14   |        |        |        |
      |        |        |        |   15   |   16   |   17   |
       -------- -------- --------         |        |        |
                                  -------- -------- -------- 

                                 ^
                                 |

                             FOLD LINE


	Currently Folds are only intended to be created and
	heroized after the first Cube mapping. After the Cube
	twists things would get rather weird...


	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/








ERNO.Fold = function( left, right ){

	this.map = [

		left.northWest[ 	left.face  ].text,
		left.north[ 		left.face  ].text,
		left.northEast[ 	left.face  ].text,
		right.northWest[ 	right.face ].text,
		right.north[ 		right.face ].text,
		right.northEast[ 	right.face ].text,

		left.west[ 			left.face  ].text,
		left.origin[ 		left.face  ].text,
		left.east[ 			left.face  ].text,
		right.west[ 		right.face ].text,
		right.origin[ 		right.face ].text,
		right.east[ 		right.face ].text,

		left.southWest[ 	left.face  ].text,
		left.south[      	left.face  ].text,
		left.southEast[  	left.face  ].text,
		right.southWest[ 	right.face ].text,
		right.south[      	right.face ].text,
		right.southEast[ 	right.face ].text
	];
}




ERNO.Fold.prototype.getText = function(){

	var text = '';

	this.map.forEach( function( element ){

		text += element.innerHTML;
	});
	return text;
};
ERNO.Fold.prototype.setText = function( text ){

	var i;

	text = text.justifyLeft( 18 );
	for( i = 0; i < 18; i ++ ){

		this.map[ i ].innerHTML = text.substr( i, 1 );
	}
};




/*


	PROJECTOR

	Converts mouse coordinates into 3D and detects mouse interaction

	--

	@author Mark Lundin - http://www.mark-lundin.com


*/









ERNO.Projector = (function(){
	


	//	The Cube Projector is a specialised class that detects mouse interaction.
	//	It's designed specifically for cubic geometry, in that it makes assumptions
	//  that cannot be applied to other 3D geometry. This makes the performance faster
	//  than other more generalised mouse picking techniques.


	return function( cube, domElement ){


		var api,
			screen,
			viewProjectionMatrix = new THREE.Matrix4(),
			inverseMatrix = new THREE.Matrix4(),
			mouse 	= new THREE.Vector3(),
			end 	= new THREE.Vector3( 1, 1, 1 ),
			normal 	= new THREE.Vector3(),
			ray 	= new THREE.Ray(), 
			box 	= new THREE.Box3(),
			sphere  = new THREE.Sphere(),
			projectionMatrixInverse = new THREE.Matrix4(),
			unitCubeBoundingRadius = mouse.distanceTo( end );



		//	Configure the bounding spehere and Axis Aligned Bounding Box dimensions.
		box.min.set( -cube.size*0.5, -cube.size*0.5, -cube.size*0.5 );
		box.max.set(  cube.size*0.5,  cube.size*0.5,  cube.size*0.5 );
		sphere.radius = unitCubeBoundingRadius * cube.size * 0.5;



		//	Utility function that unprojects 2D normalised screen coordinate to 3D.
		//	Taken from Three.js Projector class	

		function unprojectVector( vector, camera ) {

			projectionMatrixInverse.getInverse( camera.projectionMatrix );
			viewProjectionMatrix.multiplyMatrices( camera.matrixWorld, projectionMatrixInverse );
			return vector.applyProjection( viewProjectionMatrix );

		}


		// Returns the bounding area of the element
		function getBoundingClientRect( element ){
			
			var bounds = element !== document ? element.getBoundingClientRect() : {
				left: 0,
				top: 0,
				width: window.innerWidth,
				height: window.innerHeight
			};

			if( element !== document ){
				var d = element.ownerDocument.documentElement;
		 		bounds.left += window.pageXOffset - d.clientLeft;
		 		bounds.top  += window.pageYOffset - d.clientTop;
		 	}

		 	return bounds;

		}


		/*
		 *	Returns a THREE.Ray instance in cube space!
		 */
		function setRay( camera, mouseX, mouseY ){


			//	Get the bounding area
			screen = getBoundingClientRect( domElement );

			//	Convert screen coords indo normalized device coordinate space
			mouse.x = ( mouseX - screen.left ) / screen.width * 2 - 1;
			mouse.y = ( mouseY - screen.top  ) / screen.height * -2 + 1;
			mouse.z = -1.0;

			// set two vectors with opposing z values
			end.set( mouse.x, mouse.y, 1.0 );


			//	Unproject screen coordinates into 3D
			unprojectVector( mouse, camera );
			unprojectVector( end, camera );


			// find direction from vector to end
			end.sub( mouse ).normalize();


			//	Configure the ray caster
			ray.set( mouse, end );


			//	Apply the world inverse
			inverseMatrix.getInverse( cube.matrixWorld );  
			ray.applyMatrix4( inverseMatrix );


			return ray;


		}


		/*
		 *	Given an intersection point on the surface of the cube,
		 * 	this returns a vector indicating the normal of the face
		 */

		 function getFaceNormalForIntersection ( intersection, optionalTarget ){


			var target = optionalTarget || new THREE.Vector3();

			target.copy( intersection )
				.set( Math.round( target.x ), Math.round( target.y ), Math.round( target.z ))
			  	.multiplyScalar( 2 / cube.size )
			  	.set( target.x|0, target.y|0, target.z|0 );

			return normal;


		}


		/*
		 *	Given a three.js camera instance and a 2D mouse coordinates local to the domElement,
		 * 	this method tests for any intersection against the cube
		 *	and returns a cubelet if one is found, otherwise it returns null indicating no intersection.
		 */


		api = {

			getIntersection: function( camera, mouseX, mouseY, optionalIntersectionTarget, optionalPlaneTarget ){


				var intersection = optionalIntersectionTarget || new THREE.Vector3();


				//	If we haven't detected any mouse movement, then we've not made interacted!

				if( mouseX === null || mouseY === null ) return null;


				//	Shoot the camera ray into 3D

				setRay( camera, mouseX, mouseY );


				//	Check ray casting against the bounding sphere first as it's easier to compute, 
				//	if it passes, then check the Axis Aligned Bounding Box.
				
				if( ray.isIntersectionSphere( sphere ) &&
					ray.intersectBox( box, intersection ) !== null ){

					if( optionalPlaneTarget ){
						getFaceNormalForIntersection( intersection, normal );
						optionalPlaneTarget.setFromNormalAndCoplanarPoint( normal, intersection );		
					}			

					return intersection;

				}

				return null;

			},

			getIntersectionOnPlane: function( camera, mouseX, mouseY, plane, optionalTarget ){

				//	If we haven't detected any mouse movement, then we've not interacted!
				if( mouseX === null || mouseY === null ) return null;


				//	Shoot the camera ray into 3D
				setRay( camera, mouseX, mouseY );


				return ray.intersectPlane( plane, optionalTarget );
					
			},

			// Given 
			getCubeletAtIntersection : (function(){

				var tmp = new THREE.Vector3();

				return function( intersection ){

					//	Translate the world coordinates to a 3D index of the intersected cubelets location.

					tmp.copy( intersection ).add( box.max )
						.multiplyScalar( 3 / cube.size )
						.set( Math.min( tmp.x|0, 2 ), Math.min( 3 - tmp.y|0, 2 ), Math.min( 3 - tmp.z|0, 2 ));
					

					//	Translate the 3D position to an array index
					return cube.cubelets[ tmp.z * 9 + tmp.y * 3 + tmp.x ];


				};

			}())

		};

		return api;
	};


}());
/*


	INTERACTION

	This module handles all the user interactions with the cube.
	It figures out what slice to rotate and in what direction

	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/

ERNO.Interaction = (function(){

	return function( cube, camera, domElement, dragSpeed, multiDrag ){


		

		
		//	A utility class for calculating mouse intersection on a cubic surface
		var projector = new ERNO.Projector( cube, domElement );

		var intersected, points = [],
			intersection = new THREE.Vector3(),
			cubelet, possibleSlices,
			slice, mouseX, mouseY,

			pointOnPlane = new THREE.Vector3(),
			axisDefined = false,
			plane 	= new THREE.Plane(),
			direction = new THREE.Vector3(),
			cross = new THREE.Vector3(),
			current = new THREE.Vector2(),
			basis = new THREE.Vector3(),
			axis  = new THREE.Vector3(),
			angle = 0, time = 0;


		current.x = undefined;
		current.y = undefined;



		// API


		var api = {


			//	A boolean indicating when the user is interacting
			active: false,


			//	A boolean that turns on/off the api
			enabled: true,


			//	A boolean flag that, when enabled, allows the user to drag a slice on it's other axis
			multiDrag : multiDrag || false,


			//	A boolean flag that, when enabled, allows the user to drag a slice on it's other axis
			multiDragSnapArea: 100.0,


			//	This sets the default drag speed.
			dragSpeed : dragSpeed || 1.3

		}

		// Apply event skills to the api
		THREE.EventDispatcher.prototype.apply( api );




		api.getIntersectionAt = (function(){

			var intersection3D = new THREE.Vector3(),
				plane3D = new THREE.Plane();

			return function( x, y ){
				
				if( projector.getIntersection( camera, x, y, intersection3D, plane3D ) === null ) return null;
				
				return {
					cubelet: projector.getCubeletAtIntersection( intersection3D ),
					face: 	plane3D.normal.x ===  1 ? "RIGHT" :
							plane3D.normal.x === -1 ? "LEFT"  :
							plane3D.normal.y ===  1 ? "UP"   :
							plane3D.normal.y === -1 ? "DOWN"  :
							plane3D.normal.z ===  1 ? "FRONT" :
							"BACK"
				}


			}	

		}())


		var projectVector = function(){

			var viewProjectionMatrix = new THREE.Matrix4();

			return function( vector, camera ) {

				camera.matrixWorldInverse.getInverse( camera.matrixWorld );

				viewProjectionMatrix.multiplyMatrices( camera.projectionMatrix, camera.matrixWorldInverse );

				return vector.applyProjection( viewProjectionMatrix );

			}

		}

		//	This function provides a way to 'snap' a vector to it's closest axis.
		//	This is used to find a probable axis of rotation when a user performs a drag

		function snapVectorToBasis( vector ){


			var max = Math.max( Math.abs( vector.x ), Math.abs( vector.y ), Math.abs( vector.z ));

			vector.x = ( vector.x / max )|0;
			vector.y = vector.x === 1 ? 0 : ( vector.y / max )|0;
			vector.z = vector.x === 1 || vector.y === 1 ? 0 : ( vector.z / max )|0; 

			return vector;
		}


		api.update = function (){


			var x = current.x,
				y = current.y


			if( api.enabled && api.active && x !== undefined && y != undefined && ( mouseX !== x || mouseY !== y )) {


				//	As we already know what plane, or face, the interaction began on,
				//	we can then find the point on the plane where the interaction continues.

				projector.getIntersectionOnPlane( camera, x, y, plane, pointOnPlane );


				direction.subVectors( pointOnPlane, intersection );


		    	if( !axisDefined && direction.length() > 5 /*|| ( api.multiDrag && direction.length() < api.multiDragSnapArea ) */ ){


		    		//	If we've already been rotating a slice but we want to change direction, 
		    		//	for example if multiDrag is enabled, then we want to reset the original slice

		    		if( slice ) slice.rotation = 0;


					axisDefined = true;

					//	Once we have a plane, we can figure out what direction the user dragged
					//	and lock into an axis of rotation

					axis.crossVectors( plane.normal, direction );


					//	Of course, it's never a perfect gesture, so we should figure 
					//	out the intended direction by snapping to the nearest axis.

					snapVectorToBasis( axis );


					//	From the axis aligned vector, we can isolate the correct slice
					//	to rotate, by determining the index from the possible slices.
					slice = possibleSlices[ Math.abs( axis.z * 3 + axis.y * 2 + axis.x ) - 1 ];


					// Determine the cross vector, or the direction relative to the axis we're rotating
					cross.crossVectors( slice.axis, plane.normal ).normalize();


				} 

				if( axisDefined ){

					//	By now, we already know what axis to rotate on,
					//	we just need to figure out by how much.

					direction.subVectors( pointOnPlane, intersection );
					var dot = cross.dot( direction );

					angle = dot / cube.size * api.dragSpeed;

				}

				
				if( slice ) slice.rotation = angle;


			}

		}


		function onInteractStart( event ){


			if( event.touches != null ) event.preventDefault()



			if( api.enabled && event.button !== 2 ){


				mouseX = ( event.touches && event.touches[0] || event ).clientX
				mouseY = ( event.touches && event.touches[0] || event ).clientY
				// console.log( mouseX, mouseY );

				//	Here we find out if the mouse is hovering over the cube,
				//	If it is, then `intersection` is populated with the 3D local coordinates of where
				//	the intersection occured. `plane` is also configured to represent the face of the cube
				//	where the intersection occured. This is used later to determine the direction
				//	of the drag.

				//	( Note: although a plane is conceptually similar to a cube's face, the plane is a mathematical representation )


				if( intersected = projector.getIntersection( camera, mouseX, mouseY, intersection, plane ) ){


					//	If a interaction happens within the cube we should prevent the event bubbling.
					

					// event.stopImmediatePropagation();


					if( cube.isTweening() === 0 ){


						time = ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() )


						api.active = true;


						//	Now we know the point of intersection, we can figure out what the associated cubelet is ...

						cubelet = projector.getCubeletAtIntersection( intersection );


						//	... and the possible slices that might be rotated. Remeber, we can only figure out the exact slice once a drag happens.
						possibleSlices 	= [ cube.slices[ cubelet.addressX + 1 ], cube.slices[ cubelet.addressY + 4 ], cube.slices[ cubelet.addressZ + 7 ]];


						//	Add a listener for interaction in the entire document. 
						document.addEventListener( 'mousemove', onInteractUpdate );
						document.addEventListener( 'touchmove', onInteractUpdate );
						

						//	Add a lister to detect the end of interaction, remember this could happen outside the domElement, but still within the document
						document.addEventListener( 'mouseup', onInteractEnd );
						document.addEventListener( 'touchcancel', onInteractEnd );
						document.addEventListener( 'touchend', onInteractEnd );


						//	Whilst interacting we can temporarily remove the listeners detecting the start of interaction
						document.removeEventListener( 'mousedown', onInteractStart );
						document.removeEventListener( 'touchstart', onInteractStart );

					}


				}

			}
			

		}


		function onInteractUpdate( event ){


			if( api.active ){

				current.x = ( event.touches && event.touches[0] || event ).clientX,
				current.y = ( event.touches && event.touches[0] || event ).clientY;
			}

			// Prevent the default system dragging behaviour. ( Things like IOS move the viewport )
			if( api.enabled ){
				
				event.preventDefault();
				event.stopImmediatePropagation();
			}
			

		}

		
		function onInteractEnd( event ){


			var x = ( event.touches && event.touches[0] || event ).clientX,
				y = ( event.touches && event.touches[0] || event ).clientY;


			api.active = false;
		

			//	When a user has finished interating, we need to finish off any rotation.
			//	We basically snap to the nearest face and issue a rotation command

			if( api.enabled && ( x !== mouseY || y !== mouseY ) && axisDefined ){


				// event.stopImmediatePropagation();


				//	Now we can get the direction of rotation and the associated command.

				var command =  slice.name[0].toUpperCase();


				// 	We then find the nearest rotation to snap to and calculate how long the rotation should take
				//	based on the distance between our current rotation and the target rotation


				var targetAngle = Math.round( angle / Math.PI * 0.5 * 4.0 ) * Math.PI * 0.5;

				var velocityOfInteraction =  direction.length() / ( ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() ) - time );
				
				if( velocityOfInteraction > 0.3 ){
					
					targetAngle = Math.floor( angle / Math.PI * 0.5 * 4.0 ) * Math.PI * 0.5
					targetAngle += cross.dot( direction.normalize() ) > 0 ? Math.PI * 0.5: 0;	

				}



				// 	If this is a partial rotation that results in the same configuration of cubelets
				//	then it doesn't really count as a move, and we don't need to add it to the history		

				cube.twist( new ERNO.Twist( command, targetAngle.radiansToDegrees() ));


				// Delete the reference to our slice

				
			}


			time = 0;
			current.x = undefined;
			current.y = undefined;
			axisDefined = false;
			slice = null;

			document.removeEventListener( 'mousemove', onInteractUpdate );
			document.removeEventListener( 'touchmove', onInteractUpdate );


			document.removeEventListener( 'mouseup', onInteractEnd );
			document.removeEventListener( 'touchend', onInteractEnd );
			document.removeEventListener( 'touchcancel', onInteractEnd );


			document.addEventListener( 'mousedown', onInteractStart );
			document.addEventListener( 'touchstart', onInteractStart );

		}

		document.addEventListener( 'mousedown', onInteractStart );
		document.addEventListener( 'touchstart', onInteractStart );


		// CLICK DETECTION 

		var detectInteraction = function ( x, y ){
		
			var intersection = this.getIntersectionAt( x, y );
			if( intersection ){
				this.dispatchEvent( new CustomEvent("click", { detail: intersection  }));
			}
		}.bind( api )


		var ax, ay;
		domElement.addEventListener( 'mousedown', function( event ){

			ax = event.clientX;
			ay = event.clientY;

		});


		domElement.addEventListener( 'mouseup', function( event ){

			var bx = event.clientX,
				by = event.clientY;
				
			if( Math.abs( Math.sqrt(((bx-ax)*(bx-ax))+((by-ay)*(by-ay)))) < 10 * ( window.devicePixelratio || 1 )){

				detectInteraction( ax, ay );
			}
		})


		
		
		domElement.addEventListener( 'touchstart', function( event ){

			event.preventDefault();

			ax = event.touches[0].clientX,
			ay = event.touches[0].clientY;

		});


		domElement.addEventListener( 'touchend', function( event ){

			var bx = event.changedTouches[0].clientX,
				by = event.changedTouches[0].clientY;
				
			if( Math.abs( Math.sqrt(((bx-ax)*(bx-ax))+((by-ay)*(by-ay)))) < 10 * ( window.devicePixelratio || 1 )){

				detectInteraction( ax, ay );
			}
		})


		return api;

	};
	
}());

ERNO.Controls = (function(){

	//Enum of states
	var STATE = { NONE: -1, ROTATE: 0, INERTIA: 1 };


	// Returns the bounding area of the element
	function getBoundingClientRect( element ){

		var bounds = element !== document ? element.getBoundingClientRect() : {
			left: 0,
			top: 0,
			width: window.innerWidth,
			height: window.innerHeight
		};

	 	return bounds;

	}

	return function ( object, camera, domElement ) {

		var state 		 = STATE.NONE,
			direction  	 = new THREE.Vector2,
			mouse	 	 = new THREE.Vector2(),
			mouseEnd	 = new THREE.Vector2(),
			lastPosition = new THREE.Vector2(),
			projector = new ERNO.Projector( object, domElement ),
			api = {
				enabled: true,
				domElement: domElement,
				rotationSpeed: 4.0,
				damping: 0.25
			};


		var getMouseProjectionOnBall = function( x, y, vector ){

			var view = getBoundingClientRect( api.domElement ),
				aspect = view.height / view.width

			var dpr = window.devicePixelRatio || 1
			x *= dpr
			y *= dpr

			return vector.set(
				( x - view.width - view.left ) * 0.001 , // view.width,// * ( devicePixelRatio || 1 ) ,
				( view.height + view.top - y ) * 0.001 // view.height// * aspect // ( devicePixelRatio || 1 )
			);

		};

		api.update = function(){

			var axis = new THREE.Vector3,
				length = 0.0,
				modelViewInverse = new THREE.Matrix4();

			return function updateClosure () {

				if( api.enabled === false || state === STATE.NONE ) return;


			 	//	define an axis to rotate on, this is basically at a tangent to the direction
				axis.set( direction.y, direction.x * -1, 0 ).normalize();


				//	The axis of rotation needs to be in mode view space, otherwise the rotation
				//	will happen in a really strange way. We therefore need to get the local rotation
				//	of the cube and the relative position of the camera and update our axis.

				modelViewInverse.getInverse( object.matrixWorld );
				modelViewInverse.multiply( camera.matrixWorld );
				axis.transformDirection( modelViewInverse );

				// If we're in a INERTIA state, then apply an inertia like effect
				direction.multiplyScalar( 1.0 - Math.max( 0.0, Math.min( 1.0, api.damping )));


				//	Determine how far we've moved. This to determine how much to rotate by
				length = direction.length();

				
				//	Then we can rotate the cube based on how far the drag occured
				object.object3D.rotateOnAxis( axis, -length * api.rotationSpeed );

				


				//	Reset our internal state
				if( state === STATE.ROTATE ) state = STATE.NONE;


				//	If the rotation is below a certain threshold specified as a factor of the damping effect,
				//	then for all purposes, any more rotation is not noticesable, so we can might aswell stop rotating.
				else if( state === STATE.INERTIA && length >= 0.0001 ){

					mouse.add( direction );
				
				} else {
					state = STATE.NONE
				}

			};

		}();

	
		/**
		 *	Define listeners for user initiated events
		 */

		function mousedown( event ) {


			if ( !api.enabled || event.which !== 1 ) return;


			if( projector.getIntersection( camera, event.pageX, event.pageY ) === null ){

			
				state = STATE.ROTATE;


				direction.multiplyScalar( 0 );
				getMouseProjectionOnBall( event.pageX, event.pageY, mouse );
				lastPosition.copy( mouse );


				api.domElement.removeEventListener( 'mousedown', mousedown );
				document.addEventListener( 'mousemove', mousemove );
				document.addEventListener( 'mouseup', mouseup );

			}

		}

		function mousemove( event ) {


			if ( api.enabled ){

				event.preventDefault();

				state = STATE.ROTATE;

				getMouseProjectionOnBall( event.pageX, event.pageY, mouse );

				//	Get the delta between mouse positions
				direction.subVectors( mouse, lastPosition );
				lastPosition.copy( mouse );
			}	


		}

		function mouseup( event ) {

			document.removeEventListener( 'mousemove', mousemove );
			document.removeEventListener( 'mouseup', mouseup );
			api.domElement.addEventListener( 'mousedown', mousedown );


			if ( api.enabled ){

				state = STATE.INERTIA;
			}

		}


		function touchstart( event ) {

			if ( api.enabled && projector.getIntersection( camera, event.touches[ 0 ].pageX, event.touches[ 0 ].pageY ) === null ){

				state = STATE.ROTATE;

				direction.multiplyScalar( 0 );
				getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, mouse );
				lastPosition.copy( mouse );

				api.domElement.removeEventListener( 'touchstart', touchstart );
				document.addEventListener( 'touchend', touchend );
				document.addEventListener( 'touchmove', touchmove );
			}
		}

		function touchmove( event ) {

			if ( api.enabled ){

				// event.preventDefault();

				state = STATE.ROTATE;

				getMouseProjectionOnBall( event.changedTouches[ 0 ].pageX, event.changedTouches[ 0 ].pageY, mouse );

				//	Get the delta between mouse positions
				direction.subVectors( mouse, lastPosition );
				lastPosition.copy( mouse );
			}

		}

		function touchend( event ) {

			document.removeEventListener( 'touchend', touchend );
			document.removeEventListener( 'touchmove', touchmove );
			api.domElement.addEventListener( 'touchstart', touchstart );

			if ( api.enabled ){

				state = STATE.INERTIA;
			}
		}

		

		api.domElement.addEventListener( 'mousedown', mousedown );
		api.domElement.addEventListener( 'touchstart', touchstart );

		return api;
	};

}());



//	This is a basic css renderer that uses a modified version of the three.js CSS3DRenderer.
//	Having the renderer is a seperate file allows us to abstract all the visual components
//	of the cube in a simple, straightforward way.


//	THREE.JS HACK

//	You can actually use a THREE.Object3D as a Scene like object 
//	and render it with the THREE.CSS3DRenderer. For projects with filesize restrictions,
//	this is useful as it allows you to exclude the THREE.Scene and all it's dependancies entirely.
//	The only caveat is that we need to temporarily define/re-define a dummy Scene object


var SceneType = THREE.Scene;
THREE.Scene = SceneType || function(){};


ERNO.renderers = ERNO.renderers || {};
ERNO.renderers.CSS3D = function( cubelets, cube ){
	

	// SCENE + RENDERER

	var renderer = new THREE.CSS3DRenderer(),
		scene = new THREE.Object3D();
	renderer.scene = scene;


	// Add the cube 3D object to the scene

	scene.add( cube.autoRotateObj3D );
	scene.add( cube.camera );




	//	FACE LABELS

	var faceLabel, axis = new THREE.Vector3();
	cube.faces.forEach( function( face, i ){

		faceLabel = cube[face.face].label = new THREE.CSS3DObject( document.createElement( 'div' ) );

		faceLabel.element.classList.add( 'faceLabel' );
		faceLabel.position.copy( face.axis ).multiplyScalar( cube.size );
		faceLabel.position.negate();

		faceLabel.element.innerHTML = face.face.toUpperCase();
		cube.object3D.add( faceLabel );

	})
	
	cube.right.label.rotation.y = Math.PI *  0.5;
	cube.left.label.rotation.y 	= Math.PI * -0.5;
	cube.back.label.rotation.y 	= Math.PI;
	cube.up.label.rotation.x 	= Math.PI * -0.5;
	cube.down.label.rotation.x 	= Math.PI *  0.5;


	function showItem( item ){
		item.style.display = 'block';
	}
	function hideItem( item ){
		item.style.display = 'none';
	}

	function getFaceLabelElements(){
		return Array.prototype.slice.call( renderer.domElement.querySelectorAll( '.faceLabel' ));
	}


	cube.showFaceLabels = function(){

		getFaceLabelElements().forEach( showItem );
		this.showingFaceLabels = true;

		return this;

	}


	cube.hideFaceLabels = function(){

		getFaceLabelElements().forEach( hideItem );
		this.showingFaceLabels = false;

		return this;
	}




	//	CSS CUBELETS
	//	Each ERNO.Cubelet is an abstract representation of a cubelet,
	//	it has some useful information like a list of faces, but it doesn't have any visual component.
	// 	Here we take the abstract cubelet and create something you can see.

	//	First we add some functionality to the ERNO.Cubelet specific to css,
	//	things like setOpacity, and showStickers directly affects css styles.

	ERNO.extend( ERNO.Cubelet.prototype, ERNO.renderers.CSS3DCubelet.methods ); 


	// 	Then we use the CSS3DCubelet function to create all the dom elements.

	cubelets.forEach( ERNO.renderers.CSS3DCubelet );

	


	// RENDER LOOP

	function render(){

		if( cube.domElement.parentNode ){

			var parentWidth = cube.domElement.parentNode.clientWidth,
				parentHeight = cube.domElement.parentNode.clientHeight;
			
			if( cube.domElement.parentNode &&
			  ( cube.domElement.clientWidth  !== parentWidth ||
				cube.domElement.clientHeight !== parentHeight )){
				
					cube.setSize( parentWidth, parentHeight );

			}

			renderer.render( scene, cube.camera );
		}

		requestAnimationFrame( render );

	}


	requestAnimationFrame( render );


	// We'll need to set the scene object back to it's original type
	if( SceneType ) THREE.Scene = SceneType;



	// All renderers must return an object containing a domElement and an setSize method,
	// in most instances this is the renderer object itself.

	return renderer;


}
	



ERNO.renderers.CSS3DCubelet = (function(){


	return function( cubelet ){


		var domElement = document.createElement( 'div' );
		domElement.classList.add( 'cubelet' );
		domElement.classList.add( 'cubeletId-'+ cubelet.id );
		cubelet.css3DObject = new THREE.CSS3DObject( domElement );

		
		cubelet.css3DObject.name = 'css3DObject-' + cubelet.id;
		cubelet.add( cubelet.css3DObject );


		var faceSpacing = ( cubelet.size / 2 );

		var transformMap = [

			"rotateX(   0deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )",
			"rotateX(  90deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )",
			"rotateY(  90deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )",
			"rotateX( -90deg ) translateZ( "+faceSpacing+"px ) rotateZ(  90deg )",
			"rotateY( -90deg ) translateZ( "+faceSpacing+"px ) rotateZ( -90deg )",
			"rotateY( 180deg ) translateZ( "+faceSpacing+"px ) rotateZ( -90deg )",	

		]

		var axisMap = [
			'axisZ',
			'axisY',
			'axisX',
			'axisY',
			'axisX',
			'axisZ',
		]



		//	CUBELET FACES

		//  We're about to loop through our 6 faces
		//  and create visual dom elements for each
		//  Here's our overhead for that:

		cubelet.faces.forEach( function( face ) {


			//  FACE CONTAINER.
			//  This face of our Cubelet needs a DOM element for all the
			//  related DOM elements to be attached to.

			face.element = document.createElement( 'div' );
			face.element.classList.add( 'face' );
			face.element.classList.add( axisMap[ face.id ]);
			face.element.classList.add( 'face'+ ERNO.Direction.getNameById( face.id ).capitalize() );
			cubelet.css3DObject.element.appendChild( face.element );


			//  WIREFRAME.

			var wireframeElement = document.createElement( 'div' );
			wireframeElement.classList.add( 'wireframe' );
			face.element.appendChild( wireframeElement );



			//  CUBELET ID.
			//  For debugging we want the ability to display this Cubelet's ID number
			//  with an underline (to make numbers like 6 and 9 legible upside-down).

			var idElement = document.createElement( 'div' );
			idElement.classList.add( 'id' );
			face.element.appendChild( idElement );
			
			var underlineElement = document.createElement( 'span' );
			underlineElement.classList.add( 'underline' );
			underlineElement.innerText = cubelet.id;
			idElement.appendChild( underlineElement );



			// Each face has a different orientation represented by a CSS 3D transform.
			// Here we select and apply the correct one.

			var cssTransform = transformMap[ face.id ],
				style = face.element.style;

			style.OTransform = style.MozTransform = style.WebkitTransform = style.transform = cssTransform;



			//  INTROVERTED FACES.
			//  If this face has no color sticker then it must be interior to the Cube.
			//  That means in a normal state (no twisting happening) it is entirely hidden.

			if( face.isIntrovert ){

				face.element.classList.add( 'faceIntroverted' );
				face.element.appendChild( document.createElement( 'div' ));

			}


			//  EXTROVERTED FACES.
			//  But if this face does have a color then we need to
			//  create a sticker with that color
			//  and also allow text to be placed on it.

			else {


				face.element.classList.add( 'faceExtroverted' );



				//  STICKER.
				//  You know, the color part that makes the Cube
				//  the most frustrating toy ever.

				var stickerElement = document.createElement( 'div' );
				stickerElement.classList.add( 'sticker' );
				stickerElement.classList.add( face.color.name );		
				face.element.appendChild( stickerElement );



				//  If this happens to be our logo-bearing Cubelet
				//  we had better attach the logo to it!

				if( cubelet.isStickerCubelet ){

					stickerElement.classList.add( 'stickerLogo' )
				}



				//  TEXT.
				//  One character per face, mostly for our branding.

				var textElement = document.createElement( 'div' );
				textElement.classList.add( 'text' );
				textElement.innerText = face.id;
				face.text = textElement;
				face.element.appendChild( textElement );

			}

		})




		//  These will perform their actions, of course,
		//  but also setup their own boolean toggles.

		cubelet.show();
		cubelet.showIntroverts();
		cubelet.showPlastics();
		cubelet.showStickers();
		cubelet.hideIds();
		cubelet.hideTexts();
		cubelet.hideWireframes();

	}

}());


// 	The method object contains functionality specific to the CSS3D renderer that we add 
//	to the ERNO.Cubelet prototype

ERNO.renderers.CSS3DCubelet.methods = (function(){


	function showItem( item ){
		item.style.display = 'block';
	}

	function hideItem( item ){	
		item.style.display = 'none';
	} 


	return {

		//  Visual switches.
		getFaceElements: function ( selector ){

			var selectorString = selector || '';
			return Array.prototype.slice.call( this.css3DObject.element.querySelectorAll( '.face' + selectorString ));		

		},

		show: function(){

			showItem( this.css3DObject.element );
			this.showing = true
		},
		hide: function(){

			hideItem( this.css3DObject.element );
			this.showing = false
		},
		showExtroverts: function(){

			this.getFaceElements( '.faceExtroverted' ).forEach( showItem );
			this.showingExtroverts = true;
		},
		hideExtroverts: function(){

			this.getFaceElements( '.faceExtroverted' ).forEach( hideItem );
			this.showingExtroverts = false;
		},
		showIntroverts: function(){

			var axis = new THREE.Vector3(),
				inv = new THREE.Matrix4(),
				only;

			return function( onlyAxis, soft ){

				only = '';

				if( onlyAxis ){
					inv.getInverse( this.matrix );
					axis.copy( onlyAxis ).transformDirection( inv );
					only = ( Math.abs( Math.round( axis.x )) === 1 ) ? '.axisX' : ( Math.round( Math.abs( axis.y )) === 1 ) ? '.axisY' : '.axisZ';
				}

				this.getFaceElements( '.faceIntroverted' + ( onlyAxis !== undefined ? only : "" )).forEach( showItem );
				if( !soft ) this.showingIntroverts = true;

			}
		}(),
		hideIntroverts: function(){

			var axis = new THREE.Vector3(),
				inv = new THREE.Matrix4(),
				only;

			return function( onlyAxis, soft ){

				only = '';

				if( onlyAxis ){
					inv.getInverse( this.matrix );
					axis.copy( onlyAxis ).transformDirection( inv );
					only = ( Math.abs( Math.round( axis.x )) === 1 ) ? '.axisX' : ( Math.round( Math.abs( axis.y )) === 1 ) ? '.axisY' : '.axisZ';
				}

				this.getFaceElements( '.faceIntroverted' + ( onlyAxis !== undefined ? only : "" )).forEach( hideItem );
				if( !soft ) this.showingIntroverts = false;

			}
		}(),

		showPlastics: function(){

			this.getFaceElements().forEach( function( item ){
				item.classList.remove( 'faceTransparent' );
			});
			this.showingPlastics = true;
		},
		hidePlastics: function(){

			this.getFaceElements( ).forEach( function( item ){
				item.classList.add( 'faceTransparent' );
			});
			this.showingPlastics = false;
		},
		hideStickers: function(){

			this.getFaceElements( ' .sticker' ).forEach( hideItem );
			this.showingStickers = false;
		},
		showStickers: function(){

			this.getFaceElements( ' .sticker' ).forEach( showItem );
			this.showingStickers = true;
		},
		showWireframes: function(){

			this.getFaceElements( ' .wireframe' ).forEach( showItem );
			this.showingWireframes = true;
		},
		hideWireframes: function(){

			this.getFaceElements( ' .wireframe' ).forEach( hideItem );
			this.showingWireframes = false;
		},
		showIds: function(){

			this.getFaceElements( ' .id' ).forEach( showItem );
			this.showingIds = true;
		},
		hideIds: function(){

			this.getFaceElements( ' .id' ).forEach( hideItem );
			this.showingIds = false;
		},
		showTexts: function(){

			this.getFaceElements( ' .text' ).forEach( showItem );
			this.showingTexts = true;
		},
		hideTexts: function(){

			this.getFaceElements( ' .text' ).forEach( hideItem );
			this.showingTexts = false;
		},
		getOpacity: function(){

			return this.opacity
		},
		setOpacity: function( opacityTarget, onComplete ){

			if( this.opacityTween ) this.opacityTween.stop()
			if( opacityTarget === undefined ) opacityTarget = 1
			if( opacityTarget !== this.opacity ){

				var 
				that = this,
				tweenDuration = ( opacityTarget - this.opacity ).absolute().scale( 0, 1, 0, 1000 * 0.2 )

				this.opacityTween = new TWEEN.Tween({ opacity: this.opacity })
				.to({

					opacity: opacityTarget
				
				}, tweenDuration )
				.easing( TWEEN.Easing.Quadratic.InOut )
				.onUpdate( function(){

					that.css3DObject.element.style.opacity =  this.opacity;
					that.opacity = this.opacity//opacityTarget
				})
				.onComplete( function(){

					if( onComplete instanceof Function ) onComplete()
				})
				.start()

			}
		},
		getStickersOpacity: function( value ){

			return parseFloat( this.getFaceElements( ' .sticker' )[0].style.opacity );
		},
		setStickersOpacity: function( value ){

			if( value === undefined ) value = 0.2;
			var valueStr = value;
			this.getFaceElements( ' .sticker' ).forEach( function( sticker ){
				sticker.style.opacity = valueStr.toString();
			});
		}
		
	}

}())

/*


	CUBES

	A Cube is composed of 27 Cubelets (3x3x3 grid) numbered 0 through 26.
	Cubelets are numbered beginning from the top-left-forward corner of the
	Cube and proceeding left to right, top to bottom, forward to back:


             -----------------------
           /   18      19      20  /|
          /                       / |
         /   9      10       11  / 20
        /                       /   |
       /   0       1       2   / 11 |
       -----------------------     23
      |                       |2    |
      |   0       1       2   |  14 |
      |                       |    26
      |                       |5    |
      |   3       4       5   |  17 /
      |                       |    /
      |                       |8  /
      |   6       7       8   |  /
      |                       | /
       -----------------------



	Portions of the Cube are grouped (Groups):

	  this.core
	  this.centers
	  this.edges
	  this.corners
	  this.crosses



	Portions of the Cube are grouped and rotatable (Slices):

	Rotatable around the Z axis:
	  this.front
	  this.standing
	  this.back

	Rotatable around the X axis:
	  this.left
	  this.middle
	  this.right

	Rotatable around the Y axis:
	  this.up
	  this.equator
	  this.down



	A Cube may be inspected through its Faces (see Slices for more
	information on Faces vs Slices). From the browser's JavaScript console:

	  this.inspect()

	This will reveal each Face's Cubelet indexes and colors using the Face's
	compact inspection mode. The non-compact mode may be accessed by passing
	a non-false value as an argument:

	  this.inspect( true )


	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/



ERNO.Cube = function( parameters ){


	ERNO.Group.call( this );


	// Constructor parameters

	parameters = parameters || {};


	this.paused     				= parameters.paused === undefined ? false : parameters.paused;
	this.autoRotate  				= parameters.autoRotate === undefined ? false : parameters.autoRotate;
	this.keyboardControlsEnabled	= parameters.keyboardControlsEnabled === undefined ? true : parameters.keyboardControlsEnabled;
	this.mouseControlsEnabled  		= parameters.mouseControlsEnabled === undefined ? true : parameters.mouseControlsEnabled;

	var renderFactory 				= parameters.renderer || ERNO.renderers.CSS3D;


	//  Some important booleans.

	//	The textureSize sets the physical size of the cublets in pixels.
	//	This is useful for rendering purposes as browsers don't downsample textures very well, nor is upsamlping
	//	pretty either. In general, it's best to set the texture size to roughly the same size they'll appear on screen.
	parameters.textureSize 			= parameters.textureSize === undefined ? 120 : parameters.textureSize;


	this.isShuffling 	= false;
	this.isReady     	= true;
	this.isSolving   	= false;
	this.undoing 		= false;
	this.render 		= true;
	this.finalShuffle 	= null;
	this.hideInvisibleFaces = parameters.hideInvisibleFaces === undefined ? false : parameters.hideInvisibleFaces;




	//	The amount of time we've been running
	this.time = 0;


	// 	We'll keep an record of the number of moves we've made
	// 	Useful for keeping scores.
	this.moveCounter = 0;


	//  Every fire of this.loop() will attempt to complete our tasks
	//  which can only be run if this.isReady === true.

	this.taskQueue = new ERNO.Queue();


	//  We need the ability to gang up twist commands.
	//  Every fire of this.loop() will attempt to empty it.

	this.twistQueue = new ERNO.Queue( ERNO.Twist.validate );


	//	Although we have a queue containing all our twists
	//	we also need a way to collect any undo requests into a similar queue

	this.historyQueue = new ERNO.Queue( ERNO.Twist.validate );


	//  How long should a Cube.twist() take?

	this.twistDuration = parameters.twistDuration !== undefined ? parameters.twistDuration : 500;


	//  If we shuffle, how shall we do it?

	this.shuffleMethod = this.PRESERVE_LOGO;


	//  Size matters? Cubelets will attempt to read these values.
	this.size = parameters.textureSize * 3;
	this.cubeletSize = this.size / 3;



	//	To display our cube, we'll need some 3D specific attributes, like a camera

	var
	FIELD_OF_VIEW = 35,
	WIDTH         = window.innerWidth,
	HEIGHT        = window.innerHeight,
	ASPECT_RATIO  = WIDTH / HEIGHT,
	NEAR          = 1,
	FAR           = 6000;

	this.camera = new THREE.PerspectiveCamera( FIELD_OF_VIEW, ASPECT_RATIO, NEAR, FAR );
	this.camera.position.z = this.size * 4;



	//	To do all the things normaly associated with a 3D object
	//	we'll need to borrow a few properties from Three.js.
	//	Things like position rotation and orientation.

	this.object3D = new THREE.Object3D();
	this.autoRotateObj3D = new THREE.Object3D();
	this.rotation 	= this.object3D.rotation;
	this.quaternion = this.object3D.quaternion;
	this.position 	= this.object3D.position;
	this.matrix 	= this.object3D.matrix;
	this.matrixWorld= this.object3D.matrixWorld;


	this.rotation.set(

		25  * Math.PI / 180,
		-30 * Math.PI / 180,
		0
	);



	//  If we enable Auto-Rotate then the cube will spin (not twist!) in space
	//  by adding the following values to the Three object on each frame.

	this.rotationDelta = new THREE.Euler( 0.1 * Math.PI / 180, 0.15 * Math.PI / 180, 0 );




	//  Here's the first big map we've come across in the program so far.
	//  Imagine you're looking at the Cube straight on so you only see the front face.
	//  We're going to map that front face from left to right (3), and top to bottom (3):
	//  that's 3 x 3 = 9 Cubelets.
	//  But then behind the Front slice we also have a Standing slice (9) and Back slice (9),
	//  so that's going to be 27 Cubelets in total to create a Cube.

	this.cubelets = [];
	([

		//  Front slice

		[ W, O,  ,  , G,   ],    [ W, O,  ,  ,  ,   ],    [ W, O, B,  ,  ,   ],//   0,  1,  2
		[ W,  ,  ,  , G,   ],    [ W,  ,  ,  ,  ,   ],    [ W,  , B,  ,  ,   ],//   3,  4,  5
		[ W,  ,  , R, G,   ],    [ W,  ,  , R,  ,   ],    [ W,  , B, R,  ,   ],//   6,  7,  8


		//  Standing slice

		[  , O,  ,  , G,   ],    [  , O,  ,  ,  ,   ],    [  , O, B,  ,  ,   ],//   9, 10, 11
		[  ,  ,  ,  , G,   ],    [  ,  ,  ,  ,  ,   ],    [  ,  , B,  ,  ,   ],//  12, XX, 14
		[  ,  ,  , R, G,   ],    [  ,  ,  , R,  ,   ],    [  ,  , B, R,  ,   ],//  15, 16, 17


		//  Back slice

		[  , O,  ,  , G, Y ],    [  , O,  ,  ,  , Y ],    [  , O, B,  ,  , Y ],//  18, 19, 20
		[  ,  ,  ,  , G, Y ],    [  ,  ,  ,  ,  , Y ],    [  ,  , B,  ,  , Y ],//  21, 22, 23
		[  ,  ,  , R, G, Y ],    [  ,  ,  , R,  , Y ],    [  ,  , B, R,  , Y ] //  24, 25, 26

	]).forEach( function( cubeletColorMap, cubeletId ){

		this.cubelets.push( new ERNO.Cubelet( this, cubeletId, cubeletColorMap ));

	}.bind( this ));







	//  Mapping the Cube creates all the convenience shortcuts
	//  that we will need later. (Demonstrated immediately below!)

	//  A Rubik's Cube is composed of 27 cubelets arranged 3 x 3 x 3.
	//  We need a map that relates these 27 locations to the 27 cubelets
	//  such that we can ask questions like:
	//  What colors are on the Front face of the cube? Etc.


	var i;


	//  Groups are simple collections of Cubelets.
	//  Their position and rotation is irrelevant.

	this.core    = new ERNO.Group();
	this.centers = new ERNO.Group();
	this.edges   = new ERNO.Group();
	this.corners = new ERNO.Group();
	this.crosses = new ERNO.Group();
	this.cubelets.forEach( function( cubelet, index ){

		if( cubelet.type === 'core'   ) this.core.add( cubelet );
		if( cubelet.type === 'center' ) this.centers.add( cubelet );
		if( cubelet.type === 'edge'   ) this.edges.add( cubelet );
		if( cubelet.type === 'corner' ) this.corners.add( cubelet );
		if( cubelet.type === 'center' || cubelet.type === 'edge' ) this.crosses.add( cubelet );

	}.bind( this ));



	//	Now we'll create some slices. A slice represents a 3x3 grid of cubelets.
	//	Slices are Groups with purpose; they are rotate-able!

	//  Slices that can rotate about the X-axis:

	this.left = new ERNO.Slice(

		[ 24, 21, 18,
		  15, 12,  9,
		   6,  3,  0], this

	)
	this.left.name = 'left';
	this.middle = new ERNO.Slice(

		[ 25, 22, 19,
		  16, 13, 10,
		   7,  4,  1], this

	)
	this.middle.name = 'middle';
	this.right = new ERNO.Slice(

		[  2, 11, 20,
		   5, 14, 23,
		   8, 17, 26], this

	)
	this.right.name = 'right';
	this.right.neighbour = this.middle;
	this.left.neighbour = this.middle;


	//  Slices that can rotate about the Y-axis:

	this.up = new ERNO.Slice(

		[ 18, 19, 20,
		   9, 10, 11,
		   0,  1,  2], this

	)
	this.up.name = 'up';
	this.equator = new ERNO.Slice(

		[ 21, 22, 23,
		  12, 13, 14,
		   3,  4,  5], this

	)
	this.equator.name = 'equator';
	this.down = new ERNO.Slice(

		[ 8, 17, 26,
		  7, 16, 25,
		  6, 15, 24], this

	)
	this.down.name = 'down';
	this.down.neighbour = this.equator;
	this.up.neighbour = this.equator;

	//  These are Slices that can rotate about the Z-axis:
	this.front = new ERNO.Slice(

		[  0,  1,  2,
		   3,  4,  5,
		   6,  7,  8], this

	)
	this.front.name = 'front';
	this.standing = new ERNO.Slice(

		[  9, 10, 11,
		  12, 13, 14,
		  15, 16, 17], this

	)
	this.standing.name = 'standing';
	this.back = new ERNO.Slice(

		[ 26, 23, 20,
		  25, 22, 19,
		  24, 21, 18], this

	)
	this.back.name = 'back';
	this.back.neighbour = this.standing;
	this.front.neighbour = this.standing;


	//  Faces .... special kind of Slice!

	this.faces = [ this.front, this.up, this.right, this.down, this.left, this.back ];


	this.slices = [ this.left, this.middle, this.right, this.down, this.equator, this.up, this.back, this.standing, this.front ];



	// 	We also probably want a handle on any update events that occur, for example, when a slice is rotated
	var onSliceRotated = function( evt ){
		this.dispatchEvent( new CustomEvent( 'onTwistComplete', {detail: { slice : evt.target }}));
	}.bind( this );

	this.slices.forEach( function( slice ){
		slice.addEventListener( 'change', onSliceRotated );
	});




	// Dictionary to lookup slice
	var allIndices = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 ];
	this.slicesDictionary = {
		'f': this.front,
		's': this.standing,
		'b': this.back,

		'u': this.up,
		'e': this.equator,
		'd': this.down,

		'r': this.right,
		'm': this.middle,
		'l': this.left,

		//	Here we defined some arbitrary groups.
		//	Technically they're not really slices in the usual sense,
		//	there are however a few things about slices that we need,
		//	like the ability to rotate about an axis, therefore for all
		//	intents and purposes, we'll call them a slice

		'x': new ERNO.Slice( allIndices, this ),
		'y': new ERNO.Slice( allIndices, this ),
		'z': new ERNO.Slice( allIndices, this )
	}



	// Internally we have the ability to hide any invisible faces,
	// When a slice is rotated we determine what faces should be visible
	// so the cube doesn't look broken. This happend every time a slice is rotated.
	// Rotating Certain slices, such as the group slices never show internal faces.

	this.slicesDictionary.x.ableToHideInternalFaces = false;
	this.slicesDictionary.y.ableToHideInternalFaces = false;
	this.slicesDictionary.z.ableToHideInternalFaces = false;




	//	For the x,y and z groups we've defined above,
	//	we'll need to manually set an axis since once can't be automatically computed

	this.slicesDictionary.x.axis.set( -1, 0, 0 );
	this.slicesDictionary.y.axis.set( 0, -1, 0 );
	this.slicesDictionary.z.axis.set( 0, 0, -1 );



	//  Good to let each Cubelet know where it exists

	this.cubelets.forEach( function( cubelet, i ){
		cubelet.setAddress( i );
	});



	// 	RENDERER
	//	Create a renderer object from the renderer factory.
	// 	The renderFactory is a function that creates a renderer object

	this.renderer = renderFactory( this.cubelets, this );
	this.domElement = this.renderer.domElement;
	this.domElement.classList.add( 'cube' );
	this.domElement.style.fontSize = this.cubeletSize + 'px';

	this.autoRotateObj3D.add( this.object3D );


	if( this.hideInvisibleFaces ) this.hideIntroverts( null, true );


	//	The Interaction class provides all the nifty mouse picking stuff.
	//	It's responsible for figuring out what cube slice is supposed to rotate
	//	and in what direction.

	this.mouseInteraction = new ERNO.Interaction( this, this.camera, this.domElement );


	this.mouseInteraction.addEventListener( 'click', function( evt ){

		this.dispatchEvent( new CustomEvent("click", { detail: evt.detail  }));

	}.bind( this ));


	//	set up interactive controls
	//	The Controls class rotates the entire cube around using an arcball implementation.
	//	You could override this with a different style of control

	this.controls = new ( parameters.controls || ERNO.Controls )( this, this.camera, this.domElement );




	//  We need to map our folds separately from Cube.map()
	//  because we only want folds mapped at creation time.
	//  Remapping folds with each Cube.twist() would get weird...

	this.folds = [
		new ERNO.Fold( this.front, this.right ),
		new ERNO.Fold( this.left,  this.up    ),
		new ERNO.Fold( this.down,  this.back  )
	];



	//  Enable some "Hero" text for this Cube.

	// this.setText( 'BEYONDRUBIKs  CUBE', 0 );
	// this.setText( 'BEYONDRUBIKs  CUBE', 1 );
	// this.setText( 'BEYONDRUBIKs  CUBE', 2 );



	// 	Define a default size for our cube, this will be resized to 100%
	//	of it's containing dom element during the render.
	this.setSize( 400, 200 );




	//  Get ready for major loop-age.
	//  Our Cube checks these booleans at 60fps.

	this.loop = this.loop.bind( this );
	requestAnimationFrame( this.loop );



	//	The cube needs to respond to user interaction and react accordingly.
	//	We'll set up a few event below to listen for specific commands,

	//  Enable key commands for our Cube.

	document.addEventListener( 'keypress', function( event ){
		if( event.target.tagName.toLowerCase() !== 'input' &&
			event.target.tagName.toLowerCase() !== 'textarea' &&
			!this.mouseInteraction.active &&
			this.keyboardControlsEnabled ){

				var key = String.fromCharCode( event.which );
				if( 'XxRrMmLlYyUuEeDdZzFfSsBb'.indexOf( key ) >= 0 ) this.twist( key );

		}
	}.bind( this ));




}




ERNO.Cube.prototype = Object.create( ERNO.Group.prototype );
ERNO.Cube.prototype.constructor = ERNO.Cube;
ERNO.extend( ERNO.Cube.prototype, {


	shuffle: function( amount, sequence ){


		//	How many times should we shuffle?
		amount = amount || 30;
		//	Optional sequence of moves to execute instead of picking
                //	random moves from this.shuffleMethod.
		sequence = sequence || '';


		var moves = this.shuffleMethod.slice(),
			move, inverseOfLastMove = new ERNO.Twist(), allowedMoves,
			sequenceLength = sequence.length, sequenceIndex = 0;


		//	We're shuffling the cube so we should clear any history
		this.twistQueue.empty( true );
		this.historyQueue.empty( true )


		//	Create some random rotations based on our shuffle method
		while( amount-- > 0 ){
			if (sequence){
				move.set(sequence[sequenceIndex]);
				sequenceIndex = (sequenceIndex + 1) % sequenceLength;
			} else {

				// Create a copy of all possible moves
				allowedMoves = moves.split('');
				move = new ERNO.Twist().copy( inverseOfLastMove );

				//	We don't want to chose a move that reverses the last shuffle, it just looks odd,
				//	so we should only select a move if it's a new one.

				while( move.equals( inverseOfLastMove )){

					move.set( allowedMoves.splice( Math.floor( Math.random() * allowedMoves.length  ), 1 )[0] );

				}
			}


			//	If we flag this move as a shuffle, then we can remove it from the history
			//	once we've executed it.
			move.isShuffle = true;


			//	execute the shuffle
			this.twist( move );


			//	Store a reference to the reverse of the move ( a twist that undoes the shuffle )
			inverseOfLastMove = move.getInverse();

		}


		//	By stashing the last move in our shuffle sequence, we can
		// 	later check if the shuffling is complete
		this.finalShuffle = move;


	},


	solve: function(){

		this.isSolving = true;
	},


	isSolved: function(){

		return (

			this.front.isSolved( ERNO.Direction.FRONT ) &&
			this.up.isSolved(    ERNO.Direction.UP    ) &&
			this.right.isSolved( ERNO.Direction.RIGHT ) &&
			this.down.isSolved(  ERNO.Direction.DOWN  ) &&
			this.left.isSolved(  ERNO.Direction.LEFT  ) &&
			this.back.isSolved(  ERNO.Direction.BACK  )
		)

	},


	undo: function(){

		if( this.twistQueue.history.length > 0 ){

			this.historyQueue.add( this.twistQueue.undo().getInverse() );
			this.undoing = true;

		}

	},


	redo: function(){

		if( this.twistQueue.future.length > 0  ){

			this.undoing = true;
			this.historyQueue.empty();
			this.historyQueue.add( this.twistQueue.redo() );

		}

	},


	twist: function( command ){

		if( this.undoing ) this.twistQueue.empty();
		this.historyQueue.empty();
		this.undoing = false;
		this.twistQueue.add( command );

	},


	immediateTwist: function( twist ){


		if( this.verbosity >= 0.8 ){

			console.log(

				'Executing a twist command to rotate the '+
				 twist.group +' '+ twist.wise +' by',
				 twist.degrees, 'degrees.'
			)
		}



		// 	We now need to find the slice to rotate and figure out how much we need to rotate it by.
		var slice 	 = this.slicesDictionary[ twist.command.toLowerCase() ],
			rotation = ( twist.degrees === undefined ? 90 : twist.degrees ) * twist.vector,
			radians  = rotation.degreesToRadians(),
			duration = Math.abs( radians - slice.rotation ) / ( Math.PI * 0.5 ) * this.twistDuration;



		var l = slice.indices.length,
			cubelet;
		while( l-- > 0 ){

			slice.getCubelet( l ).isTweening = true;

		}


		//	Boom! Rotate a slice

		new TWEEN.Tween( slice )
		.to({

			rotation: radians

		}, duration )
		.easing( TWEEN.Easing.Quartic.Out )
		.onComplete( function(){

			slice.rotation = radians;
			slice.axis.rotation = 0;


			// Invalidate our cubelet tweens
			l = slice.indices.length;
			while( l-- > 0 ){

				cubelet = slice.getCubelet( l );
				cubelet.isTweening = false;
				cubelet.updateMatrix();
				cubelet.matrixSlice.copy( cubelet.matrix );


			}



			//	If the rotation changes the cube then we should update the cubelet mapping

			if( rotation !== 0 ){


				slice.rotateGroupMappingOnAxis( radians );


				// Also, since everythings changed, we might aswell tell everyone
			 	this.dispatchEvent( new CustomEvent( 'onTwistComplete', { detail: {

					slice : slice,
					twist : twist

				}}));
			}



			//	If we're on the final twist of a shuffle
			if( twist === this.finalShuffle ){

				this.finalShuffle = null;

			 	this.dispatchEvent( new CustomEvent( 'onShuffleComplete', { detail: {

					slice : slice,
					twist : twist

				}}));

			}


		}.bind( this ))
		.start( this.time );

	},


	//  We can read and write text to the Cube.
	//  This is handled by Folds which are composed of two Faces.

	getText: function( fold ){

		if( fold === undefined ){

			return [

				this.folds[ 0 ].getText(),
				this.folds[ 1 ].getText(),
				this.folds[ 2 ].getText()
			]
		}
		else if( _.isNumeric( fold ) && fold >= 0 && fold <= 2 ){

			return this.folds[ fold ].getText();
		}
	},
	setText: function( text, fold ){

		if( fold === undefined ){

			this.folds[ 0 ].setText( text );
			this.folds[ 1 ].setText( text );
			this.folds[ 2 ].setText( text );
		}
		else if( _.isNumeric( fold ) && fold >= 0 && fold <= 2 ){

			this.folds[ fold ].setText( text );
		}
	},


	setSize: function ( width, height ){


		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( width, height );


	},






	//  Shuffle methods.

	PRESERVE_LOGO: 'RrLlUuDdSsBb',             //  Preserve the logo position and rotation.
	ALL_SLICES:    'RrMmLlUuEeDdFfSsBb',       //  Allow all slices to rotate.
	EVERYTHING:    'XxRrMmLlYyUuEeDdZzFfSsBb', //  Allow all slices, and also full cube X, Y, and Z rotations.


	//  The cube does its own loopage.
	//  It attempts to execute twists in the twistQueue
	//  and then tasks in the taskQueue.
	//  This is how shuffling and solving are handled.


	loop: (function(){


		var time = 0;

		return function(){


			requestAnimationFrame( this.loop );


			//	Kick off the next animation frame

			var localTime = ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
			var frameDelta = localTime - ( time || localTime );
			time = localTime;


			if( !this.paused ){



				//	Update the internal animation frame
				this.time += frameDelta;


				TWEEN.update( this.time );




				if( this.autoRotate ){

					this.rotation.x += this.rotationDelta.x;
					this.rotation.y += this.rotationDelta.y;
					this.rotation.z += this.rotationDelta.z;

				}



				//  If the Cube is "ready"
				//  and not a single cubelet is currently tweening
				//  regardless of it's resting state (engagement;
				//  meaning it could in theory not be tweening but
				//  has come to rest at where rotation % 90 !== 0.

				if( this.isReady && this.isTweening() === 0 ){

					// if( this.twistQueue.isReady ){


						var queue = this.undoing ? this.historyQueue : this.twistQueue;


						//  We have zero twists in the queue
						//  so perhaps we'd like to add some?

						if( queue.future.length === 0 ){


							//  If the cube ought to be solving and a solver exists
							//  and we're not shuffling, tweening, etc.

							if( this.isSolving && window.solver ){

								this.isSolving = window.solver.consider( this );
							}


							//  If we are doing absolutely nothing else
							//  then we can can try executing a task.

							else if( this.taskQueue.isReady === true ){

								var task = this.taskQueue.do();
								if( task instanceof Function ) task();
							}
						}

						//  Otherwise, we have some twists in the queue
						//  and we should put everything else aside and tend to those.

						else {


							var twist = queue.do();

							if( twist.command.toLowerCase() !== 'x' &&
								twist.command.toLowerCase() !== 'y' &&
								twist.command.toLowerCase() !== 'z' &&
								twist.degrees !== 0  ) this.moveCounter += this.undoing ? -1 : 1;


							//  If the twist we're about to execute does not actually
							//  change any slices, ie, we're rotating back to 0,
							//  then we don't need to remember it.
							if( twist.degrees === 0 || twist.isShuffle ) queue.purge( twist );


							this.immediateTwist( twist );



						}

					// }

				}


				// Our mouse controls should only be active if we are not rotating
				this.mouseInteraction.enabled = this.mouseControlsEnabled && !this.finalShuffle;
				this.mouseInteraction.update();

				this.controls.enabled = this.mouseControlsEnabled && !this.mouseInteraction.active;
				this.controls.update();


			}
		}
	}())
})

/*


	SOLVERS

	Our Cube has its own animation loop conveniently called Cube.loop().
	If Cube.isSolving === true then within that loop Cube will call
	window.solver.consider( cube ). This means when you create your own
	Solver instance you have to set window.solver equal to your instance.

	Solver.consider() will do some very basic checking and if all's well
	will pass the Cube instance to Solver.logic() which is the function that
	you need to write yourself. 

	Your logic() should return false is the cube is solved or if something's
	gone horribly wrong. This will set Cube.isSolving = false and stop the
	solver from being called within the Cube's animation loop. 

	Your logic() should return true if an incremental improvement has been 
	made and the logic() should be run again in the next loop; For example,
	run again after a twist queue completes.

	--

	@author Mark Lundin - http://www.mark-lundin.com
	@author Stewart Smith


*/








ERNO.Solver = function(){


	//  When you create your own Solver this is the only function you need to build yourself.
	//  Having said that, it will probably be the most intense function like ... ever!
	//  Check out my example in /scripts/solvers/stewart.js to see how you might go about it.

	this.logic = function( cube ){ return false };;
}




//  This is the method called within Cube.loop() when Cube.isSolving === true.
//  It will call Solver.logic() which is the function you need to fill in.

ERNO.Solver.prototype.consider = function( cube ){


	//  Was our solver passed a valid Cube?
	//  Kind of important, eh?

	if( cube === undefined ){

		console.warn( 'A cube [Cube] argument must be specified for Solver.consider().' );
		return false;
	}
	else if( cube instanceof ERNO.Cube === false ){

		console.warn( 'The cube argument provided is not a valid Cube.' );
		return false;
	}


	//  If we're solving we should really make certain we aren't shuffling!
	//  Otherwise our logic will never actually run.
	//  The hook for this is in Cube.loop() so look there to see what's up.

	cube.isShuffling = false;


	//  If the cube is already solved then our job is done before it started.
	//  If not, we need to try solving it using our current solve method.

	if( cube.isSolved() ){

		ERNO.Solver.prototype.explain( 'I’ve found that the cube is already solved.' );
		return false;
	}
	else return this.logic( cube );
};




//  We should always hit at what the Solver wants to do next
//  so we can hault auto-solving and give the user a chance to 
//  figure out the next move for his/herself.

ERNO.Solver.prototype.hint = function( text ){

	console.log(

		'%c'+ text +'%c\n',
		'background-color: #EEE; color: #333', ''
	);
};


//  If hinting is text displayed *before* a move is made
//  then explaining is text displayed *after* a move is made.

ERNO.Solver.prototype.explain = function( text ){

	console.log(

		'Solver says: %c '+ text +' %c\n',
		'color: #080', ''
	);
};





	window.ERNO = ERNO;
	window._ = _;
	window.TWEEN = window.TWEEN || TWEEN;
	window.THREE = window.THREE || THREE;
}())