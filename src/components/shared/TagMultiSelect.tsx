import * as React from 'react';
import type { ConfiguracionTag } from '@/types';

export function TagMultiSelect({
  value,
  onChange,
  disabled = false,
  options,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
  options: ConfiguracionTag[];
}) {
  const handleToggle = (tagObj: ConfiguracionTag) => {
    if (disabled) return;
    let newValue = [...value];
    if (newValue.includes(tagObj.tag)) {
      newValue = newValue.filter((t) => t !== tagObj.tag);
    } else {
      if (tagObj.tipo === 'bifurcado') {
        const unicos = options.filter((o) => o.tipo === 'unico').map((o) => o.tag);
        newValue = newValue.filter((t) => !unicos.includes(t));
      } else if (tagObj.tipo === 'unico') {
        const bifurcados = options.filter((o) => o.tipo === 'bifurcado').map((o) => o.tag);
        newValue = newValue.filter((t) => !bifurcados.includes(t));
      }
      newValue.push(tagObj.tag);
    }
    onChange(newValue);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = value.includes(opt.tag);
        const hasUnico = value.some((t) => options.find((o) => o.tag === t)?.tipo === 'unico');
        const hasBifurcado = value.some((t) => options.find((o) => o.tag === t)?.tipo === 'bifurcado');
        let isDisabledOption = disabled;
        if (!isSelected && !disabled) {
          if (opt.tipo === 'bifurcado' && hasUnico) isDisabledOption = true;
          if (opt.tipo === 'unico' && hasBifurcado) isDisabledOption = true;
        }
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => handleToggle(opt)}
            disabled={isDisabledOption}
            title={opt.descripcion}
            className={`px-2 py-1 text-xs font-bold rounded border transition-all ${
              isSelected
                ? 'bg-[#FFF3CD] border-[#FFE69C] text-[#664D03] shadow-sm'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            } ${isDisabledOption ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {opt.tag}
          </button>
        );
      })}
    </div>
  );
}
