/*The MIT License

Copyright &copy; 2010-2014 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// cube.js
(function(){
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
var ERNO = {};
ERNO.version = 1;

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

	var epsilon = 0.0,
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
	showIntroverts: function( exclude, soft ){

		this.cubelets.forEach( function( cubelet ){ cubelet.showIntroverts( exclude, soft ) })
		return this
	},
	hideIntroverts: function( exclude, soft ){

		this.cubelets.forEach( function( cubelet ){ cubelet.hideIntroverts( exclude, soft ) })
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


		if( this.ableToHideInternalFaces /*&& this.cube.isFlagged( 'showingIntroverts' ) !== 0 */&& this.cube.hideInvisibleFaces ){

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


	hasProperty: function( property, value ){

		var results = new ERNO.Group(),
			self 	= this,
			l = 6;

		while( l-- > 0 ){
			if( self.getCubelet( l )[ property ] === value ) results.add( self.getCubelet( l ) );

		};

		return results;
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
				y = current.y;


			if( api.enabled && x !== undefined && y != undefined && ( mouseX !== x || mouseY !== y )) {


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


			if( api.enabled && event.button !== 2 ){


				mouseX = ( event.touches && event.touches[0] || event ).pageX;
				mouseY = ( event.touches && event.touches[0] || event ).pageY;


				//	Here we find out if the mouse is hovering over the cube,
				//	If it is, then `intersection` is populated with the 3D local coordinates of where
				//	the intersection occured. `plane` is also configured to represent the face of the cube
				//	where the intersection occured. This is used later to determine the direction
				//	of the drag.

				//	( Note: although a plane is conceptually similar to a cube's face, the plane is a mathematical representation )


				if( intersected = projector.getIntersection( camera, mouseX, mouseY, intersection, plane ) ){


					//	If a interaction happens within the cube we should prevent the event bubbling.
					event.stopImmediatePropagation();


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
						// domElement.removeEventListener( 'mousedown', onInteractStart );
						// domElement.removeEventListener( 'touchstart', onInteractStart );

					}


				}

			}
			

		}


		function onInteractUpdate( event ){


			current.x = ( event.touches && event.touches[0] || event ).pageX,
			current.y = ( event.touches && event.touches[0] || event ).pageY;


			// Prevent the default system dragging behaviour. ( Things like IOS move the viewport )

			if( api.enabled ){
				event.preventDefault();
				event.stopPropagation();
			}
			

		}

		
		function onInteractEnd( event ){


			var x = ( event.touches && event.touches[0] || event ).pageX,
				y = ( event.touches && event.touches[0] || event ).pageY;


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
				
				if( velocityOfInteraction > 0.8 ){
					
					targetAngle = Math.floor( angle / Math.PI * 0.5 * 4.0 ) * Math.PI * 0.5
					targetAngle += cross.dot( direction.normalize() ) > 0 ? Math.PI * 0.5: 0;	

				}



				// 	If this is a partial rotation that results in the same configuration of cubelets
				//	then it doesn't really count as a move, and we don't need to add it to the history		

				cube.twist( new ERNO.Twist( command, targetAngle.radiansToDegrees() ));


				// Delete the reference to our slice

				time = 0;
				current.x = undefined;
				current.y = undefined;
				axisDefined = false;
				slice = null;

				
			}

			document.removeEventListener( 'mousemove', onInteractUpdate );
			document.removeEventListener( 'touchmove', onInteractUpdate );


			document.removeEventListener( 'mouseup', onInteractEnd );
			document.removeEventListener( 'touchend', onInteractEnd );
			document.removeEventListener( 'touchcancel', onInteractEnd );


			// domElement.addEventListener( 'mousedown', onInteractStart );
			// domElement.addEventListener( 'touchstart', onInteractStart );

		}

		domElement.addEventListener( 'mousedown', onInteractStart );
		domElement.addEventListener( 'touchstart', onInteractStart );

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

		if( element !== document ){
			var d = element.ownerDocument.documentElement;
	 		bounds.left += window.pageXOffset - d.clientLeft;
	 		bounds.top  += window.pageYOffset - d.clientTop;
	 	}

	 	return bounds;

	}

	return function ( object, camera, domElement ) {

		var state 		 = STATE.NONE,
			direction  	 = new THREE.Vector2,
			mouse	 	 = new THREE.Vector2(),
			mouseEnd	 = new THREE.Vector2(),
			lastPosition = new THREE.Vector2(),
			api = {
				enabled: true,
				domElement: domElement,
				rotationSpeed: 6.0,
				damping: 0.25
			};


		var getMouseProjectionOnBall = function( x, y, vector ){

			var screen = getBoundingClientRect( api.domElement ),
				aspect = screen.height / screen.width

			return vector.set(
				( x - screen.width - screen.left ) / screen.width ,
				( screen.height + screen.top - y ) / screen.height * aspect
			);

		};

		api.update = function(){

			var axis = new THREE.Vector3,
				length = 0.0,
				modelRotationInverse = new THREE.Quaternion();

			return function updateClosure () {

				if( api.enabled === false || state === STATE.NONE ) return;

			
			 	//	define an axis to rotate on, this is basically at a tangent to the direction
				axis.set( direction.y, direction.x * -1, 0 ).normalize();


				//	The axis of rotation needs to be in mode view space, otherwise the rotation
				//	will happen in a really strange way. We therefore need to get the local rotation
				//	of the cube and the relative position of the camera and update our axis.

				modelRotationInverse.copy( object.quaternion ).inverse();
				axis.applyQuaternion( camera.quaternion );
				axis.applyQuaternion( modelRotationInverse );

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


			if ( api.enabled === false || event.which !== 1 ) return;


			state = STATE.ROTATE;


			direction.multiplyScalar( 0 );
			getMouseProjectionOnBall( event.pageX, event.pageY, mouse );
			lastPosition.copy( mouse );


			api.domElement.removeEventListener( 'mousedown', mousedown );
			document.addEventListener( 'mousemove', mousemove );
			document.addEventListener( 'mouseup', mouseup );

		}

		function mousemove( event ) {

			if ( api.enabled === false ) return;

			event.preventDefault();

			state = STATE.ROTATE;

			getMouseProjectionOnBall( event.pageX, event.pageY, mouse );

			//	Get the delta between mouse positions
			direction.subVectors( mouse, lastPosition );
			lastPosition.copy( mouse );


		}

		function mouseup( event ) {

			document.removeEventListener( 'mousemove', mousemove );
			document.removeEventListener( 'mouseup', mouseup );
			api.domElement.addEventListener( 'mousedown', mousedown );


			if ( api.enabled === false ) return;

			
			state = STATE.INERTIA;

		}


		function touchstart( event ) {


			console.log( 'should not be happening' );

			if ( api.enabled === false ) return;


			state = STATE.ROTATE;

			direction.multiplyScalar( 0 );
			getMouseProjectionOnBall( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, mouse );
			lastPosition.copy( mouse );

			api.domElement.removeEventListener( 'touchstart', touchstart );
			document.addEventListener( 'touchend', touchend );
			document.addEventListener( 'touchmove', touchmove );


		}

		function touchmove( event ) {

			if ( api.enabled === false ) return;

			event.preventDefault();

			state = STATE.ROTATE;

			getMouseProjectionOnBall( event.changedTouches[ 0 ].pageX, event.changedTouches[ 0 ].pageY, mouse );

			//	Get the delta between mouse positions
			direction.subVectors( mouse, lastPosition );
			lastPosition.copy( mouse );

		}

		function touchend( event ) {

			document.removeEventListener( 'touchend', touchend );
			document.removeEventListener( 'touchmove', touchmove );
			api.domElement.addEventListener( 'touchstart', touchstart );

			if ( api.enabled === false ) return;

			state = STATE.INERTIA;
		

		}

		

		api.domElement.addEventListener( 'mousedown', mousedown );
		api.domElement.addEventListener( 'touchstart', touchstart );

		return api;
	};

}());



//	This is a basic css renderer that uses a modified version of the three.js CSS3DRenderer.
//	Having the renderer is a seperate file allows us to abstract all the visual components
//	of the cube in a simple, straightforward way.


ERNO.renderers = ERNO.renderers || {};
ERNO.renderers.CSS3D = function( cubelets, cube ){



	//	THREE.JS HACK

	//	You can actually use a THREE.Object3D as a Scene like object 
	//	and render it with the THREE.CSS3DRenderer. For projects with filesize restrictions,
	//	this is useful as it allows you to exclude the THREE.Scene and all it's dependancies entirely.
	//	The only caveat is that we need to temporarily define/re-define a dummy Scene object


	var SceneType = THREE.Scene;
	THREE.Scene = SceneType || function(){};

	

	// SCENE + RENDERER

	var renderer = new THREE.CSS3DRenderer(),
		scene = new THREE.Object3D();
	


	// Add the cube 3D object to the scene

	scene.add( cube.object3D );
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


		console.log( cubelet.size )
		var faceSpacing = ( cubelet.size / 2 );

		var transformMap = [

			"rotateX(   0deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )",
			"rotateX(  90deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )",
			"rotateY(  90deg ) translateZ( "+faceSpacing+"px ) rotateZ(   0deg )",
			"rotateX( -90deg ) translateZ( "+faceSpacing+"px ) rotateZ(  90deg )",
			"rotateY( -90deg ) translateZ( "+faceSpacing+"px ) rotateZ( -90deg )",
			"rotateY( 180deg ) translateZ( "+faceSpacing+"px ) rotateZ( -90deg )",	

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
		showIntroverts: function( soft ){

			this.getFaceElements( '.faceIntroverted' ).forEach( showItem );
			if( !soft ) this.showingIntroverts = true;
		},
		hideIntroverts: function( soft ){

			this.getFaceElements( '.faceIntroverted' ).forEach( hideItem );
			if( !soft ) this.showingIntroverts = false;
		},
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



	// // 	We also probably want a handle on any update events that occur, for example, when a slice is rotated
	// var onSliceRotated = function( evt ){
	// 	this.dispatchEvent( new CustomEvent( 'onTwistComplete', {detail: { slice : evt.target }}));
	// }.bind( this );

	// this.slices.forEach( function( slice ){
	// 	slice.addEventListener( 'change', onSliceRotated );
	// });




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
		// 	Technically they're not really slices in the usual sense, 
		//	there are however a few things about slices that we need,
		//	like the ability to rotate about an axis, therefore for all 
		// 	intents and purposes, we'll call them a slice

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


	if( this.hideInvisibleFaces ) this.hideIntroverts( true );




	// 	RENDERER
	//	Create a renderer object from the renderer factory.
	// 	The renderFactory is a function that creates a renderer object

	this.renderer = renderFactory( this.cubelets, this );
	this.domElement = this.renderer.domElement;
	this.domElement.classList.add( 'cube' );
	this.domElement.style.fontSize = this.cubeletSize + 'px';

	// this.scene.add( this.camera );
	// this.scene.add( this.autoRotateObj3D );
	this.object3D.add( this.autoRotateObj3D );


	
	//	The Interaction class provides all the nifty mouse picking stuff.
	//	It's responsible for figuring out what cube slice is supposed to rotate
	//	and in what direction. 

	this.mouseInteraction = new ERNO.Interaction( this, this.camera, this.domElement );


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


	var detectInteraction = function ( x, y ){
	
		var intersection = this.mouseInteraction.getIntersectionAt( x, y );
		if( intersection ){
			this.dispatchEvent( new CustomEvent("click", { detail: intersection  }));
		}
	}.bind( this )


	this.domElement.addEventListener( 'click', function( event ){

		var x = event.pageX,
			y = event.pageY;

		detectInteraction( x, y );	

	});



}




ERNO.Cube.prototype = Object.create( ERNO.Group.prototype );
ERNO.Cube.prototype.constructor = ERNO.Cube;
ERNO.extend( ERNO.Cube.prototype, {


	shuffle: function( amount ){


		//  How many times should we shuffle?
		amount = amount || 30;


		var moves = this.shuffleMethod.slice(),
			move, inverseOfLastMove = new ERNO.Twist(), allowedMoves;


		//	We're shuffling the cube so we should clear any history
		this.twistQueue.empty( true );
		this.historyQueue.empty( true )


		//	Create some random rotations based on our shuffle method
		while( amount-- > 0 ){


			// Create a copy of all possible moves
			allowedMoves = moves.split('');
			move = new ERNO.Twist().copy( inverseOfLastMove );
			


			// 	We don't want to chose a move that reverses the last shuffle, it just looks odd,
			//	so we should only select a move if it's a new one.

			while( move.equals( inverseOfLastMove )){

				move.set( allowedMoves.splice( Math.floor( Math.random() * allowedMoves.length  ), 1 )[0] );

			}


			//	If we flag this move as a shuffle, then we can remove it from the history
			//	once we've executed it.
			move.isShuffle = true;


			// 	execute the shuffle
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


		// this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( width, height );


	},



	


	//  Shuffle methods.

	PRESERVE_LOGO: 'RrLlUuDdSsBb',            //  Preserve the logo position and rotation.
	ALL_SLICES:    'RrMmLlUuEeDdFfSsBb',      //  Allow all slices to rotate.
	EVERYTHING:    'XxRrMmLlYyUuEeDdZzFfSsBb',//  Allow all slices, and also full cube X, Y, and Z rotations.


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




				//	We'll need to resize the cube if our containing element has changed size.

				if( this.domElement.parentNode ){

					var parentWidth = this.domElement.parentNode.clientWidth,
						parentHeight = this.domElement.parentNode.clientHeight;
					
					if( this.domElement.parentNode &&
					  ( this.domElement.clientWidth  !== parentWidth ||
						this.domElement.clientHeight !== parentHeight )){
						
							this.setSize( parentWidth, parentHeight );

					}
				}
				


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


							//  If the Cube ought to be shuffling then
							//  add a random command to the twist queue.

							// if( this.isShuffling ){

							// 	this.twist( this.shuffleMethod[ this.shuffleMethod.length.rand() ]);

							// }
							

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
								twist.command.toLowerCase() !== 'z') this.moveCounter += this.undoing ? -1 : 1;

							//	If the twist we're about to execute does not actually change any slices, ie, we're rotating back to 0, then we don't need to remember it
							if( twist.degrees === 0 || twist.isShuffle ) queue.purge( twist );


							this.immediateTwist( twist );



						}

					// }

				}


				// Our mouse controls should only be active if we are not rotating
				this.mouseInteraction.enabled = /*( this.twistQueue.future.length === 0 && this.isTweening() === 0 &&*/ this.mouseControlsEnabled && !this.finalShuffle;
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





//@ sourceMappingURL=../build/cuber.no3D.js.map
	window.ERNO = ERNO;
window._ = _;
	window.TWEEN = window.TWEEN || TWEEN;
	window.THREE = window.THREE || THREE;
}())