import { CheckIcon } from '@heroicons/react/24/solid';

export default function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center w-full mb-8">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} className="flex items-center flex-1">
            <div className="flex items-center gap-2.5">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 transition ${
                  done
                    ? 'bg-success text-white'
                    : active
                    ? 'bg-primary text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium hidden sm:block ${
                  active ? 'text-primary' : done ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-3 ${done ? 'bg-success' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
