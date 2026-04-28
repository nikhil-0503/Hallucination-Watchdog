import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Users, BookOpen, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import AdminLayout from "../components/AdminLayout";
import { getCommunityPatterns } from "../services/api";

const CommunityHub = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getCommunityPatterns();
        if (mounted) setPatterns(data.patterns || []);
      } catch (e) {
        if (mounted) setError("Failed to load community patterns");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ marginTop: 12 }}>Loading community data...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="empty-state">
          <AlertTriangle size={48} className="empty-state-icon" />
          <h3>{error}</h3>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title page-title-gradient">
              <Globe size={28} style={{ verticalAlign: "middle", marginRight: 10 }} />
              Community Hub
            </h1>
            <p className="page-subtitle">Shared bias patterns and fairness insights</p>
          </div>
        </div>
        <div className="grid-2">
          {patterns.length === 0 ? (
            <div className="section-card">
              <div className="section-card-body">
                <div className="empty-state">
                  <Users size={48} className="empty-state-icon" />
                  <h3>No community patterns yet</h3>
                  <p>As more organizations use WATCHDOG, shared patterns will appear here.</p>
                </div>
              </div>
            </div>
          ) : (
            patterns.map((p, idx) => (
              <motion.div
                key={idx}
                className="section-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="section-card-header">
                  <h3 className="section-card-title">{p.name || p.title || 'Community Pattern'}</h3>
                  <span className={`badge badge-${p.severity}`}>{p.severity}</span>
                </div>
                <div className="section-card-body">
                  <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    {p.description || 'A live pattern derived from stored WATCHDOG decisions.'}
                  </p>
                  <div className="stack-item-meta">
                    <span><TrendingUp size={14} /> {p.frequency ?? p.datasets_analyzed ?? 0} reports</span>
                    <span><BookOpen size={14} /> {p.datasets_analyzed ?? 0} datasets</span>
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <CheckCircle size={16} style={{ color: "var(--success)" }} />
                      <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{p.recommendation || 'Continue monitoring'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default CommunityHub;
