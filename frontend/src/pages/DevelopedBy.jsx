import React from 'react';

export default function DevelopedByPage() {
    return (
        <div className="developed-by-page">
            {/* Project Header */}
            <div className="dev-project-header">
                <div className="dev-project-icon">⬡</div>
                <div>
                    <div className="dev-project-label">Academic Project</div>
                    <h2 className="dev-project-title">Index Recommendation Engine</h2>
                    <p className="dev-project-subtitle">
                        An interactive educational platform for database index analysis, deterministic scoring,
                        and SQL query optimization visualization.
                    </p>
                </div>
            </div>

            {/* Tech Stack Badges */}
            <div className="dev-tech-row">
                {['Python', 'FastAPI', 'MySQL', 'React', 'SQLGlot', 'Gemini AI'].map(tech => (
                    <span key={tech} className="dev-tech-badge">{tech}</span>
                ))}
            </div>

            {/* Main Cards Row */}
            <div className="dev-cards-grid">
                {/* Developer Card */}
                <section className="dev-card dev-student-card">
                    <div className="dev-card-label">Developed By</div>
                    <div className="dev-photo-ring">
                        <div className="dev-photo-placeholder">
                            <span className="dev-photo-icon">👤</span>
                            <span className="dev-photo-text">[Student Photo]</span>
                        </div>
                    </div>
                    <div className="dev-info-rows">
                        <div className="dev-info-row">
                            <span className="dev-info-label">Name</span>
                            <span className="dev-info-value">[Enter Student Name]</span>
                        </div>
                        <div className="dev-info-row">
                            <span className="dev-info-label">Reg. No</span>
                            <span className="dev-info-value dev-info-mono">[Enter Register Number]</span>
                        </div>
                    </div>
                </section>

                {/* Team + Guided By Column */}
                <div className="dev-right-col">
                    {/* Team Members */}
                    <section className="dev-card">
                        <div className="dev-card-label">Team Members</div>
                        <div className="dev-team-placeholder">
                            <span className="dev-team-icon">👥</span>
                            <p>[Enter Team Member Names]</p>
                        </div>
                    </section>

                    {/* Guided By */}
                    <section className="dev-card dev-guide-card">
                        <div className="dev-card-label">Guided By</div>
                        <div className="dev-guide-inner">
                            <div className="dev-guide-avatar">
                                <span>🎓</span>
                            </div>
                            <div>
                                <div className="dev-guide-name">Dr. Swaminathan A</div>
                                <div className="dev-guide-role">Assistant Professor</div>
                                <div className="dev-guide-dept">Department of Computer Science</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Features row */}
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
