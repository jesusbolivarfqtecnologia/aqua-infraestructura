import * as React from 'react';
import { Check, Edit2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

export function InlineEdit({ value, onSave }: { value: string; onSave: (val: string) => void }) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [tempValue, setTempValue] = React.useState(value);

  React.useEffect(() => { setTempValue(value); }, [value]);

  const handleSave = () => {
    if (tempValue.trim() !== '') {
      onSave(tempValue);
    } else {
      setTempValue(value);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          autoFocus
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          className="h-8 text-sm w-full"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <Button variant="primary" size="icon" className="h-8 w-8 shrink-0" onClick={handleSave}>
          <Check className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsEditing(true)}>
      <span className="truncate">{value}</span>
      <Edit2 className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
