function isPalindrome(word: string): boolean {
    const normalized = word
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "");
    
    return normalized === normalized.split("").reverse().join("");
}

// Tests
console.log("Aná:", isPalindrome("Aná"));
console.log("reconocer:", isPalindrome("reconocer"));
console.log("A man a plan a canal Panama:", isPalindrome("A man a plan a canal Panama"));
console.log("hola:", isPalindrome("hola"));