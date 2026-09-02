export const exportToPDF = (elementId: string, filename: string = 'export.pdf') => {
  const printArea = document.getElementById(elementId);
  if (!printArea) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  const originalContents = document.body.innerHTML;
  const printContents = printArea.innerHTML;

  document.body.innerHTML = `
    <html>
      <head>
        <title>${filename}</title>
        <style>
          @media print {
            body { 
              font-family: 'Inter', sans-serif;
              margin: 2cm;
              color: #000;
            }
            h1, h2, h3 { 
              color: #15803D;
              page-break-after: avoid;
            }
            table { 
              width: 100%;
              border-collapse: collapse;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
            }
            .no-print {
              display: none !important;
            }
            .page-break {
              page-break-before: always;
            }
          }
        </style>
      </head>
      <body>${printContents}</body>
    </html>
  `;

  window.print();

  document.body.innerHTML = originalContents;
  window.location.reload();
};

interface BatchData {
  name: string;
  status: string;
  waste_weight_kg: number;
  water_liters: number;
  sugar_kg: number;
  start_date: string;
  harvest_date?: string;
}

export const exportBatchReport = (batchData: BatchData) => {
  const reportHTML = `
    <div id="batch-report">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1>EcoFlow AI - Batch Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString('id-ID')}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h2>Batch Information</h2>
        <table>
          <tr><th>Batch Name</th><td>${batchData.name}</td></tr>
          <tr><th>Status</th><td>${batchData.status}</td></tr>
          <tr><th>Waste Weight</th><td>${batchData.waste_weight_kg} kg</td></tr>
          <tr><th>Water</th><td>${batchData.water_liters} L</td></tr>
          <tr><th>Sugar</th><td>${batchData.sugar_kg} kg</td></tr>
          <tr><th>Start Date</th><td>${batchData.start_date}</td></tr>
          <tr><th>Harvest Date</th><td>${batchData.harvest_date || 'N/A'}</td></tr>
        </table>
      </div>

      <div style="margin-bottom: 30px;">
        <h2>Environmental Impact</h2>
        <table>
          <tr><th>CO₂ Diverted</th><td>${(batchData.waste_weight_kg * 0.57).toFixed(2)} kg</td></tr>
          <tr><th>Water Saved</th><td>${(batchData.waste_weight_kg * 3).toFixed(2)} L</td></tr>
        </table>
      </div>

      <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
        <p>EcoFlow AI © 2026 - Smart Eco-Enzyme Fermentation Assistant</p>
      </div>
    </div>
  `;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = reportHTML;
  tempDiv.style.display = 'none';
  tempDiv.id = 'temp-batch-report';
  document.body.appendChild(tempDiv);

  exportToPDF('temp-batch-report', `batch-report-${batchData.name}.pdf`);

  setTimeout(() => {
    document.body.removeChild(tempDiv);
  }, 1000);
};
