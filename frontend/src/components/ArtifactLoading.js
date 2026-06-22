import { useState, useEffect } from 'react';

const STEPS = [
  { label: "Analyzing system requirements...", duration: 4000 },
  { label: "Designing system architecture components...", duration: 5000 },
  { label: "Synthesizing technical UML diagrams...", duration: 6000 },
  { label: "Drafting database DDL SQL schemas...", duration: 5000 },
  { label: "Finalizing SRS documentation suite...", duration: 5000 }
];

const TIPS = [
  "Did you know? Caching with Redis can reduce read latency to sub-milliseconds.",
  "Pro Tip: Always index your foreign key columns in SQL databases to optimize JOIN query performance.",
  "Did you know? Denormalization in NoSQL databases helps achieve high read performance at the cost of data duplication.",
  "Pro Tip: Use rate limiting (like Token Bucket) to protect your backend APIs from traffic surges.",
  "Did you know? Docker containers share the host OS kernel, making them much lighter and faster to boot than VMs.",
  "Pro Tip: Keep your microservices stateless and delegate session state to distributed stores like Redis.",
  "Did you know? Consistent hashing is used in distributed databases to minimize keyspace remapping when nodes scale."
];

export default function ArtifactLoading() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [tipIndex, setTipIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  // Rotate tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(tipInterval);
  }, []);

  // Simulate progress steps and overall percentage
  useEffect(() => {
    let step = 0;
    const timers = [];

    // Overall progress bar simulation
    const progressInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 98) return prev; // Hold at 98% until completion
        return prev + 1;
      });
    }, 250);

    const runStep = () => {
      if (step >= STEPS.length) return;
      
      const timeout = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step]);
        step += 1;
        setCurrentStepIndex(step);
        runStep();
      }, STEPS[step].duration);
      
      timers.push(timeout);
    };

    runStep();

    return () => {
      clearInterval(progressInterval);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="artifact-loading-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '40px 20px',
      background: 'var(--bg)',
      color: 'var(--text)',
      overflowY: 'auto',
      fontFamily: 'var(--sans)',
      textAlign: 'center'
    }}>
      {/* Dynamic Animated Spinner / Circular Progress */}
      <div className="loading-animation-wrapper" style={{ position: 'relative', marginBottom: '30px' }}>
        <div className="loading-ring-outer" style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: '3px solid transparent',
          borderTopColor: 'var(--accent)',
          borderBottomColor: 'var(--accent)',
          animation: 'spinAnim 2s linear infinite'
        }} />
        <div className="loading-ring-inner" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: '3px solid transparent',
          borderLeftColor: 'var(--text-sec)',
          borderRightColor: 'var(--text-sec)',
          animation: 'spinAnimReverse 1.5s linear infinite'
        }} />
        <div className="loading-percent" style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '700',
          color: 'var(--accent)'
        }}>
          {progressPercent}%
        </div>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
        Generating System Architecture Suite
      </h3>
      <p style={{ fontSize: '13px', color: 'var(--text-sec)', marginBottom: '30px', maxWidth: '380px' }}>
        Please wait while our AI system design engineer synthesizes your specifications. This usually takes 20-30 seconds.
      </p>

      {/* Checklist of Steps */}
      <div className="loading-steps-box" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'left',
        marginBottom: '35px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-ter)', marginBottom: '12px', letterSpacing: '0.5px' }}>
          Generation Pipeline
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {STEPS.map((step, idx) => {
            const isCompleted = completedSteps.includes(idx);
            const isActive = currentStepIndex === idx;
            
            let color = 'var(--text-ter)';
            let icon = '○';
            let fontWeight = '400';
            
            if (isCompleted) {
              color = 'var(--success, #137333)';
              icon = '✓';
              fontWeight = '500';
            } else if (isActive) {
              color = 'var(--accent)';
              icon = '●';
              fontWeight = '600';
            }

            return (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13.5px',
                color: color,
                fontWeight: fontWeight,
                transition: 'all 0.3s ease'
              }}>
                <span className={isActive ? "loading-pulsate" : ""} style={{ fontSize: '14px', flexShrink: 0 }}>
                  {icon}
                </span>
                <span>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rotating Trivia Card */}
      <div className="loading-trivia-card" style={{
        width: '100%',
        maxWidth: '400px',
        background: 'var(--accent-light, rgba(255, 91, 36, 0.05))',
        border: '1px solid rgba(255, 91, 36, 0.15)',
        borderRadius: '10px',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '3px',
          height: '100%',
          background: 'var(--accent)'
        }} />
        <h5 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--accent)', margin: '0 0 6px 0', letterSpacing: '0.5px' }}>
          System Design Insight
        </h5>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-sec)',
          margin: 0,
          lineHeight: '1.45',
          fontStyle: 'italic',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {TIPS[tipIndex]}
        </p>
      </div>

      {/* Animation CSS inject */}
      <style>{`
        @keyframes spinAnim {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spinAnimReverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .loading-pulsate {
          animation: pulsateAnim 1s ease-in-out infinite;
        }
        @keyframes pulsateAnim {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
