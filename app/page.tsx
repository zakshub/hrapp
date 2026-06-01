export default function Welcome() {
  const isStaging = typeof window !== 'undefined' && window.location.hostname.includes('staging');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="text-6xl">✨</div>
        <h1 className="text-5xl font-bold text-white">Responsify HR</h1>
        <p className="text-xl text-gray-300">
          {isStaging 
            ? "🚀 Staging Environment — Code Testing Ground" 
            : "🎯 Production Live — Accountability System Active"}
        </p>
        <div className="pt-8 border-t border-purple-500">
          <p className="text-sm text-gray-400">Environment: <span className="text-purple-400 font-mono">{isStaging ? 'STAGING' : 'PRODUCTION'}</span></p>
          <p className="text-xs text-gray-500 mt-2">Ready to turn irresponsible into responsible.</p>
        </div>
      </div>
    </div>
  );
}