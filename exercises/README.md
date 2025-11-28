# Ejercicios TypeScript

## 1. Palíndromo
Implementa una función que determine si una palabra o frase es un palíndromo, ignorando mayúsculas, acentos y espacios.

La función normaliza la cadena convirtiéndola a minúsculas, eliminando acentos y espacios, luego compara la cadena normalizada con su versión invertida para determinar si es palíndromo.

```typescript
function isPalindrome(word: string): boolean {
    const normalized = word
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");
    
    return normalized === normalized.split("").reverse().join("");
}
```

**Resultado:**
```
Aná: true
reconocer: true
A man a plan a canal Panama: true
hola: false
```

## 2. Lista sin duplicados
Dado un arreglo de objetos, devuelve una nueva lista sin duplicados según el campo id.

La función utiliza un Set para rastrear los IDs ya vistos y filter para crear un nuevo array que solo incluye la primera ocurrencia de cada ID, eliminando eficientemente los duplicados.

```typescript
function uniqueUsers(list: typeof users) {
    const seen = new Set<number>();
    return list.filter(user => {
        if (seen.has(user.id)) return false;
        seen.add(user.id);
        return true;
    });
}
```

**Resultado:**
```
Original: [{id:1,name:"Ana"},{id:2,name:"Carlos"},{id:1,name:"Ana 2"}]
Sin duplicados: [{id:1,name:"Ana"},{id:2,name:"Carlos"}]
Array vacío: []
```

## 3. Rotación de matriz
Dada una matriz NxN, retorna la matriz rotada 90° hacia la derecha sin usar librerías.

La función crea una nueva matriz y aplica la fórmula de rotación donde cada elemento [i][j] de la matriz original se coloca en la posición [j][n-1-i] de la matriz rotada, efectuando así un giro de 90 grados en sentido horario.

```typescript
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
```

**Resultado:**
```
Matriz 2x2: [[3,1],[4,2]]
Matriz 3x3: [[7,4,1],[8,5,2],[9,6,3]]
Matriz 1x1: [[1]]
```

**Extra**
Funcion para ver la matriz de forma mas comoda
```
function printMatrix(label: string, matrix: number[][]) {
    console.log(label);
    matrix.forEach(row => {
        console.log("[" + row.map(num => num.toString().padStart(2)).join(", ") + "]");
    });
    console.log("");
}
```

Ejemplo de uso
```
const matrix2 = [[1, 2], [3, 4]];
printMatrix("Original:", matrix2);
printMatrix("Rotada 90°:", rotateMatrix(matrix2));
```



Para estos ejercicios estuve usando [Typescript Playground](https://www.typescriptlang.org/es/play/?#code/GYVwdgxgLglg9mABAJzlAhlApgWU8mADwAoBbfIgLkTBFICMtkBtAXTYEpraGm23EAbwBQiMYggIAzlBqIAvInJQChAHQAbLGADmUABYBuUeMlgZKNJiwATBYgCCyZOgCexMBzXAYGjcQAGL3IAB2JiDgUAPkdnNw8vHz9Ajg5jcUQTMWA4ZERiLVkYewDDRGKAHhoymABqWsiRDIycvIKsWQArErLuqrBe+sas5ozUDGwbZk72JABaRABGRAWYVntlVWY16dZ00cQAXxHjjJHkDpBkJHHrG2Nj4VBIWAREEIIwKDwVIgL0RgaagyT46AA0SgohG4dEYLHYrGGGTMUjgWk0cB0-0BaRGmyI3lyAFF0BB9MRUAB3aJCEbI6RorAYrEAImYLMQtUslLUoQ8dBpPDUUDgAGVfroImoQugbOL0MgoMQAEypNSdOAwMDEFkQlmRLks1j6-ZiQ64+nmRnMnUm4SPAD0DsQABUsDIpMIUdaNJidfIA4gcA4XQAlACSAC1EMrCMqFAG7SjZPi4-ZmMxFhDlawIcwAMwQgAsrD2wg+Wu+UJ1AHkCDoteggbrIb847iK18fqodaGrDZ0IgAJwBAANlBbt2w3b+qdVuK9DPRvtZAcUwbDUcQ+cI+YT8iT0hTUL3igzWZjEPzucQzCLEIArBCAGw35gAdghAA4IUPS8ZOyrNta3rRtmwhVN8w7T4gJ7Fk+wwAdhzHCcISnXBq0g1JjEXK1lz9Fk1yDEMI2jRZCGWNdD3MY820o29M3-csYJnEgWTrGAGzAJtUNbVRFmgytWN7ftBxHcdJysadMKhAS0iAA)
