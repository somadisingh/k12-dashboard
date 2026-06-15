import { CheckIcon } from '@heroicons/react/24/solid';
import { humanize } from '../../utils/formatters.js';

// Horizontal workflow progress bar; colored up to the current status
export default function StatusStepper({ steps, current }) {
  const currentIdx = steps.indexOf(current);
  return (
    <div className="flex items-center w-full overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className="flex items-center flex-1 min-w-fit">
            <div className="flex flex-col items-center">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition ${
                  done
                    ? 'bg-success border-success text-white'
                    : active
                    ? 'bg-primary border-primary text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {done ? <CheckIcon className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`mt-1.5 text-[10px] text-center w-20 leading-tight ${
                  active ? 'text-primary font-semibold' : 'text-slate-400'
                }`}
              >
                {humanize(step)}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-5 ${done ? 'bg-success' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
