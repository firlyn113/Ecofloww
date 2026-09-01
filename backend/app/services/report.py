from datetime import datetime, timezone
import io

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF

class ReportService:
    """Generasi laporan PDF (business report & roadmap checklist) via ReportLab."""

    @staticmethod
    def generate_business_report(batch_id: int, analysis_data: dict) -> dict:
        """Generate PDF laporan kelayakan bisnis untuk satu batch.

        Args:
            batch_id: ID batch (hanya untuk label di PDF).
            analysis_data: Hasil BusinessAnalysisService.run_analysis().

        Returns:
            dict: {"title", "batch_id", "generated_at", "content" (PDF bytes)}.
        """
        timestamp = datetime.now(timezone.utc).isoformat()

        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        y = height - 50
        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, y, "Business Viability Report")

        y -= 24
        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, f"Batch ID: {batch_id}")
        y -= 16
        pdf.drawString(50, y, f"Generated At: {timestamp}")

        y -= 28
        pdf.setFont("Helvetica", 11)
        pdf.drawString(50, y, "This report outlines the commercial viability and financial metrics for your Eco-Enzyme production.")

        y -= 28
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Financial Summary")

        rows = [
            ("COGS per Liter", analysis_data.get("cogs_per_liter")),
            ("Suggested Retail Price", analysis_data.get("suggested_retail_price")),
            ("Gross Margin (%)", analysis_data.get("gross_margin_percentage")),
            ("Break-even Units (Liters)", analysis_data.get("break_even_units_liters")),
            ("Yearly Net Profit", analysis_data.get("yearly_net_profit")),
            ("Viability Rating", analysis_data.get("viability_rating")),
        ]

        pdf.setFont("Helvetica", 10)
        for label, value in rows:
            y -= 18
            display_value = f"{value:.2f}" if isinstance(value, (float, int)) else str(value)
            pdf.drawString(50, y, f"{label}: {display_value}")

        y -= 28
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "12-Month Projection")
        pdf.setFont("Helvetica", 10)
        projection_rows = [
            ("Monthly Revenue", analysis_data.get("monthly_revenue")),
            ("Monthly Net Profit", analysis_data.get("monthly_net_profit")),
            ("Yearly Net Profit", analysis_data.get("yearly_net_profit")),
            ("Breakeven Months", analysis_data.get("breakeven_months")),
        ]
        for label, value in projection_rows:
            y -= 18
            if isinstance(value, (float, int)):
                display_value = f"{value:.2f}"
            elif value is None:
                display_value = "N/A"
            else:
                display_value = str(value)
            pdf.drawString(50, y, f"{label}: {display_value}")

        sensitivity = analysis_data.get("sensitivity_analysis") or {}
        y -= 28
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, f"Sensitivity Analysis (Variance: {sensitivity.get('variance_percentage', 10)}%)")
        pdf.setFont("Helvetica", 10)
        sensitivity_rows = [
            ("Base Case", sensitivity.get("base_case")),
            ("Pessimistic", sensitivity.get("pessimistic")),
            ("Optimistic", sensitivity.get("optimistic")),
        ]
        for label, value in sensitivity_rows:
            y -= 18
            display_value = f"{value:.2f}" if isinstance(value, (float, int)) else str(value)
            pdf.drawString(50, y, f"{label}: {display_value}")

        pdf.showPage()
        pdf.save()
        buffer.seek(0)

        return {
            "title": "Business Viability Report",
            "batch_id": batch_id,
            "generated_at": timestamp,
            "content": buffer.getvalue(),
        }

    @staticmethod
    def generate_roadmap_pdf(batch_id: int, roadmap_data: dict) -> bytes:
        """Generate PDF checklist roadmap (steps dengan checkbox + QR tutorial).

        Returns:
            bytes: Raw PDF bytes siap dikirim sebagai attachment.
        """
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
        y = height - 50

        pdf.setFont("Helvetica-Bold", 16)
        pdf.drawString(50, y, "Checklist Roadmap Pemrosesan")
        y -= 24
        pdf.setFont("Helvetica", 10)
        pdf.drawString(50, y, f"ID Batch: {batch_id}")
        y -= 20
        pdf.drawString(50, y, f"Produk: {roadmap_data.get('template_name', 'Produk Eco-Enzyme')}")
        y -= 28

        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(50, y, "Langkah-Langkah")
        pdf.setFont("Helvetica", 10)
        for index, step in enumerate(roadmap_data.get("steps", []), start=1):
            y -= 20
            if y < 70:
                pdf.showPage()
                y = height - 50
                pdf.setFont("Helvetica", 10)
            marker = "[x]" if step.get("completed") else "[ ]"
            pdf.drawString(50, y, f"{marker} {index}. {step.get('title', '')}")
            y -= 14
            pdf.drawString(68, y, str(step.get("description", ""))[:110])
            y -= 14
            pdf.drawString(68, y, str(step.get("details", ""))[:110])

        y -= 20
        if y < 70:
            pdf.showPage()
            y = height - 50
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(50, y, "Peringatan Keselamatan")
        pdf.setFont("Helvetica", 10)
        y -= 16
        pdf.drawString(50, y, str(roadmap_data.get("safety_warnings", "Ikuti petunjuk penanganan yang aman."))[:130])

        tutorial_url = roadmap_data.get("tutorial_url")
        if tutorial_url:
            y -= 28
            if y < 120:
                pdf.showPage()
                y = height - 50
            pdf.setFont("Helvetica-Bold", 10)
            pdf.drawString(50, y, "Tautan Tutorial")
            pdf.setFont("Helvetica", 9)
            y -= 16
            pdf.drawString(50, y, str(tutorial_url)[:100])
            y -= 12
            try:
                qr_widget = QrCodeWidget(tutorial_url)
                qr_size = 80
                bounds = qr_widget.getBounds()
                w = bounds[2] - bounds[0]
                h = bounds[3] - bounds[1]
                d = Drawing(qr_size, qr_size, transform=[qr_size / w, 0, 0, qr_size / h, 0, 0])
                d.add(qr_widget)
                if y - qr_size < 50:
                    pdf.showPage()
                    y = height - 50
                renderPDF.draw(d, pdf, 50, y - qr_size)
                y -= qr_size + 10
            except Exception:
                pass

        pdf.showPage()
        pdf.save()
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_roadmap_report(batch_id: int, roadmap_data: dict) -> dict:
        """Versi JSON structured dari roadmap report (bukan PDF).

        Returns:
            dict: {"title", "batch_id", "generated_at", "summary", "sections", "raw_data"}.
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        
        return {
            "title": "Laporan Roadmap Komersialisasi",
            "batch_id": batch_id,
            "generated_at": timestamp,
            "summary": "Roadmap ini menyediakan panduan langkah demi langkah untuk mengolah eco-enzyme menjadi produk bernilai.",
            "sections": [
                {
                    "title": "Strategi Produk",
                    "content": roadmap_data.get("strategy", {})
                },
                {
                    "title": "Rencana Aksi",
                    "content": roadmap_data.get("steps", [])
                },
                {
                    "title": "Milestone & Lini Masa",
                    "content": roadmap_data.get("milestones", {})
                }
            ],
            "raw_data": roadmap_data
        }
