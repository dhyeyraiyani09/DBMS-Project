import React, { useState, useMemo } from 'react';
import {
    GATE_QUESTIONS,
    GATE_TOPICS,
    QUESTION_TYPES,
    DIFFICULTY_LEVELS,
    GATE_FORMULAS
} from '../data/gateQuestions';
import '../styles/gatePrep.css';

export default function GatePrepPage() {
    // Filters
    const [selectedTopic, setSelectedTopic] = useState("All Topics");
    const [selectedType, setSelectedType] = useState("All Types");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All Difficulties");
    const [selectedYear, setSelectedYear] = useState("All Years");
    const [searchQuery, setSearchQuery] = useState("");
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

    // Collapsible Formula Sheet
    const [showFormulas, setShowFormulas] = useState(false);

    // State per question: { [qId]: value }
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState({});
    const [revealed, setRevealed] = useState({});
    const [bookmarks, setBookmarks] = useState({});

    // Current question index in the filtered list
    const [currentIndex, setCurrentIndex] = useState(0);

    // Unique years list for filter
    const availableYears = useMemo(() => {
        const pyqYears = new Set();
        let hasPractice = false;
        GATE_QUESTIONS.forEach(q => {
            const match = q.year.match(/\b(19\d\d|20\d\d)\b/);
            if (match) {
                pyqYears.add(match[1]);
            } else {
                hasPractice = true;
            }
        });
        const sortedYears = Array.from(pyqYears).sort((a, b) => Number(b) - Number(a));
        if (hasPractice) {
            sortedYears.push("Practice");
        }
        return ["All Years", ...sortedYears];
    }, []);

    // Filtered questions
    const filteredQuestions = useMemo(() => {
        return GATE_QUESTIONS.filter(q => {
            if (selectedTopic !== "All Topics" && q.topic !== selectedTopic) return false;
            if (selectedType !== "All Types" && q.type !== selectedType) return false;
            if (selectedDifficulty !== "All Difficulties" && q.difficulty !== selectedDifficulty) return false;
            if (selectedYear !== "All Years" && !q.year.includes(selectedYear)) return false;
            if (showBookmarksOnly && !bookmarks[q.id]) return false;
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchQ = q.question.toLowerCase().includes(query);
                const matchTopic = q.topic.toLowerCase().includes(query);
                const matchSub = (q.subtopic || "").toLowerCase().includes(query);
                const matchYear = q.year.toLowerCase().includes(query);
                if (!matchQ && !matchTopic && !matchSub && !matchYear) return false;
            }
            return true;
        });
    }, [selectedTopic, selectedType, selectedDifficulty, selectedYear, showBookmarksOnly, searchQuery, bookmarks]);

    // Ensure valid currentIndex when filters change
    const safeIndex = Math.min(currentIndex, Math.max(0, filteredQuestions.length - 1));
    const currentQuestion = filteredQuestions[safeIndex] || null;

    // Answer assessment helper
    const checkIsCorrect = (q) => {
        if (!q) return false;
        const ans = userAnswers[q.id];
        if (ans === undefined || ans === null || ans === '') return false;

        if (q.type === 'MCQ') {
            return ans === q.correctAnswer;
        } else if (q.type === 'MSQ') {
            if (!Array.isArray(ans)) return false;
            if (ans.length !== q.correctAnswer.length) return false;
            const sortedAns = [...ans].sort();
            const sortedCorrect = [...q.correctAnswer].sort();
            return sortedAns.every((val, idx) => val === sortedCorrect[idx]);
        } else if (q.type === 'NAT') {
            const num = parseFloat(ans);
            if (isNaN(num)) return false;
            if (typeof q.correctAnswer === 'number') {
                return Math.abs(num - q.correctAnswer) < 0.01;
            } else if (typeof q.correctAnswer === 'object' && q.correctAnswer.min !== undefined) {
                return num >= q.correctAnswer.min && num <= q.correctAnswer.max;
            }
            return false;
        }
        return false;
    };

    // User interactions
    const handleSelectOption = (optIndex) => {
        if (!currentQuestion) return;
        const qId = currentQuestion.id;

        if (currentQuestion.type === 'MCQ') {
            setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));
        } else if (currentQuestion.type === 'MSQ') {
            setUserAnswers(prev => {
                const currentList = Array.isArray(prev[qId]) ? [...prev[qId]] : [];
                const foundIdx = currentList.indexOf(optIndex);
                if (foundIdx > -1) {
                    currentList.splice(foundIdx, 1);
                } else {
                    currentList.push(optIndex);
                }
                return { ...prev, [qId]: currentList };
            });
        }
    };

    const handleNatChange = (val) => {
        if (!currentQuestion) return;
        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: val }));
    };

    const handleSubmit = () => {
        if (!currentQuestion) return;
        const qId = currentQuestion.id;
        setSubmitted(prev => ({ ...prev, [qId]: true }));
        setRevealed(prev => ({ ...prev, [qId]: true }));
    };

    const handleReveal = () => {
        if (!currentQuestion) return;
        setRevealed(prev => ({ ...prev, [currentQuestion.id]: true }));
    };

    const handleReset = () => {
        if (!currentQuestion) return;
        const qId = currentQuestion.id;
        setUserAnswers(prev => {
            const copy = { ...prev };
            delete copy[qId];
            return copy;
        });
        setSubmitted(prev => {
            const copy = { ...prev };
            delete copy[qId];
            return copy;
        });
        setRevealed(prev => {
            const copy = { ...prev };
            delete copy[qId];
            return copy;
        });
    };

    const toggleBookmark = (qId) => {
        setBookmarks(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    // Aggregate statistics
    const stats = useMemo(() => {
        const total = GATE_QUESTIONS.length;
        const totalPyqs = GATE_QUESTIONS.filter(q => q.isPYQ).length;
        const attempted = Object.keys(submitted).length;
        let correctCount = 0;
        GATE_QUESTIONS.forEach(q => {
            if (submitted[q.id] && checkIsCorrect(q)) {
                correctCount++;
            }
        });
        const accuracy = attempted > 0 ? Math.round((correctCount / attempted) * 100) : 0;
        return { total, totalPyqs, attempted, correctCount, accuracy };
    }, [submitted, userAnswers]);

    return (
        <div className="gate-prep-container">
            {/* Hero Header */}
            <div className="gate-hero">
                <div className="gate-hero-text">
                    <h2>
                        <span>🎓</span>
                        <span>GATE CSE / DBMS Preparation</span>
                    </h2>
                    <p>
                        Authentic Previous-Year Questions (PYQs) and rigorous practice sets on Database Indexing,
                        B/B+ Tree node order, Disk/Block access calculations, and Heuristic Query Optimization.
                    </p>
                </div>

                <div className="gate-stats-bar">
                    <div className="gate-stat-pill">
                        <div className="gate-stat-number">{stats.total}</div>
                        <div className="gate-stat-label">Total Qs</div>
                    </div>
                    <div className="gate-stat-pill">
                        <div className="gate-stat-number">{stats.totalPyqs}</div>
                        <div className="gate-stat-label">Verified PYQs</div>
                    </div>
                    <div className="gate-stat-pill">
                        <div className="gate-stat-number">{stats.attempted}</div>
                        <div className="gate-stat-label">Attempted</div>
                    </div>
                    <div className="gate-stat-pill">
                        <div className="gate-stat-number">{stats.accuracy}%</div>
                        <div className="gate-stat-label">Accuracy</div>
                    </div>
                </div>
            </div>

            {/* Collapsible Formula Cheatsheet */}
            <div className="gate-formula-drawer">
                <div
                    className="gate-formula-header"
                    onClick={() => setShowFormulas(!showFormulas)}
                    role="button"
                    tabIndex={0}
                >
                    <h4>
                        <span>📐</span>
                        <span>GATE DBMS Indexing &amp; Query Optimization Formulas</span>
                    </h4>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {showFormulas ? '▲ Hide Formulas' : '▼ Show Formula Sheet'}
                    </span>
                </div>

                {showFormulas && (
                    <div className="gate-formula-grid">
                        {GATE_FORMULAS.map((f, i) => (
                            <div key={i} className="gate-formula-card">
                                <div className="gate-formula-card-title">{f.title}</div>
                                <code className="gate-formula-code">{f.formula}</code>
                                <div className="gate-formula-desc">{f.description}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Filter & Search Bar */}
            <div className="gate-filter-bar">
                <div className="gate-filter-group" style={{ flex: 1.5 }}>
                    <label>Topic</label>
                    <select value={selectedTopic} onChange={e => { setSelectedTopic(e.target.value); setCurrentIndex(0); }}>
                        {GATE_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="gate-filter-group">
                    <label>Question Type</label>
                    <select value={selectedType} onChange={e => { setSelectedType(e.target.value); setCurrentIndex(0); }}>
                        {QUESTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                <div className="gate-filter-group">
                    <label>Difficulty</label>
                    <select value={selectedDifficulty} onChange={e => { setSelectedDifficulty(e.target.value); setCurrentIndex(0); }}>
                        {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>

                <div className="gate-filter-group">
                    <label>Year</label>
                    <select value={selectedYear} onChange={e => { setSelectedYear(e.target.value); setCurrentIndex(0); }}>
                        {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>

                <div className="gate-filter-group" style={{ flex: 1.2 }}>
                    <label>Search</label>
                    <input
                        type="text"
                        placeholder="Search formulas, B+, disk..."
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentIndex(0); }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
                    <button
                        className={`gate-btn ${showBookmarksOnly ? 'gate-btn-primary' : 'gate-btn-secondary'}`}
                        onClick={() => { setShowBookmarksOnly(!showBookmarksOnly); setCurrentIndex(0); }}
                        title="Filter bookmarked questions"
                    >
                        ★ Bookmarks ({Object.values(bookmarks).filter(Boolean).length})
                    </button>
                    {(selectedTopic !== "All Topics" || selectedType !== "All Types" || selectedDifficulty !== "All Difficulties" || selectedYear !== "All Years" || searchQuery || showBookmarksOnly) && (
                        <button
                            className="gate-btn gate-btn-secondary"
                            onClick={() => {
                                setSelectedTopic("All Topics");
                                setSelectedType("All Types");
                                setSelectedDifficulty("All Difficulties");
                                setSelectedYear("All Years");
                                setSearchQuery("");
                                setShowBookmarksOnly(false);
                                setCurrentIndex(0);
                            }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* Question Palette / Navigation Grid */}
            {filteredQuestions.length > 0 ? (
                <>
                    <div className="gate-palette">
                        <span className="gate-palette-title">Questions ({filteredQuestions.length}):</span>
                        {filteredQuestions.map((q, idx) => {
                            const isCurrent = idx === safeIndex;
                            const isSubmitted = submitted[q.id];
                            const isCorrect = isSubmitted && checkIsCorrect(q);
                            const isIncorrect = isSubmitted && !checkIsCorrect(q);
                            const isBookmarked = !!bookmarks[q.id];

                            let statusClass = '';
                            if (isCurrent) statusClass = 'active';
                            else if (isCorrect) statusClass = 'correct';
                            else if (isIncorrect) statusClass = 'incorrect';

                            return (
                                <button
                                    key={q.id}
                                    className={`gate-palette-btn ${statusClass} ${isBookmarked ? 'bookmarked' : ''}`}
                                    onClick={() => setCurrentIndex(idx)}
                                    title={`Q${idx + 1}: ${q.year} - ${q.topic}`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Question Card */}
                    {currentQuestion && (
                        <div className="gate-question-card">
                            {/* Question Header & Badges */}
                            <div className="gate-q-header">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1, minWidth: '280px' }}>
                                    <div className="gate-q-badges">
                                        <span className={`gate-badge ${currentQuestion.isPYQ ? 'gate-badge-pyq' : 'gate-badge-practice'}`}>
                                            {currentQuestion.isPYQ ? '✓ Verified GATE PYQ' : 'Practice Question'}
                                        </span>
                                        <span className="gate-badge gate-badge-type">{currentQuestion.year}</span>
                                        <span className="gate-badge gate-badge-type">{currentQuestion.type}</span>
                                        <span className={`gate-badge gate-badge-difficulty-${currentQuestion.difficulty.toLowerCase()}`}>
                                            {currentQuestion.difficulty}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                            {currentQuestion.topic} {currentQuestion.subtopic ? `• ${currentQuestion.subtopic}` : ''}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        <strong style={{ color: 'var(--text-primary)', marginRight: '0.35rem' }}>Citation:</strong>
                                        <span>{currentQuestion.source}</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                    {currentQuestion.sourceUrl && (
                                        <a
                                            href={currentQuestion.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="gate-q-source-link"
                                            title="Open discussion and secondary reference on GateOverflow"
                                        >
                                            <span>🔗</span>
                                            <span>{currentQuestion.sourceLabel || "Discussion & Secondary Ref (GateOverflow)"}</span>
                                        </a>
                                    )}
                                    <button
                                        onClick={() => toggleBookmark(currentQuestion.id)}
                                        className="gate-btn gate-btn-secondary"
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                        title={bookmarks[currentQuestion.id] ? "Remove bookmark" : "Bookmark question"}
                                    >
                                        {bookmarks[currentQuestion.id] ? '★ Saved' : '☆ Save'}
                                    </button>
                                </div>
                            </div>

                            {/* Question Statement */}
                            <div className="gate-q-statement">
                                <strong>Question {safeIndex + 1} of {filteredQuestions.length}:</strong>
                                <div style={{ marginTop: '0.5rem' }}>{currentQuestion.question}</div>
                            </div>

                            {/* Options or NAT Input */}
                            {(currentQuestion.type === 'MCQ' || currentQuestion.type === 'MSQ') && currentQuestion.options && (
                                <div className="gate-options-list">
                                    {currentQuestion.type === 'MSQ' && (
                                        <div style={{ fontSize: '0.78rem', color: 'var(--accent)', fontWeight: 600, marginBottom: '0.25rem' }}>
                                            ℹ Multiple Select Question (MSQ): One or more options can be correct.
                                        </div>
                                    )}
                                    {currentQuestion.options.map((opt, optIdx) => {
                                        const isSelected = currentQuestion.type === 'MCQ'
                                            ? userAnswers[currentQuestion.id] === optIdx
                                            : Array.isArray(userAnswers[currentQuestion.id]) && userAnswers[currentQuestion.id].includes(optIdx);

                                        const isRevealed = revealed[currentQuestion.id];
                                        const isCorrectOpt = currentQuestion.type === 'MCQ'
                                            ? currentQuestion.correctAnswer === optIdx
                                            : Array.isArray(currentQuestion.correctAnswer) && currentQuestion.correctAnswer.includes(optIdx);

                                        let optClass = '';
                                        if (isRevealed) {
                                            if (isCorrectOpt) optClass = 'correct-revealed';
                                            else if (isSelected) optClass = 'wrong-selected';
                                        } else if (isSelected) {
                                            optClass = 'selected';
                                        }

                                        return (
                                            <div
                                                key={optIdx}
                                                className={`gate-option-item ${optClass}`}
                                                onClick={() => handleSelectOption(optIdx)}
                                            >
                                                <div className="gate-option-indicator">
                                                    {isSelected && <div className="gate-option-indicator-inner" />}
                                                </div>
                                                <div className="gate-option-text">{opt}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {currentQuestion.type === 'NAT' && (
                                <div className="gate-nat-box">
                                    <label htmlFor={`nat-input-${currentQuestion.id}`}>
                                        Enter Numerical Answer:
                                    </label>
                                    <input
                                        id={`nat-input-${currentQuestion.id}`}
                                        type="number"
                                        step="any"
                                        className="gate-nat-input"
                                        placeholder="Type number (e.g. 6 or 698)"
                                        value={userAnswers[currentQuestion.id] ?? ''}
                                        onChange={e => handleNatChange(e.target.value)}
                                        disabled={submitted[currentQuestion.id]}
                                    />
                                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                        Numerical Answer Type (NAT) accepts exact integer or float values.
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="gate-q-actions">
                                {!submitted[currentQuestion.id] ? (
                                    <button
                                        className="gate-btn gate-btn-primary"
                                        onClick={handleSubmit}
                                        disabled={userAnswers[currentQuestion.id] === undefined || userAnswers[currentQuestion.id] === ''}
                                    >
                                        ✓ Check Answer
                                    </button>
                                ) : (
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span className={`status-badge ${checkIsCorrect(currentQuestion) ? 'status-connected' : 'status-error'}`}>
                                            {checkIsCorrect(currentQuestion) ? '✓ Correct Answer!' : '✗ Incorrect'}
                                        </span>
                                    </div>
                                )}

                                {!revealed[currentQuestion.id] ? (
                                    <button className="gate-btn gate-btn-secondary" onClick={handleReveal}>
                                        💡 Reveal Solution
                                    </button>
                                ) : (
                                    <button className="gate-btn gate-btn-secondary" onClick={handleReset}>
                                        ↺ Try Again
                                    </button>
                                )}
                            </div>

                            {/* Detailed Step-by-Step Educational Solution */}
                            {revealed[currentQuestion.id] && (
                                <div className="gate-explanation-card">
                                    <div className="gate-exp-title">
                                        <span>📖</span>
                                        <span>{currentQuestion.isPYQ ? 'Official Solution & Educational Explanation' : 'Detailed Solution & Educational Explanation'}</span>
                                    </div>

                                    <div className="gate-exp-section">
                                        <h5>Correct Answer</h5>
                                        <p style={{ fontWeight: 700, color: 'var(--success)' }}>
                                            {currentQuestion.correctDisplay}
                                        </p>
                                    </div>

                                    <div className="gate-exp-section">
                                        <h5>Step-by-Step Derivation</h5>
                                        <pre>{currentQuestion.stepByStepExplanation}</pre>
                                    </div>

                                    <div className="gate-exp-section">
                                        <h5>Why this is correct</h5>
                                        <p>{currentQuestion.whyCorrect}</p>
                                    </div>

                                    {currentQuestion.commonMistakes && (
                                        <div className="gate-exp-section">
                                            <h5>Common Traps &amp; Incorrect Approaches in GATE</h5>
                                            <p style={{ color: 'var(--danger)' }}>{currentQuestion.commonMistakes}</p>
                                        </div>
                                    )}

                                    {currentQuestion.keyFormula && (
                                        <div className="gate-exp-section">
                                            <h5>Core Concept / Formula to Remember</h5>
                                            <div className="gate-formula-box">
                                                {currentQuestion.keyFormula}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer navigation */}
                            <div className="gate-nav-footer">
                                <button
                                    className="gate-btn gate-btn-secondary"
                                    onClick={() => setCurrentIndex(Math.max(0, safeIndex - 1))}
                                    disabled={safeIndex === 0}
                                >
                                    ← Previous Question
                                </button>

                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {safeIndex + 1} / {filteredQuestions.length}
                                </span>

                                <button
                                    className="gate-btn gate-btn-secondary"
                                    onClick={() => setCurrentIndex(Math.min(filteredQuestions.length - 1, safeIndex + 1))}
                                    disabled={safeIndex === filteredQuestions.length - 1}
                                >
                                    Next Question →
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <h3>No Questions Found</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        No questions matched the selected filters. Try broadening your criteria or clearing search terms.
                    </p>
                    <button
                        className="gate-btn gate-btn-primary"
                        onClick={() => {
                            setSelectedTopic("All Topics");
                            setSelectedType("All Types");
                            setSelectedDifficulty("All Difficulties");
                            setSelectedYear("All Years");
                            setSearchQuery("");
                            setShowBookmarksOnly(false);
                            setCurrentIndex(0);
                        }}
                    >
                        Reset All Filters
                    </button>
                </div>
            )}
        </div>
    );
}
