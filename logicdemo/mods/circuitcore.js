
function hexToPixelGrid(hex) {
	var hexDigits = [
		// 0-9
		[
			[1, 1, 1],
			[1, 0, 1],
			[1, 0, 1],
			[1, 0, 1],
			[1, 1, 1]
		],
		[
			[0, 0, 1],
			[0, 0, 1],
			[0, 0, 1],
			[0, 0, 1],
			[0, 0, 1]
		],
		[
			[1, 1, 1],
			[0, 0, 1],
			[1, 1, 1],
			[1, 0, 0],
			[1, 1, 1]
		],
		[
			[1, 1, 1],
			[0, 0, 1],
			[1, 1, 1],
			[0, 0, 1],
			[1, 1, 1]
		],
		[
			[1, 0, 1],
			[1, 0, 1],
			[1, 1, 1],
			[0, 0, 1],
			[0, 0, 1]
		],
		[
			[1, 1, 1],
			[1, 0, 0],
			[1, 1, 1],
			[0, 0, 1],
			[1, 1, 1]
		],
		[
			[1, 1, 1],
			[1, 0, 0],
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1]
		],
		[
			[1, 1, 1],
			[0, 0, 1],
			[0, 0, 1],
			[0, 0, 1],
			[0, 0, 1]
		],
		[
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1]
		],
		[
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1],
			[0, 0, 1],
			[1, 1, 1]
		],
		// A-F
		[
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1],
			[1, 0, 1],
			[1, 0, 1]
		],
		[
			[1, 0, 0],
			[1, 0, 0],
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1]
		],
		[
			[1, 1, 1],
			[1, 0, 0],
			[1, 0, 0],
			[1, 0, 0],
			[1, 1, 1]
		],
		[
			[0, 0, 1],
			[0, 0, 1],
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1]
		],
		[
			[1, 1, 1],
			[1, 0, 0],
			[1, 1, 1],
			[1, 0, 0],
			[1, 1, 1]
		],
		[
			[1, 1, 1],
			[1, 0, 0],
			[1, 1, 1],
			[1, 0, 0],
			[1, 0, 0]
		]
	];

	if (hex < 0 || hex > 15 || isNaN(hex)) {
		console.log("inputted value: ", hex);
		throw new Error("Input must be a valid 1-digit hexadecimal number.");
	}

	return hexDigits[hex];
}

// Function to rotate a coordinate around the origin
function rotateCoordinate(x, y, angle) {
    var radians = angle * (Math.PI / 180);
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);

    var nx = Math.round(x * cos - y * sin);
    var ny = Math.round(x * sin + y * cos);

    return [nx, ny];
}

// Initialize the circuit with optional rotation
function initializeCircuit(pixel, pins, w, h, center=true, rotation=circuitRotation, callback=()=>{}) {
    if (pixel.hasGenerated) {return;}

    pixel.circuitRotation = rotation;

    createCircuitFrame(pixel, w, h, center, rotation);
    createPins(pixel, pins, rotation);
    callback(pixel, pins, w, h);

    pixel.hasGenerated = true;
}

function createCircuitFrame(pixel, width, height, center=true, rotation=0) {
    var halfHeight = Math.floor(height / 2);
    var halfWidth = Math.floor(width / 2);

    var a = -halfHeight;
    var b = halfHeight;
    var c = -halfWidth;
    var d = halfWidth;

    if (!center) {
        a = 0;
        b = height;
        c = 0;
        d = width;
    }

    for (var y = a; y <= b; y++) {
        for (var x = c; x <= d; x++) {
            var [rx, ry] = rotateCoordinate(x, y, rotation);
            var px = pixel.x + rx;
            var py = pixel.y + ry;

            if (!pixelMap[px] || pixelMap[px][py] === undefined) {
                createPixel("circuit_material", px, py);
            }
        }
    }
}

function createPins(pixel, pins, rotation=0) {
    for (var i = 0; i < pins.length; i++) {
        var [rx, ry] = rotateCoordinate(pins[i][0], pins[i][1], rotation);
        var px = pixel.x + rx;
        var py = pixel.y + ry;

        if (!pixelMap[px] || pixelMap[px][py] == undefined) {
            var pinType = pins[i][2] ? "input_pin" : "output_pin";
            createPixel(pinType, px, py);
        }
    }
}

function checkPin(pixel, pins, index, rotation=pixel.circuitRotation) {
    var [rx, ry] = rotateCoordinate(pins[index][0], pins[index][1], rotation);
    var px = pixel.x + rx;
    var py = pixel.y + ry;

    return pixelMap[px][py] && pixelMap[px][py].active;
}

function setPin(pixel, pins, index, value, rotation=pixel.circuitRotation) {
    var [rx, ry] = rotateCoordinate(pins[index][0], pins[index][1], rotation);
    var px = pixel.x + rx;
    var py = pixel.y + ry;

    if (pixelMap[px][py] && pixelMap[px][py].element == "output_pin") {
        pixelMap[px][py].active = value;
    }
}

function previewCircuitPosition() {
//	ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
//	ctx.fillRect(mousePos.x * pixelSize, mousePos.y * pixelSize, pixelSize * 8, pixelSize * 8);
}

// Circuits
elements.four_bit_enabler_circuit = {
	tick: function(pixel) {
		var pins = [
			// Data inputs (D0-D3)
			[-3, -2, true],  // D0
			[-1, -2, true],  // D1
			[1, -2, true],  // D2
			[3, -2, true],   // D3

			// Enable input (E)
			[5, 0, true],   // Enable (E)

			// Enable mirror (E2)
			[-5, 0, false],

			// Outputs (Q0-Q3)
			[-3, 2, false],  // Q0
			[-1, 2, false],  // Q1
			[1, 2, false],  // Q2
			[3, 2, false]	// Q3
		];

		initializeCircuit(pixel, pins, 9, 3, true);

		// Read inputs
		var D = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3)
		];

		var C = checkPin(pixel, pins, 4); // Control input
		setPin(pixel, pins, 5, C);

		// Previous state initialization
		if (pixel._state === undefined) {
			pixel._state = [false, false, false, false];
		}

		// Update latch state based on control input
		if (C) {
			pixel._state = [D[0], D[1], D[2], D[3]]; // Update latch state with data inputs
		} else {
			pixel._state = [false, false, false, false];
		}

		// Output the latch state
		setPin(pixel, pins, 6, pixel._state[0]); // Q0
		setPin(pixel, pins, 7, pixel._state[1]); // Q1
		setPin(pixel, pins, 8, pixel._state[2]); // Q2
		setPin(pixel, pins, 9, pixel._state[3]); // Q3
	}
};

elements.randomizer = {
	color: "#FFCCFF",
	tick: function(pixel) {
		for (var i = 0; i < adjacentCoords.length; i++) {
			var coord = adjacentCoords[i];
			var x = pixel.x+coord[0];
			var y = pixel.y+coord[1];
			if (!isEmpty(x,y,true)) {
				if (pixelMap[x][y].element == "logic_wire"){
					if (Math.random()<0.5){
						pixelMap[x][y].lstate = 2
						pixelMap[x][y].color = pixelColorPick(pixelMap[x][y], "#ffe49c")
					} else {
						pixelMap[x][y].lstate = -2
						pixelMap[x][y].color = pixelColorPick(pixelMap[x][y], "#3d4d2c")
					}
				}
			}
		}
	},
}

elements.four_bit_randomizer_circuit = {
    tick: function(pixel) {
        var pins = [
            // Clock input
            [-2, 0, true],   // Clock

            // Outputs (Q0-Q3)
            [2, -3, false],  // Q0
            [2, -1, false],  // Q1
            [2, 1, false],   // Q2
            [2, 3, false]    // Q3
        ];

        initializeCircuit(pixel, pins, 3, 9);

        // Read clock input
        var clock = checkPin(pixel, pins, 0);

        // Initialize the state if not already done
        if (pixel._state === undefined) {
            pixel._state = [false, false, false, false];
            pixel.prevClock = false;
        }

        // Detect the positive edge on the clock pin
        if (clock && !pixel.prevClock) {
            // Generate a new 4-bit random number
            var randomValue = Math.floor(Math.random() * 16);

            // Update the state with the new random value
            pixel._state = [
                (randomValue & 1) !== 0,
                (randomValue & 2) !== 0,
                (randomValue & 4) !== 0,
                (randomValue & 8) !== 0
            ];
        }

        // Output the current state
        setPin(pixel, pins, 1, pixel._state[0]); // Q0
        setPin(pixel, pins, 2, pixel._state[1]); // Q1
        setPin(pixel, pins, 3, pixel._state[2]); // Q2
        setPin(pixel, pins, 4, pixel._state[3]); // Q3

        // Update previous state of clock input
        pixel.prevClock = clock;
    }
};

//elements.ROM_circuit = {
//	tick: function(pixel) {
//		var pins = [
//			[0, -2, true], // Input: Data
//			[0, 2, true],  // Input: Enable
//			[2, 0, false], // Output
//			[-2, 0, false] // Output
//		];
//		initializeCircuit(pixel, pins, 3, 3);
//
//		var D = checkPin(pixel, pins, 0); // Data input
//		var E = checkPin(pixel, pins, 1); // Enable input
//
//		if (E) {
//			pixel._state = D; // Q follows D when E is active
//		}
//
//		setPin(pixel, pins, 2, pixel._state);
//		setPin(pixel, pins, 3, pixel._state);
//	}
//};

function general_encoder(inputBits) {
	return function(pixel) {
		var pins = [];
		var outputBits = Math.ceil(Math.log2(inputBits));
		var circuitWidth = (inputBits * 2) + 1;
		var circuitHeight = (outputBits * 2) + 1;

		// Define input pins
		for (var i = 0; i < inputBits; i++) {
			pins.push([-Math.floor(circuitWidth / 2) + 1 + 2 * i, outputBits + 1, true]);
		}

		// Define output pins
		for (var i = 0; i < outputBits; i++) {
			pins.push([Math.floor(circuitWidth / 2) + 1, -outputBits + 1 + 2 * i, false]); // Right outputs
		}

		for (var i = 0; i < outputBits; i++) {
			pins.push([-Math.floor(circuitWidth / 2) - 1, -outputBits + 1 + 2 * i, false]); // Left outputs
		}

		initializeCircuit(pixel, pins, circuitWidth, circuitHeight);

		// Determine which input is active (priority encoder)
		var activeInput = -1;
		for (var i = inputBits - 1; i >= 0; i--) {
			if (checkPin(pixel, pins, i)) {
				activeInput = i;
				break;
			}
		}

		// Set output values based on active input
		for (var i = 0; i < outputBits; i++) {
			var outputValue = activeInput >= 0 ? ((activeInput >> i) & 1) : false;
			setPin(pixel, pins, inputBits + i, outputValue); // Right outputs
			setPin(pixel, pins, inputBits + outputBits + i, outputValue); // Left outputs
		}
	};
}

// Define a 2-to-1 encoder using the general_encoder function
elements.two_to_one_encoder_circuit = {
	tick: general_encoder(2)
};

// Define a 4-to-2 encoder using the general_encoder function
elements.four_to_two_encoder_circuit = {
	tick: general_encoder(4)
};

// Define an 8-to-3 encoder using the general_encoder function
elements.eight_to_three_encoder_circuit = {
	tick: general_encoder(8)
};

// Define a 16-to-4 encoder using the general_encoder function
elements.sixteen_to_four_encoder_circuit = {
	tick: general_encoder(16)
};

function general_demultiplexer(selectorBits) {
	return function(pixel) {
		var pins = [];
		var outputCount = Math.pow(2, selectorBits);
		var circuitWidth = 3;
		var circuitHeight = (outputCount * 2) + 1;

		// Define the input pin
		pins.push([0, Math.floor(circuitHeight / 2) + 1, true]);

		// Define selector pins
		for (var i = 0; i < selectorBits; i++) {
			pins.push([-2, (Math.floor(circuitHeight / 2) - 1) - (2 * i), true]);
		}

		// Define output pins
		for (var i = 0; i < outputCount; i++) {
			pins.push([Math.floor(circuitWidth / 2) + 1, -Math.floor(circuitHeight / 2) + 1 + 2 * i, false]);
		}

		initializeCircuit(pixel, pins, circuitWidth, circuitHeight);

		// Read input and selector values
		var input = checkPin(pixel, pins, 0);
		var selector = 0;
		for (var i = 0; i < selectorBits; i++) {
			if (checkPin(pixel, pins, 1 + i)) {
				selector += Math.pow(2, i);
			}
		}

		// Set output values based on selector
		for (var i = 0; i < outputCount; i++) {
			setPin(pixel, pins, 1 + selectorBits + i, i === selector ? input : false);
		}
	};
}

// Define a 1-to-2 demultiplexer using the general_demultiplexer function
elements.one_to_two_demultiplexer_circuit = {
	tick: general_demultiplexer(1)
};

// Define a 1-to-4 demultiplexer using the general_demultiplexer function
elements.one_to_four_demultiplexer_circuit = {
	tick: general_demultiplexer(2)
};

// Define a 1-to-8 demultiplexer using the general_demultiplexer function
elements.one_to_eight_demultiplexer_circuit = {
	tick: general_demultiplexer(3)
};

// Define a 1-to-16 demultiplexer using the general_demultiplexer function
elements.one_to_sixteen_demultiplexer_circuit = {
	tick: general_demultiplexer(4)
};

function general_decoder(inputBits) {
	return function(pixel) {
		var pins = [];
		var outputCount = Math.pow(2, inputBits);
		var circuitWidth = (inputBits * 2) + 1;
		var circuitHeight = (outputCount * 2) + 1;

		// Define input pins
		for (var i = 0; i < inputBits; i++) {
			pins.push([-Math.floor(circuitWidth / 2) + 1 + 2 * i, outputCount + 1, true]);
		}

		// Define output pins
		for (var i = 0; i < outputCount; i++) {
			pins.push([Math.floor(circuitWidth / 2) + 1, -outputCount + 1 + 2 * i, false]); // Right outputs
		}

		for (var i = 0; i < outputCount; i++) {
			pins.push([-Math.floor(circuitWidth / 2) - 1, -outputCount + 1 + 2 * i, false]); // Left outputs
		}

		initializeCircuit(pixel, pins, circuitWidth, circuitHeight);

		// Read input values
		var input = 0;
		for (var i = 0; i < inputBits; i++) {
			if (checkPin(pixel, pins, i)) {
				input += Math.pow(2, i);
			}
		}

		// Set output values
		for (var i = 0; i < outputCount; i++) {
			var outputValue = (i === input);
			setPin(pixel, pins, inputBits + i, outputValue); // Right outputs
			setPin(pixel, pins, inputBits + outputCount + i, outputValue); // Left outputs
		}
	};
}

elements.one_to_two_decoder_circuit = {
	tick: general_decoder(1)
};

elements.two_to_four_decoder_circuit = {
	tick: general_decoder(2)
};

elements.three_to_eight_decoder_circuit = {
	tick: general_decoder(3)
};

elements.four_to_sixteen_decoder_circuit = {
	tick: general_decoder(4)
};

function general_multiplexer(inputLines) {
	return function(pixel) {
		var pins = [];
		var selectorBits = Math.ceil(Math.log2(inputLines));
		var circuitWidth = (selectorBits * 2) + 1;
		var circuitHeight = (inputLines * 2) + 1;

		// Define selector pins
		for (var i = 0; i < selectorBits; i++) {
			pins.push([-Math.floor(circuitWidth / 2) + 1 + 2 * i, inputLines + 1, true]);
		}

		// Define input data pins
		for (var i = 0; i < inputLines; i++) {
			pins.push([-Math.floor(circuitWidth / 2) - 1, -inputLines + 1 + 2 * i, true]);
		}

		// Define output pin
		pins.push([Math.floor(circuitWidth / 2) + 1, 0, false]);

		initializeCircuit(pixel, pins, circuitWidth, circuitHeight);

		// Read selector input
		var selector = 0;
		for (var i = 0; i < selectorBits; i++) {
			if (checkPin(pixel, pins, i)) {
				selector += Math.pow(2, i);
			}
		}

		setPin(pixel, pins, selectorBits + inputLines, checkPin(pixel, pins, selector + selectorBits)); // Output pin
	};
}

// Define a 2-input multiplexer using the general_multiplexer function
elements.two_to_one_multiplexer_circuit = {
	tick: general_multiplexer(2)
};

// Define a 4-input multiplexer using the general_multiplexer function
elements.four_to_one_multiplexer_circuit = {
	tick: general_multiplexer(4)
};

// Define an 8-input multiplexer using the general_multiplexer function
elements.eight_to_one_multiplexer_circuit = {
	tick: general_multiplexer(8)
};

// Define an 8-input multiplexer using the general_multiplexer function
elements.sixteen_to_one_multiplexer_circuit = {
	tick: general_multiplexer(16)
};

elements.four_bit_PISO_shift_register_circuit = {
	tick: function(pixel) {
		var pins = [
			// Data inputs (D0-D3)
			[-3, -3, true],  // D0
			[-1, -3, true],  // D1
			[1, -3, true],   // D2
			[3, -3, true],   // D3

			// Control input (Load/Shift Enable)
			[-5, -1, true],  // Load/Shift Enable

			// Clock input
			[-5, 1, true],   // Clock

			// Serial output
			[5, -1, false],  // Serial Out (Q)
			[5, 1, false]	// Transmission Flag
		];

		initializeCircuit(pixel, pins, 9, 5);

		// Read data inputs
		var D = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3)
		];

		// Read control and clock inputs
		var loadShiftEnable = checkPin(pixel, pins, 4);
		var clock = checkPin(pixel, pins, 5);

		// Initialize the state if not already done
		if (pixel._state === undefined) {
			pixel._state = [false, false, false, false];
			pixel.bitIndex = 0;
			pixel.prevLoadShiftEnable = false;
			pixel.prevClock = false;
		}

		// Detect the positive edge on the control pin
		if (loadShiftEnable && !pixel.prevLoadShiftEnable) {
			// Load the data into the register on the first positive edge
			pixel._state = [D[0], D[1], D[2], D[3]];
			pixel.bitIndex = 0;
		}

		// Detect the positive edge on the clock pin
		if (clock && !pixel.prevClock) {
			if (pixel.bitIndex < 4) {
				// Shift the register and output the next bit
				var serialOut = pixel._state[0];
				for (var i = 0; i < 3; i++) {
					pixel._state[i] = pixel._state[i + 1];
				}
				pixel._state[3] = false;  // Clear the last bit after shifting

				// Output the serial value
				setPin(pixel, pins, 6, serialOut);

				// Update bit index
				pixel.bitIndex++;
			}
		}

		// Set the transmission flag
		var transmitting = pixel.bitIndex < 4;
		setPin(pixel, pins, 7, transmitting);

		// Update previous state of control and clock inputs
		pixel.prevLoadShiftEnable = loadShiftEnable;
		pixel.prevClock = clock;
	}
};

elements.four_bit_SIPO_shift_register_circuit = {
	tick: function(pixel) {
		var pins = [
			// Serial input (Data In)
			[-2, -3, true],  // Data In

			// Clock input
			[-2, -1, true],   // Clock

			// Parallel outputs (Q0-Q3)
			[2, -3, false],  // Q0
			[2, -1, false],  // Q1
			[2, 1, false],   // Q2
			[2, 3, false]    // Q3
		];

		initializeCircuit(pixel, pins, 3, 9);

		// Read serial and clock input
		var serialIn = checkPin(pixel, pins, 0);
		var clock = checkPin(pixel, pins, 1);

		// Initialize the state if not already done
		if (pixel._state === undefined) {
			pixel._state = [false, false, false, false];
			pixel.prevClock = false;
		}

		// Detect the positive edge on the clock pin
		if (clock && !pixel.prevClock) {
			pixel._state = [serialIn, pixel._state[0], pixel._state[1], pixel._state[2]];
		}

		// Output the parallel values
		for (var i = 0; i < 4; i++) {
			setPin(pixel, pins, 2 + i, pixel._state[i]);
		}

		// Update previous state of control and clock inputs
		pixel.prevClock = clock;
	}
};

elements.four_bit_register_circuit = {
	tick: function(pixel) {
		var pins = [
			// Data inputs (D0-D3)
			[-3, -3, true],  // D0
			[-1, -3, true],  // D1
			[1, -3, true],  // D2
			[3, -3, true],  // D3

			// Control inputs (Enable, Write Enable)
			[5, -1, true],   // Enable
			[5, 1, true],   // Write Enable

			// Outputs (Q0-Q3)
			[-3, 3, false],  // Q0
			[-1, 3, false],  // Q1
			[1, 3, false],  // Q2
			[3, 3, false],  // Q3
		];

		initializeCircuit(pixel, pins, 9, 5);

		// Read data inputs
		var D = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3)
		];

		// Read control inputs
		var Enable = checkPin(pixel, pins, 4);
		var WriteEnable = checkPin(pixel, pins, 5);

		// Initialize the state if not already done
		if (pixel._state === undefined) {
			pixel._state = [false, false, false, false];
		}

		// Update the register state if WriteEnable is active
		if (WriteEnable && Enable) {
			pixel._state = [D[0], D[1], D[2], D[3]];
		}

		// Output the register state if Enable is active
		if (Enable) {
			setPin(pixel, pins, 6, pixel._state[0]); // Q0
			setPin(pixel, pins, 7, pixel._state[1]); // Q1
			setPin(pixel, pins, 8, pixel._state[2]); // Q2
			setPin(pixel, pins, 9, pixel._state[3]); // Q3
		} else {
			// Disable outputs if Enable is not active
			setPin(pixel, pins, 6, false); // Q0
			setPin(pixel, pins, 7, false); // Q1
			setPin(pixel, pins, 8, false); // Q2
			setPin(pixel, pins, 9, false); // Q3
		}
	}
};

elements.SR_latch_circuit = {
	tick: function(pixel) {
		var pins = [
			[0, -2, true], // Input: Set
			[0, 2, true],  // Input: Reset
			[2, 0, false], // Output
			[-2, 0, false] // Output
		];
		initializeCircuit(pixel, pins, 3, 3);

		if (checkPin(pixel, pins, 0)) {pixel._state = true;} // Set
		if (checkPin(pixel, pins, 1)) {pixel._state = false;} // Reset

		setPin(pixel, pins, 2, pixel._state);
		setPin(pixel, pins, 3, pixel._state);
	}
};

elements.T_flip_flop_circuit = {
	tick: function(pixel) {
		var pins = [
			[0, -2, true], // Input: Toggle (T)
			[2, 0, false], // Output (Q)
			[-2, 0, false] // Output (not Q) - Optional
		];

		initializeCircuit(pixel, pins, 3, 3);

		// Check the current state of the Toggle (T) input
		var T = checkPin(pixel, pins, 0);

		// Initialize the previous state of T if not already done
		if (pixel.prevT === undefined) {
			pixel.prevT = false;
		}

		// Detect the positive edge
		if (T && !pixel.prevT) {
			pixel._state = !pixel._state; // Toggle state on positive edge
		}

		// Update the previous state of T
		pixel.prevT = T;

		setPin(pixel, pins, 1, pixel._state);
		setPin(pixel, pins, 2, pixel._state);
	}
};

elements.D_latch_circuit = {
	tick: function(pixel) {
		var pins = [
			[0, -2, true], // Input: Data
			[0, 2, true],  // Input: Enable
			[2, 0, false], // Output
			[-2, 0, false] // Output
		];
		initializeCircuit(pixel, pins, 3, 3);

		var D = checkPin(pixel, pins, 0); // Data input
		var E = checkPin(pixel, pins, 1); // Enable input

		if (E) {
			pixel._state = D; // Q follows D when E is active
		}

		setPin(pixel, pins, 2, pixel._state);
		setPin(pixel, pins, 3, pixel._state);
	}
};

elements.D_flip_flop_circuit = {
	tick: function(pixel) {
		var pins = [
			[0, -2, true], // Input: Data (D)
			[0, 2, true],  // Input: Control (C)
			[2, 0, false], // Output (Q)
			[-2, 0, false] // Output (not Q) - Optional
		];

		initializeCircuit(pixel, pins, 3, 3);

		// Read inputs
		var D = checkPin(pixel, pins, 0); // Data input
		var C = checkPin(pixel, pins, 1); // Control input

		// Initialize previous state of control input if not already done
		if (pixel.prevC === undefined) {
			pixel.prevC = false;
		}

		// Previous state initialization
		if (pixel._state === undefined) {
			pixel._state = false;
		}

		// Update flip-flop state on positive edge of control input
		if (C && !pixel.prevC) {
			pixel._state = D; // Q follows D on positive edge of C
		}

		// Update the previous state of control input
		pixel.prevC = C;

		// Output the flip-flop state
		setPin(pixel, pins, 2, pixel._state);
		setPin(pixel, pins, 3, pixel._state);
	}
};

elements.four_bit_D_latch_circuit = {
	tick: function(pixel) {
		var pins = [
			// Data inputs (D0-D3)
			[-3, -2, true],  // D0
			[-1, -2, true],  // D1
			[1, -2, true],  // D2
			[3, -2, true],   // D3

			// Control input (C)
			[5, 0, true],   // Control (C)

			// Outputs (Q0-Q3)
			[-3, 2, false],  // Q0
			[-1, 2, false],  // Q1
			[1, 2, false],  // Q2
			[3, 2, false]	// Q3
		];

		initializeCircuit(pixel, pins, 9, 3);

		// Read inputs
		var D = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3)
		];

		var C = checkPin(pixel, pins, 4); // Control input

		// Previous state initialization
		if (pixel._state === undefined) {
			pixel._state = [false, false, false, false];
		}

		// Update latch state based on control input
		if (C) {
			pixel._state = [D[0], D[1], D[2], D[3]]; // Update latch state with data inputs
		}

		// Output the latch state
		setPin(pixel, pins, 5, pixel._state[0]); // Q0
		setPin(pixel, pins, 6, pixel._state[1]); // Q1
		setPin(pixel, pins, 7, pixel._state[2]); // Q2
		setPin(pixel, pins, 8, pixel._state[3]); // Q3
	}
};

elements.four_bit_D_flip_flop_circuit = {
	tick: function(pixel) {
		var pins = [
			// Data inputs (D0-D3)
			[-3, -2, true],  // D0
			[-1, -2, true],  // D1
			[1, -2, true],   // D2
			[3, -2, true],   // D3

			// Control input (C)
			[5, 0, true],   // Control (C)

			// Outputs (Q0-Q3)
			[-3, 2, false],  // Q0
			[-1, 2, false],  // Q1
			[1, 2, false],   // Q2
			[3, 2, false]	// Q3
		];

		initializeCircuit(pixel, pins, 9, 3);

		// Read inputs
		var D = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3)
		];

		var C = checkPin(pixel, pins, 4); // Control input

		// Initialize previous state of control input if not already done
		if (pixel.prevC === undefined) {
			pixel.prevC = false;
		}

		// Previous state initialization
		if (pixel._state === undefined) {
			pixel._state = [false, false, false, false];
		}

		// Update flip-flop state on positive edge of control input
		if (C && !pixel.prevC) {
			pixel._state = [D[0], D[1], D[2], D[3]]; // Update flip-flop state with data inputs
		}

		// Update the previous state of control input
		pixel.prevC = C;

		// Output the flip-flop state
		setPin(pixel, pins, 5, pixel._state[0]); // Q0
		setPin(pixel, pins, 6, pixel._state[1]); // Q1
		setPin(pixel, pins, 7, pixel._state[2]); // Q2
		setPin(pixel, pins, 8, pixel._state[3]); // Q3
	}
};

elements.four_bit_incrementer_circuit = {
	tick: function(pixel) {
		var pins = [
			// 4-bit number inputs (N0-N3)
			[-3, -2, true],  // N0
			[-1, -2, true],  // N1
			[1, -2, true],   // N2
			[3, -2, true],   // N3

			// Increment control input (INC)
			[-5, 0, true],   // Increment (INC)

			// Outputs (Q0-Q3)
			[-3, 2, false],  // Q0
			[-1, 2, false],  // Q1
			[1, 2, false],   // Q2
			[3, 2, false],   // Q3

			// Carry out
			[5, 0, false]	// Carry out (COUT)
		];

		initializeCircuit(pixel, pins, 9, 3);

		// Read inputs
		var N = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3)
		];

		var INC = checkPin(pixel, pins, 4); // Increment control input

		// Calculate the incremented value when control is active
		var carry = 0;
		var result = [];

		if (INC) {
			carry = 1; // Start with a carry of 1 to increment by 1
		}

		for (var i = 0; i < 4; i++) {
			var sum = N[i] + carry;
			result[i] = sum % 2; // Current bit sum
			carry = Math.floor(sum / 2); // Carry for next bit
		}

		// Output the incremented value and carry out
		setPin(pixel, pins, 5, result[0]); // Q0
		setPin(pixel, pins, 6, result[1]); // Q1
		setPin(pixel, pins, 7, result[2]); // Q2
		setPin(pixel, pins, 8, result[3]); // Q3
		setPin(pixel, pins, 9, carry);	 // Carry out (COUT)
	}
};

elements.four_bit_adder_circuit = {
	tick: function(pixel) {
		var pins = [
			// First 4-bit number (A)
			[-7, -2, true],  // A0
			[-5, -2, true],  // A1
			[-3, -2, true],  // A2
			[-1, -2, true],  // A3

			// Second 4-bit number (B)
			[1, -2, true],   // B0
			[3, -2, true],   // B1
			[5, -2, true],   // B2
			[7, -2, true],   // B3

			// Carry-in (C_in)
			[9, 0, true],   // Carry-in (C_in)

			// Output sum (S)
			[-7, 2, false],  // S0
			[-5, 2, false],  // S1
			[-3, 2, false],  // S2
			[-1, 2, false],  // S3
			[1, 2, false],   // Carry Out (C4)
		];

		initializeCircuit(pixel, pins, 17, 3);

		// Read inputs
		var A = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3)
		];

		var B = [
			checkPin(pixel, pins, 4),
			checkPin(pixel, pins, 5),
			checkPin(pixel, pins, 6),
			checkPin(pixel, pins, 7)
		];

		var C_in = checkPin(pixel, pins, 8); // Carry-in

		// Calculate the sum and carry
		var sum = [];
		var carry = C_in;

		for (var i = 0; i < 4; i++) {
			var bitSum = A[i] + B[i] + carry;
			sum[i] = bitSum % 2; // Current bit sum
			carry = Math.floor(bitSum / 2); // Carry for next bit
		}

		// Output the sum
		setPin(pixel, pins, 9, sum[0]);   // S0
		setPin(pixel, pins, 10, sum[1]);  // S1
		setPin(pixel, pins, 11, sum[2]);  // S2
		setPin(pixel, pins, 12, sum[3]);  // S3
		setPin(pixel, pins, 13, carry);   // Carry Out (C4)
	}
};

function general_clock(speed, s2) {
	return function(pixel){
		for (var i = 0; i < adjacentCoords.length; i++) {
			var coord = adjacentCoords[i];
			var x = pixel.x+coord[0];
			var y = pixel.y+coord[1];
			if (!isEmpty(x,y,true)) {
				if (pixelMap[x][y].element == "logic_wire"){
					if (pixelTicks % speed < s2){
						pixelMap[x][y].lstate = 2
						pixelMap[x][y].color = pixelColorPick(pixelMap[x][y], "#ffe49c")
					} else {
						pixelMap[x][y].lstate = -2
						pixelMap[x][y].color = pixelColorPick(pixelMap[x][y], "#3d4d2c")
					}
				}
			}
		}
	};
}

elements.slow_clock = {
	color: "#BB66BB",
	tick: general_clock(64, 32),
}

elements.medium_clock = {
	color: "#DD88DD",
	tick: general_clock(32, 16),
}

elements.fast_clock = {
	color: "#FFAAFF",
	tick: general_clock(16, 8),
}

elements.very_fast_clock = {
	color: "#FFCCFF",
	tick: general_clock(8, 4),
}

var addDisplayCallback = function(pixel, pins, w, h) {
	for (var y = 1; y <= h - 1; y++) {
		for (var x = 1; x <= w - 1; x++) {
			var px = pixel.x + x;
			var py = pixel.y + y;

			deletePixel(px, py);
			createPixel("art", px, py);
			pixelMap[px][py].color = "rgb(16, 24, 32)";
		}
	}
}

elements.simple_seven_segment_display = {
	tick: function(pixel) {
		var pins = [
			// Data inputs (D0-D3)
			[-1, 1, true],  // D0
			[-1, 3, true],  // D1
			[-1, 5, true],  // D2
			[-1, 7, true],   // D3
		];

		initializeCircuit(pixel, pins, 4, 8, false, pixel.circuitRotation, addDisplayCallback);

		// Read inputs
		var D = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3)
		];

		var hexNumber = (D[3] * 8) + (D[2] * 4) + (D[1] * 2) + (D[0] * 1);
		if (isNaN(hexNumber)) {return;}

		// Draw the number
		var hexGrid = hexToPixelGrid(hexNumber);
		for (var y = 2; y <= 6; y++) {
			for (var x = 1; x <= 3; x++) {
				var px = pixel.x + x;
				var py = pixel.y + y;

				if (pixelMap[px][py] && pixelMap[px][py].element == "art") {
					if (hexGrid[y - 2][x - 1]) {
						pixelMap[px][py].color = "rgb(16, 230, 120)";
					} else {
						pixelMap[px][py].color = "rgb(16, 24, 32)";
					}
				}
			}
		}
	}
};

elements.simple_double_seven_segment_display = {
	tick: function(pixel) {
		var pins = [
			// Data inputs (D0-D3)
			[-1, 1, true],  // D0
			[-1, 3, true],  // D1
			[-1, 5, true],  // D2
			[-1, 7, true],   // D3

			[1, -1, true],  // D2-0
			[3, -1, true],  // D2-1
			[5, -1, true],  // D2-2
			[7, -1, true],   // D2-3
		];

		initializeCircuit(pixel, pins, 8, 8, false, pixel.circuitRotation, addDisplayCallback);

		// Read inputs
		var D = [
			checkPin(pixel, pins, 0),
			checkPin(pixel, pins, 1),
			checkPin(pixel, pins, 2),
			checkPin(pixel, pins, 3),
			checkPin(pixel, pins, 4),
			checkPin(pixel, pins, 5),
			checkPin(pixel, pins, 6),
			checkPin(pixel, pins, 7)
		];

		var hexNumber = (D[3] * 8) + (D[2] * 4) + (D[1] * 2) + (D[0] * 1);
		var hexNumber2 = (D[7] * 8) + (D[6] * 4) + (D[5] * 2) + (D[4] * 1);
		if (isNaN(hexNumber) || isNaN(hexNumber2)) {return;}

		// Draw the number
		var hexGrid = hexToPixelGrid(hexNumber);
		for (var y = 2; y <= 6; y++) {
			for (var x = 1; x <= 3; x++) {
				var px = pixel.x + x;
				var py = pixel.y + y;

				if (pixelMap[px][py] && pixelMap[px][py].element == "art") {
					if (hexGrid[y - 2][x - 1]) {
						pixelMap[px][py].color = "rgb(16, 230, 120)";
					} else {
						pixelMap[px][py].color = "rgb(16, 24, 32)";
					}
				}
			}
		}

		var hexGrid2 = hexToPixelGrid(hexNumber2);
		for (var y = 2; y <= 6; y++) {
			for (var x = 5; x <= 7; x++) {
				var px = pixel.x + x;
				var py = pixel.y + y;

				if (pixelMap[px][py] && pixelMap[px][py].element == "art") {
					if (hexGrid2[y - 2][x - 5]) {
						pixelMap[px][py].color = "rgb(16, 230, 120)";
					} else {
						pixelMap[px][py].color = "rgb(16, 24, 32)";
					}
				}
			}
		}
	}
};

elements.circuit_material = {
	color: "#444444",
	category: "logic"
};

elements.input_pin = {
	color: "#DDAA33",
	category: "logic",
	active: false,
	tick: function(pixel) {
		pixel.active = false;
		var neighbors = getNeighbors(pixel);
		for (var i = 0;i < neighbors.length;i++) {
			var neighbor = neighbors[i];

			if (neighbor.charge > 0 || neighbor.lstate == 2) {
				pixel.active = true;
			}
		}
	}
};

elements.output_pin = {
	color: "#AAAAAA",
	category: "logic",
	active: false,
	tick: function(pixel) {
		var neighbors = getNeighbors(pixel);
		for (var i = 0;i < neighbors.length;i++) {
			var neighbor = neighbors[i];

			// Check if it's a wire
			if (elements[neighbor.element].conduct > 0 && pixel.active) {
				neighbor.charge = 1;
			}

			// Check if it's a logic wire (logicgates.js)
			if (neighbor.lstate != undefined) {
				if (pixel.active) {
					neighbor.lstate = 2;
					neighbor.color = pixelColorPick(neighbor, "#ffe49c");
				} else {
					neighbor.lstate = -2;
					neighbor.color = pixelColorPick(neighbor, "#3d4d2c");
				}
			}
		}
	}
};

// cc_ is circuit core prefix
const cc_BROWN = "#773317";
const cc_RED = "#DD3322";
const cc_ORANGE = "#DD8833";
const cc_YELLOW = "#DDCC44";
const cc_LIME = "#77DD44";
const cc_GREEN = "#33BB44";
const cc_BLUE = "#224499";
const cc_LIGHT_BLUE = "#77CCFF";
const cc_LAVENDER = "#AA88EE";
//const cc_PINK = "#DD88DD";
const cc_WHITE = "#DDDDDD";

var circuits = [
	// ROM/RAM: red
	// - add rom, ram and variants
//	{ circuit: elements.ROM_circuit, color: cc_GREEN },
	// Encoders and de-multiplexers: orange
	{ circuit: elements.two_to_one_encoder_circuit, color: cc_ORANGE },
	{ circuit: elements.four_to_two_encoder_circuit, color: cc_ORANGE },
	{ circuit: elements.eight_to_three_encoder_circuit, color: cc_ORANGE },
	{ circuit: elements.sixteen_to_four_encoder_circuit, color: cc_ORANGE },

	{ circuit: elements.one_to_two_demultiplexer_circuit, color: cc_ORANGE },
	{ circuit: elements.one_to_four_demultiplexer_circuit, color: cc_ORANGE },
	{ circuit: elements.one_to_eight_demultiplexer_circuit, color: cc_ORANGE },
	{ circuit: elements.one_to_sixteen_demultiplexer_circuit, color: cc_ORANGE },
	// Decoders and multiplexers: yellow
	{ circuit: elements.one_to_two_decoder_circuit, color: cc_YELLOW },
	{ circuit: elements.two_to_four_decoder_circuit, color: cc_YELLOW },
	{ circuit: elements.three_to_eight_decoder_circuit, color: cc_YELLOW },
	{ circuit: elements.four_to_sixteen_decoder_circuit, color: cc_YELLOW },

	{ circuit: elements.two_to_one_multiplexer_circuit, color: cc_YELLOW },
	{ circuit: elements.four_to_one_multiplexer_circuit, color: cc_YELLOW },
	{ circuit: elements.eight_to_one_multiplexer_circuit, color: cc_YELLOW },
	{ circuit: elements.sixteen_to_one_multiplexer_circuit, color: cc_YELLOW },
	// Program counter and shift registers: lime
	{ circuit: elements.four_bit_PISO_shift_register_circuit, color: cc_LIME },
	{ circuit: elements.four_bit_SIPO_shift_register_circuit, color: cc_LIME },
	// Registers: green
	{ circuit: elements.four_bit_register_circuit, color: cc_GREEN },
	// Latches and flip flops: light blue
	{ circuit: elements.SR_latch_circuit, color: cc_LIGHT_BLUE },
	{ circuit: elements.T_flip_flop_circuit, color: cc_LIGHT_BLUE },
	{ circuit: elements.D_latch_circuit, color: cc_LIGHT_BLUE },
	{ circuit: elements.D_flip_flop_circuit, color: cc_LIGHT_BLUE },
	{ circuit: elements.four_bit_D_latch_circuit, color: cc_LIGHT_BLUE },
	{ circuit: elements.four_bit_D_flip_flop_circuit, color: cc_LIGHT_BLUE },
	// Addition/subtraction arithmetic: blue
	// - add 1-bit adder, 1-bit subtractor, 4-bit subtractor, 4-bit inverter, 4-bit decrementer
	{ circuit: elements.four_bit_adder_circuit, color: cc_BLUE },
	{ circuit: elements.four_bit_incrementer_circuit, color: cc_BLUE },
	// Complex circuits: lavender
	// - add logic ALU, arithmetic ALU, multiplier, divider, micro-CPU, ct5k's RPC3, simpleCPU
	// Clocks: pink
	{ circuit: elements.slow_clock },
	{ circuit: elements.medium_clock },
	{ circuit: elements.fast_clock },
	{ circuit: elements.very_fast_clock },
	// Misc and I/O: brown
	// - add 4-bit selector, number select panel, pin panel, keyboard panel
	{ circuit: elements.four_bit_enabler_circuit, color: cc_BROWN },
	{ circuit: elements.randomizer, color: cc_BROWN },
	{ circuit: elements.four_bit_randomizer_circuit, color: cc_BROWN },
	// Displays/visual circuits: white
	{ circuit: elements.simple_seven_segment_display, color: cc_WHITE },
	{ circuit: elements.simple_double_seven_segment_display, color: cc_WHITE },
	// - add displays
];

circuits.forEach(circuitInfo => {
	if (circuitInfo.color) {circuitInfo.circuit.color = circuitInfo.color;}
	circuitInfo.circuit.category = "logic";
	circuitInfo.circuit.maxSize = 1;
	circuitInfo.circuit.perTick = previewCircuitPosition;
});

var circuitRotation = 0;
document.addEventListener('keydown', function(event) {
    if (event.key === 'Arrow Up') {
        circuitRotation = (circuitRotation + 90) % 360;
        logMessage('CircuitRot ation changed to ' + circuitRotation);
    }
});
