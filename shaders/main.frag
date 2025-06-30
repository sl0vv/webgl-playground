#version 300 es
precision mediump float;

uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;
uniform sampler2D uTexture;

in vec3 vNormal;
in vec3 vPosition;
in vec2 vTextureCoord;

out vec4 fragColor;

// Bayer matrix (2x2) for ordered dithering
const mat2 bayerMatrix = mat2(
    0.0, 2.0,
    3.0, 1.0
) / 4.0;

// 4x4 Bayer matrix for ordered dithering
const mat4 bayerMatrix4 = mat4(
    0.0,  8.0,  2.0,  10.0,
    12.0, 4.0,  14.0, 6.0,
    3.0,  11.0, 1.0,  9.0,
    15.0, 7.0,  13.0, 5.0
) / 16.0;


const float ditherScale = 1.0;
const float shadowLevels = 16.0;

void main() {
    vec3 normal = vNormal;
    vec3 lightDir = normalize(uLightDirection);
    
    float diffuse = max(dot(normal, lightDir), 0.0);

    diffuse = ceil(diffuse * shadowLevels) / shadowLevels;
    
    vec3 textureColor = texture(uTexture, vTextureCoord).rgb;
    vec3 ambient = uAmbientColor * textureColor;
    vec3 diffuseColor = uLightColor * textureColor * diffuse;
    vec3 finalColor = ambient + diffuseColor;

    // Apply ordered dithering
    float x = mod(gl_FragCoord.x, 4.0);
    float y = mod(gl_FragCoord.y, 4.0);
    
    float ditherValue;
    if (x < 1.0) {
        if (y < 1.0) ditherValue = bayerMatrix[0][0];
        else ditherValue = bayerMatrix[0][1];
    } else {
        if (y < 1.0) ditherValue = bayerMatrix[1][0];
        else ditherValue = bayerMatrix[1][1];
    }

    vec3 ditherOffset = vec3(ditherScale * (ditherValue - 0.5));
    finalColor += ditherOffset;

    finalColor = clamp(finalColor, 0.0, 1.0);

    fragColor = vec4(finalColor, 1.0);
} 