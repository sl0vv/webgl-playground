
function calculateFaceNormal(v1, v2, v3) {
    // Create vectors from vertices
    const a = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const b = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];
    
    // Cross product
    let normal = [ // Use 'let' if reassigning for flipping
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
    
    // Normalize
    const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
    if (length === 0) return [0,0,1]; // Should not happen for non-degenerate triangles

    normal[0] /= length;
    normal[1] /= length;
    normal[2] /= length;
    
    return normal;
}

const bottleProfile = [
    [0.14, -0.97],
    [0.21, -1],
    [0.28, -1],
    [0.32, -0.9],
    [0.32, -0.82],
    [0.28, -0.65],
    [0.28, -0.51],
    [0.31, -0.14],
    [0.31, 0.01],
    [0.29, 0.22],
    [0.24, 0.41],
    [0.16, 0.59],
    [0.14, 0.73],
    [0.14, 0.88],
    [0.15, 0.89],
    [0.14, 0.96],
    [0.16, 0.96],
    [0.155, 0.98],
    [0.14, 1]
];

export function createBottle() {
    const profilePoints = bottleProfile;
    const numSegments = 10;

    const positions = [];
    const normals = [];
    const textureCoords = [];
    const indices = [];
    let currentIndex = 0;

    // Validate profile points
    if (!profilePoints || profilePoints.length < 2) {
        console.error("Bottle profile must have at least 2 points.");
        return { positions, normals, textureCoords, indices };
    }

    const profileVertices = profilePoints.map(p => ({ x: p[0], y: p[1] }));

    // Generate vertices by rotating the profile
    const rings = [];
    for (let i = 0; i <= numSegments; i++) {
        const angle = (i / numSegments) * 2 * Math.PI;
        const sinA = Math.sin(angle);
        const cosA = Math.cos(angle);
        const ring = [];
        for (let j = 0; j < profileVertices.length; j++) {
            const p = profileVertices[j];
            ring.push([
                p.x * cosA, // x
                p.y,         // y
                p.x * sinA  // z
            ]);
        }
        rings.push(ring);
    }

    // Generate faces (sides of the bottle)
    for (let i = 0; i < numSegments; i++) {
        for (let j = 0; j < profileVertices.length - 1; j++) {
            const r1 = rings[i];
            const r2 = rings[i+1];

            const p_curr = profileVertices[j];
            const p_next = profileVertices[j+1];

            const v1 = r1[j]; // Current profile point on ring i
            const v2 = r2[j]; // Current profile point on ring i+1
            const v3 = r1[j+1]; // Next profile point on ring i
            const v4 = r2[j+1]; // Next profile point on ring i+1

            // Calculate texture coordinates for this segment
            const u1 = i / numSegments;
            const u2 = (i + 1) / numSegments;
            const v_curr = j / (profileVertices.length - 1);
            const v_next = (j + 1) / (profileVertices.length - 1);

            if (Math.abs(p_next.x) < 0.001) { // Next point is on axis
                const axisPointNext = [0, p_next.y, 0]; 
                // Triangle: (v1, v2, axisPointNext) - fanning into the axis
                let faceNormal = calculateFaceNormal(v1, v2, axisPointNext);
                positions.push(...v1, ...v2, ...axisPointNext);
                normals.push(...faceNormal, ...faceNormal, ...faceNormal);
                textureCoords.push(u1, v_curr, u2, v_curr, 0.5, v_next);
                indices.push(currentIndex, currentIndex + 1, currentIndex + 2);
                currentIndex += 3;
            } else if (Math.abs(p_curr.x) < 0.001) { // Current point is on axis
                const axisPointCurr = [0, p_curr.y, 0];
                // Triangle: (v4, v3, axisPointCurr) - fanning out from the axis
                // (Order v4, v3, axisPointCurr to maintain outward normal with (v3-v4)x(axisPointCurr-v4))
                let faceNormal = calculateFaceNormal(v4, v3, axisPointCurr);
                positions.push(...v4, ...v3, ...axisPointCurr);
                normals.push(...faceNormal, ...faceNormal, ...faceNormal);
                textureCoords.push(u2, v_next, u1, v_next, 0.5, v_curr);
                indices.push(currentIndex, currentIndex + 1, currentIndex + 2);
                currentIndex += 3;
            } else { // Standard quad
                // Triangle 1: (v1, v2, v3)
                let faceNormal1 = calculateFaceNormal(v1, v2, v3);
                positions.push(...v1, ...v2, ...v3);
                normals.push(...faceNormal1, ...faceNormal1, ...faceNormal1);
                textureCoords.push(u1, v_curr, u2, v_curr, u1, v_next);
                indices.push(currentIndex, currentIndex + 1, currentIndex + 2);
                currentIndex += 3;

                // Triangle 2: (v3, v2, v4)
                let faceNormal2 = calculateFaceNormal(v3, v2, v4);
                positions.push(...v3, ...v2, ...v4);
                normals.push(...faceNormal2, ...faceNormal2, ...faceNormal2);
                textureCoords.push(u1, v_next, u2, v_curr, u2, v_next);
                indices.push(currentIndex, currentIndex + 1, currentIndex + 2);
                currentIndex += 3;
            }
        }
    }

    // Create bottom cap (fan of triangles from the first profile point)
    const bottomCenter = [0, profileVertices[0].y, 0];
    if (profileVertices[0].x > 0.001) { // Only create cap if base is not a point
        for (let i = 0; i < numSegments; i++) {
            const v1 = rings[i][0];
            const v2 = rings[i+1][0];
            // Ensure bottom center is distinct for normal calculation if needed,
            // but for flat shading, use the triangle points.
            let faceNormal = calculateFaceNormal(v2, v1, bottomCenter); // Winding order for outward normal
            positions.push(...v2, ...v1, ...bottomCenter);
            normals.push(...faceNormal, ...faceNormal, ...faceNormal);
            // Bottom cap texture coordinates - radial mapping
            const u1 = (i + 1) / numSegments;
            const u2 = i / numSegments;
            textureCoords.push(u1, 0.0, u2, 0.0, 0.5, 0.0);
            indices.push(currentIndex, currentIndex + 1, currentIndex + 2);
            currentIndex += 3;
        }
    }
    
    // Create top cap (fan of triangles from the last profile point)
    // Optional: if bottle neck is open, this might not be desired or be different.
    const topProfilePoint = profileVertices[profileVertices.length - 1];
    const topCenter = [0, topProfilePoint.y, 0];
    if (topProfilePoint.x > 0.001) { // Only create cap if top is not a point
         for (let i = 0; i < numSegments; i++) {
            const v1 = rings[i][profileVertices.length - 1];
            const v2 = rings[i+1][profileVertices.length - 1];
            let faceNormal = calculateFaceNormal(v1, v2, topCenter); // Winding order for outward normal
            positions.push(...v1, ...v2, ...topCenter);
            normals.push(...faceNormal, ...faceNormal, ...faceNormal);
            // Top cap texture coordinates - radial mapping
            const u1 = i / numSegments;
            const u2 = (i + 1) / numSegments;
            textureCoords.push(u1, 1.0, u2, 1.0, 0.5, 1.0);
            indices.push(currentIndex, currentIndex + 1, currentIndex + 2);
            currentIndex += 3;
        }
    }

    return { positions, normals, textureCoords, indices };
} 