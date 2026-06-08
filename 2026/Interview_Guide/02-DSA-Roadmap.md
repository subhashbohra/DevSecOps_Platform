# 02 — DSA Roadmap

> A serious, pattern-first DSA handbook for an experienced engineer. You are not learning to code — you are re-loading interview muscle memory and the *communication* discipline that senior loops score. Aim for **fluency in patterns**, not memorization of problems.

---

## Part A — DSA Strategy for Experienced Engineers

### How Google evaluates coding

Google scores each coding round on four axes (the actual rubric language varies, but it reduces to this):

1. **General Cognitive Ability (problem-solving):** Can you decompose an ambiguous problem, find structure, and reason about correctness?
2. **Coding:** Clean, idiomatic, *working* code. They run it mentally (sometimes literally). Bugs hurt.
3. **Communication:** You narrate your thinking *before* and *while* coding. Silent solving is a red flag even if correct.
4. **Data structures & algorithms knowledge:** You pick the right tool and discuss complexity without prompting.

At **L6**, they additionally probe *design sense within the coding problem* — extensibility, edge-case discipline, how you'd productionize it. A perfect L5 answer can still miss L6 if you don't show judgment.

> **Google reality:** ~2 medium problems per 45-min round, or 1 hard. They care more about *how you got there* than getting the optimal solution in the first 60 seconds.

### How Atlassian evaluates coding

Atlassian is more **practical / applied** than Google. Expect:

- Realistic, sometimes "messy" problems closer to real engineering than pure algorithm puzzles.
- Strong emphasis on **clean code, testing instinct, and incremental development** — they value engineers who'd write maintainable code.
- A dedicated **values interview** — Atlassian weights culture heavily. (See `05-Atlassian-Interview-Guide.md`.)
- For Principal: less raw LeetCode-hard, more "can you build a working thing well and reason about it," plus heavy system design and leadership.

### How the others lean

- **Pure Storage / NVIDIA:** more systems-y. Expect C/C++ or language-agnostic problems with a low-level flavor (memory, concurrency, data structures from scratch). Strong CS fundamentals.
- **AWS:** coding rounds exist but are *paired with* Leadership Principles relentlessly. Every coding answer is also a behavioral signal (see `14-Leadership-Principles.md`).

### Common mistakes senior engineers make

1. **Jumping to code.** You've solved 10,000 problems in your career, so you start typing. Interviewers read this as "doesn't clarify requirements." *Always* restate, ask, and outline first.
2. **Going silent.** Years of solo deep work make you internalize. In interviews, internal = invisible = no signal. Narrate.
3. **Over-engineering.** You design for production. The interviewer wants a clean algorithm. Solve the asked problem first, *then* discuss productionization if there's time.
4. **Rusty syntax.** You architect more than you code now. Off-by-one and language fumbles cost you. Re-warm a single language to fluency.
5. **Ignoring complexity until asked.** State time/space *proactively*. It signals maturity.
6. **Defending a wrong first idea.** Seniority can make you stubborn. Treat interviewer hints as gold; pivot fast.
7. **Not testing.** Walk through your code with a concrete input before declaring done. Catch your own bugs.

### The interview communication framework (use this every single time)

```
1. RESTATE   — "So we need to ... given ... returning ..."
2. CLARIFY   — inputs, ranges, edge cases, duplicates, empty, sorted?
3. EXAMPLES  — work one small example by hand
4. APPROACH  — state brute force, then the optimization + WHY
5. COMPLEXITY— state target time/space BEFORE coding
6. CODE      — narrate as you go, name variables well
7. TEST      — trace a real input; check edges
8. ITERATE   — discuss improvements, follow-ups, productionization
```

> Print this. Tape it to your monitor. It is the difference between a "hire" and a "no hire" for equally-skilled candidates.

- [ ] I have internalized the 8-step framework.
- [ ] I have picked **one** primary language and re-warmed its idioms.

---

## Part B — The 15 Patterns

For each pattern: what it is, how to *recognize* it, the complexity profile, and an interview tip.

### 1. Arrays
- **Pattern:** Direct index manipulation, prefix sums, in-place rearrangement, sorting as a preprocessing step.
- **Recognition cues:** "subarray," "contiguous," "in-place," "without extra space," range queries.
- **Complexity:** Access O(1), search O(n), sort O(n log n). Prefix sums turn range-sum queries into O(1) after O(n) setup.
- **Interview tip:** Ask about mutability and whether you can sort. Sorting often unlocks a two-pointer/binary-search solution. Watch index bounds.

### 2. HashMaps / Hashing
- **Pattern:** Trade space for time — O(1) lookup to remove an inner loop. Frequency counts, seen-sets, complement lookups.
- **Recognition cues:** "have we seen," "count of," "pair that sums to," "first unique," "group by."
- **Complexity:** Average O(1) insert/lookup; O(n) space. Worst-case O(n) per op with bad hashing (rare in interviews).
- **Interview tip:** The classic move from O(n²) → O(n) is "store complements/seen in a hashmap." Mention load factor / collisions only if asked.

### 3. Sliding Window
- **Pattern:** A moving range over a sequence; expand right, shrink left, maintain an invariant.
- **Recognition cues:** "longest/shortest substring/subarray," "at most K," "contiguous + condition."
- **Complexity:** O(n) — each element enters and leaves the window once.
- **Interview tip:** Distinguish *fixed-size* (window of size k) from *variable-size* (grow/shrink to satisfy a constraint). State which one and your shrink condition explicitly.

### 4. Two Pointers
- **Pattern:** Two indices moving toward/with each other, usually on sorted data or linked structures.
- **Recognition cues:** "sorted array," "pair/triplet," "palindrome," "remove duplicates in place," "merge."
- **Complexity:** O(n) after any required O(n log n) sort.
- **Interview tip:** Opposite-end pointers for sorted-sum problems; fast/slow for cycles and midpoints. Say *why* sorting enables the two-pointer move.

### 5. Binary Search
- **Pattern:** Halve the search space using a monotonic property. Also "binary search on the answer."
- **Recognition cues:** "sorted," "find threshold," "minimize the maximum," "first/last position," O(log n) target.
- **Complexity:** O(log n) per search.
- **Interview tip:** Get the boundary template right (lo/hi, mid, when to move which). The advanced signal is recognizing *binary search on a value range* (e.g., "minimum capacity to ship in D days").

### 6. Linked Lists
- **Pattern:** Pointer manipulation — reversal, cycle detection, merge, reorder.
- **Recognition cues:** "in-place reverse," "detect cycle," "kth from end," "merge sorted lists."
- **Complexity:** O(n) time, O(1) space achievable for most.
- **Interview tip:** Use a **dummy head** to simplify edge cases. Draw the pointers. Fast/slow pointers solve cycle + midpoint elegantly.

### 7. Stack
- **Pattern:** LIFO; track "most recent unmatched" — parentheses, monotonic stacks, expression eval.
- **Recognition cues:** "valid parentheses," "next greater element," "nearest smaller," "undo," "evaluate expression."
- **Complexity:** O(n) for monotonic-stack scans.
- **Interview tip:** **Monotonic stack** is the high-signal trick — recognize "next greater/smaller" problems and reach for it. Explain the invariant you maintain.

### 8. Queue
- **Pattern:** FIFO; BFS frontier, sliding-window maxima (deque), rate-limiting/streaming.
- **Recognition cues:** "level by level," "shortest steps," "process in order," "moving max/min."
- **Complexity:** O(1) enqueue/dequeue; deque enables O(n) window max.
- **Interview tip:** Queues power BFS — see Graphs/Trees. A **monotonic deque** gives O(n) sliding-window max; know it.

### 9. Trees
- **Pattern:** Recursion over hierarchical data; DFS (pre/in/post) and BFS traversals.
- **Recognition cues:** "binary tree," "root-to-leaf," "depth/height," "level order," "lowest common ancestor."
- **Complexity:** O(n) visit; recursion stack O(h), h = height.
- **Interview tip:** Decide DFS vs BFS by the question. "Return a value bubbling up" → post-order DFS. "Level info" → BFS. State your traversal choice and why.

### 10. Binary Search Trees (BST)
- **Pattern:** Ordered tree; in-order traversal yields sorted order; search/insert in O(h).
- **Recognition cues:** "BST," "kth smallest," "validate BST," "range queries on a tree," "successor."
- **Complexity:** O(h): O(log n) balanced, O(n) skewed.
- **Interview tip:** The killer fact: **in-order traversal of a BST is sorted.** Many BST problems reduce to "do something during in-order."

### 11. Heap / Priority Queue
- **Pattern:** Always access the min/max; top-K, merge-K, streaming medians, scheduling.
- **Recognition cues:** "top K," "K closest," "merge K sorted," "running median," "most frequent."
- **Complexity:** push/pop O(log n); building a heap O(n); top-K of n is O(n log k).
- **Interview tip:** For "top K largest," use a **min-heap of size K** (counter-intuitive but optimal). Two heaps for streaming median.

### 12. Graph
- **Pattern:** Nodes + edges; BFS/DFS, topological sort, union-find, shortest path (Dijkstra/BFS).
- **Recognition cues:** "connected components," "dependencies/ordering," "shortest path," "islands/grid," "cycle in directed graph."
- **Complexity:** BFS/DFS O(V+E); Dijkstra O(E log V); union-find ~O(α(n)).
- **Interview tip:** Treat grids as implicit graphs. For ordering/dependency problems, say "topological sort." For dynamic connectivity, say "union-find." Naming the technique *is* signal.

### 13. Trie
- **Pattern:** Prefix tree for strings; fast prefix queries, autocomplete, word search.
- **Recognition cues:** "prefix," "dictionary," "autocomplete," "word search II," "starts with."
- **Complexity:** insert/search O(L), L = word length; space heavy.
- **Interview tip:** Reach for a trie when there are *many* prefix queries over a word set; explain the space/time tradeoff vs a hashset.

### 14. Backtracking
- **Pattern:** Build candidates incrementally; abandon ("prune") when a partial solution can't work. Permutations, combinations, subsets, constraint puzzles.
- **Recognition cues:** "all combinations/permutations/subsets," "N-Queens," "Sudoku," "generate all valid …."
- **Complexity:** Often exponential — that's expected; the skill is *pruning*.
- **Interview tip:** State the recursion tree, the choice at each level, and the prune condition explicitly. Mention complexity is exponential and that's inherent.

### 15. Dynamic Programming
- **Pattern:** Optimal substructure + overlapping subproblems. Define state, transition, base case; memoize or tabulate.
- **Recognition cues:** "min/max ways," "count of ways," "can you partition," "longest X," "edit distance," constraints ~ "≤ 1000."
- **Complexity:** Usually O(states × transition).
- **Interview tip:** The senior move is to **define the state precisely in words first** ("dp[i][j] = min cost to …"), then the recurrence, *then* code. Start top-down (memoized recursion) — it's easier to reason about — and convert to bottom-up only if asked or for space.

- [ ] I can recognize each of the 15 patterns from cues in under 30 seconds.

---

## Part C — Curated Problem Sets

> Format: ✅ checkbox · linked name · difficulty · pattern · why asked · target complexity · notes.
> Work the **MUST KNOW 60** first. Don't move on until you can re-solve from scratch in one sitting.

### 🔴 MUST KNOW — 60 problems

| ✓ | Problem | Diff | Pattern | Why companies ask | Complexity | Notes |
|---|---------|------|---------|-------------------|------------|-------|
| [ ] | [Two Sum](https://leetcode.com/problems/two-sum/) | Easy | HashMap | Tests the O(n²)→O(n) hashmap instinct | O(n)/O(n) | |
| [ ] | [Best Time to Buy/Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) | Easy | Arrays | One-pass min-tracking | O(n)/O(1) | |
| [ ] | [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/) | Easy | HashMap | Set membership baseline | O(n)/O(n) | |
| [ ] | [Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/) | Med | Arrays | Prefix/suffix products, no division | O(n)/O(1) | |
| [ ] | [Maximum Subarray](https://leetcode.com/problems/maximum-subarray/) | Med | Arrays/DP | Kadane's algorithm classic | O(n)/O(1) | |
| [ ] | [Valid Anagram](https://leetcode.com/problems/valid-anagram/) | Easy | HashMap | Frequency counting | O(n)/O(1) | |
| [ ] | [Group Anagrams](https://leetcode.com/problems/group-anagrams/) | Med | HashMap | Canonical-key grouping | O(nk)/O(nk) | |
| [ ] | [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/) | Med | Heap | Top-K with heap/bucket | O(n log k) | |
| [ ] | [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/) | Easy | Two Pointers | Clean two-pointer scan | O(n)/O(1) | |
| [ ] | [Two Sum II (sorted)](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/) | Med | Two Pointers | Sorted → two pointers | O(n)/O(1) | |
| [ ] | [3Sum](https://leetcode.com/problems/3sum/) | Med | Two Pointers | Sort + two pointers + dedup | O(n²)/O(1) | dedup is the trap |
| [ ] | [Container With Most Water](https://leetcode.com/problems/container-with-most-water/) | Med | Two Pointers | Greedy two-pointer move | O(n)/O(1) | |
| [ ] | [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/) | Hard | Two Pointers | Two-pointer / prefix-max | O(n)/O(1) | high signal |
| [ ] | [Longest Substring Without Repeating](https://leetcode.com/problems/longest-substring-without-repeating-characters/) | Med | Sliding Window | Variable window + set | O(n)/O(k) | |
| [ ] | [Longest Repeating Char Replacement](https://leetcode.com/problems/longest-repeating-character-replacement/) | Med | Sliding Window | Window + max-freq invariant | O(n)/O(1) | |
| [ ] | [Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/) | Hard | Sliding Window | Hardest window template | O(n)/O(k) | master this |
| [ ] | [Permutation in String](https://leetcode.com/problems/permutation-in-string/) | Med | Sliding Window | Fixed window + freq match | O(n)/O(1) | |
| [ ] | [Binary Search](https://leetcode.com/problems/binary-search/) | Easy | Binary Search | Template baseline | O(log n) | nail the boundaries |
| [ ] | [Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/) | Med | Binary Search | Modified binary search | O(log n) | |
| [ ] | [Find Min in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/) | Med | Binary Search | Pivot finding | O(log n) | |
| [ ] | [Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/) | Med | Binary Search | Binary search on the answer | O(n log m) | the key insight |
| [ ] | [Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/) | Med | Binary Search | BS over timestamps | O(log n) | |
| [ ] | [Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/) | Easy | Linked List | Pointer reversal baseline | O(n)/O(1) | |
| [ ] | [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/) | Easy | Linked List | Dummy head merge | O(n)/O(1) | |
| [ ] | [Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/) | Easy | Linked List | Floyd's fast/slow | O(n)/O(1) | |
| [ ] | [Reorder List](https://leetcode.com/problems/reorder-list/) | Med | Linked List | Mid + reverse + merge combo | O(n)/O(1) | |
| [ ] | [Remove Nth Node From End](https://leetcode.com/problems/remove-nth-node-from-end-of-list/) | Med | Linked List | Two-pointer gap | O(n)/O(1) | |
| [ ] | [Merge K Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/) | Hard | Heap/Linked List | Heap merge, very common | O(n log k) | |
| [ ] | [LRU Cache](https://leetcode.com/problems/lru-cache/) | Med | Linked List/HashMap | Hashmap + doubly-linked list | O(1) ops | top-asked design-y |
| [ ] | [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/) | Easy | Stack | Matching with a stack | O(n)/O(n) | |
| [ ] | [Min Stack](https://leetcode.com/problems/min-stack/) | Med | Stack | Aux stack for min | O(1) ops | |
| [ ] | [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/) | Med | Stack | Monotonic stack | O(n)/O(n) | learn mono-stack here |
| [ ] | [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/) | Hard | Stack | Monotonic stack mastery | O(n)/O(n) | |
| [ ] | [Evaluate RPN](https://leetcode.com/problems/evaluate-reverse-polish-notation/) | Med | Stack | Stack expression eval | O(n)/O(n) | |
| [ ] | [Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/) | Easy | Trees | DFS warmup | O(n)/O(h) | |
| [ ] | [Max Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/) | Easy | Trees | Recursion baseline | O(n)/O(h) | |
| [ ] | [Same Tree](https://leetcode.com/problems/same-tree/) | Easy | Trees | Structural recursion | O(n)/O(h) | |
| [ ] | [Binary Tree Level Order](https://leetcode.com/problems/binary-tree-level-order-traversal/) | Med | Trees/BFS | BFS template | O(n)/O(n) | |
| [ ] | [Lowest Common Ancestor (BST)](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/) | Med | BST | BST property navigation | O(h)/O(1) | |
| [ ] | [Validate BST](https://leetcode.com/problems/validate-binary-search-tree/) | Med | BST | In-order / range bounds | O(n)/O(h) | |
| [ ] | [Kth Smallest in BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/) | Med | BST | In-order = sorted | O(h+k)/O(h) | |
| [ ] | [Construct Tree from Preorder/Inorder](https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/) | Med | Trees | Recursive reconstruction | O(n)/O(n) | |
| [ ] | [Binary Tree Max Path Sum](https://leetcode.com/problems/binary-tree-maximum-path-sum/) | Hard | Trees | Post-order with global max | O(n)/O(h) | |
| [ ] | [Serialize/Deserialize Binary Tree](https://leetcode.com/problems/serialize-and-deserialize-binary-tree/) | Hard | Trees | DFS encode/decode | O(n)/O(n) | |
| [ ] | [Kth Largest Element in Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) | Med | Heap | Heap / quickselect | O(n log k) | |
| [ ] | [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) | Hard | Heap | Two-heap balance | O(log n)/op | |
| [ ] | [Task Scheduler](https://leetcode.com/problems/task-scheduler/) | Med | Heap/Greedy | Greedy + counting | O(n)/O(1) | |
| [ ] | [Number of Islands](https://leetcode.com/problems/number-of-islands/) | Med | Graph | Grid DFS/BFS, top-asked | O(VE) | |
| [ ] | [Clone Graph](https://leetcode.com/problems/clone-graph/) | Med | Graph | DFS/BFS + hashmap | O(V+E) | |
| [ ] | [Course Schedule](https://leetcode.com/problems/course-schedule/) | Med | Graph | Cycle detect / topo sort | O(V+E) | |
| [ ] | [Pacific Atlantic Water Flow](https://leetcode.com/problems/pacific-atlantic-water-flow/) | Med | Graph | Multi-source DFS | O(VE) | |
| [ ] | [Rotting Oranges](https://leetcode.com/problems/rotting-oranges/) | Med | Graph/BFS | Multi-source BFS | O(VE) | |
| [ ] | [Word Search](https://leetcode.com/problems/word-search/) | Med | Backtracking | Grid backtracking | O(n·3^L) | |
| [ ] | [Subsets](https://leetcode.com/problems/subsets/) | Med | Backtracking | Subset generation template | O(n·2^n) | |
| [ ] | [Combination Sum](https://leetcode.com/problems/combination-sum/) | Med | Backtracking | Choice + reuse | O(2^t) | |
| [ ] | [Permutations](https://leetcode.com/problems/permutations/) | Med | Backtracking | Permutation template | O(n·n!) | |
| [ ] | [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) | Easy | DP | DP intro / Fibonacci | O(n)/O(1) | |
| [ ] | [Coin Change](https://leetcode.com/problems/coin-change/) | Med | DP | Unbounded knapsack | O(n·amt) | |
| [ ] | [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/) | Med | DP | O(n²) DP + O(n log n) BS | O(n log n) | know both |
| [ ] | [House Robber](https://leetcode.com/problems/house-robber/) | Med | DP | Linear DP with choice | O(n)/O(1) | |

### 🟡 GOOD TO KNOW — 40 problems

| ✓ | Problem | Diff | Pattern | Why companies ask | Complexity | Notes |
|---|---------|------|---------|-------------------|------------|-------|
| [ ] | [Encode and Decode Strings](https://leetcode.com/problems/encode-and-decode-strings/) | Med | Arrays/Design | Serialization design | O(n) | |
| [ ] | [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/) | Med | HashMap | O(n) via set | O(n)/O(n) | |
| [ ] | [Valid Sudoku](https://leetcode.com/problems/valid-sudoku/) | Med | HashMap | Constraint tracking | O(1) | |
| [ ] | [Sort Colors](https://leetcode.com/problems/sort-colors/) | Med | Two Pointers | Dutch national flag | O(n)/O(1) | |
| [ ] | [4Sum](https://leetcode.com/problems/4sum/) | Med | Two Pointers | Generalized k-sum | O(n³) | |
| [ ] | [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/) | Hard | Queue | Monotonic deque | O(n)/O(k) | |
| [ ] | [Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/) | Med | Binary Search | Flatten + BS | O(log mn) | |
| [ ] | [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/) | Hard | Binary Search | BS partition | O(log(m+n)) | hard, high-signal |
| [ ] | [Find Peak Element](https://leetcode.com/problems/find-peak-element/) | Med | Binary Search | BS on unsorted with property | O(log n) | |
| [ ] | [Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/) | Med | Linked List | Interleave / hashmap | O(n) | |
| [ ] | [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/) | Med | Linked List | Carry handling | O(n) | |
| [ ] | [Find the Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number/) | Med | Two Pointers | Floyd's on array | O(n)/O(1) | clever |
| [ ] | [Generate Parentheses](https://leetcode.com/problems/generate-parentheses/) | Med | Backtracking | Constrained generation | O(4^n/√n) | |
| [ ] | [Decode String](https://leetcode.com/problems/decode-string/) | Med | Stack | Nested stack parsing | O(n) | |
| [ ] | [Car Fleet](https://leetcode.com/problems/car-fleet/) | Med | Stack | Sort + monotonic logic | O(n log n) | |
| [ ] | [Binary Tree Right Side View](https://leetcode.com/problems/binary-tree-right-side-view/) | Med | Trees/BFS | Level-rightmost | O(n) | |
| [ ] | [Count Good Nodes in Binary Tree](https://leetcode.com/problems/count-good-nodes-in-binary-tree/) | Med | Trees | DFS with carried max | O(n) | |
| [ ] | [Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/) | Easy | Trees | Post-order + global | O(n) | |
| [ ] | [Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/) | Easy | Trees | Height check | O(n) | |
| [ ] | [Implement Trie](https://leetcode.com/problems/implement-trie-prefix-tree/) | Med | Trie | Trie from scratch | O(L)/op | |
| [ ] | [Design Add and Search Words](https://leetcode.com/problems/design-add-and-search-words-data-structure/) | Med | Trie | Trie + wildcard DFS | O(L) avg | |
| [ ] | [Word Search II](https://leetcode.com/problems/word-search-ii/) | Hard | Trie/Backtracking | Trie + grid DFS combo | O(W·L) | |
| [ ] | [Graph Valid Tree](https://leetcode.com/problems/graph-valid-tree/) | Med | Graph | Union-find / DFS | O(V+E) | |
| [ ] | [Number of Connected Components](https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/) | Med | Graph | Union-find | O(E·α) | |
| [ ] | [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) | Med | Graph | Topological order | O(V+E) | |
| [ ] | [Redundant Connection](https://leetcode.com/problems/redundant-connection/) | Med | Graph | Union-find cycle | O(E·α) | |
| [ ] | [Word Ladder](https://leetcode.com/problems/word-ladder/) | Hard | Graph/BFS | Shortest transform BFS | O(N·L²) | |
| [ ] | [Network Delay Time](https://leetcode.com/problems/network-delay-time/) | Med | Graph | Dijkstra | O(E log V) | |
| [ ] | [Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/) | Med | Graph | Bellman-Ford / BFS+state | O(K·E) | |
| [ ] | [Reconstruct Itinerary](https://leetcode.com/problems/reconstruct-itinerary/) | Hard | Graph | Hierholzer / Eulerian | O(E log E) | |
| [ ] | [Combination Sum II](https://leetcode.com/problems/combination-sum-ii/) | Med | Backtracking | Dedup combinations | O(2^n) | |
| [ ] | [Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/) | Med | Backtracking | Partition + check | O(n·2^n) | |
| [ ] | [Letter Combinations of Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/) | Med | Backtracking | Cartesian generation | O(4^n) | |
| [ ] | [N-Queens](https://leetcode.com/problems/n-queens/) | Hard | Backtracking | Classic constraint search | O(n!) | |
| [ ] | [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/) | Med | DP | 2D string DP | O(mn) | |
| [ ] | [Word Break](https://leetcode.com/problems/word-break/) | Med | DP | DP + dictionary | O(n²) | |
| [ ] | [Unique Paths](https://leetcode.com/problems/unique-paths/) | Med | DP | Grid DP | O(mn) | |
| [ ] | [Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/) | Med | DP | 0/1 knapsack | O(n·sum) | |
| [ ] | [House Robber II](https://leetcode.com/problems/house-robber-ii/) | Med | DP | Circular DP | O(n) | |
| [ ] | [Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/) | Med | DP | Track min & max | O(n) | |

### 🟣 STRETCH — 20 problems (do after MUST + GOOD are solid)

| ✓ | Problem | Diff | Pattern | Why companies ask | Complexity | Notes |
|---|---------|------|---------|-------------------|------------|-------|
| [ ] | [Edit Distance](https://leetcode.com/problems/edit-distance/) | Med | DP | Canonical 2D DP | O(mn) | |
| [ ] | [Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/) | Hard | DP | Hard string DP | O(mn) | |
| [ ] | [Wildcard Matching](https://leetcode.com/problems/wildcard-matching/) | Hard | DP | DP / greedy | O(mn) | |
| [ ] | [Burst Balloons](https://leetcode.com/problems/burst-balloons/) | Hard | DP | Interval DP | O(n³) | |
| [ ] | [Longest Valid Parentheses](https://leetcode.com/problems/longest-valid-parentheses/) | Hard | DP/Stack | DP or stack | O(n) | |
| [ ] | [Best Time to Buy/Sell IV](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/) | Hard | DP | State-machine DP | O(nk) | |
| [ ] | [Word Break II](https://leetcode.com/problems/word-break-ii/) | Hard | DP/Backtracking | DP + reconstruction | O(2^n) | |
| [ ] | [Maximal Rectangle](https://leetcode.com/problems/maximal-rectangle/) | Hard | Stack/DP | Histogram per row | O(mn) | |
| [ ] | [Sliding Puzzle](https://leetcode.com/problems/sliding-puzzle/) | Hard | Graph/BFS | State-space BFS | O(states) | |
| [ ] | [Alien Dictionary](https://leetcode.com/problems/alien-dictionary/) | Hard | Graph | Topo sort from order | O(C) | |
| [ ] | [Minimum Cost to Make Network Connected](https://leetcode.com/problems/number-of-operations-to-make-network-connected/) | Med | Graph | Union-find counting | O(E·α) | |
| [ ] | [Swim in Rising Water](https://leetcode.com/problems/swim-in-rising-water/) | Hard | Graph | Dijkstra / BS+DFS | O(n² log n) | |
| [ ] | [Min Cost to Hire K Workers](https://leetcode.com/problems/minimum-cost-to-hire-k-workers/) | Hard | Heap/Greedy | Ratio sort + heap | O(n log n) | |
| [ ] | [IPO](https://leetcode.com/problems/ipo/) | Hard | Heap/Greedy | Two-heap greedy | O(n log n) | |
| [ ] | [Design Twitter](https://leetcode.com/problems/design-twitter/) | Med | Heap/Design | OO design + heap merge | O(n log n) | |
| [ ] | [LFU Cache](https://leetcode.com/problems/lfu-cache/) | Hard | Design | Multi-map O(1) design | O(1) | |
| [ ] | [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/) | Hard | Heap | (Re-drill streaming) | O(log n) | |
| [ ] | [Trapping Rain Water II](https://leetcode.com/problems/trapping-rain-water-ii/) | Hard | Heap/Graph | Heap BFS over grid | O(mn log mn) | |
| [ ] | [Basic Calculator](https://leetcode.com/problems/basic-calculator/) | Hard | Stack | Expression parsing | O(n) | |
| [ ] | [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/) | Hard | Stack | (Re-drill mono-stack) | O(n) | |

**Progress:** MUST `___/60` · GOOD `___/40` · STRETCH `___/20`

---

## Part D — Study Plans

### 14-Day Pattern Sprint (pattern fluency, not coverage)

Goal: re-load every pattern + solve 2–4 representative problems each.

| Day | Focus | Problems |
|-----|-------|----------|
| 1 | Arrays + Hashing | Two Sum, Contains Duplicate, Group Anagrams, Product Except Self |
| 2 | Two Pointers | Valid Palindrome, Two Sum II, 3Sum, Container With Most Water |
| 3 | Sliding Window | Longest Substring No Repeat, Longest Repeating Replacement, Min Window Substring |
| 4 | Stack | Valid Parens, Min Stack, Daily Temperatures, Evaluate RPN |
| 5 | Binary Search | Binary Search, Search Rotated, Koko Eating Bananas, Find Min Rotated |
| 6 | Linked List | Reverse List, Merge Two, Linked List Cycle, Reorder List |
| 7 | **Review + 1 mock (coding)** | Re-solve 4 missed problems |
| 8 | Trees | Invert, Max Depth, Level Order, LCA (BST) |
| 9 | Tries + Heaps | Implement Trie, Kth Largest, Top K Frequent, Median Stream |
| 10 | Backtracking | Subsets, Combination Sum, Permutations, Word Search |
| 11 | Graphs I | Number of Islands, Clone Graph, Rotting Oranges |
| 12 | Graphs II | Course Schedule (+II), Connected Components, Network Delay |
| 13 | DP | Climbing Stairs, Coin Change, House Robber, LIS |
| 14 | **Review + 1 mock (coding)** | Re-solve weakest pattern's problems |

- [ ] 14-day sprint complete.

### 30-Day Plan (build the MUST 60)

- **Week 1:** Days 1–7 of the sprint above.
- **Week 2:** Days 8–14 of the sprint above.
- **Week 3:** Re-solve all MUST-60 you've touched + add the remaining MUST-60. 3–4 problems/weekday, 6/weekend. 1 coding mock.
- **Week 4:** Finish MUST-60. Re-solve any you failed *from scratch*. 1 coding mock + start system design (`03`).

- [ ] All 60 MUST KNOW solved at least once.
- [ ] 8+ MUST KNOW re-solved cleanly from scratch.

### 60-Day Plan (add GOOD 40 + retention)

- **Weeks 5–6:** Work GOOD-40, ~3/weekday + 6/weekend. Interleave MUST-60 re-solves (spaced repetition: re-solve anything you took >2 tries on).
- **Weeks 7–8:** Finish GOOD-40. Begin STRETCH-20 selectively (pick the DP-hard and graph-hard ones). Increase system design + mocks. By Day 60: 6 mocks total.

- [ ] All 40 GOOD TO KNOW solved.
- [ ] MUST-60 retention: can clear any random 5 in a sitting.
- [ ] 5+ STRETCH attempted.

---

## Part E — Per-session checklist

Before declaring any problem "done," confirm:

- [ ] I restated and clarified before coding.
- [ ] I stated brute force → optimization → complexity *before* coding.
- [ ] My code ran/traced correctly on one real input + one edge case.
- [ ] I can re-solve it cold in ≤ target time.
- [ ] I logged it in `trackers/` (problem name, date, time taken, pattern).

---

## Notes & weak-spot log

```
Pattern I keep missing: __________
Problem that broke me: __________  → re-solve date: __________
Syntax I fumble: __________
```
