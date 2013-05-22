
			var SCREEN_WIDTH = window.innerWidth,
			SCREEN_HEIGHT = window.innerHeight,
			SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
			SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

			var camera, scene, renderer,
			birds, bird;

			var boid, boids;

			// var stats;

			var amountOfTweets, tweetNumber;
			var realTweets = [];

			    $.getJSON('/nodejs/data.json', function(data) {
			        $.each(data, function(index) {
			            //alert(data[index]);
			            //alert(data[index].TEST2);
			            realTweets.push(data[index])
			        });

			        
			        tweetThis(realTweets);
			        init();
			        animate();
			    });


			
			
			


			// John R - Twitter Function (pull out a random Tweet)
			function tweetThis(fakeTweets){

				// Here is an array of fakeTweets. We can pull in from a real source later
				//var fakeTweets = ["yo","go","mo","yoyo","gogo","momo","yoyoyo","gg=ogogoog"];


			//var realTweets = [];

    



				// store the total number of tweets. We use this to determine the number of birds later on
				amountOfTweets = fakeTweets.length;
				
				// Pick a random tweet from our array
				function pickRandomTweet() {
					// Store tweetNumber so we can change which bird is highlighted
					tweetNumber = Math.floor(Math.random() * fakeTweets.length);
					var randomTweet = fakeTweets[tweetNumber];
					// Log the random tweet. Finished app should display the Tweet on-screen instead
					console.log(randomTweet);
				
					$.ajax({
					    url: "https://api.twitter.com/1/statuses/oembed.json?id="+randomTweet,
					            dataType: "jsonp",
					            success: function(data){
					            	console.log(data)
					                $('#tweet-list').html(data.html);
					            }
					        });


				}

				// Display new tweet every 5 seconds...
				setInterval(pickRandomTweet, 300000);

			}
			
			


			function init() {

				camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
				camera.position.z = 250; // originally 450

				scene = new THREE.Scene();

				birds = [];
				boids = [];

				for ( var i = 0; i < amountOfTweets; i ++ ) {

					boid = boids[ i ] = new Boid();
					boid.position.x = Math.random() * 400 - 200;
					boid.position.y = Math.random() * 400 - 200;
					boid.position.z = Math.random() * 400 - 200;
					boid.velocity.x = Math.random() * 2 - 1;
					boid.velocity.y = Math.random() * 2 - 1;
					boid.velocity.z = Math.random() * 2 - 1;
					boid.setAvoidWalls( true );
					// Old world size
					// boid.setWorldSize( 500, 500, 400 );
					boid.setWorldSize( 200, 200, 150 );

					bird = birds[ i ] = new THREE.Mesh( new Bird(), new THREE.MeshBasicMaterial( { color:Math.random() * 0xffffff, side: THREE.DoubleSide } ) );
					bird.phase = Math.floor( Math.random() * 62.83 );
					bird.position = boids[ i ].position;
					scene.add( bird );

				}

				renderer = new THREE.CanvasRenderer();
				// renderer.autoClear = false;
				renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

				document.body.appendChild( renderer.domElement );

				/*
				// STATS DEBUGGER
				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.left = '0px';
				stats.domElement.style.top = '0px';

				document.getElementById( 'container' ).appendChild(stats.domElement);
				*/
				

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );

				render();
				//stats.update();

			}
			
			function render() {

				for ( var i = 0, il = birds.length; i < il; i++ ) {

					boid = boids[ i ];
					boid.run( boids );

					bird = birds[ i ];

					color = bird.material.color;
					color.r = color.g = color.b = 255;
					bird.material.opacity = 0.5;

					bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
					bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

					bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
					bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;

				}

				// John R: Change colour of currently selected tweet bird
				highlightBird =	birds[tweetNumber].material.color;
				highlightBird.r = 0;
				highlightBird.g = 0;
				highlightBird.b = 255;

				renderer.render( scene, camera );


			}
				