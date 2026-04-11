'use server';
import fs from 'fs/promises';
import path from 'path';

export async function exportRecipeToDisk(recipeName: string, csvData: string, pdfBase64: string) {
  try {
    const safeName = recipeName.toLowerCase().replace(/\s+/g, '-');
    const folderPath = path.join(process.cwd(), 'recetas', safeName);
    
    // Crear carpeta
    await fs.mkdir(folderPath, { recursive: true });
    
    // Escribir CSV
    await fs.writeFile(path.join(folderPath, 'formula.csv'), csvData, 'utf-8');
    
    // Escribir PDF
    if (pdfBase64) {
      const base64Data = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.writeFile(path.join(folderPath, `${safeName}.pdf`), buffer);
    }
    
    return { success: true, path: folderPath };
  } catch(e: any) {
    console.error(e);
    return { success: false, error: e.message };
  }
}
