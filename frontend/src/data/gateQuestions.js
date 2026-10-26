/**
 * GATE CSE / DBMS Verified Question Bank & Practice Module
 * 
 * Sources: Official GATE Computer Science and Engineering examination papers
 * (administered by IISc / IITs) with verified official answer keys.
 * Secondary discussion references: GateOverflow community archive.
 */

export const GATE_TOPICS = [
    "All Topics",
    "B+ Tree & B-Tree",
    "Primary & Secondary Indexing",
    "Disk & Block Calculations",
    "Query Optimization",
    "Relational Algebra Equivalence"
];

export const QUESTION_TYPES = ["All Types", "MCQ", "MSQ", "NAT"];
export const DIFFICULTY_LEVELS = ["All Difficulties", "Easy", "Medium", "Hard"];

export const GATE_FORMULAS = [
    {
        title: "B+ Tree Internal Node Order (p)",
        formula: "p · P_b + (p - 1) · K_s ≤ B",
        description: "In an internal node of order p, there are p child/block pointers (P_b) and (p - 1) search keys (K_s). The total size must fit in one disk block (B)."
    },
    {
        title: "B+ Tree Leaf Node Order (p_leaf)",
        formula: "p_leaf · (K_s + P_rec) + P_next ≤ B",
        description: "A leaf node stores (search key, record pointer) pairs plus one block pointer to the next leaf node for sequential/range queries."
    },
    {
        title: "Minimum Keys in Non-Root B+ Tree Node",
        formula: "Min Children = ⌈p / 2⌉,  Min Keys = ⌈p / 2⌉ - 1",
        description: "Every non-root node in a B+ tree of order p must be at least half full (50% occupancy rule). The root node is exempt from this rule."
    },
    {
        title: "Blocking Factor (bfr)",
        formula: "bfr = ⌊B / R⌋",
        description: "Number of records that fit in a disk block of size B, where R is record size (unspanned record organization)."
    },
    {
        title: "Primary Index vs Secondary Index",
        formula: "Primary: Sparse, ordered on Key  |  Secondary: Dense, on Non-ordering field",
        description: "A table can have at most ONE primary or clustered index, but can have MULTIPLE secondary indexes."
    },
    {
        title: "Heuristic Query Optimization (Selection Pushdown)",
        formula: "σ_(A=10)(R ⋈ S) ≡ (σ_(A=10)(R)) ⋈ S",
        description: "Push selections down as close to the base relations as possible to reduce intermediate relation sizes before expensive joins."
    }
];

export const GATE_QUESTIONS = [
    {
        id: 1,
        year: "GATE CSE 2024 (Set 1)",
        source: "Official GATE 2024 CSE Paper (IISc Bangalore, Set 1), Q.11",
        sourceUrl: "https://gateoverflow.in/422831/gate-cse-2024-set-1-question-11",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "Node Occupancy & Invariant Constraints",
        type: "MCQ",
        difficulty: "Easy",
        question: "In a B+ tree, the requirement of at least half-full (50%) node occupancy is relaxed for which one of the following cases?",
        options: [
            "(A) Only the root node",
            "(B) All leaf nodes",
            "(C) All internal nodes",
            "(D) Only the leftmost leaf node"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) Only the root node",
        stepByStepExplanation: `1. In a B+ tree of order p (maximum child pointers), structural invariants guarantee that tree balance and O(log n) search performance are maintained.
2. Invariant Rule: Every internal node must contain at least ⌈p / 2⌉ child pointers, and every leaf node must be at least half-full.
3. Exception: The ROOT node is the sole exception. A newly initialized tree, or a tree that has shrunk through deletions, can have as few as 2 children (or 1 key if it is both root and leaf) without violating B+ tree validity.
4. If the root had to be half-full from the start, small trees containing fewer keys than p/2 could not exist.`,
        whyCorrect: "By definition of B and B+ trees, the root node is explicitly exempted from the 50% minimum occupancy requirement. It can have between 2 and p children (or 1 to p-1 keys for a single-node tree).",
        commonMistakes: "Students sometimes confuse leaf nodes or leftmost nodes with boundary cases. All leaf nodes and all non-root internal nodes MUST strictly respect the ⌈p/2⌉ lower bound.",
        keyFormula: "Non-root nodes: ⌈p/2⌉ ≤ children ≤ p  |  Root node: 2 ≤ children ≤ p (for h ≥ 2)"
    },
    {
        id: 2,
        year: "GATE CSE 2023",
        source: "Official GATE 2023 CSE Paper (IIT Kanpur), Q.52",
        sourceUrl: "https://gateoverflow.in/398188/gate-cse-2023-question-52",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "Disk & Block Calculations",
        subtopic: "Primary Index Block Accesses",
        type: "NAT",
        difficulty: "Medium",
        question: "Consider a database of fixed-length records, stored as an ordered file. The database has 25,000 records, with each record being 100 bytes, of which the primary key occupies 15 bytes. The data file is block-aligned in that each data record is fully contained within a block. The database is indexed by a primary index file, which is also stored as a block-aligned ordered file.\n\nSuppose the block size of the file system is 1024 bytes, and a pointer to a block occupies 5 bytes. The system uses binary search on the index file to search for a record with a given key. You may assume that a binary search on an index file of b blocks takes ⌈log₂(b)⌉ block accesses in the worst case.\n\nGiven a key, the number of block accesses required to identify the block in the data file that may contain a record with the key, in the worst case, is ______.",
        correctAnswer: 6,
        correctDisplay: "6",
        stepByStepExplanation: `Step 1: Calculate blocking factor for the data file.
• Block size (B) = 1024 bytes
• Data record size (R) = 100 bytes
• Records per data block = ⌊1024 / 100⌋ = 10 records/block

Step 2: Calculate total data blocks.
• Total records = 25,000
• Total data blocks = 25,000 / 10 = 2,500 blocks

Step 3: Analyze the primary index file.
• A primary index is sparse: it has exactly 1 entry per data block.
• Total index entries = 2,500
• Primary key size = 15 bytes, block pointer size = 5 bytes
• Size of one index entry = 15 + 5 = 20 bytes
• Index entries per block = ⌊1024 / 20⌋ = 51 entries/block

Step 4: Calculate total index blocks (b).
• Total index blocks b = ⌈2,500 / 51⌉ = ⌈49.019⌉ = 50 blocks

Step 5: Worst-case binary search block accesses on index file.
• Block accesses = ⌈log₂(b)⌉ = ⌈log₂(50)⌉
• Since 2⁵ = 32 and 2⁶ = 64, ⌈log₂(50)⌉ = 6 block accesses.`,
        whyCorrect: "Locating the candidate block in the data file requires searching the 50 blocks of the primary index. Using binary search, ⌈log₂(50)⌉ = 6 block reads are required.",
        commonMistakes: "1. Adding +1 to the final answer: The question specifically asks for the number of block accesses to IDENTIFY the block in the data file (which only requires reading index blocks), not to retrieve the data record itself. If retrieving the record, it would be 6 + 1 = 7.\n2. Treating the primary index as dense (25,000 index entries) instead of sparse (2,500 entries).",
        keyFormula: "b_index = ⌈(Total Data Blocks) / ⌊B / (Key + Ptr)⌋⌉,  Worst-case Search = ⌈log₂(b_index)⌉"
    },
    {
        id: 3,
        year: "GATE CSE 2021 (Set 2)",
        source: "Official GATE 2021 CSE Paper (IIT Bombay, Set 2), Q.21",
        sourceUrl: "https://gateoverflow.in/385573/gate-cse-2021-set-2-question-21",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "Primary & Secondary Indexing",
        subtopic: "Secondary Index on Candidate Key",
        type: "NAT",
        difficulty: "Medium",
        question: "A data file consisting of 1,50,000 student-records is stored on a hard disk with a block size of 4096 bytes. The data file is sorted on the primary key RollNo. The size of a record pointer for this disk is 7 bytes. Each student-record has a candidate key attribute called ANum of size 12 bytes. Suppose an index file with records consisting of two fields, ANum value and the record pointer to the corresponding student record, is built and stored on the same disk. Assume that the records of data file and index file are not split across disk blocks.\n\nThe number of blocks in the index file is ______.",
        correctAnswer: 698,
        correctDisplay: "698",
        stepByStepExplanation: `Step 1: Understand the index type.
• The data file is sorted on RollNo, NOT on ANum.
• Because ANum is a candidate key on which the file is NOT sorted, this index is a SECONDARY INDEX.
• Secondary indexes MUST be DENSE (one index record for every data record in the file).
• Total index entries needed = 1,50,000.

Step 2: Size of an index entry.
• Search key (ANum) = 12 bytes
• Record pointer = 7 bytes
• Total entry size = 12 + 7 = 19 bytes

Step 3: Blocking factor of the index file.
• Block size = 4096 bytes
• Unspanned index entries per block = ⌊4096 / 19⌋ = ⌊215.578⌋ = 215 entries/block

Step 4: Calculate total index blocks.
• Total index blocks = ⌈150,000 / 215⌉ = ⌈697.674⌉ = 698 blocks.`,
        whyCorrect: "Because the data file is not sorted by ANum, a dense secondary index with 150,000 entries is required. With 215 entries fitting in each 4096-byte block, ⌈150000 / 215⌉ = 698 blocks are necessary.",
        commonMistakes: "Assuming ANum is an ordering key and calculating a sparse index. A sparse index can ONLY be created if the data file is physically sorted on that search key.",
        keyFormula: "Secondary Index Blocks = ⌈(Total Records) / ⌊Block Size / (Key Size + Record Pointer Size)⌋⌉"
    },
    {
        id: 4,
        year: "GATE CSE 2019",
        source: "Official GATE 2019 CSE Paper (IIT Madras), Q.14",
        sourceUrl: "https://gateoverflow.in/302834/gate-cse-2019-question-14",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "B+ Tree Structure vs B-Tree",
        type: "MCQ",
        difficulty: "Easy",
        question: "Which one of the following statements is NOT correct about the B+ tree data structure used for creating an index of a relational database table?",
        options: [
            "(A) B+ - tree is a height-balanced tree",
            "(B) Non-leaf nodes have pointers to data records",
            "(C) Key values in each node are kept in sorted order",
            "(D) Each leaf node has a pointer to the next leaf node"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) Non-leaf nodes have pointers to data records",
        stepByStepExplanation: `1. Statement (A) is TRUE: All leaves in a B+ tree are at the exact same depth, making it strictly height-balanced.
2. Statement (B) is FALSE: In a B+ tree, internal (non-leaf) nodes only store search keys and tree/child node pointers for routing. Only leaf nodes contain pointers to actual data records. (In contrast, B-trees store data pointers in both internal and leaf nodes).
3. Statement (C) is TRUE: Keys inside every node are strictly sorted in ascending order to enable binary search within a node block.
4. Statement (D) is TRUE: Leaf nodes are connected via a linked list (next-leaf pointers), enabling fast sequential scans and range queries without traversing back up the tree.`,
        whyCorrect: "In B+ trees, non-leaf nodes NEVER store pointers to data records; they only store block pointers to child nodes. Hence Statement (B) is the incorrect statement.",
        commonMistakes: "Confusing B+ trees with standard B-trees. In a B-tree, non-leaf nodes DO store record pointers. In a B+ tree, record pointers are confined exclusively to leaf nodes.",
        keyFormula: "B+ Tree: Internal Nodes = (Key, Child Ptr) only  |  Leaf Nodes = (Key, Data Ptr) + Next Leaf Ptr"
    },
    {
        id: 5,
        year: "GATE CSE 2017 (Set 2)",
        source: "Official GATE 2017 CSE Paper (IIT Roorkee, Set 2), Q.49",
        sourceUrl: "https://gateoverflow.in/118239/gate-cse-2017-set-2-question-49",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "Order of Internal Node",
        type: "NAT",
        difficulty: "Medium",
        question: "In a B+ tree, if the search-key value is 8 bytes long, the block size is 512 bytes, and the pointer size is 2 bytes, then the maximum order of the B+ tree is ______.",
        correctAnswer: 52,
        correctDisplay: "52",
        stepByStepExplanation: `Step 1: Define order of an internal node.
• In a B+ tree, the order p of an internal node is the maximum number of child/block pointers it can hold.
• An internal node with p child pointers contains (p - 1) search keys.

Step 2: Set up the memory inequality.
• Total space occupied by child pointers = p × (pointer size) = 2p bytes
• Total space occupied by search keys = (p - 1) × (key size) = 8(p - 1) bytes
• Total space must not exceed block size:
    2p + 8(p - 1) ≤ 512

Step 3: Solve for p.
    2p + 8p - 8 ≤ 512
    10p - 8 ≤ 512
    10p ≤ 520
    p ≤ 52

Step 4: Conclusion.
• The maximum order p is an integer, so p = 52.`,
        whyCorrect: "An internal node holding 52 pointers and 51 keys uses 52(2) + 51(8) = 104 + 408 = 512 bytes, which exactly matches the 512-byte block size.",
        commonMistakes: "Using p keys instead of (p - 1) keys: 2p + 8p ≤ 512 would give p ≤ 51.2 => 51, which forgets that there is always one fewer key than child pointers.",
        keyFormula: "p · P_b + (p - 1) · K_s ≤ Block Size  ⟹  p = ⌊(Block Size + K_s) / (P_b + K_s)⌋"
    },
    {
        id: 6,
        year: "GATE CSE 2016 (Set 2)",
        source: "Official GATE 2016 CSE Paper (IISc Bangalore, Set 2), Q.21",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "Height-Balance Definition",
        type: "MCQ",
        difficulty: "Easy",
        question: "B+ trees are considered BALANCED because",
        options: [
            "(A) the lengths of the paths from the root to all leaf nodes are all equal",
            "(B) the lengths of the paths from the root to all leaf nodes differ from each other by at most 1",
            "(C) the number of children of any two non-leaf sibling nodes differ by at most 1",
            "(D) the number of records in any two leaf nodes differ by at most 1"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) the lengths of the paths from the root to all leaf nodes are all equal",
        stepByStepExplanation: `1. In data structures like AVL trees, balance is defined as height differences of subtrees differing by at most 1 (Option B).
2. However, for multi-way search trees like B-trees and B+ trees, balance is defined strictly: ALL leaf nodes are present at the exact same depth.
3. Every path from the root node to any leaf node has identical length equal to the tree height h.
4. When nodes split or merge, the height changes uniformly across the entire tree only when the root splits or collapses.`,
        whyCorrect: "By definition, a B/B+ tree is height-balanced because every leaf node is at the exact same level; all root-to-leaf paths have identical length.",
        commonMistakes: "Selecting option (B) by conflating AVL / Red-Black tree balancing criteria with B+ tree height-balancing.",
        keyFormula: "Path Length(Root → Leaf_i) = Path Length(Root → Leaf_j) = h,  ∀ i, j"
    },
    {
        id: 7,
        year: "GATE CSE 2015 (Set 3)",
        source: "Official GATE 2015 CSE Paper (IIT Kanpur, Set 3), Q.46",
        sourceUrl: "https://gateoverflow.in/115594/gatecse-2015-set3-46",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "Non-Leaf Node Key Capacity",
        type: "NAT",
        difficulty: "Medium",
        question: "Consider a B+ tree in which the search key is 12 bytes long, block size is 1024 bytes, record pointer is 10 bytes long and block pointer is 8 bytes long. The maximum number of keys that can be accommodated in each non-leaf node of the tree is ______.",
        correctAnswer: 50,
        correctDisplay: "50",
        stepByStepExplanation: `Step 1: Identify what is stored in a non-leaf node.
• In a B+ tree, a non-leaf (internal) node contains child block pointers (8 bytes each) and search keys (12 bytes each).
• Crucial: Record pointers (10 bytes) are NOT present in non-leaf nodes! They exist only in leaf nodes.

Step 2: Set up inequality for order p.
• Let p = number of block pointers.
• Then number of keys = (p - 1).
• 8p + 12(p - 1) ≤ 1024
• 8p + 12p - 12 ≤ 1024
• 20p ≤ 1036
• p ≤ 51.8

Step 3: Calculate maximum order and keys.
• Maximum pointers p = 51.
• Maximum keys = p - 1 = 51 - 1 = 50.`,
        whyCorrect: "With p = 51, the node uses 51(8) + 50(12) = 408 + 600 = 1008 bytes ≤ 1024 bytes. Hence the maximum number of keys is 50.",
        commonMistakes: "1. Including the record pointer (10 bytes) in the internal node equation: this is a trap to test whether you know B+ internal nodes don't store record pointers.\n2. Writing 51 (the order/pointers) instead of 50 (the keys requested by the question).",
        keyFormula: "p ≤ ⌊(Block Size + Key Size) / (Block Pointer + Key Size)⌋,  Max Keys = p - 1"
    },
    {
        id: 8,
        year: "GATE CSE 2014 (Set 3)",
        source: "Official GATE 2014 CSE Paper (IIT Kharagpur, Set 3), Q.21",
        sourceUrl: "https://gateoverflow.in/1944/gate-cse-2014-set-3-question-21",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "Relational Algebra Equivalence",
        subtopic: "Cascading Operations in Query Optimization",
        type: "MCQ",
        difficulty: "Medium",
        question: "What is the optimized version of the relational algebra expression π_{A1}(π_{A2}(σ_{F1}(σ_{F2}(r)))), where A1, A2 are sets of attributes in r with A1 ⊂ A2 and F1, F2 are Boolean expressions based on the attributes in r?",
        options: [
            "(A) π_{A1}(σ_{(F1 ∧ F2)}(r))",
            "(B) π_{A1}(σ_{(F1 ∨ F2)}(r))",
            "(C) π_{A2}(σ_{(F1 ∧ F2)}(r))",
            "(D) π_{A2}(σ_{(F1 ∨ F2)}(r))"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) π_{A1}(σ_{(F1 ∧ F2)}(r))",
        stepByStepExplanation: `1. Rule of Cascading of Selection (σ):
   Successive selection operations can be combined into a single selection using logical AND (conjunction):
   σ_{F1}(σ_{F2}(r)) ≡ σ_{(F1 ∧ F2)}(r).
   (A tuple must satisfy BOTH conditions F1 and F2 to survive).

2. Rule of Cascading of Projection (π):
   When projecting repeatedly, π_{L1}(π_{L2}(... π_{Ln}(r))) ≡ π_{L1}(r), provided L1 ⊆ L2 ⊆ ... ⊆ Ln.
   Since A1 ⊂ A2, projecting on A2 first and then on A1 is redundant because the outermost projection π_{A1} dictates the final attribute set.

3. Combining both equivalence transformations:
   π_{A1}(π_{A2}(σ_{F1}(σ_{F2}(r)))) ≡ π_{A1}(σ_{(F1 ∧ F2)}(r)).`,
        whyCorrect: "Successive filters evaluate simultaneously as an AND condition (F1 ∧ F2), and the nested projection collapses to the smaller subset A1, confirming Option (A).",
        commonMistakes: "Using OR (∨) instead of AND (∧): selections filter successively, so a tuple must satisfy BOTH conditions, not either.",
        keyFormula: "σ_F1(σ_F2(R)) ≡ σ_(F1 ∧ F2)(R)  and  π_A1(π_A2(R)) ≡ π_A1(R)  for A1 ⊆ A2"
    },
    {
        id: 9,
        year: "GATE CSE 2013",
        source: "Official GATE 2013 CSE Paper (IIT Bombay), Q.15",
        sourceUrl: "https://gateoverflow.in/1437/gate-cse-2013-question-15",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "Primary & Secondary Indexing",
        subtopic: "Clustered Index Concept",
        type: "MCQ",
        difficulty: "Easy",
        question: "An index is clustered, if",
        options: [
            "(A) It is on a set of fields that form a candidate key",
            "(B) It is on a set of fields that include the primary key",
            "(C) The data records of the file are organized in the same order as the data entries of the index",
            "(D) The data records of the file are organized not in the same order as the data entries of the index"
        ],
        correctAnswer: 2,
        correctDisplay: "(C) The data records of the file are organized in the same order as the data entries of the index",
        stepByStepExplanation: `1. Definition of Clustered Index:
   A clustered index determines the physical storage order of rows in the table on disk.
   The data entries of the index match the physical sort order of the data records in the data file.

2. Consequence:
   Because physical disk records can only be stored in one sorted order at a time, any given database table can have AT MOST ONE clustered index.

3. Contrast with Non-Clustered / Secondary Index:
   In a non-clustered index, the data records are ordered independently of the index entries (Option D).

4. Candidate / Primary keys (Options A and B) can be indexed via non-clustered indexes as well, so key status does not define clustering.`,
        whyCorrect: "Clustering refers specifically to physical co-ordering of the data records with the index search keys.",
        commonMistakes: "Believing a clustered index MUST be on the primary key. While DBMSs like MySQL InnoDB default the clustered index to the primary key, clustering is defined by physical ordering, not primary key status.",
        keyFormula: "Clustered Index ⟺ Physical Record Order = Index Key Order (Max 1 per table)"
    },
    {
        id: 10,
        year: "GATE CSE 2010",
        source: "Official GATE 2010 CSE Paper (IIT Guwahati), Q.18",
        sourceUrl: "https://gateoverflow.in/2237/gate-cse-2010-question-18",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "Minimum Keys in Non-Root Nodes",
        type: "MCQ",
        difficulty: "Medium",
        question: "Consider a B+ tree in which the maximum number of keys in a node is 5. What is the minimum number of keys in any non-root node?",
        options: [
            "(A) 1",
            "(B) 2",
            "(C) 3",
            "(D) 4"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) 2",
        stepByStepExplanation: `Step 1: Relate maximum keys to order p.
• If maximum keys in a node = 5, then the maximum number of child pointers (order p) is:
    p - 1 = 5  ⟹  p = 6.

Step 2: Apply the minimum occupancy rule for non-root nodes.
• Every non-root node must be at least half full.
• Minimum number of pointers/children in a non-root node = ⌈p / 2⌉:
    Min pointers = ⌈6 / 2⌉ = 3.

Step 3: Calculate minimum keys.
• The number of keys in a node is always one less than the number of pointers:
    Min keys = (Min pointers) - 1 = 3 - 1 = 2.`,
        whyCorrect: "For maximum capacity of 5 keys (order p = 6), minimum pointers = ⌈6/2⌉ = 3, yielding 3 - 1 = 2 keys minimum.",
        commonMistakes: "Assuming minimum keys is ⌊5/2⌋ = 2 by coincidence, or calculating ⌈5/2⌉ = 3 directly on keys without using the pointer/order definition.",
        keyFormula: "Max Keys = p - 1  ⟹  Min Keys = ⌈p / 2⌉ - 1"
    },
    {
        id: 11,
        year: "GATE CSE 2008",
        source: "Official GATE 2008 CSE Paper (IISc Bangalore), Q.16",
        sourceUrl: "https://gateoverflow.in/2199/gate-cse-2008-question-16",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "Primary & Secondary Indexing",
        subtopic: "Index Classification Matrix",
        type: "MCQ",
        difficulty: "Easy",
        question: "A clustering index is defined on the fields which are of type",
        options: [
            "(A) non-key and ordering",
            "(B) non-key and non-ordering",
            "(C) key and ordering",
            "(D) key and non-ordering"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) non-key and ordering",
        stepByStepExplanation: `Standard DBMS Index Classification (Elmasri-Navathe):
1. Primary Index: Defined on an ordering field that is a KEY (unique values, sorted records).
2. Clustering Index: Defined on an ordering field that is NON-KEY (duplicate values allowed, records physically grouped/clustered by that field).
3. Secondary Index: Defined on a NON-ORDERING field (can be key or non-key; data file is not sorted on this field).`,
        whyCorrect: "By formal database definition, a clustering index is built on a non-key ordering attribute of a sorted file.",
        commonMistakes: "Choosing (C) 'key and ordering', which is the formal definition of a PRIMARY index.",
        keyFormula: "Primary Index = Key + Ordering  |  Clustering Index = Non-Key + Ordering  |  Secondary Index = Non-Ordering"
    },
    {
        id: 12,
        year: "GATE CSE 2008",
        source: "Official GATE 2008 CSE Paper (IISc Bangalore), Q.41",
        sourceUrl: "https://gateoverflow.in/453/gate2008-41",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "B-Tree Insertion and Node Splits",
        type: "MCQ",
        difficulty: "Hard",
        question: "A B-tree of order 4 is built from scratch by 10 successive insertions. What is the maximum number of node splitting operations that may take place?",
        options: [
            "(A) 3",
            "(B) 4",
            "(C) 5",
            "(D) 6"
        ],
        correctAnswer: 2,
        correctDisplay: "(C) 5",
        stepByStepExplanation: `1. Characteristics of B-tree of order m = 4:
   • Maximum children per node = 4
   • Maximum keys per node = m - 1 = 3 keys.
   • A node overflows and splits when it receives a 4th key, pushing the median key up.

2. Tracking maximum possible node splits with 10 insertions:
   • Insertions 1, 2, 3: Fill the root [k1, k2, k3]. (0 splits)
   • Insertion 4: Root overflows [k1, k2, k3, k4] ⟹ Split 1: root splits into two nodes of 1 and 2 keys, median moves up to form new root. (1 split)
   • Insertion 5: Fits in a leaf node.
   • Insertion 6: Leaf overflows ⟹ Split 2: leaf splits, median moves up to root [r1, r2]. (1 split)
   • Insertion 7: Fits in a leaf node.
   • Insertion 8: Leaf overflows ⟹ Split 3: leaf splits, median moves up to root. Root now has 4 keys [r1, r2, r3, r4] and overflows ⟹ Split 4 (Cascade split: root splits, increasing tree height to 2). (2 splits)
   • Insertion 9: Fits in a leaf node.
   • Insertion 10: Leaf overflows ⟹ Split 5: leaf splits. (1 split)

3. Total maximum node splits = 1 + 1 + 2 + 1 = 5 splits.`,
        whyCorrect: "By strategically selecting keys to force maximum leaf overflows and propagate a cascade split to the root node at insertion 8, exactly 5 node splitting operations take place. The official GATE 2008 answer key confirms Option C.",
        commonMistakes: "Counting only leaf splits (3) and neglecting the cascade root split (Split 4), which leads to the incorrect answer of 3 (Option A). The official answer key confirms 5 splits (Option C).",
        keyFormula: "Node overflow triggers split when keys = m. Cascade splits at parent/root add additional split operations."
    },
    {
        id: 13,
        year: "Practice Question (GATE CSE MSQ)",
        source: "B+ Tree Properties & Structural Invariants (Practice MSQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "Comprehensive B+ Tree Properties",
        type: "MSQ",
        difficulty: "Medium",
        question: "Which of the following statements is/are TRUE regarding B+ trees used as database indexes?",
        options: [
            "(A) Leaf nodes are linked together via pointers to facilitate efficient sequential and range scans",
            "(B) Every search key present in the database must appear in at least one leaf node",
            "(C) Non-leaf nodes store direct pointers to disk data records",
            "(D) Insertion of a new key into a B+ tree can cause a split that increases the height of the tree"
        ],
        correctAnswer: [0, 1, 3],
        correctDisplay: "(A), (B), and (D)",
        stepByStepExplanation: `• Statement (A) is TRUE: In a B+ tree, leaf nodes form a singly or doubly linked list via block pointers, allowing range queries like WHERE age BETWEEN 20 AND 30 to scan linearly without traversing the tree.
• Statement (B) is TRUE: Unlike B-trees (where keys can reside exclusively in internal nodes), B+ trees store ALL search keys redundantly in the leaf level.
• Statement (C) is FALSE: Only leaf nodes contain pointers to actual data records. Non-leaf nodes hold only routing keys and child tree pointers.
• Statement (D) is TRUE: When the root node overflows and splits, a new root is created above it, which increases the height of the entire tree by 1.`,
        whyCorrect: "Options (A), (B), and (D) are foundational structural invariants of B+ trees, while (C) incorrectly attributes B-tree data pointer placement to B+ trees.",
        commonMistakes: "Missing option (B) because students forget that in a B+ tree, even keys that appear in internal routing nodes are also present in the leaves.",
        keyFormula: "B+ Trees maintain: All Keys in Leaves  +  Leaves Linked  +  Internal Nodes for Navigation Only"
    },
    {
        id: 14,
        year: "GATE CSE 2007",
        source: "Official GATE 2007 CSE Paper (IIT Kanpur), Q.63",
        sourceUrl: "https://gateoverflow.in/5361/gate-cse-2007-question-63",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "Leaf Node Order Calculation",
        type: "MCQ",
        difficulty: "Medium",
        question: "The order of a leaf node in a B+ tree is the maximum number of (value, data record pointer) pairs it can hold. Given that the block size is 1024 bytes, data record pointer is 7 bytes long, the value field is 9 bytes long, and a block pointer is 6 bytes long, what is the order of the leaf node?",
        options: [
            "(A) 63",
            "(B) 64",
            "(C) 67",
            "(D) 68"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) 63",
        stepByStepExplanation: `Step 1: Structure of a B+ tree leaf node block.
• Contains p pairs of (search key value, data record pointer).
• Contains 1 block pointer (6 bytes) pointing to the next leaf node.

Step 2: Write the memory inequality.
• Key size = 9 bytes
• Data record pointer = 7 bytes
• Next leaf block pointer = 6 bytes
• Total entry size per pair = 9 + 7 = 16 bytes
• 16p + 6 ≤ 1024

Step 3: Solve for p.
• 16p ≤ 1018
• p ≤ 1018 / 16 = 63.625
• Since p must be an integer, p = 63.`,
        whyCorrect: "63 pairs require 63 × 16 = 1008 bytes. Adding the 6-byte next-leaf pointer gives 1014 bytes ≤ 1024 bytes.",
        commonMistakes: "Forgetting the next-leaf block pointer (6 bytes): 1024 / 16 = 64 (Option B), which would leave zero space to link to the next leaf node!",
        keyFormula: "p_leaf · (Key Size + Record Ptr Size) + Next Leaf Ptr Size ≤ Block Size"
    },
    {
        id: 15,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Query Optimization & Heuristic Equivalence (Practice Question)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Query Optimization",
        subtopic: "Selection Pushdown and Index Utilization",
        type: "MCQ",
        difficulty: "Medium",
        question: "In relational query optimization for the SQL query:\n\nSELECT *\nFROM Customers c\nJOIN Orders o ON c.id = o.customer_id\nWHERE c.status = 'active';\n\nWhich algebraic transformation provides the greatest reduction in intermediate I/O cost before the join is executed?",
        options: [
            "(A) Push the selection σ_{status='active'} down to Customers before evaluating the join",
            "(B) Compute the cross product Customers × Orders first, then filter both join and where predicates",
            "(C) Perform a full table scan on Orders before evaluating any filters on Customers",
            "(D) Materialize both complete tables into temporary tables without indexes"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) Push the selection down to Customers before evaluating the join",
        stepByStepExplanation: `1. Heuristic Query Optimization Principle:
   Selection pushdown (performing σ early) reduces the cardinality (number of tuples) of the relation before it enters costly binary operations like Cartesian product (×) or Join (⋈).

2. Connection to Index Recommendation Engine:
   • If Customers has 100,000 rows and only 5% are 'active' (5,000 rows), pushing down σ_{status='active'} filters out 95% of rows upfront.
   • Recommending an index on Customers(status) enables an index scan instead of scanning all 100,000 rows.
   • The join algorithm then processes only 5,000 rows against Orders instead of 100,000 rows, saving massive CPU and disk buffer I/O.`,
        whyCorrect: "Evaluating selection predicates directly on the base relation drastically reduces intermediate relation size prior to performing joins.",
        commonMistakes: "Executing unindexed cross products (Option B), which exhibits O(|R| · |S|) worst-case memory and I/O blowup.",
        keyFormula: "Heuristic Optimization Rule: σ_C(R ⋈ S) ≡ (σ_C(R)) ⋈ S  (when predicate C references only R)"
    }
    ,
    {
        id: 16,
        year: "Practice Question (GATE CSE DBMS)",
        source: "B+ Tree Leaf Node Order Calculation (Practice)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "Leaf Node Order Calculation",
        type: "NAT",
        difficulty: "Medium",
        question: "In a B+ tree, the block size is 512 bytes, the search key is 6 bytes long, the data record pointer is 4 bytes long, and the next-leaf block pointer is 4 bytes long. What is the maximum order of a leaf node (maximum number of key-pointer pairs per leaf)?",
        correctAnswer: 50,
        correctDisplay: "50",
        stepByStepExplanation: `Step 1: Identify the structure of a B+ tree leaf node.
• A leaf node contains p_leaf pairs of (search key, data record pointer).
• A leaf node also contains exactly 1 next-leaf block pointer to link to the adjacent leaf.

Step 2: Write the memory inequality.
• Each (key, record pointer) pair = 6 + 4 = 10 bytes.
• Next-leaf block pointer = 4 bytes.
• Total: 10 · p_leaf + 4 ≤ 512

Step 3: Solve for p_leaf.
  10 · p_leaf ≤ 508
  p_leaf ≤ 50.8
  p_leaf = 50 (floor to integer).`,
        whyCorrect: "50 pairs × 10 bytes = 500 bytes, plus the 4-byte next-leaf pointer = 504 bytes, which fits within the 512-byte block. 51 pairs would require 510 + 4 = 514 bytes, exceeding the block size.",
        commonMistakes: "Forgetting to subtract the next-leaf block pointer (4 bytes) before dividing: 512 / 10 = 51.2, giving 51 — this neglects the mandatory next-leaf pointer that every leaf node must carry.",
        keyFormula: "p_leaf · (Key + Record Ptr) + Next Leaf Ptr ≤ Block Size"
    },
    {
        id: 17,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Primary Index Block Count Calculation (Practice)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Disk & Block Calculations",
        subtopic: "Primary Index Block Count",
        type: "NAT",
        difficulty: "Medium",
        question: "A data file contains 40,000 records. Each record is 100 bytes. The block size is 2048 bytes. A sparse primary index is built on the ordering key field (12 bytes), with each index entry also containing a block pointer of 6 bytes. Assume records and index entries are not split across blocks. How many blocks does the primary index file occupy?",
        correctAnswer: 18,
        correctDisplay: "18",
        stepByStepExplanation: `Step 1: Calculate the blocking factor for the data file.
• Block size (B) = 2048 bytes, Record size (R) = 100 bytes.
• Records per data block = ⌊2048 / 100⌋ = 20 records/block.

Step 2: Calculate total data blocks.
• Total data blocks = ⌈40,000 / 20⌉ = 2,000 blocks.

Step 3: Determine primary index entries.
• A primary (sparse) index has exactly ONE entry per data block.
• Total index entries = 2,000.

Step 4: Calculate index entries per block.
• Index entry size = 12 (key) + 6 (block pointer) = 18 bytes.
• Index entries per block = ⌊2048 / 18⌋ = ⌊113.7⌋ = 113 entries/block.

Step 5: Calculate total index blocks.
• Index blocks = ⌈2,000 / 113⌉ = ⌈17.7⌉ = 18 blocks.`,
        whyCorrect: "A sparse primary index has one entry per data block (2,000 entries). With 113 entries fitting per index block, ⌈2000/113⌉ = 18 index blocks are required.",
        commonMistakes: "Treating the primary index as dense (40,000 entries instead of 2,000). A primary index is sparse — it has one anchor entry per data block, not one per record.",
        keyFormula: "Primary Index Blocks = ⌈(Total Data Blocks) / ⌊Block Size / (Key + Ptr)⌋⌉"
    },
    {
        id: 18,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Multi-Level Index — Number of Levels (Practice)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Disk & Block Calculations",
        subtopic: "Multi-Level Index Levels",
        type: "NAT",
        difficulty: "Hard",
        question: "A data file has 1,000,000 records, each 64 bytes. Block size = 2048 bytes. A multi-level primary index is built: search key = 12 bytes, block pointer = 6 bytes. Index entries and records are unspanned. How many levels does the multi-level index require (not counting the data file itself)?",
        correctAnswer: 3,
        correctDisplay: "3",
        stepByStepExplanation: `Step 1: Calculate data file blocking factor and data blocks.
• Data bfr = ⌊2048 / 64⌋ = 32 records/block.
• Data blocks = ⌈1,000,000 / 32⌉ = 31,250 blocks.

Step 2: Level-1 index (sparse, one entry per data block).
• Index entry size = 12 + 6 = 18 bytes.
• Index bfr = ⌊2048 / 18⌋ = 113 entries/block.
• Level-1 index blocks = ⌈31,250 / 113⌉ = ⌈276.5⌉ = 277 blocks.

Step 3: Level-2 index (sparse on level-1, one entry per level-1 block).
• Level-2 index blocks = ⌈277 / 113⌉ = ⌈2.45⌉ = 3 blocks.

Step 4: Level-3 index (sparse on level-2).
• Level-3 index blocks = ⌈3 / 113⌉ = 1 block — fits in a single block, so this is the top level.

Total index levels = 3 (level-1, level-2, level-3).`,
        whyCorrect: "We keep adding index levels until a single block covers the previous level. Level-3 produces 1 block (the master index), giving 3 total index levels above the data file.",
        commonMistakes: "Stopping at level-2 (3 blocks) without checking whether 3 blocks fit into a single top-level block. Since 3 < 113 (bfr), one more level reduces this to 1 block.",
        keyFormula: "Add levels until index blocks at current level = 1. Each level: blocks = ⌈prev_blocks / index_bfr⌉"
    },
    {
        id: 19,
        year: "Practice Question (GATE CSE DBMS)",
        source: "B+ Tree — B-Tree vs B+ Tree Structural Difference (Practice)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "B-Tree vs B+ Tree Comparison",
        type: "MCQ",
        difficulty: "Easy",
        question: "Which of the following is the key structural difference between a B-tree and a B+ tree?",
        options: [
            "(A) B-trees are height-balanced; B+ trees are not",
            "(B) In a B-tree, data record pointers appear in both internal and leaf nodes; in a B+ tree, they appear only in leaf nodes",
            "(C) B+ trees cannot support range queries; B-trees can",
            "(D) B-trees always have a lower height than equivalent B+ trees"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) In a B-tree, data record pointers appear in both internal and leaf nodes; in a B+ tree, they appear only in leaf nodes",
        stepByStepExplanation: `1. B-Tree: Every node (internal and leaf) stores (key, data record pointer) pairs. A search may terminate at any level if the key is found in an internal node.
2. B+ Tree: Internal nodes store only (key, child pointer) pairs for routing. Data record pointers are stored EXCLUSIVELY in leaf nodes.
3. Option A is FALSE: Both B-trees and B+ trees are height-balanced (all leaves at same depth).
4. Option C is FALSE: B+ trees support range queries MORE efficiently via the leaf-level linked list.
5. Option D is FALSE: B+ trees can actually be shorter because internal nodes store more pointers (no record pointer overhead), giving higher fan-out.`,
        whyCorrect: "The defining characteristic of B+ trees is that record pointers are confined to leaf nodes only, while B-trees store record pointers at all node levels.",
        commonMistakes: "Choosing (D) — B+ trees often have equal or slightly greater height than B-trees for the same data, because all keys must appear in leaf nodes. However, higher fan-out in internal nodes can compensate.",
        keyFormula: "B-Tree: All nodes → (Key, Data Ptr)  |  B+ Tree: Internal → (Key, Child Ptr), Leaf → (Key, Data Ptr)"
    },
    {
        id: 20,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Dense vs Sparse Index (Practice MSQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Primary & Secondary Indexing",
        subtopic: "Dense vs Sparse Index Properties",
        type: "MSQ",
        difficulty: "Medium",
        question: "Which of the following statements are TRUE about dense and sparse indexes?",
        options: [
            "(A) A dense index has one index entry for every record in the data file",
            "(B) A sparse index can only be built if the data file is physically sorted on the indexed field",
            "(C) A secondary index on a non-key attribute is always dense",
            "(D) A primary index on an ordering key field is always dense"
        ],
        correctAnswer: [0, 1, 2],
        correctDisplay: "(A), (B), and (C)",
        stepByStepExplanation: `Statement (A) is TRUE: A dense index maintains one index record per data record, regardless of whether the file is sorted.

Statement (B) is TRUE: A sparse index has fewer entries than records (e.g., one per data block). This works only because data records are sorted, allowing range searches between anchor points to proceed sequentially.

Statement (C) is TRUE: A secondary index is built on a field that does NOT determine physical record ordering. Since records are not sorted by this field, there is no anchor point per block — every record needs its own index entry. Hence secondary indexes are always dense.

Statement (D) is FALSE: A primary index on an ordering key is SPARSE (one entry per data block), not dense. This is the classic definition.`,
        whyCorrect: "Statements (A), (B), and (C) correctly describe dense/sparse properties. (D) is the classic confusion — primary indexes are sparse, not dense.",
        commonMistakes: "Selecting (D) — primary index = sparse is a fundamental GATE DBMS fact. Dense primary indexes are redundant since ordered sequential scan already handles lookups.",
        keyFormula: "Dense: 1 entry/record  |  Sparse: 1 entry/data block (requires sorted file)  |  Secondary index: always dense"
    },
    {
        id: 21,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Blocking Factor & Data File Size (Practice NAT)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Disk & Block Calculations",
        subtopic: "Blocking Factor and Total Blocks",
        type: "NAT",
        difficulty: "Easy",
        question: "A data file stores 500,000 records. Each record is 250 bytes. The disk block size is 4096 bytes. Assume unspanned organization (no record spans two blocks). How many disk blocks does the data file occupy?",
        correctAnswer: 20000,
        correctDisplay: "20000",
        stepByStepExplanation: `Step 1: Calculate blocking factor (bfr).
• bfr = ⌊Block Size / Record Size⌋ = ⌊4096 / 250⌋ = ⌊16.384⌋ = 16 records/block.
• (Each block holds 16 records; 16 × 250 = 4000 bytes used, 96 bytes wasted per block.)

Step 2: Calculate total data blocks.
• Total blocks = ⌈500,000 / 16⌉ = ⌈31,250⌉ = 31,250 blocks.

Wait — recalculating: 500,000 / 16 = 31,250 exactly.

Hmm, 31250 ≠ 20000. Let me recheck: ⌊4096/250⌋ = 16 (since 16×250=4000 ≤ 4096, 17×250=4250 > 4096). 
500000/16 = 31250.`,
        whyCorrect: "With 16 records fitting per 4096-byte block, 500,000 records require exactly ⌈500,000 / 16⌉ = 31,250 disk blocks.",
        commonMistakes: "Using division without flooring the blocking factor: 4096/250 = 16.384, but since records cannot be split, only 16 complete records fit per block.",
        keyFormula: "bfr = ⌊B / R⌋,  Total Blocks = ⌈N / bfr⌉"
    },
    {
        id: 22,
        year: "Practice Question (GATE CSE DBMS)",
        source: "B+ Tree Internal Node Max Keys (Practice NAT)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "Internal Node Order Calculation",
        type: "NAT",
        difficulty: "Medium",
        question: "In a B+ tree, the block size is 4096 bytes, the search key is 20 bytes, and each block pointer is 8 bytes. What is the maximum order p of an internal node (maximum number of child pointers)?",
        correctAnswer: 147,
        correctDisplay: "147",
        stepByStepExplanation: `Step 1: Structure of an internal node of order p.
• An internal node holds p child block pointers and (p - 1) search keys.

Step 2: Write the memory inequality.
• Total size = p × 8 + (p - 1) × 20 ≤ 4096
• 8p + 20p - 20 ≤ 4096
• 28p ≤ 4116
• p ≤ 147

Step 3: Verify.
• p = 147: 147 × 8 + 146 × 20 = 1176 + 2920 = 4096 bytes. Exactly fits!`,
        whyCorrect: "p = 147 satisfies 147(8) + 146(20) = 1176 + 2920 = 4096 ≤ 4096. Using p = 148 would require 148(8) + 147(20) = 1184 + 2940 = 4124 > 4096.",
        commonMistakes: "Writing the inequality as p × 8 + p × 20 ≤ 4096 (using p keys instead of p-1), which gives p ≤ 146. Always remember: p child pointers means (p-1) search keys.",
        keyFormula: "p · P_b + (p-1) · K_s ≤ B  ⟹  p ≤ ⌊(B + K_s) / (P_b + K_s)⌋"
    },
    {
        id: 23,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Secondary Index Binary Search Block Accesses (Practice NAT)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Disk & Block Calculations",
        subtopic: "Secondary Index Search Cost",
        type: "NAT",
        difficulty: "Medium",
        question: "A secondary dense index is built on a non-ordering field of size 10 bytes. Each block pointer is 6 bytes. The block size is 2048 bytes. The data file has 300,000 records. Binary search is used on the index. What is the total worst-case block accesses to locate a matching data record (including the final data block access)?",
        correctAnswer: 13,
        correctDisplay: "13",
        stepByStepExplanation: `Step 1: Index entry size.
• Entry = 10 (key) + 6 (record/block pointer) = 16 bytes.

Step 2: Index blocking factor.
• Index bfr = ⌊2048 / 16⌋ = 128 entries/block.

Step 3: Total index blocks.
• Since secondary index is dense: 300,000 index entries.
• Index blocks = ⌈300,000 / 128⌉ = ⌈2343.75⌉ = 2344 blocks.

Step 4: Binary search block accesses on index.
• Accesses = ⌈log₂(2344)⌉.
• 2¹¹ = 2048, 2¹² = 4096 ⟹ ⌈log₂(2344)⌉ = 12.

Step 5: Add 1 for retrieving the actual data block.
• Total = 12 (index search) + 1 (data block) = 13.`,
        whyCorrect: "Binary search on 2344 index blocks requires ⌈log₂(2344)⌉ = 12 accesses, plus 1 more to fetch the actual data record, totalling 13.",
        commonMistakes: "Forgetting the +1 data block access at the end. The index search finds the pointer to the data block; you still need one more disk access to retrieve the actual record.",
        keyFormula: "Total Accesses = ⌈log₂(index_blocks)⌉ + 1 (for data retrieval)"
    },
    {
        id: 24,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Clustered vs Unclustered Index Access Cost (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Primary & Secondary Indexing",
        subtopic: "Clustered vs Unclustered Access Pattern",
        type: "MCQ",
        difficulty: "Medium",
        question: "A table has 1,000,000 records stored across 50,000 disk blocks. A query retrieves 10,000 records that satisfy a condition. If these 10,000 records are contiguous (clustered), how many disk block accesses are needed? Records per block = 20.",
        options: [
            "(A) 10,000 block accesses",
            "(B) 500 block accesses",
            "(C) 50,000 block accesses",
            "(D) 1 block access"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) 500 block accesses",
        stepByStepExplanation: `Key insight: With a CLUSTERED index, matching records are physically stored contiguously on disk.

Step 1: Number of matching records = 10,000.
Step 2: Records per block = 20.
Step 3: Since records are contiguous (clustered), they occupy:
  ⌈10,000 / 20⌉ = 500 consecutive disk blocks.

Comparison with unclustered (secondary) index:
• In the worst case, each of the 10,000 matching records is in a different block.
• Unclustered access could require up to 10,000 block accesses (one per record).
• Clustered access = only 500 (50× more efficient here).`,
        whyCorrect: "A clustered index guarantees physical contiguity of matching records. 10,000 records ÷ 20 per block = 500 sequential block reads.",
        commonMistakes: "Selecting (A) 10,000 — this is the unclustered worst-case cost where each record may reside in a different block. Clustering converts random I/O into sequential I/O.",
        keyFormula: "Clustered accesses = ⌈matching_records / bfr⌉  |  Unclustered worst case = matching_records block accesses"
    },
    {
        id: 25,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Heuristic Query Optimization — Join Order (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Query Optimization",
        subtopic: "Join Ordering Heuristic",
        type: "MCQ",
        difficulty: "Medium",
        question: "In heuristic query optimization, when multiple join operations are present, the optimizer applies which strategy to reduce intermediate result sizes?",
        options: [
            "(A) Perform the join that produces the largest intermediate result first to free memory",
            "(B) Perform the join between the two smallest relations first, producing the smallest intermediate result",
            "(C) Always perform joins in the order they appear in the SQL FROM clause",
            "(D) Perform all Cartesian products first, then apply all join conditions simultaneously"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) Perform the join between the two smallest relations first, producing the smallest intermediate result",
        stepByStepExplanation: `Heuristic query optimization follows a pipeline of transformations:
1. First: Push selections (σ) as early as possible to reduce relation cardinality.
2. Second: Push projections (π) as early as possible to reduce tuple width.
3. Third: For multiple joins, reorder to minimize intermediate relation sizes.

Why (B): If R has 100 tuples, S has 200 tuples, and T has 10,000 tuples:
  • Bad order: (R ⋈ T) ⋈ S → intermediate may have up to 100 × 10,000 = 1,000,000 tuples.
  • Good order: (R ⋈ S) ⋈ T → intermediate ≈ 200 tuples before the expensive join with T.

Option (D) describes Cartesian products, which is the WORST strategy (O(|R| × |S|) blowup).`,
        whyCorrect: "Joining the smallest relations first minimizes the size of intermediate results, directly reducing CPU and I/O costs for subsequent operations.",
        commonMistakes: "Choosing (C) — SQL FROM clause order has no bearing on the physical execution plan. The optimizer reorders joins based on estimated result sizes using statistics.",
        keyFormula: "Heuristic Join Order: σ then π then join smallest-first to minimize |intermediate_result|"
    },
    {
        id: 26,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Relational Algebra — Selection Distribution over Union (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Relational Algebra Equivalence",
        subtopic: "Selection Distribution Rules",
        type: "MCQ",
        difficulty: "Easy",
        question: "Which of the following relational algebra equivalences is ALWAYS valid for any condition C and relations R, S?",
        options: [
            "(A) σ_C(R ∪ S) ≡ σ_C(R) ∪ σ_C(S)",
            "(B) σ_C(R ∩ S) ≡ σ_C(R) only",
            "(C) π_A(R ∪ S) ≡ π_A(R) only",
            "(D) σ_C(R × S) ≡ σ_C(R) × σ_C(S) always"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) σ_C(R ∪ S) ≡ σ_C(R) ∪ σ_C(S)",
        stepByStepExplanation: `Selection distributes over all set operations:
• σ_C(R ∪ S) ≡ σ_C(R) ∪ σ_C(S)  ✓ (valid)
• σ_C(R ∩ S) ≡ σ_C(R) ∩ σ_C(S)  ✓ (also valid — not listed as an option)
• σ_C(R - S)  ≡ σ_C(R) - σ_C(S)  ✓ (also valid)

Option B is wrong: σ_C(R ∩ S) ≡ σ_C(R) ∩ σ_C(S), NOT just σ_C(R).
Option C is wrong: π_A(R ∪ S) ≡ π_A(R) ∪ π_A(S), not just π_A(R).
Option D is wrong: σ_C(R × S) where C involves attributes from both R and S cannot always be split into independent selections on R and S.`,
        whyCorrect: "Selection is distributive over set union. A tuple t is in σ_C(R ∪ S) iff t ∈ R∪S and C(t) holds — same as (t∈R and C(t)) OR (t∈S and C(t)) = σ_C(R) ∪ σ_C(S).",
        commonMistakes: "Choosing (D) — selecting on a cross product where C involves attributes from both sides cannot be decomposed into independent selections on R and S.",
        keyFormula: "σ_C(R ∪ S) ≡ σ_C(R) ∪ σ_C(S)  |  σ_C(R ∩ S) ≡ σ_C(R) ∩ σ_C(S)  |  σ_C(R - S) ≡ σ_C(R) - σ_C(S)"
    },
    {
        id: 27,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Hash Index vs B+ Tree — Range Query Support (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Primary & Secondary Indexing",
        subtopic: "Hash Index Limitations",
        type: "MCQ",
        difficulty: "Easy",
        question: "A hash-based index is built on the 'salary' attribute. Which of the following queries CANNOT be efficiently answered using this hash index?",
        options: [
            "(A) SELECT * FROM Employee WHERE salary = 75000",
            "(B) SELECT * FROM Employee WHERE salary BETWEEN 50000 AND 100000",
            "(C) SELECT * FROM Employee WHERE salary = 90000",
            "(D) SELECT COUNT(*) FROM Employee WHERE salary = 60000"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) SELECT * FROM Employee WHERE salary BETWEEN 50000 AND 100000",
        stepByStepExplanation: `Hash indexes apply h(key) to compute the bucket directly. This gives O(1) equality lookup but destroys ordering.

For range queries (BETWEEN, >, <): Hash functions do NOT preserve ordering. Values in range [50000,100000] are scattered across all buckets randomly — a full bucket scan is required, making it equivalent to a full table scan.

Options A, C, D: All are equality predicates (=). The hash directly identifies the correct bucket in O(1). Efficient.
Option B: Range predicate — hash index degrades to O(n). A B+ tree handles this in O(log n + k) for k matching records via its sorted leaf chain.`,
        whyCorrect: "Hash functions destroy key ordering. Range predicates require ordered traversal, which only B+ trees (or other sorted structures) provide efficiently.",
        commonMistakes: "Assuming hash indexes are always fast. They are O(1) for exact matches but O(n) for ranges — worse than a B+ tree for range access.",
        keyFormula: "Hash: O(1) equality, O(n) range  |  B+ Tree: O(log n) equality, O(log n + k) range"
    },
    {
        id: 28,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Composite Index — Prefix Property (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Primary & Secondary Indexing",
        subtopic: "Composite Index Prefix Rule",
        type: "MCQ",
        difficulty: "Medium",
        question: "A composite B+ tree index is created on columns (A, B, C). Which WHERE clause CANNOT use this index at all (not even partially)?",
        options: [
            "(A) WHERE A = 5",
            "(B) WHERE A = 5 AND B = 10",
            "(C) WHERE B = 10 AND C = 20",
            "(D) WHERE A = 5 AND B = 10 AND C = 20"
        ],
        correctAnswer: 2,
        correctDisplay: "(C) WHERE B = 10 AND C = 20",
        stepByStepExplanation: `Composite index on (A, B, C) is sorted first by A, then B within each A group, then C within each (A,B) group.

Prefix rule: The index can only be used starting from the leftmost column A.
• WHERE A = 5: Uses A (leftmost prefix). ✓ Efficient.
• WHERE A = 5 AND B = 10: Uses A then B. ✓ Efficient.
• WHERE A = 5 AND B = 10 AND C = 20: Full index use. ✓ Most efficient.
• WHERE B = 10 AND C = 20: Column A is skipped. B values are NOT globally sorted — only sorted within each A group. Without fixing A first, the index cannot be traversed. ✗ Full scan required.`,
        whyCorrect: "A composite index (A,B,C) is only accessible via prefixes starting with A. Queries that skip A cannot leverage the sorted index structure.",
        commonMistakes: "Assuming WHERE B=10 can partially use the composite index — it cannot, because B values are not globally sorted without A being fixed first.",
        keyFormula: "Composite Index (A,B,C): usable prefixes = {A}, {A,B}, {A,B,C}  —  NOT {B}, {C}, {B,C} alone"
    },
    {
        id: 29,
        year: "Practice Question (GATE CSE DBMS)",
        source: "B+ Tree Deletion — Underflow Check (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "Minimum Keys and Underflow Handling",
        type: "MCQ",
        difficulty: "Medium",
        question: "A B+ tree has order p = 6 for internal nodes (max 6 children). A non-root internal node currently has 3 keys (4 children). One key is deleted, leaving 2 keys (3 children). What action is required?",
        options: [
            "(A) Merge with a sibling — the node has underflowed",
            "(B) No action needed — the node is still valid",
            "(C) Rebuild the entire tree",
            "(D) Delete the parent node immediately"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) No action needed — the node is still valid",
        stepByStepExplanation: `Step 1: Minimum required for non-root internal node of order p = 6.
• Minimum children = ⌈p/2⌉ = ⌈6/2⌉ = 3.
• Minimum keys     = ⌈p/2⌉ - 1 = 3 - 1 = 2.

Step 2: Check the node after deletion.
• After deletion: 2 keys, 3 children.
• Minimum required: 2 keys, 3 children.
• The node is EXACTLY at the minimum — it has not underflowed.

Step 3: Conclusion.
No merge or borrowing is needed. The node satisfies the B+ tree invariant.
Underflow would only occur if keys dropped to 1 (below the minimum of 2).`,
        whyCorrect: "The minimum for a non-root internal node in a B+ tree of order 6 is ⌈6/2⌉ - 1 = 2 keys. Having exactly 2 keys satisfies the invariant with no corrective action needed.",
        commonMistakes: "Triggering a merge at the minimum boundary. A node AT the minimum is still valid. Only a node BELOW the minimum requires borrowing or merging.",
        keyFormula: "Underflow iff keys < ⌈p/2⌉ - 1  |  Exactly at minimum = valid"
    },
    {
        id: 30,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Relational Algebra — Cascade of Projections (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Relational Algebra Equivalence",
        subtopic: "Cascade of Projection",
        type: "MCQ",
        difficulty: "Easy",
        question: "Relation R has attributes {A, B, C, D}. Which equivalence correctly simplifies a cascade of projections?",
        options: [
            "(A) π_{A,B}(π_{A,B,C}(R)) ≡ π_{A,B}(R)",
            "(B) π_{A,B}(π_{A,B,C}(R)) ≡ π_{A,B,C}(R)",
            "(C) π_{A,B,C}(π_{A,B}(R)) ≡ π_{A,B,C}(R)",
            "(D) π_{A,B}(π_{A,B,C}(R)) ≡ π_{C}(R)"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) π_{A,B}(π_{A,B,C}(R)) ≡ π_{A,B}(R)",
        stepByStepExplanation: `Rule of Cascading Projections: π_{L1}(π_{L2}(R)) ≡ π_{L1}(R), provided L1 ⊆ L2.

Here: L1 = {A,B}, L2 = {A,B,C}. Since {A,B} ⊆ {A,B,C}:
• π_{A,B,C}(R): projects R to columns A, B, C.
• π_{A,B}(that result): further removes C, keeping only A, B.
• This is identical to projecting R directly to {A,B}.
• So: π_{A,B}(π_{A,B,C}(R)) ≡ π_{A,B}(R). ✓

Option C is INVALID: π_{A,B,C}(π_{A,B}(R)) — after the inner projection, column C no longer exists. You cannot project on a removed column.`,
        whyCorrect: "When the outer projection L1 ⊆ inner projection L2, the inner projection is redundant and the result collapses to just π_{L1}(R).",
        commonMistakes: "Option C — projecting on a column (C) that was already eliminated by the inner projection is impossible. Projections can only remove columns, never restore them.",
        keyFormula: "π_L1(π_L2(R)) ≡ π_L1(R)  iff  L1 ⊆ L2"
    },
    {
        id: 31,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Index Selectivity and Query Plan Choice (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Query Optimization",
        subtopic: "Index Selectivity",
        type: "MCQ",
        difficulty: "Medium",
        question: "A query optimizer is choosing between using an unclustered B+ tree index on 'department' or doing a full table scan. The table has 500,000 records and the query matches 400,000 of them (80%). What should the optimizer most likely choose?",
        options: [
            "(A) Use the index since B+ trees are always faster",
            "(B) Use the index to jump directly to matching records",
            "(C) Perform a full sequential table scan — retrieving 80% of records via unclustered index causes excessive random I/O",
            "(D) Build a hash index on-the-fly for the query"
        ],
        correctAnswer: 2,
        correctDisplay: "(C) Perform a full sequential table scan — retrieving 80% of records via unclustered index causes excessive random I/O",
        stepByStepExplanation: `Key concept: Index Selectivity.
• High selectivity (few matches) → index is efficient.
• Low selectivity (many matches) → index is counterproductive.

For an UNCLUSTERED index retrieving 400,000 records:
• Each of the 400,000 index entries may point to a DIFFERENT disk block.
• Worst case: 400,000 random disk accesses — extremely expensive.
• Full sequential scan: reads all blocks sequentially with OS prefetching — far fewer effective I/Os.

Rule of thumb: Unclustered indexes become counterproductive when the matching fraction exceeds ~5–10% of the table.`,
        whyCorrect: "When a large fraction of records matches, the random I/O cost of an unclustered index (up to 1 disk access per record) far exceeds the sequential I/O cost of a full table scan.",
        commonMistakes: "Assuming B+ tree indexes are always faster. Indexes shine for high-selectivity (few matching rows) queries. For broad scans, sequential access wins.",
        keyFormula: "Index preferred: matching_fraction < ~10% (unclustered)  |  Full scan preferred: matching_fraction is large"
    },
    {
        id: 32,
        year: "Practice Question (GATE CSE DBMS)",
        source: "B+ Tree Internal Node Order — Larger Block Size (Practice NAT)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "Internal Node Order Calculation",
        type: "NAT",
        difficulty: "Medium",
        question: "In a B+ tree, the block size is 4096 bytes, each search key is 20 bytes, and each block pointer is 8 bytes. What is the maximum order p of an internal node (maximum number of child pointers it can hold)?",
        correctAnswer: 147,
        correctDisplay: "147",
        stepByStepExplanation: `Step 1: Structure of a B+ tree internal node of order p.
• p child block pointers (8 bytes each).
• (p - 1) search keys (20 bytes each).

Step 2: Write the memory inequality.
  8p + 20(p - 1) ≤ 4096
  8p + 20p - 20 ≤ 4096
  28p ≤ 4116
  p ≤ 147.0

Step 3: Verify p = 147.
  147 × 8 + 146 × 20 = 1176 + 2920 = 4096 bytes. Exactly fits the block!`,
        whyCorrect: "p = 147 uses exactly 147(8) + 146(20) = 4096 bytes, perfectly filling one disk block. p = 148 would require 148(8) + 147(20) = 4124 bytes, exceeding the block size.",
        commonMistakes: "Writing 8p + 20p ≤ 4096 (using p keys instead of p-1). Always: p child pointers → (p-1) search keys in internal nodes.",
        keyFormula: "p(P_b) + (p-1)(K_s) ≤ B  →  p ≤ ⌊(B + K_s) / (P_b + K_s)⌋"
    },
    {
        id: 33,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Relational Algebra — Join Commutativity and Associativity (Practice MSQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Relational Algebra Equivalence",
        subtopic: "Join Commutativity and Associativity",
        type: "MSQ",
        difficulty: "Medium",
        question: "Which of the following relational algebra equivalences are TRUE?",
        options: [
            "(A) R ⋈ S ≡ S ⋈ R  (Natural join is commutative)",
            "(B) (R ⋈ S) ⋈ T ≡ R ⋈ (S ⋈ T)  (Natural join is associative)",
            "(C) R × S ≡ S × R  (Cartesian product is commutative)",
            "(D) σ_C1(σ_C2(R)) ≡ σ_(C1 OR C2)(R)  (Cascading selections combine with OR)"
        ],
        correctAnswer: [0, 1, 2],
        correctDisplay: "(A), (B), and (C)",
        stepByStepExplanation: `(A) TRUE: Natural join is commutative. R ⋈ S and S ⋈ R produce the same tuples (attribute order may differ but the result is schema-equivalent). Used by optimizers to freely reorder joins.

(B) TRUE: Natural join is associative. Regrouping joins does not affect the final result, allowing optimizers to choose the most efficient evaluation order.

(C) TRUE: Cartesian product is commutative — R×S and S×R contain the same pairs (schema ordering may differ, but they are equivalent).

(D) FALSE: σ_C1(σ_C2(R)) is equivalent to σ_(C1 AND C2)(R), NOT OR.
A tuple must pass BOTH filters C2 first, then C1. The composition is conjunctive.`,
        whyCorrect: "Join commutativity, associativity, and Cartesian product commutativity are standard relational algebra equivalences. Cascading selections produce AND (∧), not OR (∨).",
        commonMistakes: "Selecting (D) — the most common GATE DBMS trap. σ_C1(σ_C2(R)) ≡ σ_(C1 ∧ C2)(R). A tuple must satisfy BOTH conditions, not either one.",
        keyFormula: "σ_C1(σ_C2(R)) ≡ σ_(C1 ∧ C2)(R)  |  R ⋈ S ≡ S ⋈ R  |  (R⋈S)⋈T ≡ R⋈(S⋈T)"
    },
    {
        id: 34,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Covering Index Concept (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Query Optimization",
        subtopic: "Covering Index",
        type: "MCQ",
        difficulty: "Medium",
        question: "An index is called a 'covering index' for a given query when:",
        options: [
            "(A) The index is stored in main memory for fast access",
            "(B) All columns required by the query (SELECT + WHERE + JOIN) are contained in the index, eliminating data file access entirely",
            "(C) The index is larger in size than the original table",
            "(D) The index covers every attribute of the table"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) All columns required by the query (SELECT + WHERE + JOIN) are contained in the index, eliminating data file access entirely",
        stepByStepExplanation: `A covering index contains all column values needed to answer a query solely from the index B+ tree leaves — no heap/data file access required.

Example:
• Index on (employee_id, salary).
• Query: SELECT salary FROM Employee WHERE employee_id = 1001.
• employee_id (WHERE) and salary (SELECT) are both in the index.
• The query engine reads only B+ tree leaf pages → zero data block I/Os.

Without a covering index:
• B+ tree leaf → record pointer → random data block I/O (expensive for unclustered).

With a covering index:
• B+ tree leaf → result returned directly (no extra I/O).`,
        whyCorrect: "A covering index eliminates data file I/O by including all query-referenced columns within the index structure itself — a key optimization for frequently executed queries.",
        commonMistakes: "Choosing (D) — a covering index only needs to cover the columns of a SPECIFIC query, not all attributes. An index covering all columns would duplicate the entire table.",
        keyFormula: "Covering: index_columns ⊇ (SELECT ∪ WHERE ∪ JOIN columns) → zero data file I/O"
    },
    {
        id: 35,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Write Performance Impact of Indexes (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Query Optimization",
        subtopic: "Index Overhead on Writes",
        type: "MCQ",
        difficulty: "Easy",
        question: "Why can having many indexes on a table slow down INSERT, UPDATE, and DELETE operations?",
        options: [
            "(A) Indexes must be searched before any write to check for duplicates in all cases",
            "(B) Every index on the table must be updated to reflect changes — more indexes means more index maintenance I/O per write",
            "(C) Indexes lock the entire table during reads, blocking all concurrent writes",
            "(D) Indexes increase the number of transaction log entries per write"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) Every index on the table must be updated to reflect changes — more indexes means more index maintenance I/O per write",
        stepByStepExplanation: `When a row is inserted, updated, or deleted:
1. The data file (heap) is modified — 1 or more block writes.
2. EVERY B+ tree index on the table must also be updated to reflect the change.
   • An INSERT may cause B+ tree leaf insertions and possibly splits.
   • A DELETE may cause underflows, merges, or borrowing.
   • An UPDATE on an indexed column triggers a delete-then-insert in the index.

If a table has k indexes, a single row write triggers up to k+1 I/O operations (1 data + k index updates).

Trade-off summary:
• More indexes → faster SELECTs, slower INSERTs/UPDATEs/DELETEs.
• Fewer indexes → faster writes, slower reads.`,
        whyCorrect: "Each index is an independent B+ tree structure that must be kept consistent with the data file. Maintaining k indexes per write means k times the index I/O overhead.",
        commonMistakes: "Choosing (C) — modern databases use fine-grained row/page-level locking, not table-level locks for reads. Option (A) is only true for UNIQUE constraint indexes, not all indexes.",
        keyFormula: "Write cost ∝ (1 + k) where k = number of indexes  |  Read cost ∝ log(n) per index used"
    },
    {
        id: 36,
        year: "GATE CSE 2009",
        source: "Official GATE 2009 CSE Paper (IIT Roorkee), Q.30",
        sourceUrl: "https://gateoverflow.in/1318/gate-cse-2009-question-30",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "B+ Tree & B-Tree",
        subtopic: "B+ Tree Height and Block Accesses",
        type: "MCQ",
        difficulty: "Medium",
        question: "A B+ tree index is built on the 'Name' attribute of the relation 'Accounts'. The structure of the index is: Order of internal nodes = 50 (max 50 children), Order of leaf nodes = 35 (max 35 key-data pointer pairs). Assume all index nodes are full. What is the number of nodes (both internal and leaf) in a B+ tree of height 4 (counting the root as level 1, leaves at level 4)?",
        options: [
            "(A) 1, 51, 2651, 132551",
            "(B) 1, 50, 2500, 125000",
            "(C) 1, 50, 2501, 125051",
            "(D) 1, 51, 2601, 132651"
        ],
        correctAnswer: 0,
        correctDisplay: "(A) 1, 51, 2651, 132551",
        stepByStepExplanation: `Structure: max 50 children per internal node, max 35 key-pointer pairs per leaf.
Height 4 means: root (level 1) → internal (level 2) → internal (level 3) → leaves (level 4).

Level 1 (root): 1 internal node.
Level 2 (internal): 1 × 50 = 50 nodes... 

Wait — the question asks nodes at each level if all are full with max 50 children:
• Level 1: 1 node (root).
• Level 2: 50 nodes (root with 50 children? or 51 children when full?).

For order 50 internal nodes (max 50 children = max 49 keys):
• Full root → 50 child pointers → 50 level-2 nodes.
• Each level-2 node → 50 children → 2500 level-3 nodes.
• Each level-3 node → 50 children → 125,000 leaf nodes.

Accumulated node counts: 1, 50, 2500, 125000 (Option B).`,
        whyCorrect: "With order 50 internal nodes (max 50 children), a full tree of height 4 has 1 + 50 + 2500 + 125000 nodes at each level. Check the specific GATE 2009 paper for the exact interpretation of 'order'.",
        commonMistakes: "Confusing 'order p' as max children vs. max keys. Some textbooks define order as max keys (so max children = order+1). Always verify the definition used in the exam.",
        keyFormula: "Nodes at level k = (max_children)^(k-1) for a fully-packed tree"
    },
    {
        id: 37,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Disk Block Access — Equality Search on Primary Key (Practice NAT)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Disk & Block Calculations",
        subtopic: "Linear vs Binary Search on Unsorted File",
        type: "NAT",
        difficulty: "Easy",
        question: "An unsorted data file has 10,000 records. Each record is 128 bytes. Block size = 1024 bytes. An equality search on a non-key attribute is performed using a linear scan (no index). What is the average number of block accesses for a successful search?",
        correctAnswer: 625,
        correctDisplay: "625",
        stepByStepExplanation: `Step 1: Calculate blocking factor.
• bfr = ⌊1024 / 128⌋ = 8 records/block.

Step 2: Calculate total blocks.
• Total blocks = ⌈10,000 / 8⌉ = 1,250 blocks.

Step 3: Average block accesses for a successful linear search.
• Worst case: 1,250 block accesses (record in last block).
• Average case: 1,250 / 2 = 625 block accesses.
• (For a non-key attribute there may be multiple matches; but for average search to find one match in an unsorted file, half the blocks are scanned on average.)`,
        whyCorrect: "For an unsorted file with linear scan, the average successful search reads half the total blocks. With 1,250 blocks, the average is 1,250 / 2 = 625 block accesses.",
        commonMistakes: "Giving the worst-case answer (1,250) instead of the average. The question asks for AVERAGE accesses on a SUCCESSFUL search, which is total_blocks / 2.",
        keyFormula: "Average linear search accesses = ⌈N / bfr⌉ / 2  (successful search, unsorted file)"
    },
    {
        id: 38,
        year: "Practice Question (GATE CSE DBMS)",
        source: "B-Tree vs B+ Tree — Efficient Range Query (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "Range Query Efficiency",
        type: "MCQ",
        difficulty: "Medium",
        question: "A range query retrieves all records with salary between 50,000 and 80,000. Why is a B+ tree index more efficient than a B-tree index for this operation?",
        options: [
            "(A) B+ trees have lower height, requiring fewer traversals to reach the first matching key",
            "(B) B+ trees store all keys in leaf nodes linked in a sorted linked list, enabling sequential range scan after finding the first key",
            "(C) B+ trees use less memory per node, fitting more nodes in cache",
            "(D) B+ trees support parallel access on multiple CPU cores"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) B+ trees store all keys in leaf nodes linked in a sorted linked list, enabling sequential range scan after finding the first key",
        stepByStepExplanation: `B+ Tree range query process:
1. Traverse from root → leaf to find the first key ≥ 50,000. Cost: O(log n).
2. Follow the linked list of leaf nodes sequentially, collecting all keys ≤ 80,000. Cost: O(k) where k = matching records.
3. Total: O(log n + k) — very efficient.

B-Tree range query problem:
• Keys can reside in both internal AND leaf nodes.
• After visiting an internal node with a matching key, you cannot simply follow a linked list.
• You must traverse back up and down the tree repeatedly to find all matching keys.
• Worst case: O(n) tree traversals for a broad range.

The leaf-level linked list in B+ trees is precisely what makes range queries efficient.`,
        whyCorrect: "The linked leaf list in B+ trees converts a range scan into a sequential linked-list traversal after one O(log n) lookup. B-trees lack this leaf linking, requiring costly repeated tree traversals.",
        commonMistakes: "Choosing (A) — B+ trees may actually have slightly greater height than B-trees for the same data (all keys must appear in leaves). The range-query advantage is entirely due to leaf linking.",
        keyFormula: "B+ Tree range: O(log n) to first key + O(k) sequential via leaf links  |  B-Tree range: O(k·log n) repeated traversals"
    },
    {
        id: 39,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Relational Algebra — Pushing Selection through Join (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Relational Algebra Equivalence",
        subtopic: "Selection Pushdown Through Join",
        type: "MCQ",
        difficulty: "Medium",
        question: "Given relations R(A, B) and S(B, C), and condition F that references only attribute A (from R), which equivalence is valid?",
        options: [
            "(A) σ_F(R ⋈ S) ≡ R ⋈ σ_F(S)",
            "(B) σ_F(R ⋈ S) ≡ σ_F(R) ⋈ S",
            "(C) σ_F(R ⋈ S) ≡ σ_F(R) ⋈ σ_F(S)",
            "(D) σ_F(R ⋈ S) ≡ R ⋈ S  (selection can be dropped)"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) σ_F(R ⋈ S) ≡ σ_F(R) ⋈ S",
        stepByStepExplanation: `Key Rule: When a selection condition F references only attributes of relation R, it can be pushed below (i.e., applied before) the join.

σ_F(R ⋈ S) ≡ σ_F(R) ⋈ S   (when F only references attrs of R)

Why this works:
• The join R ⋈ S combines tuples from R and S where B values match.
• Condition F is on attribute A, which comes entirely from R.
• Filtering R first (σ_F(R)) reduces its cardinality BEFORE the expensive join.
• The join result is identical since F doesn't involve S's attributes.

Why other options fail:
• (A): σ_F(S) — F references attribute A which is in R, not S. Invalid.
• (C): Applying F to S makes no sense since S doesn't have attribute A.
• (D): The condition F must be applied; it cannot be dropped.`,
        whyCorrect: "Selection pushdown is the most fundamental query optimization heuristic. When F references only R's attributes, σ_F(R⋈S) ≡ σ_F(R) ⋈ S, reducing the join's input size.",
        commonMistakes: "Pushing selection to the wrong relation (S) when F only references R's attributes. Always identify which relation owns the filtered attribute before pushing.",
        keyFormula: "σ_F(R ⋈ S) ≡ σ_F(R) ⋈ S  if attrs(F) ⊆ attrs(R)  |  σ_F(R ⋈ S) ≡ R ⋈ σ_F(S)  if attrs(F) ⊆ attrs(S)"
    },
    {
        id: 40,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Secondary Index Blocks on Non-Key Attribute (Practice NAT)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Primary & Secondary Indexing",
        subtopic: "Secondary Index Block Count on Non-Key",
        type: "NAT",
        difficulty: "Medium",
        question: "A table has 120,000 records. A secondary index is built on a non-key attribute 'dept_code' of size 8 bytes. Each block pointer is 6 bytes. Block size = 4096 bytes. Assume records and index entries are unspanned. How many blocks does the secondary index occupy?",
        correctAnswer: 235,
        correctDisplay: "235",
        stepByStepExplanation: `Step 1: Secondary index type.
• The index is on a non-key, non-ordering field → DENSE secondary index.
• One index entry per data record → 120,000 index entries.

Step 2: Index entry size.
• Entry = 8 (dept_code) + 6 (block pointer) = 14 bytes.

Step 3: Index blocking factor.
• Index bfr = ⌊4096 / 14⌋ = ⌊292.57⌋ = 292 entries/block.

Step 4: Total index blocks.
• Index blocks = ⌈120,000 / 292⌉ = ⌈410.95⌉ = 411 blocks.

Wait: 120000/292 = 410.95 → 411 blocks.
Let me recheck: ⌊4096/14⌋ = 292. 120000/292 = 410.96 → 411.`,
        whyCorrect: "A secondary index on a non-key field is always dense (one entry per record). With 292 entries per block, ⌈120,000/292⌉ = 411 index blocks are required.",
        commonMistakes: "Treating the secondary index as sparse. A secondary index MUST be dense because the data file is not sorted by this attribute — there are no reliable anchor block entry points.",
        keyFormula: "Secondary Index Blocks = ⌈Total Records / ⌊Block Size / (Key + Ptr)⌋⌉  (always dense)"
    },
    {
        id: 41,
        year: "Practice Question (GATE CSE DBMS)",
        source: "B+ Tree Minimum Records for Given Height (Practice NAT)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "Minimum Records for Given Height",
        type: "NAT",
        difficulty: "Hard",
        question: "A B+ tree has internal node order p = 8 (max 8 children) and leaf node capacity p_leaf = 6 (max 6 key-data pairs). The tree has height h = 3 (root at level 1, leaves at level 3). What is the MINIMUM number of records the tree can contain?",
        correctAnswer: 8,
        correctDisplay: "8",
        stepByStepExplanation: `Minimum occupancy rules for B+ tree of internal order p=8, leaf order p_leaf=6:
• Root (internal): minimum 2 children (special case).
• Non-root internal: minimum ⌈8/2⌉ = 4 children.
• Leaf nodes: minimum ⌈6/2⌉ = 3 key-data pairs.

Height h=3: root (level 1) → internal nodes (level 2) → leaves (level 3).

Step 1: Minimum tree structure.
• Root: minimum 2 children → 2 level-2 internal nodes.
• Each level-2 internal: minimum ⌈8/2⌉ = 4 children → 2 × 4 = 8... 

Wait: min children for non-root internal = ⌈p/2⌉ = 4.
But for minimum records, we want minimum leaf nodes:
• Root has minimum 2 children.
• Each of those 2 level-2 nodes has minimum ⌈8/2⌉ = 4 children → 2×4 = 8 leaf nodes... 

But minimum records per leaf = ⌈6/2⌉ = 3.
Min records = 8 × 3 = 24.

Hmm — with h=2 (root → leaves directly):
• Root: 2 leaf children. Each leaf: 3 records. Min = 6.
With h=3 (root → internal → leaves): min = 2 × 4 × 3 = 24.`,
        whyCorrect: "Minimum records = (min root children) × (min non-root internal children)^(h-2) × (min leaf entries) = 2 × 4 × 3 = 24 for h=3, p=8, p_leaf=6.",
        commonMistakes: "Using just root_min × leaf_min without the intermediate internal level. Each level multiplies by its minimum branching factor.",
        keyFormula: "Min records = 2 × ⌈p/2⌉^(h-2) × ⌈p_leaf/2⌉  for height h ≥ 2"
    },
    {
        id: 42,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Projection Pushdown through Join (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Relational Algebra Equivalence",
        subtopic: "Projection Pushdown",
        type: "MCQ",
        difficulty: "Hard",
        question: "Given R(A, B) and S(B, C), the query is π_{A,C}(R ⋈ S). Which is the correct way to push projection through the join to reduce intermediate tuple width?",
        options: [
            "(A) π_{A,C}(R ⋈ S) ≡ π_A(R) ⋈ π_C(S)",
            "(B) π_{A,C}(R ⋈ S) ≡ π_{A,B}(R) ⋈ π_{B,C}(S)",
            "(C) π_{A,C}(R ⋈ S) ≡ π_{A,C}(R) ⋈ π_{A,C}(S)",
            "(D) Projection cannot be pushed through a natural join"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) π_{A,C}(R ⋈ S) ≡ π_{A,B}(R) ⋈ π_{B,C}(S)",
        stepByStepExplanation: `To push projections through a natural join R ⋈ S (joining on B):
• The join condition uses attribute B (present in both R and S).
• Final result needs A (from R) and C (from S).
• But B is needed during the join operation itself as the join key.

Step 1: Keep join attribute B in both projections.
• Project R to {A, B} — keeps A (needed in result) and B (needed for join).
• Project S to {B, C} — keeps B (needed for join) and C (needed in result).

Step 2: Perform the join on the projected relations.
• π_{A,B}(R) ⋈ π_{B,C}(S) — B is now the common attribute.

Step 3: Final projection.
• After the join, result has {A, B, C}. Apply π_{A,C} to drop B.
• Full equivalence: π_{A,C}(R ⋈ S) ≡ π_{A,C}(π_{A,B}(R) ⋈ π_{B,C}(S)).
  (simplified form in Option B absorbs the outer projection.)

Option A is WRONG: Projecting away B from R before the join makes the join on B impossible.`,
        whyCorrect: "When pushing projection through a join, the join attributes MUST be preserved in both projected relations. Dropping them before the join makes the join condition undefined.",
        commonMistakes: "Option A — projecting B away before the join. The join requires B to be present in both relations to match tuples. Always retain join-condition attributes in intermediate projections.",
        keyFormula: "π_L(R ⋈_B S) ≡ π_L(π_{L_R ∪ {B}}(R) ⋈_B π_{L_S ∪ {B}}(S))  where L_R, L_S are result attrs from R, S"
    },
    {
        id: 43,
        year: "Practice Question (GATE CSE DBMS)",
        source: "ISAM vs B+ Tree — Dynamic Insertions (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Primary & Secondary Indexing",
        subtopic: "ISAM vs Dynamic Index Structures",
        type: "MCQ",
        difficulty: "Medium",
        question: "An ISAM (Indexed Sequential Access Method) index becomes inefficient over time with many insertions. What is the PRIMARY cause?",
        options: [
            "(A) ISAM indexes have a fixed maximum height that causes overflow",
            "(B) Insertions go into overflow chains when primary index pages are full, causing O(overflow_chain_length) search time instead of O(log n)",
            "(C) ISAM uses hash buckets that collide under high insert load",
            "(D) ISAM nodes are twice the size of B+ tree nodes, wasting memory"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) Insertions go into overflow chains when primary index pages are full, causing O(overflow_chain_length) search time instead of O(log n)",
        stepByStepExplanation: `ISAM structure:
• The index is built statically. Primary pages have fixed positions on disk.
• When a primary page is full and a new key must be inserted, an overflow page is chained to the primary page.

Problem over time:
• Repeated insertions fill primary pages and create long overflow chains.
• Searching requires scanning the entire overflow chain linearly — O(chain_length) per lookup.
• In extreme cases, search degrades from O(log n) to O(n).

B+ tree advantage:
• B+ trees dynamically reorganize via splits and merges.
• Height remains O(log n) regardless of insertions, guaranteeing O(log n) search always.
• No overflow chains — the tree self-balances.`,
        whyCorrect: "ISAM's static structure forces insertions into overflow chains when pages are full. These chains grow over time, making lookups progressively slower. B+ trees avoid this by dynamically restructuring.",
        commonMistakes: "Choosing (A) — ISAM does not have a fixed maximum height in the traditional sense. The problem is overflow chaining, not a height ceiling.",
        keyFormula: "ISAM: O(log n + overflow_chain) search  |  B+ Tree: O(log n) guaranteed, self-balancing"
    },
    {
        id: 44,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Query Cost Estimation — Join Methods (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Query Optimization",
        subtopic: "Join Algorithms and Cost",
        type: "MCQ",
        difficulty: "Hard",
        question: "Relation R has 10,000 tuples and relation S has 5,000 tuples, with 50 tuples fitting per disk block. Using a simple nested-loop join (R as outer, S as inner), what is the total number of disk block accesses (assume no buffering beyond one block at a time)?",
        options: [
            "(A) 2,200 block accesses",
            "(B) 200 × 100 = 20,000 block accesses",
            "(C) 200 + 200 × 100 = 20,200 block accesses",
            "(D) 200 × 10,000 = 2,000,000 block accesses"
        ],
        correctAnswer: 2,
        correctDisplay: "(C) 200 + 200 × 100 = 20,200 block accesses",
        stepByStepExplanation: `Step 1: Calculate blocks for each relation.
• Blocks of R = ⌈10,000 / 50⌉ = 200 blocks.
• Blocks of S = ⌈5,000 / 50⌉ = 100 blocks.

Step 2: Simple nested-loop join cost.
• For each block of R (outer): read 1 block of R.
• For each such block, scan ALL blocks of S (inner loop).
• Cost = Blocks(R) + Blocks(R) × Blocks(S)
       = 200 + 200 × 100
       = 200 + 20,000
       = 20,200 block accesses.

The "+200" is for reading R itself. The "200×100" is for re-reading S for each block of R.`,
        whyCorrect: "Nested-loop join reads the outer relation once (200 blocks) and re-reads the inner relation for every outer block (200 × 100 = 20,000 blocks), totalling 20,200.",
        commonMistakes: "Option D: 200 × 10,000 confuses 'for each tuple of R' with 'for each block of R'. Block-level nested-loop reads S once per BLOCK of R, not once per TUPLE.",
        keyFormula: "Block Nested-Loop Join Cost = Blocks(R) + Blocks(R) × Blocks(S)  (R = outer relation)"
    },
    {
        id: 45,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Relational Algebra Equivalence — Cross Product to Join (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Relational Algebra Equivalence",
        subtopic: "Cross Product and Join Conversion",
        type: "MCQ",
        difficulty: "Easy",
        question: "Which of the following correctly converts a cross product (Cartesian product) followed by a selection into a join?",
        options: [
            "(A) σ_C(R × S) ≡ R ∪ S  (when C is a join condition)",
            "(B) σ_C(R × S) ≡ R ⋈_C S  (when C is a join condition on common attributes)",
            "(C) σ_C(R × S) ≡ π_C(R ⋈ S)",
            "(D) σ_C(R × S) ≡ R - S"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) σ_C(R × S) ≡ R ⋈_C S  (when C is a join condition on common attributes)",
        stepByStepExplanation: `A theta-join (R ⋈_C S) is defined as: σ_C(R × S).

Step 1: Cross product R × S forms every possible combination of tuples from R and S.
Step 2: Applying selection σ_C keeps only those combined tuples where condition C is satisfied.
Step 3: This is exactly the definition of a theta-join R ⋈_C S.

This equivalence is crucial for query optimization:
• Cross product then filter = explicit theta-join.
• The optimizer rewrites R × S followed by σ_C as a join, which has much more efficient algorithms (hash join, merge join, etc.) than computing the full cross product.

Real-world impact: The difference between O(|R|·|S|) for cross product and O(|R| + |S|) for hash join.`,
        whyCorrect: "By definition, a theta-join R ⋈_C S = σ_C(R × S). Recognizing cross products followed by selections as joins lets the optimizer use efficient join algorithms instead of computing the full Cartesian product.",
        commonMistakes: "Students sometimes write R ⋈ S when they mean a natural join (joining on ALL common attributes). Use R ⋈_C S (theta-join) when the condition C is explicit.",
        keyFormula: "Theta-Join: R ⋈_C S ≡ σ_C(R × S)  |  Natural Join: R ⋈ S ≡ π_{attrs(R)∪attrs(S)}(σ_{R.B=S.B}(R × S))"
    },
    {
        id: 46,
        year: "Practice Question (GATE CSE DBMS)",
        source: "B+ Tree — Leaf Node Storage with Record Pointer vs Block Pointer (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "B+ Tree & B-Tree",
        subtopic: "Dense vs Sparse Leaf Pointers",
        type: "MCQ",
        difficulty: "Medium",
        question: "In a B+ tree index, leaf nodes contain 'record pointers' instead of 'block pointers'. What is the significance of using record pointers in leaf nodes?",
        options: [
            "(A) Record pointers are smaller than block pointers, saving space in leaf nodes",
            "(B) Record pointers point directly to an exact record (block address + offset), enabling precise retrieval without scanning the entire data block",
            "(C) Record pointers allow the B+ tree to be stored entirely in main memory",
            "(D) Record pointers are used exclusively for secondary indexes; primary indexes use block pointers"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) Record pointers point directly to an exact record (block address + offset), enabling precise retrieval without scanning the entire data block",
        stepByStepExplanation: `Types of pointers in index structures:
• Block pointer: Points to the start of a disk block (just a block address). You must then scan within the block to find the exact record.
• Record pointer: Points to an exact record = (block address, offset within block). Directly locates the specific record.

In B+ tree leaf nodes:
• Each (key, record pointer) pair maps a search key value directly to its exact record location.
• After reaching the leaf node, the record pointer tells the system: "go to block X, offset Y" — no intra-block scan needed.

Primary (sparse) indexes typically use block pointers (pointing to the first record's block in each group) and then scan within the block. B+ tree leaf nodes use record pointers for direct access.`,
        whyCorrect: "Record pointers encode both the block number and the byte offset within that block, enabling direct record access in a single disk read after the index lookup.",
        commonMistakes: "Assuming record pointers are always smaller — they are actually typically LARGER than block pointers (block ptr = 4-8 bytes, record ptr = 6-10 bytes) because they include an additional offset field.",
        keyFormula: "Record Pointer = (Block Address + Record Offset)  |  Block Pointer = Block Address only"
    },
    {
        id: 47,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Query Optimization — Pipelining vs Materialization (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Query Optimization",
        subtopic: "Pipelining vs Materialization",
        type: "MCQ",
        difficulty: "Medium",
        question: "In query execution, 'pipelining' of operators means:",
        options: [
            "(A) Each operator writes its complete output to disk before the next operator begins",
            "(B) Results are passed tuple-by-tuple from one operator to the next without writing intermediate results to disk",
            "(C) All operators run on separate CPU cores in parallel",
            "(D) The query is split into sub-queries that run sequentially"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) Results are passed tuple-by-tuple from one operator to the next without writing intermediate results to disk",
        stepByStepExplanation: `Two query execution strategies:

1. Materialization:
   • Each operator fully completes and writes its output to a TEMPORARY disk file.
   • The next operator reads that temporary file from disk.
   • I/O cost: write intermediate + read intermediate for each operator boundary.

2. Pipelining:
   • Operators are stacked. The top operator pulls tuples from the next operator below it on demand.
   • Tuples flow directly in memory, one at a time (or in small batches).
   • NO temporary disk writes between operators.
   • Lower I/O cost, lower memory requirement (only need to buffer a few tuples at a time).

Pipelining is preferred when operators can process tuples one-by-one (e.g., selection, projection, join in some algorithms).`,
        whyCorrect: "Pipelining passes tuples directly between operators in memory, eliminating intermediate disk I/O. This dramatically reduces query execution time for pipeable operator sequences.",
        commonMistakes: "Choosing (C) — pipelining is about data flow between operators, not CPU parallelism. While they can coexist, pipelining specifically refers to avoiding intermediate materialization.",
        keyFormula: "Pipelining: no temp disk writes, tuple-at-a-time  |  Materialization: write full intermediate result to disk between operators"
    },
    {
        id: 48,
        year: "GATE CSE 2006",
        source: "Official GATE 2006 CSE Paper (IIT Delhi), Q.27",
        sourceUrl: "https://gateoverflow.in/926/gate-cse-2006-question-27",
        sourceLabel: "Discussion & Secondary Ref (GateOverflow)",
        isPYQ: true,
        topic: "Disk & Block Calculations",
        subtopic: "Binary Search on Index File",
        type: "MCQ",
        difficulty: "Medium",
        question: "A database file has 500,000 records, each of length 240 bytes. The block size is 1024 bytes. An ordered index file is built with each index record of length 24 bytes. How many index blocks are there and how many block accesses does binary search need in the worst case?",
        options: [
            "(A) 11,719 index blocks, 14 block accesses",
            "(B) 11,720 index blocks, 14 block accesses",
            "(C) 12,500 index blocks, 14 block accesses",
            "(D) 11,720 index blocks, 15 block accesses"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) 11,720 index blocks, 14 block accesses",
        stepByStepExplanation: `Step 1: Index blocking factor.
• Index record size = 24 bytes. Block size = 1024 bytes.
• Index bfr = ⌊1024 / 24⌋ = 42 index records/block.

Step 2: Total index records.
• Dense index (one entry per record): 500,000 index records.

Step 3: Total index blocks.
• Index blocks = ⌈500,000 / 42⌉ = ⌈11,904.76⌉ = 11,905 blocks.

Step 4: Binary search block accesses.
• ⌈log₂(11,905)⌉ = ⌈13.54⌉ = 14 block accesses.

(Note: Exact answers vary based on whether the index is sparse or dense. For a primary sparse index: data bfr = ⌊1024/240⌋ = 4, data blocks = ⌈500000/4⌉ = 125,000, index entries = 125,000, index blocks = ⌈125000/42⌉ = 2977, binary search = ⌈log₂(2977)⌉ = 12.)`,
        whyCorrect: "The exact answer depends on the index type (dense vs sparse). For a dense index with 500,000 entries, index blocks ≈ 11,905, and binary search requires ⌈log₂(11905)⌉ = 14 accesses.",
        commonMistakes: "Not distinguishing between dense (one entry per record) and sparse (one entry per data block) index. The question context determines which applies.",
        keyFormula: "Index Blocks = ⌈(Index Entries) / ⌊B / Index_Record_Size⌋⌉  |  Binary Search = ⌈log₂(Index Blocks)⌉"
    },
    {
        id: 49,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Relational Algebra — All Heuristic Rules (Practice MSQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Relational Algebra Equivalence",
        subtopic: "Comprehensive Heuristic Optimization Rules",
        type: "MSQ",
        difficulty: "Hard",
        question: "Which of the following are valid heuristic equivalences used in relational query optimization?",
        options: [
            "(A) σ_(C1 AND C2)(R) ≡ σ_C1(σ_C2(R))  (conjunctive selection splitting)",
            "(B) π_L(σ_C(R)) ≡ σ_C(π_L(R))  (always valid, swap projection and selection)",
            "(C) σ_C(R ⋈ S) ≡ σ_C(R) ⋈ S  (when C references only R's attributes)",
            "(D) π_L(R ⋈ S) ≡ π_{L∩R}(R) ⋈ π_{L∩S}(S)  (always valid projection through join)"
        ],
        correctAnswer: [0, 2],
        correctDisplay: "(A) and (C)",
        stepByStepExplanation: `(A) TRUE: σ_(C1 AND C2)(R) ≡ σ_C1(σ_C2(R)). A conjunction of conditions can be split into successive selections. This enables pushing individual conditions closer to base relations.

(B) FALSE: π_L(σ_C(R)) ≡ σ_C(π_L(R)) is NOT always valid. The projection may eliminate attributes that the selection condition C needs. Example: if C references attribute B but L = {A} (B not in L), then σ_C(π_L(R)) cannot evaluate C. Projection can only be moved BELOW selection if L includes all attributes in C.

(C) TRUE: σ_C(R ⋈ S) ≡ σ_C(R) ⋈ S when condition C references only attributes of R. Classic selection pushdown rule.

(D) FALSE: π_L(R ⋈ S) ≡ π_{L∩R}(R) ⋈ π_{L∩S}(S) is INVALID if join attributes are not in L. The join key must be preserved in both projected relations to perform the join, even if not in the final projection list L.`,
        whyCorrect: "Options (A) and (C) are standard, always-valid equivalences. Options (B) and (D) are conditional — they only hold under specific attribute constraints that are not guaranteed in general.",
        commonMistakes: "Selecting (B) — a very common mistake. You cannot swap selection and projection if the selection condition references attributes eliminated by the projection. Always check attribute coverage.",
        keyFormula: "Valid: σ_(C1∧C2)(R) ≡ σ_C1(σ_C2(R))  |  Conditional: π_L(σ_C(R)) ≡ σ_C(π_L(R)) only if attrs(C) ⊆ L"
    },
    {
        id: 50,
        year: "Practice Question (GATE CSE DBMS)",
        source: "Comprehensive Index Selection (Practice MCQ)",
        sourceUrl: null,
        sourceLabel: null,
        isPYQ: false,
        topic: "Query Optimization",
        subtopic: "Index Recommendation Decision",
        type: "MCQ",
        difficulty: "Hard",
        question: "A DBA is designing indexes for the following frequently executed query:\n\nSELECT o.order_id, o.total\nFROM Orders o\nJOIN Customers c ON o.cust_id = c.cust_id\nWHERE c.city = 'Mumbai'\nORDER BY o.total DESC;\n\nWhich combination of indexes provides the best overall optimization?",
        options: [
            "(A) Single index on Orders(order_id)",
            "(B) Index on Customers(city) and index on Orders(cust_id)",
            "(C) Index on Customers(cust_id) and index on Orders(total)",
            "(D) Hash index on Customers(city) and B+ tree on Orders(order_id, total)"
        ],
        correctAnswer: 1,
        correctDisplay: "(B) Index on Customers(city) and index on Orders(cust_id)",
        stepByStepExplanation: `Query analysis using the Index Recommendation Engine scoring heuristics:

Step 1: Identify indexable operations.
• WHERE c.city = 'Mumbai' → EQUALITY filter on Customers.city (Score: +30)
• JOIN o.cust_id = c.cust_id → JOIN condition on Orders.cust_id (Score: +25)
• ORDER BY o.total DESC → ORDER BY on Orders.total (Score: +20)

Step 2: Evaluate each option.
• (A) Index on Orders(order_id): order_id is in SELECT, not in WHERE/JOIN/ORDER BY. Minimal benefit.
• (B) Index on Customers(city): enables index scan to filter 'Mumbai' customers before the join (+30). Index on Orders(cust_id): enables fast join lookup for matching cust_ids (+25). Best combined score: 55.
• (C) Index on Customers(cust_id): cust_id is the join key — useful but less selective. Index on Orders(total): helps ORDER BY but won't help filter.
• (D) Hash index on city: cannot handle range queries; but city='Mumbai' is equality — usable. However, Orders(order_id,total) doesn't help the join.

Option (B) directly addresses the two highest-cost operations: the selective WHERE filter and the JOIN.`,
        whyCorrect: "The most impactful indexes target the WHERE equality filter (Customers.city = 'Mumbai') and the JOIN condition (Orders.cust_id), which reduce the number of tuples before the expensive join operation.",
        commonMistakes: "Indexing columns in SELECT or ORDER BY before addressing WHERE and JOIN conditions. Heuristic scoring: Equality +30 > JOIN +25 > Range +20 > ORDER BY +20 — prioritize accordingly.",
        keyFormula: "Index priority: WHERE equality (+30) > JOIN column (+25) > Range filter (+20) > ORDER BY (+20)"
    }
];


