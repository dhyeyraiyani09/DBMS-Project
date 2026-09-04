import React from 'react';

export default function DevelopedByPage() {
    return (
        <div className="developed-by-page" style={{ padding: '2rem 1rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '2.5rem', fontSize: '1.8rem', letterSpacing: '-0.02em' }}>Project: Index Recommendation Engine</h2>

            <div className="team-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem' }}>
                
                <section className="card student-section" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem 2rem' }}>
                    <h3 style={{ margin: '0 0 1.5rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Developed By</h3>
                    
                    <div className="photo-placeholder" style={{ 
                        width: '140px', 
                        height: '140px', 
                        background: 'var(--surface-raised, var(--table-header-bg))', 
                        borderRadius: '50%', 
                        margin: '0 auto 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed var(--border-strong, var(--border))',
                        color: 'var(--text-muted)',
                        fontSize: '0.875rem'
                    }}>
                        <span>[Student Photo]</span>
                    </div>

                    <div style={{ textAlign: 'left', display: 'inline-block', width: '100%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                            <strong style={{ color: 'var(--text-secondary)' }}>Student Name</strong> 
                            <span style={{ fontWeight: 600 }}>[Enter Student Name]</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                            <strong style={{ color: 'var(--text-secondary)' }}>Register Number</strong> 
                            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>[Enter Register Number]</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--text-secondary)' }}>Team Members</strong> 
                            <span style={{ fontWeight: 600 }}>[Enter Team Member Names]</span>
                        </div>
                    </div>
                </section>

                <section className="card guide-section" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
                    <h3 style={{ margin: '0 0 1rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.85rem' }}>Guided By</h3>
                    <div>
                        <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem', color: 'var(--text-primary)' }}>Dr. Swaminathan A</p>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>Assistant Professor</p>
                    </div>
                </section>

            </div>
        </div>
    );
}
