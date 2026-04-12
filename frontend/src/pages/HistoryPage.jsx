import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { historyApi } from '../services/api';
import { FiClock } from 'react-icons/fi';

export default function HistoryPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await historyApi.getAll({ page: p, limit: 10 });
      setTrips(res.data.trips || []);
      setPagination(res.data.pagination || {});
      setPage(p);
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this trip from history?')) return;

    try {
      await historyApi.delete(id);
      load(page);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>
          <FiClock style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Trip History
        </h1>
        <p>Your previous route searches and fare estimates</p>
      </div>

      <div className="card">
        {loading ? (
          <div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8 }} />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📜</div>
            <h3>No trip history yet</h3>
            <p>Plan your first route to see it here</p>
            <Link to="/planner" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Plan a Route
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>City</th>
                  <th>Vehicle</th>
                  <th>Distance</th>
                  <th>Fare</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                        {t.source?.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        → {t.destination?.name}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem' }}>
                        {t.city?.name || '—'}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-blue">
                        {t.vehicleType}
                      </span>
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>
                      {t.result?.totalDistanceKm
                        ? `${t.result.totalDistanceKm} km`
                        : '—'}
                    </td>

                    <td style={{ fontWeight: 600, color: 'var(--accent-green)' }}>
                      {t.result?.estimatedFare
                        ? `₹${t.result.estimatedFare}`
                        : '—'}
                    </td>

                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(t._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination?.pages > 1 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '1rem',
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => load(page - 1)}
            >
              Previous
            </button>

            <span
              style={{
                padding: '0.375rem 0.75rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
              }}
            >
              {page} / {pagination.pages}
            </span>

            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= pagination.pages}
              onClick={() => load(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}