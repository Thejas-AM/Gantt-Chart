
import React, { useEffect, useRef } from 'react';
import Highcharts from 'highcharts/highcharts-gantt';
import HighchartsReact from 'highcharts-react-official';
import { GanttData, GanttTask } from '@/types/gantt';
import { formatDate, timestampToDate } from '@/utils/dateUtils';

interface GanttChartProps {
  data: GanttData;
  onTaskUpdate: (task: GanttTask) => void;
}

const GanttChart: React.FC<GanttChartProps> = ({ data, onTaskUpdate }) => {
  const chartRef = useRef<HighchartsReact.RefObject>(null);
  console.log(data)

  // Filter out any invalid tasks (those without start or end)
  const validTasks = data.tasks.filter(task => 
    task && typeof task.start === 'number' && typeof task.end === 'number'
  );

  // Format data for Highcharts
  const series = [{
    name: 'Tasks',
    type: 'gantt', // Add type to fix TS error
    data: validTasks.map(task => ({
      id: task.id,
      name: task.name,
      start: task.start,
      end: task.end,
      y: validTasks.findIndex(t => t.id === task.id),
      milestone: task.milestone || false,
      dependency: task.dependencies,
      feature: task.feature,
      completed: {
        amount: task.progress / 100
      },
      color: task.color || '#6366F1'
    })),
    tooltip: {
      pointFormat: '<span style="font-weight: bold">{point.name}</span><br>' +
        'Start: {point.start:%e %b %Y}<br>' +
        'End: {point.end:%e %b %Y}<br>' +
        'Progress: {point.completed.amount:.0%}'
    }
  }];

  const today = new Date();
  const todayValue = today.getTime();

  // Check if we have any valid tasks before calculating min/max
  const hasValidTasks = validTasks.length > 0;

  // Get safe min/max values for the chart timeline
  const minDate = hasValidTasks 
    ? Math.min(...validTasks.map(t => t.start)) - 86400000  // one day before first task
    : todayValue - 7 * 86400000; // Default to a week ago if no tasks

  const maxDate = hasValidTasks 
    ? Math.max(...validTasks.map(t => t.end)) + 86400000    // one day after last task
    : todayValue + 7 * 86400000; // Default to a week from now if no tasks

  const chartOptions: Highcharts.Options = {
    chart: {
      type: 'gantt',
      height: '500px',
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Project Timeline',
      style: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1F2937'
      }
    },
    navigator: {
      enabled: true,
      series: {
        type: 'gantt',
        // pointPlacement: 0.5,
        pointPadding: 0.25
      },
      yAxis: {
        min: 0,
        max: validTasks.length,
        reversed: true,
        categories: []
      }
    },
    scrollbar: {
      enabled: true
    },
    rangeSelector: {
      enabled: true,
      selected: 0
    },
    xAxis: {
      currentDateIndicator: {
        color: '#EF4444',
        width: 2,
        label: {
          format: '%a %e %b %Y',
          style: {
            color: 'white'
          } as any
        }
      },
      min: minDate,
      max: maxDate,
      scrollbar: {
        enabled: true
      }
    },
    yAxis: {
      type: 'category',
      grid: {
        borderColor: '#E5E7EB',
        columns: [{
          title: {
            text: 'Feature',
            style: {
              fontWeight: 'bold'
            }
          },
          labels: {
            format: '{point.feature}'
          }
        },
        {
          title: {
            text: 'Task',
            style: {
              fontWeight: 'bold'
            }
          },
          labels: {
            format: '{point.name}'
          }
        }]
      }
    },
    tooltip: {
      xDateFormat: '%a %e %b %Y'
    },
    series: series as any, // Type casting to fix TS error
    plotOptions: {
      series: {
        animation: true,
        dragDrop: {
          draggableX: true,
          draggableY: true,
          dragMinY: 0,
          dragMaxY: Math.max(0, validTasks.length - 1)
        },
        dataLabels: {
          enabled: true,
          format: '{point.name}',
          style: {
            fontSize: '11px',
            textOutline: 'none',
            fontWeight: 'normal',
            color: '#1F2937'
          }
        },
        connectors: {
          dashStyle: 'Dash',
          lineWidth: 2,
          radius: 5
        },
        cursor: 'move',
        point: {
          events: {
            dragStart: function() {
              const id = (this as any).id; // Type casting to fix TS error
              console.log('Drag started on task:', id);
            },
            drop: function() {
              // When a task is dropped, update the task in the state
              const point = this as any; // Type casting to fix TS error
              if (point.id && point.start && point.end) {
                const updatedTask = validTasks.find(t => t.id === point.id);
                if (updatedTask) {
                  onTaskUpdate({
                    ...updatedTask,
                    start: point.start,
                    end: point.end,
                    // Update index/position if changed
                    // (this requires more complex handling to reorder tasks)
                  });
                }
              }
            }
          }
        }
      }
    },
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          yAxis: {
            labels: {
              style: {
                fontSize: '10px'
              }
            }
          }
        }
      }]
    }
  };

  useEffect(() => {
    // When data changes, update the chart
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.update({
        series: series
      } as Highcharts.Options);
    }
  }, [data]);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 my-4">
      {validTasks.length > 0 ? (
        <HighchartsReact
          highcharts={Highcharts}
          constructorType={'ganttChart'}
          options={chartOptions}
          ref={chartRef}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          No valid tasks to display. Add tasks to see the timeline.
        </div>
      )}
    </div>
  );
};

export default GanttChart;
