function deviceMotion( cube, element ){


	var x, y,
		isDeviceOrientationSupported = window.DeviceOrientationEvent && 'ontouchstart' in window,
		bounds = getBoundingClientRect( element ),
		target = new THREE.Euler(),
		deviceOrientation = {},
		screenOrientation = 0,
		compassHeading, fixedAlpha,
		alpha, beta, gamma;



	var api = {
		paused: false,
		range: new THREE.Euler( Math.PI * 0.06, Math.PI * 0.06, 0 ),
		decay: 0.1
	}

	var parent = cube.object3D.parent;
	parent.remove( cube.object3D );
	var container = new THREE.Object3D();
	container.add( cube.object3D );
	parent.add( container );
	container.rotation.copy( cube.rotation );


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
	


	element.addEventListener( 'mousemove', function( evt ){

		if( !api.paused ){
			x = event.pageX / bounds.width  * 2.0 - 1.0;
			y = event.pageY / bounds.height * 2.0 - 1.0;
		}

	})


	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function ( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler );                               // orient the device

			quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation

			quaternion.inverse();

		}

	}();



	function step(){

		cube.autoRotate = false;

		if( x !== undefined && y !== undefined ){

			target.copy( api.range );
			target.y *= x;
			target.x *= y;

			container.rotation.x += ( target.x - container.rotation.x ) * api.decay;
			container.rotation.y += ( target.y - container.rotation.y ) * api.decay;
			
			
		}

		requestAnimationFrame( step );	

	}

	step();
	return api;

}