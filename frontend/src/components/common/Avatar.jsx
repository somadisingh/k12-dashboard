import { initials } from '../../utils/formatters.js';

const COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ firstName = '', lastName = '', size = 40, url }) {
  const name = `${firstName}${lastName}`;
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold ${colorFor(
        name
      )}`}
      style={{ width: size, height: size, fontSize: size / 2.5 }}
    >
      {initials(firstName, lastName)}
    </div>
  );
}
