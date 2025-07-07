(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))c(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&c(r)}).observe(document,{childList:!0,subtree:!0});function i(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function c(n){if(n.ep)return;n.ep=!0;const o=i(n);fetch(n.href,o)}})();function y(t,a,i){const c=[a[0]-t[0],a[1]-t[1],a[2]-t[2]],n=[i[0]-t[0],i[1]-t[1],i[2]-t[2]];let o=[c[1]*n[2]-c[2]*n[1],c[2]*n[0]-c[0]*n[2],c[0]*n[1]-c[1]*n[0]];const r=Math.sqrt(o[0]*o[0]+o[1]*o[1]+o[2]*o[2]);return r===0?[0,0,1]:(o[0]/=r,o[1]/=r,o[2]/=r,o)}const se=[[.14,-.97],[.21,-1],[.28,-1],[.32,-.9],[.32,-.82],[.28,-.65],[.28,-.51],[.31,-.14],[.31,.01],[.29,.22],[.24,.41],[.16,.59],[.14,.73],[.14,.88],[.15,.89],[.14,.96],[.16,.96],[.155,.98],[.14,1]];function ce(){const t=se,a=10,i=[],c=[],n=[],o=[];let r=0;if(!t||t.length<2)return console.error("Bottle profile must have at least 2 points."),{positions:i,normals:c,textureCoords:n,indices:o};const m=t.map(s=>({x:s[0],y:s[1]})),x=[];for(let s=0;s<=a;s++){const l=s/a*2*Math.PI,p=Math.sin(l),u=Math.cos(l),g=[];for(let P=0;P<m.length;P++){const R=m[P];g.push([R.x*u,R.y,R.x*p])}x.push(g)}for(let s=0;s<a;s++)for(let l=0;l<m.length-1;l++){const p=x[s],u=x[s+1],g=m[l],P=m[l+1],R=p[l],_=u[l],b=p[l+1],w=u[l+1],S=s/a,N=(s+1)/a,F=l/(m.length-1),C=(l+1)/(m.length-1);if(Math.abs(P.x)<.001){const E=[0,P.y,0];let h=y(R,_,E);i.push(...R,..._,...E),c.push(...h,...h,...h),n.push(S,F,N,F,.5,C),o.push(r,r+1,r+2),r+=3}else if(Math.abs(g.x)<.001){const E=[0,g.y,0];let h=y(w,b,E);i.push(...w,...b,...E),c.push(...h,...h,...h),n.push(N,C,S,C,.5,F),o.push(r,r+1,r+2),r+=3}else{let E=y(R,_,b);i.push(...R,..._,...b),c.push(...E,...E,...E),n.push(S,F,N,F,S,C),o.push(r,r+1,r+2),r+=3;let h=y(b,_,w);i.push(...b,..._,...w),c.push(...h,...h,...h),n.push(S,C,N,F,N,C),o.push(r,r+1,r+2),r+=3}}const T=[0,m[0].y,0];if(m[0].x>.001)for(let s=0;s<a;s++){const l=x[s][0],p=x[s+1][0];let u=y(p,l,T);i.push(...p,...l,...T),c.push(...u,...u,...u);const g=(s+1)/a,P=s/a;n.push(g,0,P,0,.5,0),o.push(r,r+1,r+2),r+=3}const k=m[m.length-1],q=[0,k.y,0];if(k.x>.001)for(let s=0;s<a;s++){const l=x[s][m.length-1],p=x[s+1][m.length-1];let u=y(l,p,q);i.push(...l,...p,...q),c.push(...u,...u,...u);const g=s/a,P=(s+1)/a;n.push(g,1,P,1,.5,1),o.push(r,r+1,r+2),r+=3}return{positions:i,normals:c,textureCoords:n,indices:o}}var le=`#version 300 es\r
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
}`,me=`#version 300 es
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
}`,fe=`#version 300 es\r
precision mediump float;

out vec4 fragColor;

void main() {\r
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);\r
}`;const d=document.getElementById("glCanvas"),e=d.getContext("webgl2"),ue=document.getElementById("fpsDisplay");if(!e)throw alert("WebGL 2 not supported"),new Error("WebGL 2 not supported");function re(){d.width=window.innerWidth,d.height=window.innerHeight,e.viewport(0,0,d.width,d.height)}re();window.addEventListener("resize",re);function W(t,a){const i=e.createShader(a);return e.shaderSource(i,t),e.compileShader(i),e.getShaderParameter(i,e.COMPILE_STATUS)?i:(console.error("Shader compilation error:",e.getShaderInfoLog(i)),e.deleteShader(i),null)}const ne=W(le,e.VERTEX_SHADER),de=W(me,e.FRAGMENT_SHADER),he=W(fe,e.FRAGMENT_SHADER),f=e.createProgram();e.attachShader(f,ne);e.attachShader(f,de);e.linkProgram(f);const v=e.createProgram();e.attachShader(v,ne);e.attachShader(v,he);e.linkProgram(v);e.getProgramParameter(f,e.LINK_STATUS)||console.error("Shader program linking error:",e.getProgramInfoLog(f));e.getProgramParameter(v,e.LINK_STATUS)||console.error("Wireframe program linking error:",e.getProgramInfoLog(v));const B={vertexPosition:e.getAttribLocation(f,"aVertexPosition"),vertexNormal:e.getAttribLocation(f,"aVertexNormal"),textureCoord:e.getAttribLocation(f,"aTextureCoord")},D={vertexPosition:e.getAttribLocation(v,"aVertexPosition"),vertexNormal:e.getAttribLocation(v,"aVertexNormal")},M={cameraParams:e.getUniformLocation(f,"uCameraParams"),projectionParams:e.getUniformLocation(f,"uProjectionParams"),lightDirection:e.getUniformLocation(f,"uLightDirection"),lightColor:e.getUniformLocation(f,"uLightColor"),ambientColor:e.getUniformLocation(f,"uAmbientColor"),texture:e.getUniformLocation(f,"uTexture")},K={cameraParams:e.getUniformLocation(v,"uCameraParams"),projectionParams:e.getUniformLocation(v,"uProjectionParams")},I=ce(),V=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,V);e.bufferData(e.ARRAY_BUFFER,new Float32Array(I.positions),e.STATIC_DRAW);const X=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,X);e.bufferData(e.ARRAY_BUFFER,new Float32Array(I.normals),e.STATIC_DRAW);const oe=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,oe);e.bufferData(e.ARRAY_BUFFER,new Float32Array(I.textureCoords),e.STATIC_DRAW);const j=e.createBuffer();e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,j);e.bufferData(e.ELEMENT_ARRAY_BUFFER,new Uint16Array(I.indices),e.STATIC_DRAW);let $=I.indices.length;function xe(t){const a=t.createTexture();t.bindTexture(t.TEXTURE_2D,a);const i=document.getElementById("textureImage");return t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,i),Z(i.width)&&Z(i.height)?t.generateMipmap(t.TEXTURE_2D):(t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR)),a}function Z(t){return(t&t-1)==0}const pe=xe(e);let L=3;const Y=.2,ae=.2;let H=!1,G=-1,z=-1,A=0,U=0;const J=.005;let O=0,Q=performance.now()/1e3;const Pe=20,ee=1e3/Pe;let te=performance.now();document.getElementById("zoomIn").addEventListener("click",()=>{L=Math.max(1,L-ae)});document.getElementById("zoomOut").addEventListener("click",()=>{L=Math.min(10,L+ae)});document.getElementById("rotateLeft").addEventListener("click",()=>{U+=Y});document.getElementById("rotateRight").addEventListener("click",()=>{U-=Y});document.getElementById("rotateUp").addEventListener("click",()=>{A=Math.min(Math.PI/2-.1,A+Y)});document.getElementById("rotateDown").addEventListener("click",()=>{A=Math.max(-Math.PI/2+.1,A-Y)});d.addEventListener("wheel",t=>{t.preventDefault();const a=t.deltaY*.01;L=Math.max(1,Math.min(10,L+a))});function ie(t){requestAnimationFrame(ie);const a=t-te;if(a<ee)return;te=t-a%ee,O++;const i=t/1e3,c=i-Q;if(c>=1){const T=O/c;ue.textContent=`FPS: ${T.toFixed(2)}`,O=0,Q=i}e.clearColor(0,0,1,1),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT),e.useProgram(f),e.uniform4fv(M.cameraParams,[A,U,L,0]);const n=45*Math.PI/180,o=d.width/d.height,r=.1,m=100;e.uniform4fv(M.projectionParams,[n,o,r,m]),e.uniform3fv(M.lightDirection,[4,-10,-10]),e.uniform3fv(M.lightColor,[1,1,1]),e.uniform3fv(M.ambientColor,[.3,.3,.3]),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,pe),e.uniform1i(M.texture,0),e.bindBuffer(e.ARRAY_BUFFER,V),e.vertexAttribPointer(B.vertexPosition,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(B.vertexPosition),e.bindBuffer(e.ARRAY_BUFFER,X),e.vertexAttribPointer(B.vertexNormal,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(B.vertexNormal),e.bindBuffer(e.ARRAY_BUFFER,oe),e.vertexAttribPointer(B.textureCoord,2,e.FLOAT,!1,0,0),e.enableVertexAttribArray(B.textureCoord),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,j),e.drawElements(e.TRIANGLES,$,e.UNSIGNED_SHORT,0),e.useProgram(v),e.uniform4fv(K.cameraParams,[A,U,L,0]),e.uniform4fv(K.projectionParams,[n,o,r,m]),e.bindBuffer(e.ARRAY_BUFFER,V),e.vertexAttribPointer(D.vertexPosition,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(D.vertexPosition),e.bindBuffer(e.ARRAY_BUFFER,X),e.vertexAttribPointer(D.vertexNormal,3,e.FLOAT,!1,0,0),e.enableVertexAttribArray(D.vertexNormal),e.enable(e.POLYGON_OFFSET_FILL),e.polygonOffset(1,1),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,j);const x=$;if(x%3===0)for(let T=0;T<x;T+=3)e.drawElements(e.LINE_LOOP,3,e.UNSIGNED_SHORT,T*Uint16Array.BYTES_PER_ELEMENT);else console.warn("Wireframe rendering: bottle.indices.length is not a multiple of 3.");e.disable(e.POLYGON_OFFSET_FILL)}e.enable(e.DEPTH_TEST);requestAnimationFrame(ie);d.addEventListener("mousedown",t=>{t.button===0&&(H=!0,G=t.clientX,z=t.clientY)});d.addEventListener("mouseup",t=>{t.button===0&&(H=!1)});d.addEventListener("mousemove",t=>{if(!H)return;const a=t.clientX-G,i=t.clientY-z;U+=a*J,A+=i*J,A=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,A)),G=t.clientX,z=t.clientY});d.addEventListener("contextmenu",t=>t.preventDefault());
