const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'recetas', 'biogenesis-mineral');
fs.mkdirSync(dir, { recursive: true });

const content = `Ingrediente,Porcentaje,Cantidad (Gramos),Función Principal
Harina de Roca,40%,200 g,Aporte de minerales y silicio.
Terrabono,30%,150 g,Materia orgánica y estructura.
Micorrizas,16%,80 g,Expansión radicular y absorción.
N-30,4%,20 g,Impulso de nitrógeno para crecimiento.
Sulfato de Zinc,3%,15 g,Síntesis de hormonas y crecimiento.
Sulfato de Cobre,2%,10 g,Protección fúngica y fotosíntesis.
Ácido Bórico,2%,10 g,Floración y transporte de azúcares.
Flos,3%,15 ml/g,Activador biológico líquido.
TOTAL,100%,500 g, -`;

fs.writeFileSync(path.join(dir, 'formula.csv'), content);
console.log('Carpeta y CSV generados correctamente en:', dir);
