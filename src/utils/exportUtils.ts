import { GanttData, GanttTask } from "@/types/gantt";

export const exportToCSV = (ganttData: GanttData) => {
    // Calculate total weeks based on project duration
    const projectStart = Math.min(...ganttData.tasks.map(task => task.start));
    const projectEnd = Math.max(...ganttData.tasks.map(task => task.end));
    const totalWeeks = Math.ceil((projectEnd - projectStart) / (7 * 24 * 60 * 60 * 1000));

    // Generate week headers dynamically
    const weekHeaders = Array.from({ length: totalWeeks }, (_, i) => `W${i + 1}`);
    const headers = ['Sl. No', 'Feature', 'Task', ...weekHeaders];

    interface ExportRow {
        'Sl. No': number;
        'Feature': string;
        'Task': string;
        [key: string]: string | number; // For dynamic week columns
    }

    const exportRows: ExportRow[] = [];
    let currentSlNo = 1;

    // Group tasks by feature
    const taskGroups: { [key: string]: GanttTask[] } = {};
    ganttData.tasks.forEach(task => {
        if (task.feature) {
            if (!taskGroups[task.feature]) {
                taskGroups[task.feature] = [];
            }
            taskGroups[task.feature].push(task);
        }
    });

    // Create rows for each group
    Object.entries(taskGroups).forEach(([parentName, tasks], groupIndex) => {
        // Add separator row before each group (except the first one)
        if (groupIndex > 0) {
            const separatorRow: ExportRow = {
                'Sl. No': 0,
                'Feature': '',
                'Task': '',
            };
            weekHeaders.forEach(week => {
                separatorRow[week] = '';
            });
            exportRows.push(separatorRow);
        }

        // Add feature/feature row with tasks
        tasks.forEach((task, index) => {
            const row: ExportRow = {
                'Sl. No': index === 0 ? currentSlNo++ : 0,
                'Feature': index === 0 ? parentName : '',
                'Task': task.name,
            };

            // Initialize week columns
            weekHeaders.forEach(week => {
                row[week] = '';
            });

            // Calculate which weeks this task spans
            const taskStart = new Date(task.start);
            const taskEnd = new Date(task.end);
            const projectStartDate = new Date(projectStart);

            for (let w = 1; w <= totalWeeks; w++) {
                const weekStart = new Date(projectStartDate);
                weekStart.setDate(weekStart.getDate() + (w - 1) * 7);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);

                if (taskStart <= weekEnd && taskEnd >= weekStart) {
                    row[`W${w}`] = '\u2713';
                }
            }

            exportRows.push(row);
        });
    });

    // Create HTML table
    let html = '<table border="1" style="width: auto; border-collapse: collapse;">';

    // Add headers
    html += '<tr>';
    headers.forEach(header => {
        const width = header === 'Task' ? '200px' : header === 'Feature' ? '150px' : '80px';
        html += `<th style="width: ${width}; text-align: center;">${header}</th>`;
    });
    html += '</tr>';

    // Update the row rendering with rowspan for features and Sl. No
    let currentFeature = '';
    let currentSlNoValue = 0;
    let featureRowspan = 0;
    let slNoRowspan = 0;
    let featureStartIndex = 0;
    let slNoStartIndex = 0;

    exportRows.forEach((row, rowIndex) => {
        const isSeparator = row['Sl. No'] === 0 && row['Feature'] === '' && row['Task'] === '';

        if (isSeparator) {
            if (featureRowspan > 0) {
                html = html.replace('{{FEATURE_ROWSPAN}}', ` rowspan="${featureRowspan}"`);
            }
            if (slNoRowspan > 0) {
                html = html.replace('{{SLNO_ROWSPAN}}', ` rowspan="${slNoRowspan}"`);
            }
            featureRowspan = 0;
            slNoRowspan = 0;
            html += `<tr style="height: 10px;">`;
            headers.forEach(() => {
                html += `<td style="padding: 0; background-color: #E5E7EB;"></td>`;
            });
            html += '</tr>';
            return;
        }

        if (row['Feature']) {
            currentFeature = row['Feature'];
            featureStartIndex = rowIndex;
            featureRowspan = 1;
        } else if (currentFeature && !row['Feature']) {
            featureRowspan++;
        }

        if (row['Sl. No'] !== 0) {
            currentSlNoValue = row['Sl. No'];
            slNoStartIndex = rowIndex;
            slNoRowspan = 1;
        } else if (currentSlNoValue && row['Sl. No'] === 0) {
            slNoRowspan++;
        }

        html += '<tr>';
        headers.forEach((header) => {
            const cellValue = row[header] || '';
            const isChecked = cellValue === '\u2713';
            const width = header === 'Task' ? '200px' : header === 'Feature' ? '150px' : '80px';

            if (header === 'Feature' && !row['Feature'] && !isSeparator) {
                return;
            }
            if (header === 'Sl. No' && row['Sl. No'] === 0 && !isSeparator) {
                return;
            }

            const style = `
        width: ${width}; 
        ${isChecked ? 'background-color: #90EE90;' : ''} 
        white-space: nowrap;
        text-align: center;
        vertical-align: middle;
      `;

            if (header === 'Feature' && row['Feature']) {
                html += `<td style="${style}"{{FEATURE_ROWSPAN}}>${cellValue}</td>`;
            } else if (header === 'Sl. No' && row['Sl. No'] !== 0) {
                html += `<td style="${style}"{{SLNO_ROWSPAN}}>${cellValue}</td>`;
            } else {
                html += `<td style="${style}">${cellValue}</td>`;
            }
        });
        html += '</tr>';
    });

    // Add rowspan to the last group
    if (featureRowspan > 0) {
        html = html.replace('{{FEATURE_ROWSPAN}}', ` rowspan="${featureRowspan}"`);
    }
    if (slNoRowspan > 0) {
        html = html.replace('{{SLNO_ROWSPAN}}', ` rowspan="${slNoRowspan}"`);
    }

    html += '</table>';

    // Download as Excel-compatible HTML
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'gantt_chart.xls';
    link.click();
};