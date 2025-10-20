import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Extend jsPDF types for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Types for analytics data
interface JobMetrics {
  jobId: string;
  totalApplications: number;
  hireRate: number;
  avgTimeToHire: number;
}

interface OverallMetrics {
  totalCandidates: number;
  hireRate: number;
  avgTimeToHire: number;
}

interface AnalyticsData {
  jobs?: JobMetrics[];
  overallMetrics?: OverallMetrics;
}

interface Filters {
  dateRange: { start: string; end: string };
}

export class ExportService {
  static async exportReport(
    format: 'pdf' | 'csv' | 'excel',
    data: AnalyticsData,
    filters: Filters
  ): Promise<string> {
    switch (format) {
      case 'pdf':
        return this.generatePDF(data, filters);
      case 'csv':
        return this.generateCSV(data);
      case 'excel':
        return this.generateExcel(data);
      default:
        throw new Error('Unsupported export format');
    }
  }

  private static async generatePDF(data: AnalyticsData, filters: Filters): Promise<string> {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Hiring Analytics Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);

    // Filters
    doc.text('Filters:', 20, 50);
    doc.text(`Date Range: ${filters.dateRange.start} - ${filters.dateRange.end}`, 30, 65);

    // Metrics table
    if (data?.overallMetrics) {
      doc.autoTable({
        startY: 80,
        head: [['Metric', 'Value']],
        body: [
          ['Total Candidates', data.overallMetrics.totalCandidates.toString()],
          ['Hire Rate', `${data.overallMetrics.hireRate?.toFixed(1)}%`],
          ['Avg Time to Hire', `${data.overallMetrics.avgTimeToHire?.toFixed(1)} days`],
        ],
      });
    }

    // Save and return blob URL
    const pdfOutput = doc.output('blob');
    const url = URL.createObjectURL(pdfOutput);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `hiring-report-${Date.now()}.pdf`;
    link.click();

    return url;
  }

  private static async generateCSV(data: AnalyticsData): Promise<string> {
    const csvContent = this.dataToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `hiring-data-${Date.now()}.csv`;
    link.click();

    return url;
  }

  private static async generateExcel(data: AnalyticsData): Promise<string> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hiring Metrics');

    // Add headers for overall metrics
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 20 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    // Add overall metrics
    if (data?.overallMetrics) {
      worksheet.addRows([
        { metric: 'Total Candidates', value: data.overallMetrics.totalCandidates.toString() },
        { metric: 'Hire Rate', value: `${data.overallMetrics.hireRate?.toFixed(1)}%` },
        { metric: 'Avg Time to Hire', value: `${data.overallMetrics.avgTimeToHire?.toFixed(1)} days` },
      ]);
    }

    // Add job-specific metrics
    if (data?.jobs) {
      const jobWorksheet = workbook.addWorksheet('Job Metrics');
      jobWorksheet.columns = [
        { header: 'Job ID', key: 'jobId', width: 20 },
        { header: 'Total Applications', key: 'totalApplications', width: 15 },
        { header: 'Hire Rate', key: 'hireRate', width: 10 },
        { header: 'Time to Hire', key: 'avgTimeToHire', width: 15 },
      ];
      jobWorksheet.addRows(
        data.jobs.map(job => ({
          jobId: job.jobId,
          totalApplications: job.totalApplications,
          hireRate: `${job.hireRate?.toFixed(1)}%`,
          avgTimeToHire: `${job.avgTimeToHire?.toFixed(1)} days`,
        }))
      );
    }

    // Generate buffer and create blob
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);

    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `hiring-report-${Date.now()}.xlsx`;
    link.click();

    return url;
  }

  private static dataToCSV(data: AnalyticsData): string {
    const headers = ['Job ID', 'Total Applications', 'Hire Rate', 'Time to Hire'];
    const rows =
      data.jobs?.map(job => [
        job.jobId,
        job.totalApplications,
        `${job.hireRate?.toFixed(1)}%`,
        `${job.avgTimeToHire?.toFixed(1)} days`,
      ]) || [];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private static dataToExcelRows(data: AnalyticsData): string[][] {
    return (
      data.jobs?.map(job => [
        job.jobId,
        job.totalApplications.toString(),
        job.hireRate?.toFixed(1),
        job.avgTimeToHire?.toFixed(1),
      ]) || []
    );
  }
}