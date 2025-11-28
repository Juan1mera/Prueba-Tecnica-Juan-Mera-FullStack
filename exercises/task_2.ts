function uniqueUsers(list: typeof users) {
    const seen = new Set<number>();
    return list.filter(user => {
        if (seen.has(user.id)) return false;
        seen.add(user.id);
        return true;
    });
}

const users = [
    { id: 1, name: "Ana" },
    { id: 2, name: "Carlos" },
    { id: 1, name: "Ana 2" },
];

// Tests
console.log("Original:", users);
console.log("Sin duplicados:", uniqueUsers(users));
console.log("Array vacío:", uniqueUsers([]));