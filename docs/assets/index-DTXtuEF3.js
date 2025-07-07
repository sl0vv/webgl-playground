(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))l(r);new MutationObserver(r=>{for(const o of r)if(o.type==="childList")for(const n of o.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&l(n)}).observe(document,{childList:!0,subtree:!0});function m(r){const o={};return r.integrity&&(o.integrity=r.integrity),r.referrerPolicy&&(o.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?o.credentials="include":r.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function l(r){if(r.ep)return;r.ep=!0;const o=m(r);fetch(r.href,o)}})();function S(i,e,m){const l=[e[0]-i[0],e[1]-i[1],e[2]-i[2]],r=[m[0]-i[0],m[1]-i[1],m[2]-i[2]];let o=[l[1]*r[2]-l[2]*r[1],l[2]*r[0]-l[0]*r[2],l[0]*r[1]-l[1]*r[0]];const n=Math.sqrt(o[0]*o[0]+o[1]*o[1]+o[2]*o[2]);return n===0?[0,0,1]:(o[0]/=n,o[1]/=n,o[2]/=n,o)}const q=[[.14,-.97],[.21,-1],[.28,-1],[.32,-.9],[.32,-.82],[.28,-.65],[.28,-.51],[.31,-.14],[.31,.01],[.29,.22],[.24,.41],[.16,.59],[.14,.73],[.14,.88],[.15,.89],[.14,.96],[.16,.96],[.155,.98],[.14,1]];function K(){const i=q,e=10,m=[],l=[],r=[],o=[];let n=0;if(!i||i.length<2)return console.error("Bottle profile must have at least 2 points."),{positions:m,normals:l,textureCoords:r,indices:o};const d=i.map(a=>({x:a[0],y:a[1]})),s=[];for(let a=0;a<=e;a++){const c=a/e*2*Math.PI,f=Math.sin(c),u=Math.cos(c),v=[];for(let g=0;g<d.length;g++){const A=d[g];v.push([A.x*u,A.y,A.x*f])}s.push(v)}for(let a=0;a<e;a++)for(let c=0;c<d.length-1;c++){const f=s[a],u=s[a+1],v=d[c],g=d[c+1],A=f[c],_=u[c],C=f[c+1],B=u[c+1],M=a/e,p=(a+1)/e,T=c/(d.length-1),b=(c+1)/(d.length-1);if(Math.abs(g.x)<.001){const E=[0,g.y,0];let h=S(A,_,E);m.push(...A,..._,...E),l.push(...h,...h,...h),r.push(M,T,p,T,.5,b),o.push(n,n+1,n+2),n+=3}else if(Math.abs(v.x)<.001){const E=[0,v.y,0];let h=S(B,C,E);m.push(...B,...C,...E),l.push(...h,...h,...h),r.push(p,b,M,b,.5,T),o.push(n,n+1,n+2),n+=3}else{let E=S(A,_,C);m.push(...A,..._,...C),l.push(...E,...E,...E),r.push(M,T,p,T,M,b),o.push(n,n+1,n+2),n+=3;let h=S(C,_,B);m.push(...C,..._,...B),l.push(...h,...h,...h),r.push(M,b,p,T,p,b),o.push(n,n+1,n+2),n+=3}}const P=[0,d[0].y,0];if(d[0].x>.001)for(let a=0;a<e;a++){const c=s[a][0],f=s[a+1][0];let u=S(f,c,P);m.push(...f,...c,...P),l.push(...u,...u,...u);const v=(a+1)/e,g=a/e;r.push(v,0,g,0,.5,0),o.push(n,n+1,n+2),n+=3}const L=d[d.length-1],y=[0,L.y,0];if(L.x>.001)for(let a=0;a<e;a++){const c=s[a][d.length-1],f=s[a+1][d.length-1];let u=S(c,f,y);m.push(...c,...f,...y),l.push(...u,...u,...u);const v=a/e,g=(a+1)/e;r.push(v,1,g,1,.5,1),o.push(n,n+1,n+2),n+=3}return{positions:m,normals:l,textureCoords:r,indices:o}}var $=`#version 300 es\r
precision mediump float;

mat4 identity() {\r
    return mat4(\r
        1.0, 0.0, 0.0, 0.0,\r
        0.0, 1.0, 0.0, 0.0,\r
        0.0, 0.0, 1.0, 0.0,\r
        0.0, 0.0, 0.0, 1.0\r
    );\r
}

mat4 perspective(float fovy, float aspect, float near, float far) {\r
    float f = 1.0 / tan(fovy / 2.0);\r
    return mat4(\r
        f / aspect, 0.0, 0.0, 0.0,\r
        0.0, f, 0.0, 0.0,\r
        0.0, 0.0, (far + near) / (near - far), -1.0,\r
        0.0, 0.0, (2.0 * far * near) / (near - far), 0.0\r
    );\r
}

mat4 translate(mat4 m, vec3 v) {\r
    mat4 result = m;\r
    result[3] = m[0] * v.x + m[1] * v.y + m[2] * v.z + m[3];\r
    return result;\r
}

mat4 rotationX(float angle) {\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    return mat4(\r
        1.0, 0.0, 0.0, 0.0,\r
        0.0, c,   -s,  0.0,\r
        0.0, s,   c,   0.0,\r
        0.0, 0.0, 0.0, 1.0\r
    );\r
}

mat4 rotationY(float angle) {\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    return mat4(\r
        c,   0.0, s,   0.0,\r
        0.0, 1.0, 0.0, 0.0,\r
        -s,  0.0, c,   0.0,\r
        0.0, 0.0, 0.0, 1.0\r
    );\r
}

mat4 rotationZ(float angle) {\r
    float c = cos(angle);\r
    float s = sin(angle);\r
    return mat4(\r
        c,   -s,  0.0, 0.0,\r
        s,   c,   0.0, 0.0,\r
        0.0, 0.0, 1.0, 0.0,\r
        0.0, 0.0, 0.0, 1.0\r
    );\r
}

uniform vec4 uCameraParams; 
uniform vec4 uProjectionParams; 

in vec3 aVertexPosition;\r
in vec3 aVertexNormal;\r
in vec2 aTextureCoord;

out vec3 vNormal;\r
out vec3 vPosition;\r
out vec2 vTextureCoord;

const float snapFactor = 100.0;

void main() {\r
    
    float cameraAngleX = uCameraParams.x;\r
    float cameraAngleY = uCameraParams.y;\r
    float cameraDistance = uCameraParams.z;

    float fov = uProjectionParams.x;\r
    float aspectRatio = uProjectionParams.y;\r
    float near = uProjectionParams.z;\r
    float far = uProjectionParams.w;

    
    mat4 projMatrix = perspective(fov, aspectRatio, near, far);\r
    \r
    
    mat4 modelMatrix = mat4(1.0);

    
    mat4 rotXMatrix = rotationX(cameraAngleX);\r
    mat4 rotYMatrix = rotationY(cameraAngleY);\r
    \r
    
    mat4 translationMatrix = translate(identity(), vec3(0.0, 0.0, -cameraDistance));\r
    mat4 modelViewMatrix = translationMatrix * rotXMatrix * rotYMatrix * modelMatrix;\r
    \r
    
    mat3 normalMatrix = mat3(modelViewMatrix);\r
    vNormal = normalize(normalMatrix * aVertexNormal);\r
    \r
    vec4 worldPosition = modelViewMatrix * vec4(aVertexPosition, 1.0);\r
    vPosition = worldPosition.xyz;\r
    \r
    vTextureCoord = aTextureCoord;\r
    \r
    vec4 projectedPosition = projMatrix * worldPosition;

    
    projectedPosition.xyz /= projectedPosition.w; 
    projectedPosition.xy = floor(projectedPosition.xy * snapFactor) / snapFactor; 
    projectedPosition.xyz *= projectedPosition.w; 

    gl_Position = projectedPosition;\r
}`,Z=`#version 300 es
precision mediump float;

uniform vec3 uLightDirection;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;
uniform sampler2D uTexture;

in vec3 vNormal;
in vec3 vPosition;
in vec2 vTextureCoord;

out vec4 fragColor;

const mat2 bayerMatrix = mat2(
    0.0, 2.0,
    3.0, 1.0
) / 4.0;

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
}`,J=`#version 300 es\r
precision mediump float;

out vec4 fragColor;

void main() {\r
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);\r
}`;window.onload=()=>{const i=document.getElementById("glCanvas"),e=i.getContext("webgl2"),m=document.getElementById("fpsDisplay");if(!e)throw alert("WebGL 2 not supported"),new Error("WebGL 2 not supported");function l(){i.width=window.innerWidth,i.height=window.innerHeight,e.viewport(0,0,i.width,i.height)}l(),window.addEventListener("resize",l);function r(t,R){const x=e.createShader(R);return e.shaderSource(x,t),e.compileShader(x),e.getShaderParameter(x,e.COMPILE_STATUS)?x:(console.error("Shader compilation error:",e.getShaderInfoLog(x)),e.deleteShader(x),null)}const o=r($,e.VERTEX_SHADER),n=r(Z,e.FRAGMENT_SHADER),d=r(J,e.FRAGMENT_SHADER),s=e.createProgram();e.attachShader(s,o),e.attachShader(s,n),e.linkProgram(s);const P=e.createProgram();e.attachShader(P,o),e.attachShader(P,d),e.linkProgram(P),e.getProgramParameter(s,e.LINK_STATUS)||console.error("Shader program linking error:",e.getProgramInfoLog(s)),e.getProgramParameter(P,e.LINK_STATUS)||console.error("Wireframe program linking error:",e.getProgramInfoLog(P));const L={vertexPosition:e.getAttribLocation(s,"aVertexPosition"),vertexNormal:e.getAttribLocation(s,"aVertexNormal"),textureCoord:e.getAttribLocation(s,"aTextureCoord")},y={vertexPosition:e.getAttribLocation(P,"aVertexPosition"),vertexNormal:e.getAttribLocation(P,"aVertexNormal")},a={cameraParams:e.getUniformLocation(s,"uCameraParams"),projectionParams:e.getUniformLocation(s,"uProjectionParams"),lightDirection:e.getUniformLocation(s,"uLightDirection"),lightColor:e.getUniformLocation(s,"uLightColor"),ambientColor:e.getUniformLocation(s,"uAmbientColor"),texture:e.getUniformLocation(s,"uTexture")},c={cameraParams:e.getUniformLocation(P,"uCameraParams"),projectionParams:e.getUniformLocation(P,"uProjectionParams")},f=K(),u=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,u),e.bufferData(e.ARRAY_BUFFER,new Float32Array(f.positions),e.STATIC_DRAW);const v=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,v),e.bufferData(e.ARRAY_BUFFER,new Float32Array(f.normals),e.STATIC_DRAW);const g=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,g),e.bufferData(e.ARRAY_BUFFER,new Float32Array(f.textureCoords),e.STATIC_DRAW);const A=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,A),e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(f.indices),e.STATIC_DRAW);let _=f.indices.length;function C(t){const R=t.createTexture();t.bindTexture(t.TEXTURE_2D,R);const x=document.getElementById("textureImage");return t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,x),B(x.width)&&B(x.height)?t.generateMipmap(t.TEXTURE_2D):(t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR)),R}function B(t){return(t&t-1)==0}const M=C(e);let p=3;const T=.2,b=.2;let E=!1,h=-1,I=-1,F=0,N=0;const D=.005;let w=0,Y=performance.now()/1e3;const O=1e3/20;let V=performance.now();document.getElementById("zoomIn").addEventListener("click",()=>{p=Math.max(1,p-b)}),document.getElementById("zoomOut").addEventListener("click",()=>{p=Math.min(10,p+b)}),document.getElementById("rotateLeft").addEventListener("click",()=>{N+=T}),document.getElementById("rotateRight").addEventListener("click",()=>{N-=T}),document.getElementById("rotateUp").addEventListener("click",()=>{F=Math.min(Math.PI/2-.1,F+T)}),document.getElementById("rotateDown").addEventListener("click",()=>{F=Math.max(-Math.PI/2+.1,F-T)}),i.addEventListener("wheel",t=>{t.preventDefault();const R=t.deltaY*.01;p=Math.max(1,Math.min(10,p+R))});function X(t){requestAnimationFrame(X);const R=t-V;if(R<O)return;V=t-R%O,w++;const x=t/1e3,j=x-Y;if(j>=1){const U=w/j;m.textContent=`FPS: ${U.toFixed(2)}`,w=0,Y=x}e.clearColor(0,0,1,1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.useProgram(s),e.uniform4fv(a.cameraParams,[F,N,p,0]);const G=45*Math.PI/180,z=i.width/i.height,W=.1,H=100;e.uniform4fv(a.projectionParams,[G,z,W,H]),e.uniform3fv(a.lightDirection,[4,-10,-10]),e.uniform3fv(a.lightColor,[1,1,1]),e.uniform3fv(a.ambientColor,[.3,.3,.3]),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,M),e.uniform1i(a.texture,0),e.bindBuffer(e.ARRAY_BUFFER,u),e.vertexAttribPointer(L.vertexPosition,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(L.vertexPosition),e.bindBuffer(e.ARRAY_BUFFER,v),e.vertexAttribPointer(L.vertexNormal,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(L.vertexNormal),e.bindBuffer(e.ARRAY_BUFFER,g),e.vertexAttribPointer(L.textureCoord,2,e.FLOAT,!1,0,0),e.enableVertexAttribArray(L.textureCoord),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,A),e.drawElements(e.TRIANGLES,_,e.UNSIGNED_SHORT,0),e.useProgram(P),e.uniform4fv(c.cameraParams,[F,N,p,0]),e.uniform4fv(c.projectionParams,[G,z,W,H]),e.bindBuffer(e.ARRAY_BUFFER,u),e.vertexAttribPointer(y.vertexPosition,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(y.vertexPosition),e.bindBuffer(e.ARRAY_BUFFER,v),e.vertexAttribPointer(y.vertexNormal,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(y.vertexNormal),e.enable(e.POLYGON_OFFSET_FILL),e.polygonOffset(1,1),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,A);const k=_;if(k%3===0)for(let U=0;U<k;U+=3)e.drawElements(e.LINE_LOOP,3,e.UNSIGNED_SHORT,U*Uint16Array.BYTES_PER_ELEMENT);else console.warn("Wireframe rendering: bottle.indices.length is not a multiple of 3.");e.disable(e.POLYGON_OFFSET_FILL)}e.enable(e.DEPTH_TEST),requestAnimationFrame(X),i.addEventListener("mousedown",t=>{t.button===0&&(E=!0,h=t.clientX,I=t.clientY)}),i.addEventListener("mouseup",t=>{t.button===0&&(E=!1)}),i.addEventListener("mousemove",t=>{if(!E)return;const R=t.clientX-h,x=t.clientY-I;N+=R*D,F+=x*D,F=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,F)),h=t.clientX,I=t.clientY}),i.addEventListener("contextmenu",t=>t.preventDefault())};
