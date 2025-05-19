import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FaEdit, FaTrash, FaPlus, FaSpinner, FaTimes, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Contributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentContribution, setCurrentContribution] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    month: '',
    year: new Date().getFullYear().toString()
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Month options for dropdown
  const months = [
    { value: 'january', label: 'January' },
    { value: 'february', label: 'February' },
    { value: 'march', label: 'March' },
    { value: 'april', label: 'April' },
    { value: 'may', label: 'May' },
    { value: 'june', label: 'June' },
    { value: 'july', label: 'July' },
    { value: 'august', label: 'August' },
    { value: 'september', label: 'September' },
    { value: 'october', label: 'October' },
    { value: 'november', label: 'November' },
    { value: 'december', label: 'December' }
  ];

  // Generate year options (current year and 10 years back)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchContributions();
  }, [selectedYear]);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://kangemi-backend.onrender.com/api/contributions/${selectedYear}`);
      if (!response.ok) {
        throw new Error('Failed to fetch contributions');
      }
      const data = await response.json();
      
      // Sort contributions by total amount (highest first)
      const sortedData = data.sort((a, b) => {
        const totalA = calculateTotal(a);
        const totalB = calculateTotal(b);
        return totalB - totalA;
      });
      
      setContributions(sortedData);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (contribution) => {
    return Object.keys(contribution)
      .filter(key => months.map(m => m.value).includes(key))
      .reduce((sum, month) => sum + (contribution[month] || 0), 0);
  };

  const openEditModal = (contribution, month) => {
    setCurrentContribution(contribution);
    setFormData({
      amount: contribution[month]?.toString() || '',
      month: month,
      year: contribution.year?.toString() || new Date().getFullYear().toString()
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch(
        `https://kangemi-backend.onrender.com/api/contributions/member/${currentContribution.member._id}/month/${formData.month}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: parseFloat(formData.amount) || 0,
            year: parseInt(formData.year) || new Date().getFullYear()
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update contribution');
      }

      const updatedContribution = await response.json();
      
      // Update the local state and re-sort
      const updatedContributions = contributions.map(cont => 
        cont._id === updatedContribution._id ? updatedContribution : cont
      ).sort((a, b) => {
        const totalA = calculateTotal(a);
        const totalB = calculateTotal(b);
        return totalB - totalA;
      });
      
      setContributions(updatedContributions);

      toast.success('Contribution updated successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Error updating contribution:', error);
      toast.error('Failed to update contribution');
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF("landscape");
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      
      // Current date formatting
      const currentDate = new Date();
      const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      doc.text(`Kangemi Wemen Group- ${selectedYear} Contributions Report `, 14, 15);
      doc.setFontSize(10);
      doc.text(`As of: ${formattedDate}`, 14, 22);

      const headers = [
        "Rank", "Name", "Phone", "Year",
        ...months.map(m => m.label.slice(0, 3)),
        "Total"
      ];

      const tableData = contributions.map((contribution, index) => [
        index + 1,
        contribution.member.name || "-",
        contribution.member.phone || "-",
        contribution.year || "-",
        ...months.map(m => contribution[m.value]?.toString() || "0"),
        calculateTotal(contribution).toString()
      ]);

      if (contributions.length > 0) {
        const summaryRow = [
          "", "TOTALS", "", "",
          ...months.map(m =>
            contributions.reduce((sum, c) => sum + (c[m.value] || 0), 0).toString()
          ),
          contributions.reduce((sum, c) => sum + calculateTotal(c), 0).toString()
        ];
        tableData.push(summaryRow);
      }

      doc.autoTable({
        head: [headers],
        body: tableData,
        startY: 30,
        styles: {
          cellPadding: 4,
          fontSize: 9,
          valign: 'middle',
          lineColor: [0, 0, 0],
          lineWidth: 0.2,
          textColor: [0, 0, 0]
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          lineWidth: 0.3
        },
        margin: { top: 30 },
        didDrawPage: function (data) {
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Page ${data.pageNumber}`, 
                  data.settings.margin.left, 
                  doc.internal.pageSize.height - 10);
        }
      });

      doc.save(`Contributions_Report_${selectedYear}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const exportToExcel = () => {
    try {
      if (contributions.length === 0) {
        toast.warning('No data to export');
        return;
      }

      const data = contributions.map(contribution => ({
        'Rank': contributions.indexOf(contribution) + 1,
        'Name': contribution.member?.name || 'N/A',
        'Phone': contribution.member?.phone || 'N/A',
        'Email': contribution.member?.email || 'N/A',
        'Year': contribution.year || 'N/A',
        ...months.reduce((acc, month) => {
          acc[month.label] = contribution[month.value] || 0;
          return acc;
        }, {}),
        'Total': calculateTotal(contribution)
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contributions');
      XLSX.writeFile(workbook, `contributions_report_${selectedYear}.xlsx`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Failed to generate Excel file');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <button 
          onClick={fetchContributions}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto PX-2 py-8">
      <div className="bg-white rounded-lg  p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Group Contributions</h1>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="flex items-center">
                <select
                  value={selectedYear}
                  onChange={handleYearChange}
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 PX-2 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                >
                  {yearOptions.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <FaSearch />
                </div>
              </div>
            </div>

            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              {contributions.length} <span className='hidden md:flex'>Records</span> <span className=' md:hidden'>R</span>
            </div>
            <button 
              onClick={exportToPDF}
              className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              PDF
            </button>
            <button 
              onClick={exportToExcel}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                
                <th className="PX-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="PX-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="PX-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                {months.map((month) => (
                  <th key={month.value} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {month.label.slice(0, 3)}
                  </th>
                ))}
                <th className="PX-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contributions.map((contribution, index) => {
                const total = calculateTotal(contribution);
                return (
                  <tr key={contribution._id} className="hover:bg-gray-50 transition-colors">
                  
                    <td className="PX-2 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-medium">
                            {contribution.member.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contribution.member.name}</div>
                          <div className="text-sm text-gray-500">{contribution.member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="PX-2 py-3 whitespace-nowrap text-sm text-gray-500">
                      {contribution.member.phone}
                    </td>
                    <td className="PX-2 py-3 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {contribution.year}
                      </span>
                    </td>
                    {months.map((month) => (
                      <td key={month.value} className="px-2 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => openEditModal(contribution, month.value)}
                          className={`text-sm px-2 py-1 rounded-full ${
                            contribution[month.value] > 0 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          disabled={isProcessing}
                        >
                          {contribution[month.value] || 0}
                        </button>
                      </td>
                    ))}
                    <td className="PX-2 py-3 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {total}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {contributions.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No contributions found for {selectedYear}</h3>
            <p className="text-gray-500 mt-1">There are currently no contribution records available for this year.</p>
          </div>
        )}
      </div>

      {/* Contribution Edit Modal */}
      {showModal && currentContribution && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Update Contribution
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={isProcessing}
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Member</label>
                <input
                  type="text"
                  value={currentContribution.member.name}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                  readOnly
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Month</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="PX-2 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="PX-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaEdit className="mr-2" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contributions;