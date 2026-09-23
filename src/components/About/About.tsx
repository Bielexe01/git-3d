import { bandInfo } from "../../data/band";

const fields = [
  ["Descrição", bandInfo.description],
  ["Cidade", bandInfo.location],
  ["Estilo", bandInfo.style],
];

export function About() {
  return (
    <section id="banda" className="px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1400px] items-end gap-12 lg:grid-cols-12">
        <h2 className="font-display text-7xl leading-[0.85] tracking-tight md:text-8xl lg:col-span-6">
          B'ritt
        </h2>
        <div className="border-t border-bone/20 pt-6 lg:col-span-5 lg:col-start-8">
          {fields.map(([label, value]) => (
            <p key={label} className="mt-8 first:mt-0">
              <span className="block text-xs tracking-[0.16em] text-brass">{label.toUpperCase()}</span>
              <span className="mt-2 block max-w-[42ch] text-lg text-bone-dim">{value}</span>
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
