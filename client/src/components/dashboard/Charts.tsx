import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Mock data
const mockTicketData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Open Tickets',
      data: [65, 59, 80, 81, 56, 55],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
    },
    {
      label: 'Resolved Tickets',
      data: [28, 48, 40, 19, 86, 27],
      fill: false,
      borderColor: 'rgb(54, 162, 235)',
      tension: 0.1,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Ticket Trends Over Time',
    },
  },
};

export function TicketTrends() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Ticket Activity</h2>
      <div className="w-full">
        <Line options={options} data={mockTicketData} />
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Open Tickets</p>
          <p className="text-2xl font-bold text-blue-600">24</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Avg Resolution Time</p>
          <p className="text-2xl font-bold text-green-600">2.5d</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Customer Satisfaction</p>
          <p className="text-2xl font-bold text-purple-600">4.8</p>
        </div>
      </div>
    </div>
  );
}

export function ContactGrowth() {
  // Placeholder for ContactGrowth component
  return null;
} 