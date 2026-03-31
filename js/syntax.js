// SYNTAX SURGE - Language Database
// Complete syntax bank for all programming languages

const SYNTAX_DATABASE = {
    javascript: {
        name: "JavaScript",
        color: "#f7df1e",
        bugs: [
            { name: "SyntaxError: Unexpected token", syntax: "console.log('Hello World');", damage: 15, castTime: 3.0 },
            { name: "ReferenceError: x is not defined", syntax: "let x = 10;", damage: 20, castTime: 2.8 },
            { name: "TypeError: undefined is not a function", syntax: "const greet = () => 'Hello';", damage: 25, castTime: 2.5 },
            { name: "Uncaught TypeError", syntax: "try { throw new Error('Oops'); } catch(e) {}", damage: 30, castTime: 2.2 },
            { name: "Promise Rejection", syntax: "Promise.resolve('Success').then(console.log);", damage: 35, castTime: 2.0 }
        ]
    },
    python: {
        name: "Python",
        color: "#3776ab",
        bugs: [
            { name: "IndentationError", syntax: "def hello():\n    print('Hello')", damage: 15, castTime: 3.0 },
            { name: "NameError", syntax: "name = 'Python'", damage: 20, castTime: 2.8 },
            { name: "ImportError", syntax: "import sys", damage: 25, castTime: 2.5 },
            { name: "KeyError", syntax: "d = {'key': 'value'}\nd['key']", damage: 30, castTime: 2.2 },
            { name: "AttributeError", syntax: "str.upper('hello')", damage: 35, castTime: 2.0 }
        ]
    },
    java: {
        name: "Java",
        color: "#b07219",
        bugs: [
            { name: "NullPointerException", syntax: "String text = 'Hello';", damage: 20, castTime: 2.8 },
            { name: "ArrayIndexOutOfBounds", syntax: "int[] arr = new int[5];\narr[0] = 1;", damage: 25, castTime: 2.5 },
            { name: "ClassNotFoundException", syntax: "public class Main {\n    public static void main(String[] args) {}\n}", damage: 30, castTime: 2.2 },
            { name: "IllegalArgumentException", syntax: "if (age < 0) throw new IllegalArgumentException();", damage: 35, castTime: 2.0 }
        ]
    },
    cpp: {
        name: "C++",
        color: "#004482",
        bugs: [
            { name: "Segmentation Fault", syntax: "int* ptr = new int(10);\ndelete ptr;", damage: 25, castTime: 2.5 },
            { name: "Memory Leak", syntax: "std::unique_ptr<int> ptr = std::make_unique<int>(10);", damage: 30, castTime: 2.2 },
            { name: "Buffer Overflow", syntax: "char buffer[10];\nstrcpy(buffer, 'test');", damage: 35, castTime: 2.0 },
            { name: "Dangling Pointer", syntax: "int* ptr = new int(5);\ndelete ptr;\nptr = nullptr;", damage: 40, castTime: 1.8 }
        ]
    },
    rust: {
        name: "Rust",
        color: "#dea584",
        bugs: [
            { name: "Borrow Checker Error", syntax: "let s = String::from('hello');\nprintln!('{}', s);", damage: 30, castTime: 2.2 },
            { name: "Lifetime Mismatch", syntax: "fn longest<'a>(x: &'a str, y: &'a str) -> &'a str { x }", damage: 35, castTime: 2.0 },
            { name: "Ownership Violation", syntax: "let s1 = String::from('hello');\nlet s2 = s1;", damage: 40, castTime: 1.8 },
            { name: "Pattern Matching Error", syntax: "match value { Some(x) => x, None => 0 }", damage: 45, castTime: 1.5 }
        ]
    }
};

// Language unlock progression
const LANGUAGE_PROGRESSION = ['javascript', 'python', 'java', 'cpp', 'rust'];

// Get bug for current language and wave
function getBugForWave(language, wave) {
    const langData = SYNTAX_DATABASE[language];
    if (!langData) return null;
    
    // More difficult bugs appear in later waves
    const bugIndex = Math.min(Math.floor(wave / 3), langData.bugs.length - 1);
    return { ...langData.bugs[bugIndex], language: language, languageName: langData.name };
}

// Validate user input against required syntax
function validateSyntax(userInput, requiredSyntax) {
    // Normalize both strings: trim, remove extra spaces, handle newlines
    const normalizedInput = userInput.trim().replace(/\s+/g, ' ');
    const normalizedRequired = requiredSyntax.trim().replace(/\s+/g, ' ');
    
    // Exact match required for precision
    return normalizedInput === normalizedRequired;
}

// Get available languages for player (based on highest wave achieved)
function getUnlockedLanguages(highestWave) {
    const unlocked = [];
    for (let i = 0; i < LANGUAGE_PROGRESSION.length; i++) {
        if (highestWave >= i * 5) { // Unlock new language every 5 waves
            unlocked.push(LANGUAGE_PROGRESSION[i]);
        }
    }
    return unlocked;
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SYNTAX_DATABASE, LANGUAGE_PROGRESSION, getBugForWave, validateSyntax, getUnlockedLanguages };
}
