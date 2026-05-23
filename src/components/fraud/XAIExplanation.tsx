import React from 'react';
import { XAIExplanation as XAIExplanationType, XAIFactor } from '@/types/fraud';

interface XAIExplanationProps {
  explanation: XAIExplanationType;
  transactionId?: string;
}

const XAIExplanation: React.FC<XAIExplanationProps> = ({ explanation, transactionId }) => {
  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'approved':
        return 'from-emerald-500 to-green-500';
      case 'flagged':
        return 'from-amber-500 to-orange-500';
      case 'blocked':
        return 'from-red-500 to-rose-500';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getImpactColor = (impact: XAIFactor['impact']) => {
    switch (impact) {
      case 'positive':
        return 'bg-emerald-500';
      case 'negative':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getImpactBgColor = (impact: XAIFactor['impact']) => {
    switch (impact) {
      case 'positive':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'negative':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-slate-500/10 border-slate-500/30';
    }
  };

  const getImpactIcon = (impact: XAIFactor['impact']) => {
    switch (impact) {
      case 'positive':
        return (
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getDecisionColor(explanation.decision)} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">XAI Fraud Analysis</h3>
            {transactionId && (
              <p className="text-white/70 text-sm font-mono">{transactionId}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-white/70 text-xs">Model Version</p>
            <p className="text-white font-medium text-sm">{explanation.modelVersion}</p>
          </div>
        </div>
      </div>

      {/* Risk Score & Confidence */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-2">Risk Score</p>
            <div className="flex items-end gap-2">
              <span className={`text-3xl font-bold ${
                explanation.riskScore >= 70 ? 'text-red-400' :
                explanation.riskScore >= 40 ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {explanation.riskScore}
              </span>
              <span className="text-slate-400 text-sm mb-1">/ 100</span>
            </div>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  explanation.riskScore >= 70 ? 'bg-red-500' :
                  explanation.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${explanation.riskScore}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-2">Model Confidence</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-cyan-400">{explanation.confidence}</span>
              <span className="text-slate-400 text-sm mb-1">%</span>
            </div>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${explanation.confidence}%` }}
              />
            </div>
          </div>
        </div>

        {/* Decision Badge */}
        <div className={`mt-4 p-3 rounded-xl border ${
          explanation.decision === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30' :
          explanation.decision === 'flagged' ? 'bg-amber-500/10 border-amber-500/30' :
          'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-2">
            {explanation.decision === 'approved' ? (
              <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : explanation.decision === 'flagged' ? (
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            )}
            <span className={`font-semibold capitalize ${
              explanation.decision === 'approved' ? 'text-emerald-400' :
              explanation.decision === 'flagged' ? 'text-amber-400' : 'text-red-400'
            }`}>
              Transaction {explanation.decision}
            </span>
          </div>
          <p className="text-slate-300 text-sm mt-2">{explanation.summary}</p>
        </div>
      </div>

      {/* Factor Analysis */}
      <div className="p-4">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Feature Importance Analysis
        </h4>

        <div className="space-y-3">
          {explanation.factors.map((factor, index) => (
            <div
              key={index}
              className={`p-3 rounded-xl border ${getImpactBgColor(factor.impact)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getImpactIcon(factor.impact)}
                  <span className="text-white font-medium text-sm">{factor.name}</span>
                </div>
                <span className="text-slate-400 text-xs">
                  Weight: {(factor.weight * 100).toFixed(0)}%
                </span>
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Impact Score</span>
                  <span className={`font-medium ${
                    factor.impact === 'negative' ? 'text-red-400' :
                    factor.impact === 'positive' ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {factor.value.toFixed(1)}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getImpactColor(factor.impact)}`}
                    style={{ width: `${Math.min(factor.value, 100)}%` }}
                  />
                </div>
              </div>

              <p className="text-slate-400 text-xs">{factor.description}</p>
              
              {factor.actualValue && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Actual Value:</span>
                  <span className="text-white text-xs font-mono bg-slate-800 px-2 py-0.5 rounded">
                    {factor.actualValue}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <div className="bg-slate-900/50 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-medium">Explainable AI Powered</p>
            <p className="text-slate-400 text-xs">
              Using LIME/SHAP-based interpretability for transparent fraud detection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XAIExplanation;
