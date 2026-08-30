import type { Expense, Room } from '../types';
import { formatCurrency } from './currencyFormatter';

export function exportExpensesToCSV(room: Room, expenses: Expense[]) {
  const headers = ['Date', 'Item / Expense', 'Category', 'Total Amount', 'Primary Payer', 'Regret Vibe', 'Consuming Members'];
  const rows = expenses.map(exp => {
    const payer = room.members.find(m => m.id === exp.paidById)?.name || 'Unknown';
    const regret = exp.regretTag === 'worth_it'
      ? 'Worth It'
      : exp.regretTag === 'necessary'
        ? 'Necessary Evil'
        : exp.regretTag === 'mistake'
          ? 'Financial Mistake'
          : 'N/A';
    const members = exp.optedInMembers
      ? exp.optedInMembers.map(id => room.members.find(m => m.id === id)?.name || id).join('; ')
      : 'All Members';

    return [
      new Date(exp.createdAt).toLocaleDateString(),
      `"${exp.title.replace(/"/g, '""')}"`,
      exp.category.toUpperCase(),
      formatCurrency(exp.totalAmount, room.currency),
      `"${payer}"`,
      `"${regret}"`,
      `"${members}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `DivvyUp_Report_${room.code}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
