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
];
