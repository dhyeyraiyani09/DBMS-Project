import React from 'react';

export default function DevelopedByPage() {
    return (
        <div className="developed-by-page" style={{ padding: '2rem', textAlign: 'center', lineHeight: '1.6' }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-color)' }}>Project: Index Recommendation Engine</h2>

            <div className="team-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3rem' }}>
                
                <section className="student-section" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--card-border)', width: '100%', maxWidth: '500px' }}>
                    <h3>Developed By</h3>
                    
                    <div className="photo-placeholder" style={{ 
                        width: '150px', 
                        height: '150px', 
                        background: 'var(--edu-note-bg)', 
                        borderRadius: '50%', 
                        margin: '1rem auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed var(--input-border)',
                        color: 'var(--text-color)'
                    }}>
                        <span>[Student Photo]</span>
                    </div>

                    <div style={{ textAlign: 'left', marginTop: '1.5rem', display: 'inline-block' }}>
                        <p><strong>Student Name:</strong> [Enter Student Name]</p>
                        <p><strong>Register Number:</strong> [Enter Register Number]</p>
                        <p><strong>Team Members:</strong> [Enter Team Member Names]</p>
                    </div>
                </section>

                <section className="guide-section" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '8px', border: '1px solid var(--card-border)', width: '100%', maxWidth: '500px' }}>
                    <h3>Guided By</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Dr. Swaminathan A</p>
                        <p style={{ color: 'var(--btn-secondary-bg)' }}>Assistant Professor</p>
                    </div>
                </section>

            </div>
        </div>
    );
}
