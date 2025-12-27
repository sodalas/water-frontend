function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`bg-surface-highlight/60 rounded ${className}`} />;
}

export default SkeletonBlock;
