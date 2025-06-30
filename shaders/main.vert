#version 300 es
precision mediump float;

#include 'utils.glsl';

uniform vec4 uCameraParams; // x: angleX, y: angleY, z: distance
uniform vec4 uProjectionParams; // x: fov, y: aspect, z: near, w: far

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

out vec3 vNormal;
out vec3 vPosition;
out vec2 vTextureCoord;

// PS1-style vertex snapping parameters
const float snapFactor = 100.0;

void main() {
    // Unpack uniforms
    float cameraAngleX = uCameraParams.x;
    float cameraAngleY = uCameraParams.y;
    float cameraDistance = uCameraParams.z;

    float fov = uProjectionParams.x;
    float aspectRatio = uProjectionParams.y;
    float near = uProjectionParams.z;
    float far = uProjectionParams.w;

    // Create matrices
    mat4 projMatrix = perspective(fov, aspectRatio, near, far);
    
    // Model matrix is identity, as the object is at the origin
    mat4 modelMatrix = mat4(1.0);

    // View matrix based on camera parameters
    mat4 rotXMatrix = rotationX(cameraAngleX);
    mat4 rotYMatrix = rotationY(cameraAngleY);
    
    // Order: first apply model rotation, then camera translation and rotation
    mat4 translationMatrix = translate(identity(), vec3(0.0, 0.0, -cameraDistance));
    mat4 modelViewMatrix = translationMatrix * rotXMatrix * rotYMatrix * modelMatrix;
    
    // Apply rotation to normal
    mat3 normalMatrix = mat3(modelViewMatrix);
    vNormal = normalize(normalMatrix * aVertexNormal);
    
    vec4 worldPosition = modelViewMatrix * vec4(aVertexPosition, 1.0);
    vPosition = worldPosition.xyz;
    
    vTextureCoord = aTextureCoord;
    
    vec4 projectedPosition = projMatrix * worldPosition;

    // Apply vertex snapping in screen space
    projectedPosition.xyz /= projectedPosition.w; // Perspective divide
    projectedPosition.xy = floor(projectedPosition.xy * snapFactor) / snapFactor; // Snap X and Y
    projectedPosition.xyz *= projectedPosition.w; // Multiply back by W

    gl_Position = projectedPosition;
}