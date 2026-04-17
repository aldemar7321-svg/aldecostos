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

export async function getSavedCalculations(): Promise<{id: string, name: string, date: string, path: string}[]> {
  try {
    const dirPath = path.join(process.cwd(), 'recetas');
    
    // Check if dir exists
    try {
      await fs.access(dirPath);
    } catch {
      return [];
    }
    
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    const calculations = [];
    
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('calculadora-')) {
        const fullPath = path.join(dirPath, entry.name);
        const stats = await fs.stat(fullPath);
        
        let name = entry.name.replace('calculadora-', '').replace(/-/g, ' ');
        if (name === 'dinamica') name = 'Muestra Rápida';
        
        calculations.push({
          id: entry.name,
          name,
          date: stats.atime.toISOString(), // Approximating creation date
          path: fullPath
        });
      }
    }
    
    // Sort by date newest first
    return calculations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
  } catch (e: any) {
    console.error("Error reading saved calculations:", e);
    return [];
  }
}
