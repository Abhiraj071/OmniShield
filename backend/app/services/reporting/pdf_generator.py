import os
import io
from datetime import datetime
from typing import List, Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from app.schemas.audit import DeviceAuditReport, FrameworkAuditSummary, FindingDetail

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        # Header line
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, letter[1] - 40, letter[0] - 54, letter[1] - 40)
        self.drawString(54, letter[1] - 35, "NetArmor AI — Multi-Vendor Network Compliance & Hardening Dossier")

        # Footer
        self.line(54, 45, letter[0] - 54, 45)
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 32, page_text)
        self.drawString(54, 32, "CONFIDENTIAL — STRICTLY FOR AUTHORIZED SECURITY AUDITING")
        self.restoreState()


class PDFReportGenerator:
    @classmethod
    def generate_audit_pdf(cls, report: DeviceAuditReport, framework: str = "CIS") -> io.BytesIO:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            leftMargin=40,
            rightMargin=40,
            topMargin=54,
            bottomMargin=54
        )

        styles = getSampleStyleSheet()
        primary_color = colors.HexColor("#0F172A")    # Slate 900
        accent_blue = colors.HexColor("#0284C7")      # Sky 600
        text_dark = colors.HexColor("#1E293B")
        text_muted = colors.HexColor("#64748B")

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=primary_color,
            spaceAfter=4
        )

        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            leading=14,
            textColor=text_muted,
            spaceAfter=14
        )

        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=primary_color,
            spaceBefore=14,
            spaceAfter=8
        )

        normal_text = ParagraphStyle(
            'NormalText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=text_dark
        )

        code_style = ParagraphStyle(
            'CodeStyle',
            parent=styles['Code'],
            fontName='Courier',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#0F172A")
        )

        story = []

        # 1. Header Banner
        story.append(Paragraph("NETARMOR AI — SECURITY COMPLIANCE REPORT", title_style))
        fw_summary = report.framework_results.get(framework.upper())
        if not fw_summary:
            # Fallback to first available framework
            fw_summary = list(report.framework_results.values())[0] if report.framework_results else None

        date_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        story.append(Paragraph(f"Framework: <b>{fw_summary.framework if fw_summary else framework}</b> &nbsp;|&nbsp; Generated on: {date_str}", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=accent_blue, spaceBefore=0, spaceAfter=14))

        # 2. Device Metadata Card
        story.append(Paragraph("1. Device Identification & Asset Details", section_heading))
        device_data = [
            [
                Paragraph("<b>Device Hostname:</b>", normal_text),
                Paragraph(f"<code>{report.hostname}</code>", normal_text),
                Paragraph("<b>Vendor:</b>", normal_text),
                Paragraph(report.vendor.upper(), normal_text)
            ],
            [
                Paragraph("<b>Hardware Model:</b>", normal_text),
                Paragraph(report.model, normal_text),
                Paragraph("<b>Firmware/OS:</b>", normal_text),
                Paragraph(report.os_version, normal_text)
            ],
            [
                Paragraph("<b>Serial Number:</b>", normal_text),
                Paragraph(report.serial_number or "N/A", normal_text),
                Paragraph("<b>Compliance Standard:</b>", normal_text),
                Paragraph(f"<b>{fw_summary.framework if fw_summary else framework}</b>", normal_text)
            ]
        ]
        dev_table = Table(device_data, colWidths=[110, 150, 120, 150])
        dev_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(dev_table)
        story.append(Spacer(1, 14))

        # 3. Compliance Executive Scorecard
        story.append(Paragraph("2. Executive Compliance Scorecard", section_heading))
        if fw_summary:
            score = fw_summary.compliance_score
            score_color = "#16A34A" if score >= 80 else ("#D97706" if score >= 50 else "#DC2626")
            
            score_data = [
                [
                    Paragraph(f"<font size='22' color='{score_color}'><b>{score}%</b></font><br/><font color='#64748B'>Overall Score</font>", normal_text),
                    Paragraph(f"<font size='16' color='#16A34A'><b>{fw_summary.passed_count}</b></font><br/>Passed", normal_text),
                    Paragraph(f"<font size='16' color='#DC2626'><b>{fw_summary.failed_count}</b></font><br/>Failed", normal_text),
                    Paragraph(f"<font size='16' color='#D97706'><b>{fw_summary.warning_count}</b></font><br/>Warnings", normal_text),
                    Paragraph(f"<font size='16' color='#0F172A'><b>{fw_summary.total_controls}</b></font><br/>Total Controls", normal_text),
                ]
            ]
            score_table = Table(score_data, colWidths=[120, 100, 100, 100, 110])
            score_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ]))
            story.append(score_table)
        story.append(Spacer(1, 14))

        # 4. Detailed Audit Findings Table
        story.append(Paragraph("3. Detailed Security Benchmark Findings", section_heading))
        if fw_summary and fw_summary.findings:
            table_header = [
                Paragraph("<b>Rule ID</b>", normal_text),
                Paragraph("<b>Control Title & Evidence</b>", normal_text),
                Paragraph("<b>Severity</b>", normal_text),
                Paragraph("<b>Status</b>", normal_text)
            ]
            table_rows = [table_header]

            for f in fw_summary.findings:
                status_color = "#16A34A" if f.status == "PASS" else ("#DC2626" if f.status == "FAIL" else "#D97706")
                sev_color = "#DC2626" if f.severity in ["CRITICAL", "HIGH"] else ("#D97706" if f.severity == "MEDIUM" else "#2563EB")
                
                rule_desc = f"<b>{f.title}</b><br/><font color='#64748B'>Observed: {f.current_value}</font><br/><font color='#0284C7'>Required: {f.expected_value}</font>"
                if f.evidence:
                    rule_desc += f"<br/><font color='#475569'>Evidence: <i>{f.evidence[:80]}...</i></font>"

                table_rows.append([
                    Paragraph(f"<b>{f.benchmark_id}</b>", normal_text),
                    Paragraph(rule_desc, normal_text),
                    Paragraph(f"<font color='{sev_color}'><b>{f.severity}</b></font>", normal_text),
                    Paragraph(f"<font color='{status_color}'><b>{f.status}</b></font>", normal_text)
                ])

            findings_table = Table(table_rows, colWidths=[80, 310, 70, 70])
            findings_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
                ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(findings_table)

        story.append(Spacer(1, 14))

        # 5. Device-Specific Remediation CLI Commands
        story.append(Paragraph("4. Actionable Remediation Paths (Device-Specific CLI)", section_heading))
        story.append(Paragraph("Execute the following verified CLI commands in configuration mode on the device to bring it into strict compliance:", normal_text))
        story.append(Spacer(1, 6))

        if report.remediation_script:
            # Split remediation script by rule blocks or chunks so ReportLab can paginate across pages
            blocks = report.remediation_script.split("\n\n")
            for blk in blocks:
                clean_blk = blk.strip()
                if not clean_blk:
                    continue
                script_lines = clean_blk.splitlines()
                formatted_lines = "<br/>".join([line.replace(" ", "&nbsp;") for line in script_lines])
                remediation_flow = Paragraph(f"<font face='Courier' size='7.5'>{formatted_lines}</font>", normal_text)
                rem_table = Table([[remediation_flow]], colWidths=[530])
                rem_table.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#0F172A")),
                    ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                    ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#334155")),
                    ('TOPPADDING', (0,0), (-1,-1), 6),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
                    ('LEFTPADDING', (0,0), (-1,-1), 8),
                    ('RIGHTPADDING', (0,0), (-1,-1), 8),
                ]))
                story.append(rem_table)
                story.append(Spacer(1, 6))
        else:
            story.append(Paragraph("No remediation required. All evaluated controls passed.", normal_text))

        doc.build(story, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer
