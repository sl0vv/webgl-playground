import { createBottle } from './bottleGeometry.js';
import vertexShaderSource from './shaders/main.vert';
import fragmentShaderSource from './shaders/main.frag';
import wireframeFragmentShaderSource from './shaders/wireframe.frag';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
const fpsDisplay = document.getElementById('fpsDisplay'); // Get the FPS display element

if (!gl) {
    alert('WebGL 2 not supported');
    throw new Error('WebGL 2 not supported');
}

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Shader compilation
function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create shader program
const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
const wireframeFragmentShader = compileShader(wireframeFragmentShaderSource, gl.FRAGMENT_SHADER);

const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);

const wireframeProgram = gl.createProgram();
gl.attachShader(wireframeProgram, vertexShader);
gl.attachShader(wireframeProgram, wireframeFragmentShader);
gl.linkProgram(wireframeProgram);

if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Shader program linking error:', gl.getProgramInfoLog(shaderProgram));
}

if (!gl.getProgramParameter(wireframeProgram, gl.LINK_STATUS)) {
    console.error('Wireframe program linking error:', gl.getProgramInfoLog(wireframeProgram));
}

// Get attribute and uniform locations for both programs
const attribLocations = {
    vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
};

const wireframeAttribLocations = {
    vertexPosition: gl.getAttribLocation(wireframeProgram, 'aVertexPosition'),
    vertexNormal: gl.getAttribLocation(wireframeProgram, 'aVertexNormal')
};

const uniformLocations = {
    cameraParams: gl.getUniformLocation(shaderProgram, 'uCameraParams'),
    projectionParams: gl.getUniformLocation(shaderProgram, 'uProjectionParams'),
    lightDirection: gl.getUniformLocation(shaderProgram, 'uLightDirection'),
    lightColor: gl.getUniformLocation(shaderProgram, 'uLightColor'),
    ambientColor: gl.getUniformLocation(shaderProgram, 'uAmbientColor'),
    texture: gl.getUniformLocation(shaderProgram, 'uTexture')
};

const wireframeUniformLocations = {
    cameraParams: gl.getUniformLocation(wireframeProgram, 'uCameraParams'),
    projectionParams: gl.getUniformLocation(wireframeProgram, 'uProjectionParams'),
};

// Create buffers
const bottle = createBottle();

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bottle.positions), gl.STATIC_DRAW);

const normalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bottle.normals), gl.STATIC_DRAW);

const textureCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(bottle.textureCoords), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bottle.indices), gl.STATIC_DRAW);

let currentBottleIndicesLength = bottle.indices.length; // Initialize

// Texture setup
function setupTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const image = document.getElementById('textureImage');

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D);
    } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
    return texture;
}

function isPowerOf2(value) {
    return (value & (value - 1)) == 0;
}

// Create and bind the texture from the existing image element
const bottleTexture = setupTexture(gl);

// Camera parameters (instead of matrices)
let cameraDistance = 3.0;
const rotationSpeed = 0.2;
const zoomSpeed = 0.2;

// Mouse interaction state
let isDragging = false;
let lastMouseX = -1;
let lastMouseY = -1;
let cameraAngleX = 0;
let cameraAngleY = 0;
const rotationSensitivity = 0.005; // Adjust sensitivity as needed

// FPS calculation variables & Frame rate control
let frameCount = 0;
let fpsLastTime = performance.now() / 1000; // For FPS display updates

const targetFPS = 20;
const fpsInterval = 1000 / targetFPS;
let then = performance.now();

// Add button event listeners
document.getElementById('zoomIn').addEventListener('click', () => {
    cameraDistance = Math.max(1.0, cameraDistance - zoomSpeed);
});

document.getElementById('zoomOut').addEventListener('click', () => {
    cameraDistance = Math.min(10.0, cameraDistance + zoomSpeed);
});

document.getElementById('rotateLeft').addEventListener('click', () => {
    cameraAngleY += rotationSpeed;
});

document.getElementById('rotateRight').addEventListener('click', () => {
    cameraAngleY -= rotationSpeed;
});

document.getElementById('rotateUp').addEventListener('click', () => {
    cameraAngleX = Math.min(Math.PI/2 - 0.1, cameraAngleX + rotationSpeed);
});

document.getElementById('rotateDown').addEventListener('click', () => {
    cameraAngleX = Math.max(-Math.PI/2 + 0.1, cameraAngleX - rotationSpeed);
});

canvas.addEventListener('wheel', (event) => {
    event.preventDefault();
    const zoomAmount = event.deltaY * 0.01;
    cameraDistance = Math.max(1.0, Math.min(10.0, cameraDistance + zoomAmount));
});

// Render function
function render(now) {
    requestAnimationFrame(render); // Schedule the next frame immediately

    const elapsed = now - then;
    if (elapsed < fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    // Calculate FPS
    frameCount++;
    const currentTimeForFPS = now / 1000; // Convert to seconds (using 'now' from rAF)
    const deltaTimeForFPS = currentTimeForFPS - fpsLastTime;

    if (deltaTimeForFPS >= 1.0) { // Update FPS display every second
        const fps = frameCount / deltaTimeForFPS;
        fpsDisplay.textContent = `FPS: ${fps.toFixed(2)}`;
        frameCount = 0;
        fpsLastTime = currentTimeForFPS;
    }

    // --- Start of actual rendering logic ---
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shaderProgram);

    // Set camera and projection parameters as vec4 uniforms
    gl.uniform4fv(uniformLocations.cameraParams, [cameraAngleX, cameraAngleY, cameraDistance, 0.0]);
    const fov = 45 * Math.PI / 180;
    const aspectRatio = canvas.width / canvas.height;
    const near = 0.1;
    const far = 100.0;
    gl.uniform4fv(uniformLocations.projectionParams, [fov, aspectRatio, near, far]);
    gl.uniform3fv(uniformLocations.lightDirection, [4.0, -10.0, -10.0]);
    gl.uniform3fv(uniformLocations.lightColor, [1.0, 1.0, 1.0]);
    gl.uniform3fv(uniformLocations.ambientColor, [0.3, 0.3, 0.3]);

    // Bind texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bottleTexture);
    gl.uniform1i(uniformLocations.texture, 0);

    // Set up attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocations.vertexNormal);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer(attribLocations.textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocations.textureCoord);

    // Draw solid bottle
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.drawElements(gl.TRIANGLES, currentBottleIndicesLength, gl.UNSIGNED_SHORT, 0);

    // Draw wireframe
    gl.useProgram(wireframeProgram);

    // Set camera and projection parameters for wireframe
    gl.uniform4fv(wireframeUniformLocations.cameraParams, [cameraAngleX, cameraAngleY, cameraDistance, 0.0]);
    gl.uniform4fv(wireframeUniformLocations.projectionParams, [fov, aspectRatio, near, far]);

    // Set up attributes for wireframe
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(wireframeAttribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(wireframeAttribLocations.vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.vertexAttribPointer(wireframeAttribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(wireframeAttribLocations.vertexNormal);

    // Enable polygon offset to prevent z-fighting
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1.0, 1.0);

    // Draw wireframe
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    const numIndices = currentBottleIndicesLength;
    if (numIndices % 3 === 0) {
        for (let i = 0; i < numIndices; i += 3) {
            gl.drawElements(gl.LINE_LOOP, 3, gl.UNSIGNED_SHORT, i * Uint16Array.BYTES_PER_ELEMENT);
        }
    } else {
        console.warn("Wireframe rendering: bottle.indices.length is not a multiple of 3.");
    }

    // Disable polygon offset
    gl.disable(gl.POLYGON_OFFSET_FILL);
    // --- End of actual rendering logic ---
}

// Enable depth testing
gl.enable(gl.DEPTH_TEST);

// Start animation
window.onload = () => {
	requestAnimationFrame(render);
}

// Add mouse event listeners
canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left mouse button
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    }
});

canvas.addEventListener('mouseup', (event) => {
    if (event.button === 0) { // Left mouse button
        isDragging = false;
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (!isDragging) return;

    const deltaX = event.clientX - lastMouseX;
    const deltaY = event.clientY - lastMouseY;

    cameraAngleY += deltaX * rotationSensitivity;
    cameraAngleX += deltaY * rotationSensitivity;

    // Clamp pitch to avoid flipping
    cameraAngleX = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, cameraAngleX));

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
});

// Prevent context menu on right-click drag (optional)
canvas.addEventListener('contextmenu', (event) => event.preventDefault());
