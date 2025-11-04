import React, { useState } from 'react';
import './EditModal.css';

function EditModal({ entry, onClose, onSave }) {
  const [editData, setEditData] = useState({
    date: entry.date.split('T')[0],
    data: entry.data,
    reg: entry.reg,
    cold_key: entry.cold_key,
    hot_key: entry.hot_key,
    uid: entry.uid,
    number: entry.number,
    status: entry.status,
    paid: entry.paid
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...entry, ...editData });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Entry Details</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-grid">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={editData.date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Subnet</label>
              <input
                type="number"
                name="number"
                value={editData.number}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Data</label>
              <textarea
                name="data"
                value={editData.data}
                onChange={handleChange}
                className="form-textarea"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label>REG</label>
              <input
                type="number"
                name="reg"
                value={editData.reg}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Cold Key</label>
              <input
                type="text"
                name="cold_key"
                value={editData.cold_key}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Hot Key</label>
              <input
                type="text"
                name="hot_key"
                value={editData.hot_key}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>UID</label>
              <input
                type="number"
                name="uid"
                value={editData.uid}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={editData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Paid</label>
              <input
                type="number"
                name="paid"
                value={editData.paid}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;

