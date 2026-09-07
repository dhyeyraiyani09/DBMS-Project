import React from 'react';

const StudentCard = ({ n }) => (
    <div className="dev-student-card-v2">
        <div className="dev-photo-ring-v2">
            <div className="dev-photo-placeholder-v2">
                <span className="dev-photo-icon-v2">👤</span>
                <span className="dev-photo-label-v2">[Student Photo]</span>
            </div>
        </div>
        <div className="dev-student-info-v2">
            <div className="dev-student-name-v2">[Enter Student Name {n}]</div>
            <div className="dev-student-reg-v2">[Enter Register Number]</div>
        </div>
    </div>
);

export default function DevelopedByPage() {
    return (
        <div className="developed-by-page">

            {/* Project Header */}
            <div className="dev-project-header">
                <div className="dev-project-icon">⬡</div>
                <div>
                    <div className="dev-project-label">Academic Project · DBMS</div>
                    <h2 className="dev-project-title">Index Recommendation Engine</h2>
                    <p className="dev-project-subtitle">
                        An interactive educational platform for database index analysis,
                        deterministic heuristic scoring, and SQL query optimization visualization.
                    </p>
                </div>
            </div>

            {/* Technology Stack */}
            <div className="dev-tech-row">
                {['Python', 'FastAPI', 'MySQL', 'React', 'SQLGlot', 'Gemini AI'].map(tech => (
                    <span key={tech} className="dev-tech-badge">{tech}</span>
                ))}
            </div>

            {/* ── DEVELOPED BY ── */}
            <section className="dev-section">
                <div className="dev-section-label">Developed By</div>
                <div className="dev-students-row">
                    <StudentCard n={1} />
                    <StudentCard n={2} />
                    <StudentCard n={3} />
                </div>
            </section>

            {/* ── GUIDED BY ── */}
            <section className="dev-section">
                <div className="dev-section-label">Guided By</div>
                <div className="dev-guide-card-v2">
                    <div className="dev-guide-avatar-v2">🎓</div>
                    <div className="dev-guide-info-v2">
                        <div className="dev-guide-name-v2">Dr. Swaminathan A</div>
                        <div className="dev-guide-role-v2">Assistant Professor</div>
                        <div className="dev-guide-dept-v2">Department of Computer Science</div>
                    </div>
                </div>
            </section>

            {/* Feature pills */}
            <div className="dev-features-row">
                {[
                    { icon: '🔍', label: 'SQL Parser', desc: 'SQLGlot AST engine' },
                    { icon: '⚡', label: 'Scoring Engine', desc: 'Deterministic heuristics' },
                    { icon: '🌳', label: 'B-Tree Viz', desc: 'Conceptual diagrams' },
                    { icon: '🎓', label: 'AI Tutor', desc: 'Gemini-powered' },
                    { icon: '📋', label: 'Reports', desc: 'PDF · DOCX · TXT' },
                    { icon: '🗄', label: 'MySQL', desc: 'Real EXPLAIN plans' },
                ].map(f => (
                    <div key={f.label} className="dev-feature-pill">
                        <span className="dev-feature-icon">{f.icon}</span>
                        <div>
                            <div className="dev-feature-label">{f.label}</div>
                            <div className="dev-feature-desc">{f.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
