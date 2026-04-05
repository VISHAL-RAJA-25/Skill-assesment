const mongoose = require('mongoose');
const Question = require('./models/Question');

mongoose.connect('mongodb://localhost:27017/skillassessment');

const questions = [

  // ─── APTITUDE MCQ ───────────────────────────────────────────────
  {
    topic: 'aptitude', type: 'mcq', difficulty: 'easy',
    question: 'If a train travels 60 km in 1 hour, how far does it travel in 2.5 hours?',
    options: ['120 km', '150 km', '180 km', '200 km'],
    correctAnswer: '150 km',
    explanation: 'Distance = Speed × Time = 60 × 2.5 = 150 km'
  },
  {
    topic: 'aptitude', type: 'mcq', difficulty: 'easy',
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctAnswer: '30',
    explanation: '15/100 × 200 = 30'
  },
  {
    topic: 'aptitude', type: 'mcq', difficulty: 'easy',
    question: 'A shopkeeper buys an item for ₹80 and sells it for ₹100. What is the profit percentage?',
    options: ['20%', '25%', '30%', '15%'],
    correctAnswer: '25%',
    explanation: 'Profit% = (20/80) × 100 = 25%'
  },
  {
    topic: 'aptitude', type: 'mcq', difficulty: 'medium',
    question: 'Two pipes A and B can fill a tank in 12 and 18 hours respectively. If both are opened together, how many hours to fill?',
    options: ['6.2 hours', '7.2 hours', '8 hours', '9 hours'],
    correctAnswer: '7.2 hours',
    explanation: 'Combined rate = 1/12 + 1/18 = 5/36. Time = 36/5 = 7.2 hours'
  },
  {
    topic: 'aptitude', type: 'mcq', difficulty: 'medium',
    question: "The ratio of ages of A and B is 3:5. After 10 years the ratio becomes 5:7. What is A's current age?",
    options: ['15', '20', '25', '30'],
    correctAnswer: '15',
    explanation: '3x+10 / 5x+10 = 5/7 → x=5, A=15'
  },
  {
    topic: 'aptitude', type: 'mcq', difficulty: 'hard',
    question: 'A boat goes 30 km upstream in 6 hours and 30 km downstream in 3 hours. What is the speed of the stream?',
    options: ['2.5 km/h', '3 km/h', '4 km/h', '5 km/h'],
    correctAnswer: '2.5 km/h',
    explanation: 'Upstream=5, Downstream=10. Stream=(10-5)/2=2.5 km/h'
  },
  {
    topic: 'aptitude', type: 'mcq', difficulty: 'hard',
    question: 'How many ways can 6 people sit around a circular table?',
    options: ['120', '360', '720', '480'],
    correctAnswer: '120',
    explanation: 'Circular permutations = (n-1)! = 5! = 120'
  },

  // ─── NETWORKS MCQ ───────────────────────────────────────────────
  {
    topic: 'networks', type: 'mcq', difficulty: 'easy',
    question: 'What does IP stand for?',
    options: ['Internet Protocol', 'Internal Process', 'Integrated Port', 'Internet Port'],
    correctAnswer: 'Internet Protocol',
    explanation: 'IP stands for Internet Protocol, responsible for addressing and routing.'
  },
  {
    topic: 'networks', type: 'mcq', difficulty: 'easy',
    question: 'Which OSI layer is responsible for routing?',
    options: ['Layer 1', 'Layer 2', 'Layer 3', 'Layer 4'],
    correctAnswer: 'Layer 3',
    explanation: 'Layer 3 is the Network layer, responsible for logical addressing and routing.'
  },
  {
    topic: 'networks', type: 'mcq', difficulty: 'easy',
    question: 'What is the default port for HTTP?',
    options: ['21', '22', '80', '443'],
    correctAnswer: '80',
    explanation: 'HTTP uses port 80. HTTPS uses port 443.'
  },
  {
    topic: 'networks', type: 'mcq', difficulty: 'medium',
    question: 'Which protocol translates domain names to IP addresses?',
    options: ['DHCP', 'DNS', 'ARP', 'ICMP'],
    correctAnswer: 'DNS',
    explanation: 'DNS (Domain Name System) resolves domain names to IP addresses.'
  },
  {
    topic: 'networks', type: 'mcq', difficulty: 'medium',
    question: 'What is the subnet mask for a /24 network?',
    options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.128'],
    correctAnswer: '255.255.255.0',
    explanation: '/24 = 24 bits network, 8 bits host = 255.255.255.0'
  },
  {
    topic: 'networks', type: 'mcq', difficulty: 'hard',
    question: 'In TCP three-way handshake, what is the purpose of SYN-ACK?',
    options: [
      'Acknowledges the SYN and requests connection from server side',
      'Terminates the connection',
      'Sends data to client',
      'Resets the connection'
    ],
    correctAnswer: 'Acknowledges the SYN and requests connection from server side',
    explanation: 'SYN-ACK acknowledges the client SYN and simultaneously requests connection from server.'
  },
  {
    topic: 'networks', type: 'mcq', difficulty: 'hard',
    question: "Which routing protocol uses Dijkstra's algorithm?",
    options: ['RIP', 'BGP', 'OSPF', 'EIGRP'],
    correctAnswer: 'OSPF',
    explanation: 'OSPF (Open Shortest Path First) uses Dijkstra\'s algorithm for shortest path.'
  },

  // ─── SQL ────────────────────────────────────────────────────────
  {
    topic: 'sql', type: 'sql', difficulty: 'easy',
    question: 'Write a SQL query to get all employees from the employees table.',
    starterCode: `
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees VALUES (1,'Alice','Engineering',90000);
INSERT INTO employees VALUES (2,'Bob','Marketing',70000);
INSERT INTO employees VALUES (3,'Charlie','Engineering',85000);
INSERT INTO employees VALUES (4,'Diana','HR',65000);`,
    testCases: [{ description: 'Should return all 4 employees', input: '', expectedOutput: 'SELECT * FROM employees ORDER BY id' }],
    explanation: 'Use SELECT * FROM employees to retrieve all rows.'
  },
  {
    topic: 'sql', type: 'sql', difficulty: 'easy',
    question: 'Write a SQL query to get names of employees in the Engineering department.',
    starterCode: `
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees VALUES (1,'Alice','Engineering',90000);
INSERT INTO employees VALUES (2,'Bob','Marketing',70000);
INSERT INTO employees VALUES (3,'Charlie','Engineering',85000);
INSERT INTO employees VALUES (4,'Diana','HR',65000);`,
    testCases: [{ description: 'Should return Alice and Charlie', input: '', expectedOutput: "SELECT name FROM employees WHERE department='Engineering' ORDER BY name" }],
    explanation: "Use WHERE department = 'Engineering'"
  },
  {
    topic: 'sql', type: 'sql', difficulty: 'medium',
    question: 'Write a SQL query to find average salary per department. Return department and avg_salary.',
    starterCode: `
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees VALUES (1,'Alice','Engineering',90000);
INSERT INTO employees VALUES (2,'Bob','Marketing',70000);
INSERT INTO employees VALUES (3,'Charlie','Engineering',85000);
INSERT INTO employees VALUES (4,'Diana','HR',65000);
INSERT INTO employees VALUES (5,'Eve','Marketing',75000);`,
    testCases: [{ description: 'Avg salary per department', input: '', expectedOutput: 'SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department ORDER BY department' }],
    explanation: 'Use GROUP BY department with AVG(salary).'
  },
  {
    topic: 'sql', type: 'sql', difficulty: 'medium',
    question: 'Find all employees who earn more than the average salary.',
    starterCode: `
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees VALUES (1,'Alice','Engineering',90000);
INSERT INTO employees VALUES (2,'Bob','Marketing',70000);
INSERT INTO employees VALUES (3,'Charlie','Engineering',85000);
INSERT INTO employees VALUES (4,'Diana','HR',65000);
INSERT INTO employees VALUES (5,'Eve','Marketing',75000);`,
    testCases: [{ description: 'Employees above avg salary', input: '', expectedOutput: 'SELECT name,salary FROM employees WHERE salary>(SELECT AVG(salary) FROM employees) ORDER BY name' }],
    explanation: 'Use subquery: WHERE salary > (SELECT AVG(salary) FROM employees)'
  },
  {
    topic: 'sql', type: 'sql', difficulty: 'hard',
    question: 'Rank employees by salary within each department using ROW_NUMBER(). Return name, department, salary, rank.',
    starterCode: `
CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, department TEXT, salary INTEGER);
INSERT INTO employees VALUES (1,'Alice','Engineering',90000);
INSERT INTO employees VALUES (2,'Bob','Marketing',70000);
INSERT INTO employees VALUES (3,'Charlie','Engineering',85000);
INSERT INTO employees VALUES (4,'Diana','HR',65000);
INSERT INTO employees VALUES (5,'Eve','Marketing',75000);`,
    testCases: [{ description: 'Rank within departments', input: '', expectedOutput: 'SELECT name,department,salary,ROW_NUMBER() OVER(PARTITION BY department ORDER BY salary DESC) as rank FROM employees ORDER BY department,rank' }],
    explanation: 'Use ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC)'
  },

  // ─── DSA — Multi-language ────────────────────────────────────────
  {
    topic: 'dsa', type: 'code', difficulty: 'easy',
    question: `Sum of Array
Given an array of numbers, return their sum.

JavaScript: write function solve(input) — input is an array
Python:     write function solve(input) — input is a list
C++:        write void solve(string input) — parse JSON array from input string, print result
C:          write void solve(char* input) — parse array manually from input string, print result

Example: solve([1, 2, 3]) → 6`,
    starterCode: `// JavaScript
function solve(input) {
  // input is an array of numbers
  // return their sum
}`,
    starterCodeByLang: {
      javascript: `function solve(input) {
  // input is an array of numbers
  // return their sum
}`,
      python: `def solve(input):
    # input is a list of numbers
    # return their sum
    pass`,
      cpp: `// input arrives as JSON string via cin
// parse it and print the result to cout
void solve(string input) {
    // Example: input = "[1,2,3]"
    // Parse numbers and print sum
    int sum = 0;
    // your code here
    cout << sum << endl;
}`,
      c: `// input arrives as JSON string
// parse it and print result to stdout
void solve(char* input) {
    // Example: input = "[1,2,3]"
    int sum = 0;
    // your code here
    printf("%d\\n", sum);
}`
    },
    testCases: [
      { description: 'Sum of [1,2,3]', input: [1, 2, 3], expectedOutput: '6' },
      { description: 'Sum of [10,20,30]', input: [10, 20, 30], expectedOutput: '60' },
      { description: 'Sum of empty array', input: [], expectedOutput: '0' }
    ],
    explanation: 'Use a loop or reduce to add all elements.'
  },
  {
    topic: 'dsa', type: 'code', difficulty: 'easy',
    question: `Reverse a String
Given a string, return it reversed.

JavaScript: write function solve(input) — input is a string
Python:     write function solve(input) — input is a string
C++:        write void solve(string input) — input is JSON string (with quotes), print reversed
C:          write void solve(char* input) — input is JSON string, print reversed

Example: solve("hello") → "olleh"`,
    starterCode: `function solve(input) {
  // input is a string
  // return it reversed
}`,
    starterCodeByLang: {
      javascript: `function solve(input) {
  // input is a string
  // return it reversed
}`,
      python: `def solve(input):
    # input is a string
    # return it reversed
    pass`,
      cpp: `void solve(string input) {
    // input is a JSON string like "\"hello\""
    // strip quotes, reverse, print
    string s = input.substr(1, input.size()-2);
    reverse(s.begin(), s.end());
    cout << s << endl;
}`,
      c: `void solve(char* input) {
    // input is JSON string like "\"hello\""
    int len = strlen(input);
    // strip quotes
    char s[1024];
    strncpy(s, input+1, len-2);
    s[len-2] = '\\0';
    // reverse
    int n = strlen(s);
    for(int i=0;i<n/2;i++){char t=s[i];s[i]=s[n-1-i];s[n-1-i]=t;}
    printf("%s\\n", s);
}`
    },
    testCases: [
      { description: 'Reverse "hello"', input: 'hello', expectedOutput: '"olleh"' },
      { description: 'Reverse "abc"', input: 'abc', expectedOutput: '"cba"' },
      { description: 'Reverse ""', input: '', expectedOutput: '""' }
    ],
    explanation: 'Use reverse(), slicing [::-1], or a loop.'
  },
  {
    topic: 'dsa', type: 'code', difficulty: 'medium',
    question: `Two Sum
Given an array and a target, return indices of two numbers that add up to target.
input = { nums: [...], target: N }

JavaScript: write function solve(input) — return [i, j]
Python:     write function solve(input) — input is dict with 'nums' and 'target'
C++:        write void solve(string input) — parse JSON, print indices as "i j"
C:          write void solve(char* input) — parse JSON, print indices as "i j"

Example: solve({nums:[2,7,11,15], target:9}) → [0,1]`,
    starterCode: `function solve(input) {
  const { nums, target } = input;
  // use a hash map for O(n) solution
}`,
    starterCodeByLang: {
      javascript: `function solve(input) {
  const { nums, target } = input;
  // use a hash map for O(n) solution
}`,
      python: `def solve(input):
    nums = input['nums']
    target = input['target']
    # use a dictionary for O(n) solution
    pass`,
      cpp: `// For C++: parse the JSON manually or use simple parsing
// input format: {"nums":[2,7,11,15],"target":9}
// print two indices separated by space: "0 1"
void solve(string input) {
    // your code here
    // cout << i << " " << j << endl;
}`,
      c: `// For C: input is JSON string
// print two indices: "0 1"
void solve(char* input) {
    // your code here
    // printf("%d %d\\n", i, j);
}`
    },
    testCases: [
      { description: 'Two sum [2,7,11,15] target 9', input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: '[0,1]' },
      { description: 'Two sum [3,2,4] target 6', input: { nums: [3, 2, 4], target: 6 }, expectedOutput: '[1,2]' },
      { description: 'Two sum [3,3] target 6', input: { nums: [3, 3], target: 6 }, expectedOutput: '[0,1]' }
    ],
    explanation: 'Use a hash map: store complement (target - nums[i]) and check on each step.'
  },
  {
    topic: 'dsa', type: 'code', difficulty: 'medium',
    question: `Valid Palindrome
Check if a string is a valid palindrome (ignore non-alphanumeric, case-insensitive).
Return true or false.

JavaScript: write function solve(input) — return boolean
Python:     write function solve(input) — return bool
C++:        write void solve(string input) — print "true" or "false"
C:          write void solve(char* input) — print "true" or "false"

Example: solve("A man a plan a canal Panama") → true`,
    starterCode: `function solve(input) {
  // clean the string, then check palindrome
}`,
    starterCodeByLang: {
      javascript: `function solve(input) {
  // clean: keep only alphanumeric, lowercase
  // check if it equals its reverse
}`,
      python: `def solve(input):
    # clean: keep only alphanumeric, lowercase
    # check if it equals its reverse
    pass`,
      cpp: `void solve(string input) {
    // strip JSON quotes if present
    string s = (input[0]=='"') ? input.substr(1,input.size()-2) : input;
    string clean = "";
    for(char c : s) if(isalnum(c)) clean += tolower(c);
    string rev = clean;
    reverse(rev.begin(), rev.end());
    cout << (clean == rev ? "true" : "false") << endl;
}`,
      c: `void solve(char* input) {
    // strip JSON quotes
    char s[4096];
    int len = strlen(input);
    if(input[0]=='"'){strncpy(s,input+1,len-2);s[len-2]='\\0';}
    else strcpy(s,input);
    char clean[4096]; int ci=0;
    for(int i=0;s[i];i++) if(isalnum(s[i])) clean[ci++]=tolower(s[i]);
    clean[ci]='\\0';
    int n=strlen(clean); int ok=1;
    for(int i=0;i<n/2;i++) if(clean[i]!=clean[n-1-i]){ok=0;break;}
    printf("%s\\n", ok?"true":"false");
}`
    },
    testCases: [
      { description: 'Valid palindrome', input: 'A man a plan a canal Panama', expectedOutput: 'true' },
      { description: 'Not palindrome', input: 'race a car', expectedOutput: 'false' },
      { description: 'Empty string', input: '', expectedOutput: 'true' }
    ],
    explanation: 'Clean the string with regex/isalnum, then check if equals reverse.'
  },
  {
    topic: 'dsa', type: 'code', difficulty: 'hard',
    question: `Binary Search
Perform binary search on a sorted array. Return index if found, else -1.
input = { nums: [...], target: N }

JavaScript: write function solve(input) — return index or -1
Python:     write function solve(input) — return index or -1
C++:        write void solve(string input) — print index or -1
C:          write void solve(char* input) — print index or -1

Example: solve({nums:[-1,0,3,5,9,12], target:9}) → 4`,
    starterCode: `function solve(input) {
  const { nums, target } = input;
  let left = 0, right = nums.length - 1;
  // binary search here
}`,
    starterCodeByLang: {
      javascript: `function solve(input) {
  const { nums, target } = input;
  let left = 0, right = nums.length - 1;
  // binary search
}`,
      python: `def solve(input):
    nums = input['nums']
    target = input['target']
    left, right = 0, len(nums) - 1
    # binary search
    pass`,
      cpp: `// parse input JSON manually
// print found index or -1
void solve(string input) {
    // your binary search code here
    // cout << result << endl;
}`,
      c: `void solve(char* input) {
    // your binary search code here
    // printf("%d\\n", result);
}`
    },
    testCases: [
      { description: 'Target found at index 4', input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expectedOutput: '4' },
      { description: 'Target not found', input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expectedOutput: '-1' },
      { description: 'Single element found', input: { nums: [5], target: 5 }, expectedOutput: '0' }
    ],
    explanation: 'left=0, right=n-1. mid = Math.floor((left+right)/2). Shrink range each step.'
  },
  {
    topic: 'dsa', type: 'code', difficulty: 'hard',
    question: `Longest Increasing Subsequence (LIS)
Find the length of the longest strictly increasing subsequence.

JavaScript: write function solve(input) — input is array, return length
Python:     write function solve(input) — input is list, return length
C++:        write void solve(string input) — parse array, print length
C:          write void solve(char* input) — parse array, print length

Example: solve([10,9,2,5,3,7,101,18]) → 4`,
    starterCode: `function solve(input) {
  // dp[i] = LIS length ending at index i
  // for each i, check all j < i
}`,
    starterCodeByLang: {
      javascript: `function solve(input) {
  const n = input.length;
  if (n === 0) return 0;
  const dp = new Array(n).fill(1);
  // for each i, for each j < i, if input[j] < input[i]: dp[i] = max(dp[i], dp[j]+1)
}`,
      python: `def solve(input):
    n = len(input)
    if n == 0:
        return 0
    dp = [1] * n
    # fill dp using nested loop
    pass`,
      cpp: `void solve(string input) {
    // parse JSON array, compute LIS length, print it
    // your code here
    // cout << result << endl;
}`,
      c: `void solve(char* input) {
    // parse array from JSON string, compute LIS, print result
    // printf("%d\\n", result);
}`
    },
    testCases: [
      { description: 'LIS of [10,9,2,5,3,7,101,18]', input: [10, 9, 2, 5, 3, 7, 101, 18], expectedOutput: '4' },
      { description: 'LIS of [0,1,0,3,2,3]', input: [0, 1, 0, 3, 2, 3], expectedOutput: '4' },
      { description: 'All same elements', input: [7, 7, 7, 7], expectedOutput: '1' }
    ],
    explanation: 'DP: dp[i] = max LIS ending at i. Check all j < i where nums[j] < nums[i].'
  }
];

async function seed() {
  await Question.deleteMany({});
  await Question.insertMany(questions);
  console.log(`✅ Seeded ${questions.length} questions (MCQ + SQL + DSA multi-language)`);
  mongoose.disconnect();
}

seed().catch(err => { console.error(err); mongoose.disconnect(); });