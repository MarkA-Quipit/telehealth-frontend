interface FilterTabsProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onChange: (tab: T) => void;
  className?: string;
}

export function FilterTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className = '',
}: FilterTabsProps<T>) {
  return (
    <div className={`flex border-b border-neutral-200 overflow-x-auto ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition border-b-2 -mb-px ${
            activeTab === tab
              ? 'border-sky-400 text-sky-700'
              : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
