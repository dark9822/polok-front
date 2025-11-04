import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DataManagement.css';
import EditModal from './EditModal';
import ConfirmModal from './ConfirmModal';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function DataManagement({ onSignOut }) {
  const [formData, setFormData] = useState({
    date: '',
    data: '',
    reg: '',
    cold_key: '',
    hot_key: '',
    uid: '',
    number: ''
  });

  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get('/api/data');
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
      toast.error('Failed to fetch data entries');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!formData.date || !formData.data || !formData.reg || 
        !formData.cold_key || !formData.hot_key || !formData.uid || !formData.number) {
      toast.warning('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/data', formData);
      
      // Clear form
      setFormData({
        date: '',
        data: '',
        reg: '',
        cold_key: '',
        hot_key: '',
        uid: '',
        number: ''
      });
      
      // Refresh entries
      fetchEntries();
      toast.success('Data created successfully!');
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create data entry');
    } finally {
      setLoading(false);
    }
  };

  const handleMoreDetails = (entry) => {
    setSelectedEntry(entry);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEntry(null);
  };

  const handleSaveEdit = async (updatedEntry) => {
    try {
      await axios.put(`/api/data/${updatedEntry._id}`, updatedEntry);
      fetchEntries();
      handleCloseModal();
      toast.success('Data updated successfully!');
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Failed to update data entry');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`/api/data/${deleteId}`);
      fetchEntries();
      toast.success('Data deleted successfully!');
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete data entry');
    } finally {
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
    setDeleteId(null);
  };

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedEntries = () => {
    const sortedEntries = [...entries];
    if (sortConfig.key) {
      sortedEntries.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortedEntries;
  };

  const sortedEntries = getSortedEntries();

  // Pagination logic
  const indexOfLastItem = itemsPerPage === 'all' ? sortedEntries.length : currentPage * itemsPerPage;
  const indexOfFirstItem = itemsPerPage === 'all' ? 0 : indexOfLastItem - itemsPerPage;
  const currentEntries = itemsPerPage === 'all' ? sortedEntries : sortedEntries.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = itemsPerPage === 'all' ? 1 : Math.ceil(sortedEntries.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('landscape'); // Use landscape for wide table
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Data Management Report', 14, 20);
    
    // Add date
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    // Prepare table data
    const tableData = entries.map((entry, index) => [
      index + 1,
      entry.number,
      new Date(entry.date).toLocaleDateString(),
      entry.uid,
      entry.cold_key,
      entry.hot_key,
      entry.reg,
      entry.paid,
      entry.status,
      entry.data
    ]);
    
    // Add table
    doc.autoTable({
      startY: 35,
      head: [['ID', 'Subnet', 'Date', 'UID', 'Cold Key', 'Hot Key', 'REG', 'Paid', 'Status', 'Data']],
      body: tableData,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [102, 126, 234],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 255]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25 },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 35 },
        5: { cellWidth: 35 },
        6: { cellWidth: 20, halign: 'center' },
        7: { cellWidth: 20, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' },
        9: { cellWidth: 40 }
      },
      didDrawPage: (data) => {
        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
          `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });
    
    // Save the PDF
    const fileName = `TAO_AI_Data_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('PDF downloaded successfully!');
  };

  return (
    <div className="data-management-container">
      <div className="header">
        <h1 className="page-title">Data Management</h1>
        <button onClick={onSignOut} className="signout-button">
          Sign Out
        </button>
      </div>

      <div className="content-wrapper">
        {/* Input Form Section */}
        <div className="form-section">
          <h2 className="section-title">Create New Entry</h2>
          <form onSubmit={handleCreate} className="data-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Subnet</label>
                <input
                  type="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter subnet"
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Data (Text Area)</label>
                <textarea
                  name="data"
                  value={formData.data}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Enter data"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>REG Fee</label>
                <input
                  type="number"
                  name="reg"
                  value={formData.reg}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter REG"
                  required
                />
              </div>

              <div className="form-group">
                <label>Cold Key</label>
                <input
                  type="text"
                  name="cold_key"
                  value={formData.cold_key}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter cold key"
                  required
                />
              </div>

              <div className="form-group">
                <label>Hot Key</label>
                <input
                  type="text"
                  name="hot_key"
                  value={formData.hot_key}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter hot key"
                  required
                />
              </div>

              <div className="form-group">
                <label>UID</label>
                <input
                  type="number"
                  name="uid"
                  value={formData.uid}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter UID"
                  required
                />
              </div>
            </div>

            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Entry'}
            </button>
          </form>
        </div>

        {/* History Table Section */}
        <div className="table-section">
          <div className="table-header">
            <h2 className="section-title">History</h2>
            <button onClick={handleDownloadPDF} className="download-pdf-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15M12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Download PDF
            </button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th className="sortable" onClick={() => handleSort('number')}>
                    <div className="th-content">
                      Subnet
                      <span className="sort-icon">
                        {sortConfig.key === 'number' ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '⇅'}
                      </span>
                    </div>
                  </th>
                  <th>Date</th>
                  <th>UID</th>
                  <th>Cold Key</th>
                  <th>Hot Key</th>
                  <th className="sortable" onClick={() => handleSort('reg')}>
                    <div className="th-content">
                      REG
                      <span className="sort-icon">
                        {sortConfig.key === 'reg' ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '⇅'}
                      </span>
                    </div>
                  </th>
                  <th className="sortable" onClick={() => handleSort('paid')}>
                    <div className="th-content">
                      Paid
                      <span className="sort-icon">
                        {sortConfig.key === 'paid' ? (
                          sortConfig.direction === 'asc' ? '↑' : '↓'
                        ) : '⇅'}
                      </span>
                    </div>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data">No data entries yet</td>
                  </tr>
                ) : (
                  currentEntries.map((entry, index) => (
                    <tr key={entry._id}>
                      <td>{indexOfFirstItem + index + 1}</td>
                      <td>{entry.number}</td>
                      <td>{new Date(entry.date).toLocaleDateString()}</td>
                      <td>{entry.uid}</td>
                      <td className="data-cell">{entry.cold_key}</td>
                      <td className="data-cell">{entry.hot_key}</td>
                      <td>{entry.reg}</td>
                      <td>{entry.paid}</td>
                      <td>
                        <span className={`status-badge ${entry.status}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleMoreDetails(entry)}
                            className="detail-button"
                          >
                            More Details
                          </button>
                          <button
                            onClick={() => handleDeleteClick(entry._id)}
                            className="delete-button"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {entries.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {itemsPerPage === 'all' ? sortedEntries.length : Math.min(indexOfLastItem, sortedEntries.length)} of {sortedEntries.length} entries
              </div>

              <div className="pagination-controls">
                <div className="items-per-page">
                  <label>Show:</label>
                  <button
                    className={`page-size-button ${itemsPerPage === 5 ? 'active' : ''}`}
                    onClick={() => handleItemsPerPageChange(5)}
                  >
                    5
                  </button>
                  <button
                    className={`page-size-button ${itemsPerPage === 10 ? 'active' : ''}`}
                    onClick={() => handleItemsPerPageChange(10)}
                  >
                    10
                  </button>
                  <button
                    className={`page-size-button ${itemsPerPage === 20 ? 'active' : ''}`}
                    onClick={() => handleItemsPerPageChange(20)}
                  >
                    20
                  </button>
                  <button
                    className={`page-size-button ${itemsPerPage === 'all' ? 'active' : ''}`}
                    onClick={() => handleItemsPerPageChange('all')}
                  >
                    All
                  </button>
                </div>

                {itemsPerPage !== 'all' && totalPages > 1 && (
                  <div className="page-navigation">
                    <button
                      className="page-nav-button"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    <div className="page-numbers">
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNumber = i + 1;
                        // Show first page, last page, current page, and pages around current
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              className={`page-number-button ${currentPage === pageNumber ? 'active' : ''}`}
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </button>
                          );
                        } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                          return <span key={pageNumber} className="page-ellipsis">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      className="page-nav-button"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedEntry && (
        <EditModal
          entry={selectedEntry}
          onClose={handleCloseModal}
          onSave={handleSaveEdit}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          message="Are you sure you want to delete this entry? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default DataManagement;

