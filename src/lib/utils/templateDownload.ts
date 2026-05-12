'use client';

export function descargarPlantillaIRI(): void {
  const header = 'From (m),To (m),Distance (m),"IRI, Left (mm/m)","IRI, Right (mm/m)"';
  const rows = [
    'PR02+080,PR02+100,20,2.10,2.30',
    'PR02+100,PR02+120,20,2.05,2.20',
    'PR02+120,PR02+140,20,2.30,2.10',
    'PR02+140,PR02+160,20,2.50,2.40',
    'PR02+160,PR02+180,20,2.20,2.35',
  ];
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'plantilla_iri.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
