import React, { useState, useEffect, useRef } from 'react';
import SimulationControls from './SimulationControls';
import {
    StepSQLQuery,
    StepParseQuery,
    StepDetectOperations,
    StepGenerateCandidates,
    StepCheckExisting,
    StepScoreCandidates,
    StepRankCandidates,
    StepEducationalDeepDive,
    StepFinalRecommendation
} from './SimulationSteps';
import './Simulation.css';

const STEPS = [
    { id: 0, label: "SQL Query", title: "Original Query" },
    { id: 1, label: "Parse Query", title: "AST Parsing" },
    { id: 2, label: "Detect Operations", title: "Clause Detection" },
    { id: 3, label: "Candidates", title: "Candidate Generation" },
    { id: 4, label: "Existing Indexes", title: "Existing Index Validation" },
    { id: 5, label: "Score Candidates", title: "Heuristic Scoring" },
    { id: 6, label: "Rank Candidates", title: "Rank & Threshold" },
    { id: 7, label: "Deep Dive", title: "Educational Breakdown" },
    { id: 8, label: "Recommendation", title: "Final Recommendation" }
];

export default function SimulationPipeline({ query, analysis, recommendations, schemaData, onReset }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const timerRef = useRef(null);

    const handleNext = () => setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
    const handlePrev = () => setCurrentStep(s => Math.max(s - 1, 0));
    const handleReset = () => {
        setCurrentStep(0);
        setIsPlaying(false);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setCurrentStep(s => {
                    if (s >= STEPS.length - 1) {
                        setIsPlaying(false);
                        return s;
                    }
                    return s + 1;
                });
            }, 2500); // 2.5 seconds per step
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isPlaying]);

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <StepSQLQuery query={query} />;
            case 1: return <StepParseQuery analysis={analysis} />;
            case 2: return <StepDetectOperations analysis={analysis} />;
            case 3: return <StepGenerateCandidates recommendations={recommendations} />;
            case 4: return <StepCheckExisting recommendations={recommendations} schema={schemaData} />;
            case 5: return <StepScoreCandidates recommendations={recommendations} />;
            case 6: return <StepRankCandidates recommendations={recommendations} />;
            case 7: return <StepEducationalDeepDive recommendations={recommendations} analysis={analysis} />;
            case 8: return <StepFinalRecommendation recommendations={recommendations} />;
            default: return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="simulation-pipeline">
            <div className="simulation-header">
                <h3>{STEPS[currentStep].title}</h3>
                <div className="simulation-progress-bar">
                    {STEPS.map((step, idx) => (
                        <div 
                            key={step.id} 
                            className={`progress-step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                            onClick={() => {
                                setCurrentStep(idx);
                                setIsPlaying(false);
                            }}
                        >
                            <span className="step-dot"></span>
                            <span className="step-label">{step.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="simulation-content">
                {renderStep()}
            </div>

            <SimulationControls 
                currentStep={currentStep} 
                totalSteps={STEPS.length} 
                isPlaying={isPlaying}
                onNext={handleNext} 
                onPrev={handlePrev} 
                onReset={handleReset} 
                onTogglePlay={togglePlay}
                onExit={onReset}
            />
        </div>
    );
}
