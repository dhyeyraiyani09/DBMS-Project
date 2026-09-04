import React from 'react';

export default function SimulationControls({ 
    currentStep, 
    totalSteps, 
    isPlaying,
    onNext, 
    onPrev, 
    onReset, 
    onTogglePlay,
    onExit
}) {
    return (
        <div className="simulation-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={onExit} className="btn-secondary btn-exit">
                    Exit Simulation
                </button>
                <div className="step-info">
                    Step {currentStep + 1} of {totalSteps}
                </div>
            </div>
            <div className="nav-buttons">
                <button 
                    onClick={onPrev} 
                    disabled={currentStep === 0}
                    className="btn-primary"
                >
                    &laquo; Previous
                </button>
                <button 
                    onClick={onTogglePlay} 
                    className={`btn-primary ${isPlaying ? 'playing' : ''}`}
                >
                    {isPlaying ? 'Pause' : 'Auto Play'}
                </button>
                <button 
                    onClick={onNext} 
                    disabled={currentStep === totalSteps - 1}
                    className="btn-primary"
                >
                    Next &raquo;
                </button>
                <button 
                    onClick={onReset} 
                    disabled={currentStep === 0 && !isPlaying}
                    className="btn-secondary"
                >
                    Reset
                </button>
            </div>
        </div>
    );
}
