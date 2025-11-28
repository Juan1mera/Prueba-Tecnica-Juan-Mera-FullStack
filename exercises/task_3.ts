function rotateMatrix(matrix: number[][]): number[][] {
    const n = matrix.length;
    const rotated = Array(n).fill(0).map(() => Array(n).fill(0));
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            rotated[j][n - 1 - i] = matrix[i][j];
        }
    }
    
    return rotated;
}

// Tests
console.log("Matriz 2x2:");
console.log(rotateMatrix([[1, 2], [3, 4]]));

console.log("Matriz 3x3:");
console.log(rotateMatrix([[1, 2, 3], [4, 5, 6], [7, 8, 9]]));

console.log("Matriz 1x1:");
console.log(rotateMatrix([[1]]));